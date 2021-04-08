#!/usr/bin/env node
// emsdk-npm - emsdk.js 
// Copyright 2019-2020 Brion Vibber and the emsdk-npm contributors
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

const path = require('path');
const common = require('./common.js');
const version = require('./version.js');

function emsdkContainsGitRef(emsdkDir, ref) {
    let ret = true;
    common.run("git", ["merge-base", "--is-ancestor", "HEAD", ref], { cwd: emsdkDir })
    .then(() => {
        ret = false;
    })
    .catch((err) => {
        if (err.exitStatus !== 1) {
            throw new Error(`Failed to check ancestor (${ref})`);
        }
    });
    return ret;
}

function emsdk(args, opts = {}) {
    const emsdkDir = common.emsdkBase();
    let emsdkArgs = args;
    if (!emsdkContainsGitRef(emsdkDir, "1.39.17")) {
        // release 1.39.17 was the first one with embedded mode as default setting
        emsdkArgs.push("--embedded");
    }
    const suffix = (process.platform === 'win32') ? '.bat' : '';
    const emsdk = path.join(emsdkDir, 'emsdk' + suffix);
    return common.run(emsdk, emsdkArgs, opts);
}

if (require.main === module) {
    const args = version.restrictVersionInArgs(process.argv.slice(2));

    emsdk(args).then(function () {
        process.exit(0);
    })
    .catch(function (err) {
        if ('exitStatus' in err
            && err.exitStatus != 0)
            process.exit(err.exitStatus);
        else
            process.exit(1);
    });
}

module.exports = {
    run: emsdk
};
