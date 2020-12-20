// validate.js
//
// Ensure that a manual EMSDK install path is set under MAX_BASE_PATH chars

const path = require('path');
const fs = require('fs');

function ValidateEmsdkPath(emsdkPath) {
    // emsdkPath and modulePath refer to the path BEFORE the "emsdk" repo folder

    // Presumes <module>/src
    let modulePath = path.resolve(path.join(path.dirname(module.filename), '..'));
    let testPath = (emsdkPath ? path.resolve(emsdkPath) : modulePath);

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

Set a manual EMSDK install path with this command. The \`emsdk\` folder
will become a subdirectory of this path:

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

The \`emsdk\` folder will become a subdirectory of this path.
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

module.exports = ValidateEmsdkPath;
