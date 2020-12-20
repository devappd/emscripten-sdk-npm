@echo off

if "%1" == "" (
    echo "emsdk-run"
    echo "Usage: emsdk-run <command> [<arg>...]"
    echo "Runs a given command within the context of the emsdk environment"
    echo "in the current node project."
    exit /b 1
)

rem Set PATH and other environment vars
call %~dp0..\emsdk\emsdk_env.bat

rem Run the binary, which should now be in PATH.
rem
rem The first block resolves an emsdk issue where the Python scripts
rem cannot find the correct path.
rem
rem The second block resolves a path expansion issue where PATH commands
rem will have their true path listed twice.

if exist "%~dp$PATH:1%1" (
    %~dp$PATH:1%*
) else (
    %*
)
