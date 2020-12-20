const emsdk = require('emsdk.js');
const emsdk_checkout = require('emsdk-checkout.js');
const emsdk_run = require('emsdk-run.js');

function checkout() {
    return emsdk_checkout.run()
    .except(function (err) {
        if (typeof err !== 'ChildProcessError'
            || err.code == 0
            || !err.message.contains('already exists'))
            throw err;
        // else, assume we already checked out
        // and dismiss the error.
    });
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
    const run_args = command.concat(args);
    return emsdk_run.run(run_args);
}

module.exports = {
    update: update,
    install: install,
    activate: activate,
    run: run
};
