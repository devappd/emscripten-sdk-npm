# emsdk-npm

Proof of concept npm-module wrapper for [emscripten](https://emscripten.org/)'s [emsdk](https://github.com/emscripten-core/emsdk).

## What it does

Downloads emscripten SDK binaries into the local node_modules directory and makes emscripten tools easy to call from within your parent npm module's build scripts, without disturbing the user's global emscripten configuration.

## Command line usage

```sh
npm install --save-dev emsdk-npm
npx emsdk-checkout
npx emsdk install latest
npx emsdk activate latest
npx emsdk-run emcc test/test.c -o test/test.html
```

You can choose a specific release of emscripten to install by changing the `emsdk` parameters from "`latest`".

## Module usage

```js
const emsdk = require('emsdk-npm');

// Optionally, you can call emsdk.update() first to
// pre-emptively retrieve the latest emsdk version.
//
// Both emsdk.update() and emsdk.install() will call
// `emsdk-checkout`.

emsdk.install('latest')
.then(_ => emsdk.activate('latest'))
.then(_ => emsdk.run('emcc',
        [
            // Arguments
            'test/test.c', '-o', 'test/test.html'
        ], 
        { /* child_process.spawn options, e.g., cwd */ }
    )
)
.catch(function(err) {
    // handle err...
});
```

As with command line usage, you can choose a specific release of emscripten to install by changing the "`latest`" parameter.

## Install

```sh
npm install --emsdk='/your/install/path' --save-dev emsdk-npm
```

Use the `--emsdk` switch to specify your own install path for the Emscripten SDK. This path is saved to your `npmrc` user config and is referred to every time this package is installed.

You should specify your own path in order to save disk space. This package may be duplicated across multiple `node_modules` folders and the EMSDK will be installed into each one if you do not specify your own path.

In addition, if you are running on Windows, this package will warn you that EMSDK installation will fail if your install path is longer than 85 characters. This is a certainty when installing globally with `-g`.

In addition to the above switch, you may specify an install path via this command:

```sh
npm config set emsdk "/your/install/path"
```

## How it works

With the `emsdk-checkout` command, emsdk is checked out via git into the module's subdirectory. The `emsdk` command is then callable , which allows installing and configuring a specific emscripten binary distribution.

The various tools like `emcc` and `em++` are then available through the `emsdk-run` command (they will not work until the '`activate`' step is done).

Note that emsdk's binary releases may not be available for all platforms, and sometimes release at different times.

Note that emsdk is used in "embedded" mode where it does not alter the user's global `~/.emscripten`, so different projects may install and use different versions of emscripten.

## License

Copyright 2019 Brion Vibber

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
