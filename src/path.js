// path.js
//
// Ensure that a manual EMSDK install path is set under MAX_BASE_PATH chars

const config = require('@zkochan/npm-conf')();
const path = require('path');
const fs = require('fs');

function _CheckNonEmptyPath(testPath) {
    // Sanity check: If user specified a non-empty directory that's
    // NOT emsdk, then fail.
    let emsdkFilePath = path.join(testPath, 'emsdk.py');

    if (fs.existsSync(emsdkFilePath)) {
        console.warn(`
WARNING: Your configured path is not empty! Specify an empty path.

    ${testPath}
`.trimLeft());

        throw new RangeError(`Emscripten SDK install path is not empty.`);
    }
}

function _CheckLengthOfPath(testPath) {
    // Sanity check: If Windows, check if path exceeds 85 chars, or else EMSDK installation
    // will fail due to MAX_PATH limitation.
    // See https://github.com/devappd/emscripten-build-npm/issues/6
    const MAX_BASE_PATH = 85;

    if (process.platform === 'win32') {
        if (testPath.length > MAX_BASE_PATH) {
            console.warn(`
WARNING: This path exceeds ${MAX_BASE_PATH} characters, meaning that
Emscripten SDK installation will FAIL!

    ${testPath}

Set a manual EMSDK install path with this command:

    npm config set emsdk "your/installation/path"
`.trimLeft());

            throw new RangeError(`Emscripten SDK install path exceeds ${MAX_BASE_PATH} characters.`);
        }
    }
}

function GetEmsdkPath() {
    // Retrieve the path from NPM config (cmd argument or .npmrc) or default to node_modules.
    let configPath = config.get('emsdk');

    // Presumes <module>/src
    let modulePath = path.resolve(path.join(path.dirname(module.filename), '..', 'emsdk'));
    let testPath = (configPath ? path.resolve(configPath) : modulePath);

    // Throws exception if failed
    _CheckNonEmptyPath(testPath);
    _CheckLengthOfPath(testPath);

    // We're installable
    return testPath;
}

module.exports = GetEmsdkPath;
