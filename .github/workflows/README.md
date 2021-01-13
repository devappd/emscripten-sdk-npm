# emsdk-npm CI

## Branch Layout

| Branch       | Description
|--------------|------------
| `master`     | Latest code, not yet published to NPM. Tested.
| `deploy`     | Code to be tested, deployed onto `emscripten-sdk-npm`, and merged into `release-` branches
| `release-**` | Code to be tested, deployed onto `emscripten-sdk`
