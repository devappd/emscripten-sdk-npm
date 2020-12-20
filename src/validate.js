// validate.js
//
// Ensure that a manual EMSDK install path is set under MAX_BASE_PATH chars

const config = require('@zkochan/npm-conf')();
const path = require('path');
const fs = require('fs');
const installedGlobally = require('is-installed-globally');
const pathInside = require('is-path-inside');

function GetValidatedEmsdkPath(overridePath = null, printMessages = false) {
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

    // Keep checking until we reach an empty/non-existent dir
    let changed = false;
    while (fs.existsSync(testPath)
        && !fs.existsSync(emsdkFilePath)
    ) {
        testPath = path.join(testPath, 'emsdk');
        emsdkFilePath = path.join(testPath, 'emsdk.py');
        changed = true;
    }

    // Let the user know we changed the path if they configured it
    if (emsdkPath && changed) {
        if (printMessages)
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
            // Always print this message due to imminent failure
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

    // If emsdkPath is empty, warn that the user should set one manually.
    // Also do this if the configured path already has node_modules in it.
    let hasNodeModules = testPath.includes('node_modules');
    let emsdkPathIsGlobal = (installedGlobally && pathInside(testPath, modulePath));
    if (!emsdkPath || hasNodeModules) {
        // But don't warn if we're installing to global; in this case,
        // we retain the path into config.
        //
        // UNLESS the configured path is NOT in global! Then warn.
        if (!installedGlobally || !emsdkPathIsGlobal) {
            if (printMessages)
                console.warn(`
WARNING: Emscripten SDK will be installed to a \`node_modules\`
folder! To save disk space, you should set an installation path manually
with this command:

    npm config set emsdk "/your/install/path"
`.trimLeft());

            // Don't suggest to save global on Windows because the
            // default global path exceeds MAX_PATH easily.
            if (process.platform !== 'win32') {
                // We get here if we're a global install, but the
                // configured path is not global.
                //
                // 
                if (installedGlobally) {
                    if (printMessages)
                        console.warn(`
You may update the \`emsdk\` variable in your NPM config to point to
this global package:

    npm config set emsdk "${path.join(modulePath, 'emsdk')}"
`.trimLeft());
                } else {
                    if (printMessages)
                        console.warn(`
Or install emsdk-npm as a global package:

    npm install --global git+https://github.com/marcolovescode/emsdk-npm.git
`.trimLeft());
                }
            }
        }
    }
    // If emsdkPath is set AND we have a local `emsdk` folder, warn that
    // the user shall delete it.
    else {
        let moduleEmsdkPath = path.join(modulePath, 'emsdk');

        // Don't warn if we're installing to global. This will happen
        // if a previous global install already set `emsdk` in NPM config
        // to the global node_modules path.
        if (!emsdkPathIsGlobal && fs.existsSync(moduleEmsdkPath)) {
            // Always print this message
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
