# emsdk-npm

Proof of concept npm-module wrapper for [emscripten](https://emscripten.org/)'s [emsdk](https://github.com/emscripten-core/emsdk).

## What it does

Downloads emscripten SDK binaries into your system and makes emscripten tools easy to call from within your parent npm module's build scripts, without disturbing the user's global emscripten configuration.

## Command line usage

```sh
npm install --save-dev git+https://github.com/devappd/emsdk-npm.git
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
))
.catch(function(err) {
    // handle err...
});
```

As with command line usage, you can choose a specific release of emscripten to install by changing the "`latest`" parameter.

## Install

Before you install this package, you must have at least Python 3.6 on your system. You may download it at [python.org](https://www.python.org/downloads/), or refer to your OS's package manager.

The install command is:

```sh
npm install --save-dev git+https://github.com/devappd/emsdk-npm.git
```

By default, EMSDK is installed into your `node_modules` tree. You may specify a custom path by
[modifying your NPM config](https://docs.npmjs.com/cli/v6/using-npm/config) via one of the following:

|Method|Command
|------|-------
| Commit the path to your user `.npmrc` | `npm config set emsdk "/your/install/path"`
| Set an environment variable | `set NPM_CONFIG_EMSDK=/your/install/path`
| Use a config argument to NPM temporarily | `npm [command] --emsdk="/your/install/path"`

You should specify your own path in order to save disk space. In addition, if you are running on Windows, EMSDK installation will fail if your install path is longer than 85 characters.

## How it works

With the `emsdk-checkout` command, emsdk is checked out via git into the module's subdirectory. The `emsdk` command is then callable , which allows installing and configuring a specific emscripten binary distribution.

The various tools like `emcc` and `em++` are then available through the `emsdk-run` command (they will not work until the '`activate`' step is done).

Note that emsdk's binary releases may not be available for all platforms, and sometimes release at different times.

Note that emsdk is used in "embedded" mode where it does not alter the user's global `~/.emscripten`, so different projects may install and use different versions of emscripten.

## License

Copyright 2019-2020 Brion Vibber and the emsdk-npm contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
