#!/usr/bin/env node
// emsdk-npm - emsdk.js 
// Copyright 2019 Brion Vibber
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

const os = require('os');
const path = require('path');
const common = require('./common.js');

function emsdk(args) {
    const emsdkargs = ['--embedded'].concat(args);
    const basedir = common.base();
    const emsdkdir = path.join(basedir, 'emsdk');
    const suffix = (os.type() == 'Windows_NT') ? '.bat' : '';
    const emsdk = path.join(emsdkdir, 'emsdk' + suffix);
    return common.run(emsdk, emsdkargs);
}

if (require.main === module) {
    const args = process.argv.slice(2);
    emsdk(args)
    .then(function (result) {
        process.exit(result.code);
    })
    .catch(function (err) {
        if (err instanceof ChildProcessError
            && err.code != 0)
            process.exit(err.code);
        else {
            console.error(err.message);
            process.exit(1);
        }
    });
}

module.exports = {
    run: emsdk
};
