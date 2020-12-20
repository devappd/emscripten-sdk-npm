#!/usr/bin/env node
// emsdk-npm - emsdk-run.js 
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
const common = require('./common.js');

function emsdkRun(cmd, args, opts = {}) {
    // validate parameters
    if (!cmd)
        // nothing to do
        return Promise.reject('No command passed to EMSDK.');
    
    // args needs to be an array for operations later
    if (args) {
        if (!Array.isArray(args))
            args = [args];
    } else
        args = [];

    // Retrieve our paths
    const modulePath = common.moduleBase();
    const emsdkPath = common.emsdkBase();

    // Construct emsdk_env script command
    const prefix = (process.platform !== 'win32') ? '. ' : '';
    const suffix = (process.platform === 'win32') ? '.bat' : '.sh';
    const emsdkEnvPath = path.join(emsdkPath, 'emsdk_env' + suffix);

    // We run two commands in one call to spawn() by enabling
    // { "shell": true }. The command is passed as "emsdk_env.bat &&", then
    // the args array represents the second command and its args.
    //
    // This works because the args are concatenated to the command to create
    // the final command string in <node_internal>/child_process.js.
    // What gets passed to the shell (cmd.exe or /bin/bash) is
    // "emsdk_env.bat && your_cmd --args1 --args2"
    const cwd = process.cwd();
    // Change dir to make sure `emsdk_env` works correctly.
    const emsdkEnvCommand = 
        `cd "${emsdkPath}" && `+
        `${prefix}"${emsdkEnvPath}" && ` +
        `cd "${cwd}" && `;
    const commandArgs = [cmd, ...args];

    return common.run(emsdkEnvCommand, commandArgs, {...opts, "shell": true });
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const cmd = args.shift();

    emsdkRun(cmd, args).then(_ => {
        process.exit(0);
    })
    .catch(err => {
        if ('exitStatus' in err
            && err.exitStatus != 0)
            process.exit(err.exitStatus);
        else {
            console.error(err.stderr);
            process.exit(1);
        }
    });
}

module.exports = {
    run: emsdkRun
};
