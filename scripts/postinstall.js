// postinstall.js
//
// If user passes --emsdk during install command,
// save it to npm config or warn.

const GetValidatedEmsdkPath = require('../src/validate.js');
const execSync = require('child_process').execSync;

const emsdkPath = GetValidatedEmsdkPath();

// Print the warning messages. Truthy if the path is valid.
if (emsdkPath) {
    // If emsdkPath is specified, save it to NPM config.
    //
    // If this path from the NPM config, I don't know if we can differentiate
    // between the `npmrc` user/global files and the command line, because
    // these are researched through the same call to `config()`.
    //
    // Therefore, just save indiscriminately to the user config.
    execSync(`npm config set emsdk "${emsdkPath}"`);

    console.log(`
Emscripten SDK installation path is set to:

    ${emsdkPath}
`.trimLeft());
}
