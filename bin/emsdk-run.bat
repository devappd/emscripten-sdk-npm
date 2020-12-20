@echo off

if "%1" == "" (
    echo "emsdk-run"
    echo "Usage: emsdk-run <emsdk_path> <command> [<arg>...]"
    echo "Runs a given command within the context of the emsdk environment"
    echo "in the current node project."
    exit /b 1
)

rem Set PATH and other environment vars
call %1\emsdk_env.bat

rem Get every argument after the emsdk_path
set _tail=%*
call set _tail=%%_tail:*%1=%%

rem Remove leading space from _tail
call :Trim _tail %_tail%

rem Run the binary, which should now be in PATH.
rem
rem The first block resolves an emsdk issue where the Python scripts
rem cannot find the correct path.
rem
rem The second block resolves a path expansion issue where PATH commands
rem will have their true path listed twice.

if exist "%~dp$PATH:2%2" (
    %~dp$PATH:2%_tail%
) else (
    %_tail%
)

exit /b

:Trim
SetLocal EnableDelayedExpansion
set Params=%*
for /f "tokens=1*" %%a in ("!Params!") do EndLocal & set %1=%%b
exit /b
