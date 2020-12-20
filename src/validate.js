// validate.js
//
// Ensure that a manual EMSDK install path is set under MAX_BASE_PATH chars

const config = require('@zkochan/npm-conf')();
const path = require('path');
const fs = require('fs');

function GetValidatedEmsdkPath(overridePath = null) {
    // Test the overridePath, or else
    // attempt to retrieve common install path. Priority:
    //
    // 1. Command line (`npm install --emsdk='path/to/emsdk' emsdk-npm`)
    // 2. User npmrc config
    // 3. Global npmrc config
    let emsdkPath = overridePath || config.get('emsdk');

    // Presumes <module>/src
    let modulePath = path.resolve(path.join(path.dirname(module.filename), '..'));
    let testPath = (emsdkPath ? path.resolve(emsdkPath) : modulePath);

    // Enforce failsafe: If user specified a non-empty directory that's
    // NOT emsdk, then affix an 'emsdk' subdirectory.
    let emsdkFilePath = path.join(testPath, 'emsdk.py');
    let emsdkFilePath2 = path.join(testPath, '.emscripten');

    // Keep checking until we reach an empty/non-existent dir
    let changed = false;
    while (fs.existsSync(testPath)
        && !fs.existsSync(emsdkFilePath) 
        && !fs.existsSync(emsdkFilePath2)
    ) {
        testPath = path.join(testPath, 'emsdk');
        changed = true;
    }

    // Let the user know we changed the path if they configured it
    if (emsdkPath && changed) {
        console.log(`
Changing the EMSDK path because it pointed to a non-empty directory.
The path is now:

    ${testPath}
`.trimLeft());
    }

    // If Windows, check if path exceeds 85 chars, or else EMSDK installation
    // will fail due to MAX_PATH limitation.
    // See https://github.com/devappd/emscripten-build-npm/issues/9
    const MAX_BASE_PATH = 85;
    if (process.platform === 'win32') {
        if (testPath.length > MAX_BASE_PATH) {
            // \todo check if user has set
            // HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled == 1
            console.warn(`
WARNING: This path exceeds ${MAX_BASE_PATH} characters, meaning that
Emscripten SDK installation will FAIL!

    ${testPath}

Set a manual EMSDK install path with this command:

    npm config set emsdk "your/installation/path"
`.trimLeft());

            // Refuse to install when the path is too long
            return null;
        }
    }

    // If emsdkPath is empty, warn that the user should set one manually
    if (!emsdkPath) {
        console.warn(`
WARNING: Emscripten SDK will be installed to your \`node_modules\`
folder! To save disk space, you should set an installation path manually
with this command:

    npm config set emsdk "/your/install/path"
`.trimLeft());
    }
    // If emsdkPath is set AND we have a local `emsdk` folder, warn that
    // the user shall delete it.
    else {
        let moduleEmsdkPath = path.join(modulePath, 'emsdk');

        if (fs.existsSync(moduleEmsdkPath)) {
            console.warn(`
WARNING: An \`emsdk\` installation exists inside this module! You should
delete this path:

    ${moduleEmsdkPath}

Your configured installation path is:

    ${testPath}
`.trimLeft())
        }
    }

    // We're installable
    return testPath;
}

module.exports = GetValidatedEmsdkPath;
