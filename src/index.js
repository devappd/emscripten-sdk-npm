const emsdk = require('./emsdk.js');
const emsdk_checkout = require('./emsdk-checkout.js');
const emsdk_run = require('./emsdk-run.js');
const shelljs = require('shelljs');
const path = require('path');
const common = require('./common.js');
const fs = require('fs');

function remove() {
    let emsdk_path = path.join(common.base(), 'emsdk');

    if (fs.existsSync(emsdk_path))
        shelljs.rm('-rf', emsdk_path);

    return Promise.resolve();
}

function checkout(force = false) {
    let emsdk_path = path.join(common.base(), 'emsdk');

    if (fs.existsSync(emsdk_path)) {
        if (force)
            remove();
        else
            return Promise.resolve();
    }

    return emsdk_checkout.run();
}

function update() {
    // Checkout here so that the user can
    // pre-emptively update() before calling
    // install().
    return checkout()
    .then(function () {
        // Because we clone from git, emsdk
        // does nothing upon "update", but
        // does suggest to use "update-tags" instead.
        return emsdk.run([
            'update-tags'
        ]);
    })
}

function _getReleaseTags() {
    let tagsFile = path.join(common.base(), 'emsdk', 'emscripten-releases-tags.txt');
    let rawData = fs.readFileSync(tagsFile);
    return JSON.parse(rawData);
}

function _getTotHash() {
    let totFile = path.join(common.base(), 'emsdk', 'emscripten-releases-tot.txt');
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
        
        let versionFile = path.join(common.base(), 'emsdk', which, '.emsdk_version');
        let versionData = fs.readFileSync(versionFile);

        return versionData.includes(hash);
    } catch (e) {
        console.warn('Error retrieving installed EMSDK version: ' + e.message);
        return false;
    }
}

function install(version = 'latest', force = false) {
    if (!force && _getInstalled(version))
        return Promise.resolve();

    return checkout()
    .then(function () {
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
    let run_args = [command];
    if (args)
        run_args = run_args.concat(args);
    return emsdk_run.run(run_args, opts);
}

module.exports = {
    remove: remove,
    update: update,
    install: install,
    activate: activate,
    run: run
};
