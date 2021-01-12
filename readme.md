# emscripten-sdk

An NPM wrapper for the [Emscripten SDK](https://emscripten.org/).

The package installs the SDK and provides a command line and a JS interface. You may install either package below,  differing in how you specify the Emscripten version:

|Package|Description
|-------|-----------
|[emscripten-sdk](https://www.npmjs.com/package/emscripten-sdk)|Specify the Emscripten version by installing the corresponding NPM version. Recommended.
|[emscripten-sdk-npm](https://www.npmjs.com/package/emscripten-sdk-npm)|Specify the Emscripten version as a parameter in the command line and JS interfaces.

## Command line usage

```sh
npx emsdk-checkout
# To update SDK tags, run both `npx emsdk-pull` and `npx emsdk update-tags`
npx emsdk install <version>
npx emsdk activate <version>
npx emsdk-run emcc test/test.c -o test/test.html
```

The `version` parameter is not required when using the `emscripten-sdk` package.

## JavaScript usage

```js
const emsdk = require('emsdk-npm');

emsdk.checkout()
.then(() => emsdk.update())
.then(() => emsdk.install(version))
.then(() => emsdk.activate(version))
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

The JS interface maps to the terminal commands with some extra safety checks. The interface will skip installation of the SDK and version if they already exist.

The `version` parameter is not required when using the `emscripten-sdk` package.

## Install

```sh
npm install --save-dev emscripten-sdk
```

Before you install this package, you must install Python 3.6+ on your system. You may download it at [python.org](https://www.python.org/downloads/) or your OS's package manager.

By default, the SDK is installed into your `node_modules` tree. You may specify a custom path by
[modifying your NPM config](https://docs.npmjs.com/cli/v6/using-npm/config) via one of the commands below. Do this **before** you install this package:

|Action|Command
|------|-------
| Save the path to your project `.npmrc` | `npm config --userconfig "/your/project/root/.npmrc" set emsdk "/your/absolute/custom/path"`
| Save the path to your user `.npmrc` | `npm config set emsdk "/your/absolute/custom/path"`
| Set an environment variable | `set NPM_CONFIG_EMSDK=/your/absolute/custom/path`
| Use a config argument to NPM temporarily | `npm [command] --emsdk="/your/absolute/custom/path"`

## Version selection

If you install the `emscripten-sdk` package, then the Emscripten version is selected via the NPM
package version. Change the version you need by editing your `package.json`.

For example, to force version `1.40.1`, you specify the NPM version as `~1.40.1-0`. On the command line:

```sh
npm install --save-dev emscripten-sdk@~1.40.1-0
```

You may only specify single versions this way. You may not specify version ranges. If you do not specify a version, then the latest version will be selected. The above string will select the latest installer revision for that version.

If you install the `emscripten-sdk-npm` package, then you will specify the `version` parameter in the command line and JS interfaces. To force version `1.40.1`, you specify `1.40.1`. To select the most recent version, you specify `latest`.

## License

MIT License; see LICENSE.
