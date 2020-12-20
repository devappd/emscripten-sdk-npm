// postinstall.js
//
// If user passes --emsdk during install command,
// save it to npm config or warn.

const GetValidatedEmsdkPath = require('../src/validate.js');
const execSync = require('child_process').execSync;
const path = require('path');

// https://stackoverflow.com/questions/37521893/determine-if-a-path-is-subdirectory-of-another-in-node-js
function isAncestorDir(papa, child) {
    const papaDirs = papa.split(path.sep).filter(dir => dir!=='');
    const childDirs = child.split(path.sep).filter(dir => dir!=='');

    return papaDirs.every((dir, i) => childDirs[i] === dir);
}

// Do sanity checks on install path and print warning messages.
const emsdkPath = GetValidatedEmsdkPath();
// presumes <module_dir>/scripts
const modulePath = path.resolve(path.join(__dirname, '..'));

// Truthy if the path is valid.
if (emsdkPath) {
    // If emsdkPath is specified, AND it does not have `node_modules` in it, then save the config.
    //
    // If this path was found by checking `config()`, I don't know if we can differentiate
    // whether it was sourced from the command line, the user config, or the global config.
    //
    // Therefore, just save indiscriminately to the user config.
    if (!isAncestorDir(modulePath, emsdkPath)) {
        execSync(`npm config set emsdk "${emsdkPath}"`);

        console.log(`
    Emscripten SDK installation path is set to:

        ${emsdkPath}
`.trimLeft());
    }
}
