// validate.js
//
// Ensure that a manual EMSDK install path is set under MAX_BASE_PATH chars

const config = require('@zkochan/npm-conf')();
const path = require('path');
const fs = require('fs');
const installedGlobally = require('is-installed-globally');
const pathInside = require('is-path-inside');
const { execSync } = require('child_process');

// Retain a local copy of this variable for subsequent use.
// npm-conf does not refresh during runtime.
let _EmsdkWasRun = false;

function GetValidatedEmsdkPath(overridePath = null, printMessages = false) {
    // If we're printing messages, then throw an error on first run
    // if emsdkPath is not set explicitly. We do this to give
    // the user a fair warning as install messages no longer print on
    // NPM 7.x.

    // This config object does not refresh on updates in the current process.
    // We could do so by calling require('@zkochan/npm-conf')(),
    // but I don't want to re-read the file on every call to this method.
    let firstRun;
    const configResult = config.get('emsdkWasRun');

    if (typeof configResult === 'undefined' || _EmsdkWasRun)
        firstRun = !_EmsdkWasRun;
    else
        firstRun = !configResult;

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
            // Don't throw an error if we're silent, i.e., during install.
            if (printMessages) {
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

                // Always throw (unless silent), regardless of first run
                throw new RangeError(`Emscripten SDK install path exceeds ${MAX_BASE_PATH} characters.`);
            } else {
                // Falsy result signals the calling function to reject path
                return null;
            }
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
            if (printMessages && firstRun)
                console.warn(`
WARNING: Emscripten SDK will be installed to a \`node_modules\`
folder! To save disk space, you should set an installation path manually
with this command:

    npm config set emsdk "/your/install/path"
`.trimLeft());

            // Mark for throw if we're running for the first time
            if (printMessages && firstRun) {
                execSync('npm config set emsdkWasRun "True"');
                _EmsdkWasRun = true;

                console.warn(`
This message is only printed once. To bypass, simply run your script again.
`.trimLeft());

                throw new Error('Exiting on first run to allow you to set a custom install path...');
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

    // Path is valid! Let the user know on first run.
    if (printMessages && firstRun) {
        execSync('npm config set emsdkWasRun "True"');
        _EmsdkWasRun = true;

        console.log(`
Emscripten SDK installation path is set to:

    ${testPath}
    `.trimLeft());
    }

    // We're installable
    return testPath;
}

module.exports = GetValidatedEmsdkPath;
