// emsdk-npm - common.js 
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

const path = require('path');
const GetValidatedEmsdkPath = require('./validate.js');
const spawn = require('cross-spawn-promise');

function moduleBase() {
    // Top-level dir for this module
    const srcdir = path.dirname(module.filename);
    const basedir = path.dirname(srcdir);
    return basedir;
}

function emsdkBase() {
    // Do sanity checks on the location and prints warning messages
    let testPath = GetValidatedEmsdkPath();

    // Will be falsy if the path is too long on Windows
    if (!testPath)
        throw new RangeError('Emscripten SDK installation path is invalid');
    
    return testPath;
}

function run(command, args, opts = {}) {
    return spawn(
        command,
        args,
        {
            stdio: [
                'inherit',
                'inherit',
                'inherit'
            ],
            ...opts
        }
    );
}

module.exports = {
    moduleBase: moduleBase,
    emsdkBase: emsdkBase,
    run: run
};
