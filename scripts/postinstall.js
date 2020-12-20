// postinstall.js
//
// If user passes --emsdk during install command,
// save it to npm config or warn.

const config = require('@zkochan/npm-conf')();
const ValidateEmsdkPath = require('../src/validate.js');
const execSync = require('child_process').execSync;

// Get EMSDK path from NPM config. Priority:
// 1. Command line (`npm install --emsdk='path/to/emsdk' emsdk-npm`)
// 2. User npmrc config
// 3. Global npmrc config
let emsdkPath = config.get('emsdk');

// Print the warning messages. Truthy if the path is valid.
if (ValidateEmsdkPath(emsdkPath) && emsdkPath) {
    // If emsdkPath is specified, save it to NPM config
    // \todo Determine whether to save to global or user configs
    execSync(`npm config set emsdk "${emsdkPath}"`);

    console.log(`
Emscripten SDK installation path is set to:

    ${emsdkPath}
`.trimLeft());
}
