@echo off
setlocal
cd /d "%~dp0"
title Administration du Portfolio - Sacha Guitter

:: Les sources Node suivent les changements du gestionnaire.
where node >nul 2>nul
if errorlevel 1 goto executable

if not exist "tools\projectmanager\node_modules" (
    pushd "tools\projectmanager"
    call npm ci
    if errorlevel 1 (
        popd
        goto executable
    )
    popd
)
node "tools\projectmanager\index.js" --path "%~dp0src" %*
goto end

:executable
if exist "tools\projectmanager\bin\projectmanager.exe" (
    "tools\projectmanager\bin\projectmanager.exe" --path "%~dp0src" %*
    goto end
)
echo [ERREUR] Installer Node.js ou compiler tools\projectmanager\build.ps1.
exit /b 1

:end
if errorlevel 1 pause
