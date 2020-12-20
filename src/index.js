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

function install(version = 'latest') {
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

function run(command, args) {
    let run_args = [command];
    if (args)
        run_args = run_args.concat(args);
    return emsdk_run.run(run_args);
}

module.exports = {
    remove: remove,
    update: update,
    install: install,
    activate: activate,
    run: run
};
