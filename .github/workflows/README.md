# emsdk-npm CI

## Note on `package.json` version

The NPM version in the code is fixed as "0.3.0" to dodge merge conflicts with the `sdk-*` branches.

The actual package version is set from the tag name via the GitHub Actions runner, then deployed
onto NPM. The version change is not merged back into `master`.

## Branch Convention

| Branch           | Description
|------------------|------------
| `master`         | Latest code, not yet published to NPM. Tested.
| `npm-*` *or tag* | Code to be tested, deployed onto `emscripten-sdk-npm`, and merged into `sdk-` branches
| `sdk-*`          | Code to be tested, deployed onto `emscripten-sdk`

## Tag Convention

| Tag              | Description
|------------------|------------
| `v1.0.0`         | `emscripten-sdk` release, versioned to a specific Emscripten version.
| `1.0.0`          | `emscripten-sdk-npm` release, no version restrictions.
