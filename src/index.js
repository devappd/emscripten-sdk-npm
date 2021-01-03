// emsdk-npm - index.js
// Copyright 2019-2020 Brion Vibber and the emsdk-npm contributors
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

const emsdk = require('./emsdk.js');
const emsdkCheckout = require('./emsdk-checkout.js');
const emsdkRun = require('./emsdk-run.js');
const emsdkPull = require('./emsdk-pull.js');
const shelljs = require('shelljs');
const path = require('path');
const common = require('./common.js');
const getEmsdkPath = require('./path.js');
const fs = require('fs');

////////////////////////////////////////////////////////////////////////
// install() helpers
// Retrieve release tags and detect whether our requested version
// is already active as indicated by `.emsdk_version`
////////////////////////////////////////////////////////////////////////

function _getReleaseTags() {
    let tagsFile = path.join(common.emsdkBase(), 'emscripten-releases-tags.txt');
    let rawData = fs.readFileSync(tagsFile);
    return JSON.parse(rawData);
}

function _getTotHash() {
    let totFile = path.join(common.emsdkBase(), 'emscripten-releases-tot.txt');
    return fs.readFileSync(totFile);
}

function getInstalled(version) {
    // Set lookup defaults in case of exception
    let which = (version.includes('fastcomp')) ? 'fastcomp' : 'upstream';
    let hash = version;
    let versionData = '';

    try {
        // Get hash from version
        // Version hash is the same regardless if -fastcomp is in the string
        if (version.includes('tot'))
            hash = _getTotHash();
        else {
            let tags = _getReleaseTags();
            
            if (version.includes('latest'))
                hash = tags.releases[tags.latest];
            else {
                let versionTest = version.replace('-fastcomp', '');
                if (versionTest in tags.releases)
                    hash = tags.releases[versionTest];
                // else, user may have passed a complete hash string already
            }
        }
        
        // Get currently installed hash
        let versionFile = path.join(common.emsdkBase(), which, '.emsdk_version');
        versionData = fs.readFileSync(versionFile);
    } catch (e) {
        console.warn('Error retrieving installed EMSDK version: ' + e.message);
    }

    return versionData.includes(hash);
}

////////////////////////////////////////////////////////////////////////
// JS API
////////////////////////////////////////////////////////////////////////

function remove() {
    let emsdkPath = common.emsdkBase();

    if (fs.existsSync(emsdkPath))
        shelljs.rm('-rf', emsdkPath);

    return Promise.resolve();
}

function checkout(force = false) {
    let emsdkPath = common.emsdkBase();

    if (fs.existsSync(emsdkPath)) {
        if (force)
            remove();
        else
            return Promise.resolve();
    }

    return emsdkCheckout.run();
}

function update() {
    // Checkout here to save the user from calling checkout() before
    // update(). This does not un-necessarily call `git clone` if the
    // repo already exists.
    return checkout().then(function () {
        // Because we clone from git, we need to `git pull` to update
        // the tag list in `emscripten-releases-tags.txt`
        return emsdkPull.run();
    })
    .then(function () {
        // `emsdk update-tags` updates `emscripten-release-tot.txt`
        return emsdk.run([
            'update-tags'
        ]);
    })
}

function install(version = 'latest', force = false) {
    // Check if requested EMSDK version is installed.
    // Only one version can be installed at a time, and no other
    // versions are cached.
    if (!force && getInstalled(version))
        return Promise.resolve();

    return checkout().then(function () {
        return emsdk.run([
            'install',
            version
        ]);
    });
}

function activate(version = 'latest') {
    return emsdk.run([
        'activate',
        version
    ]);
}

function run(command, args, opts = {}) {
    return emsdkRun.run(command, args, opts);
}

module.exports = {
    remove: remove,
    update: update,
    install: install,
    activate: activate,
    run: run,
    getEmsdkPath: getEmsdkPath,
    getInstalled: getInstalled
};
