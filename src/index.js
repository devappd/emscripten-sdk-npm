const emsdk = require('./emsdk.js');
const emsdkCheckout = require('./emsdk-checkout.js');
const emsdkRun = require('./emsdk-run.js');
const shelljs = require('shelljs');
const path = require('path');
const common = require('./common.js');
const getEmsdkPath = require('./path.js');
const fs = require('fs');

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
    // Checkout here to allow the user to call update()
    // pre-emptively before install()ing
    return checkout().then(function () {
        // Because we clone from git, emsdk
        // does nothing upon "update", but
        // does suggest to use "update-tags" instead.
        return emsdk.run([
            'update-tags'
        ]);
    })
}

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

function _getInstalled(version) {
    let hash;
    let which;

    try {
        if (version === 'tot') {
            hash = _getTotHash();
            which = 'upstream';
        } else {
            which = (version.includes('fastcomp')) ? 'fastcomp' : 'upstream';

            let tags = _getReleaseTags();
            
            if (version.includes('latest'))
                hash = tags.releases[tags.latest];
        }
        
        let versionFile = path.join(common.emsdkBase(), which, '.emsdk_version');
        let versionData = fs.readFileSync(versionFile);

        return versionData.includes(hash);
    } catch (e) {
        console.warn('Cannot retrieve installed EMSDK version: ' + e.message);
        return false;
    }
}

////////////////////////////////////////////////////////////////////////
// End install() helpers
////////////////////////////////////////////////////////////////////////

function install(version = 'latest', force = false) {
    if (!force && _getInstalled(version))
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
    getEmsdkPath: getEmsdkPath
};
