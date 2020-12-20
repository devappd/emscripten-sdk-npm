// postinstall.js
//
// If user passes --emsdk during install command,
// save it to npm config or warn.

const GetValidatedEmsdkPath = require('../src/validate.js');
const execSync = require('child_process').execSync;
const installedGlobally = require('is-installed-globally');

function main() {
    // Do sanity checks on install path and print warning messages.
    const emsdkPath = GetValidatedEmsdkPath();

    // Truthy if the path is valid.
    if (emsdkPath) {
        // If emsdkPath is specified, AND it's not going to node_modules
        // (OR if this is a global installation), then save the config.
        //
        // If this path was found by checking `config()`, I don't know if we can differentiate
        // whether it was sourced from the command line, the user config, or the global config.
        //
        // Therefore, just save indiscriminately to the user config.
        if (installedGlobally || !emsdkPath.includes('node_modules')) {
            execSync(`npm config set emsdk "${emsdkPath}"`);

            console.log(`
Emscripten SDK installation path is set to:

    ${emsdkPath}
`.trimLeft());
        }
    }
}

main();
