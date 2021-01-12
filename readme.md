# emsdk-npm

An NPM wrapper that downloads the [Emscripten SDK](https://emscripten.org/) binaries into your system and makes Emscripten tools easy to call from within your parent NPM module's build scripts.

By default, it does not disturb the user's global Emscripten configuration. You can also configure this package to refer to your existing installation.

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

The JS API maps to the terminal commands with some extra safety checks.
The calls will check if the SDK and version are already installed. If
they are, then the calls return immediately.

```js
const emsdk = require('emsdk-npm');

emsdk.checkout()
.then(() => emsdk.update())
.then(() => emsdk.install('latest'))
.then(() => emsdk.activate('latest'))
.then(() => emsdk.run(
    'emcc',
    [
        // Arguments
        'test/test.c', '-o', 'test/test.html'
    ], 
    { 
        // child_process.spawn options, e.g., cwd
    }
))
.catch((err) => {
    // handle err...
});
```

As with command line usage, you can choose a specific release of emscripten to install by changing the "`latest`" parameter.

## Install

Before you install this package, you must install Python 3.6+ on your system. You may download it at [python.org](https://www.python.org/downloads/), or refer to your OS's package manager.

The install command is:

```sh
npm install --save-dev git+https://github.com/devappd/emsdk-npm.git
```

By default, EMSDK is installed into your `node_modules` tree. You may specify a custom path by
[modifying your NPM config](https://docs.npmjs.com/cli/v6/using-npm/config) via one of the following:

|Method|Command
|------|-------
| Save the path to your project `.npmrc` | `npm config --userconfig "/your/project/path/.npmrc" set emsdk "/your/install/path"`
| Save the path to your user `.npmrc` | `npm config set emsdk "/your/install/path"`
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
