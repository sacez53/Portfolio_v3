@echo off
title Administration du Portfolio - Sacha Guitter
color 0b

cd /d "%~dp0"

:: 1. Priorité à l'exécutable autonome
if exist "projectmanager.exe" (
    cls
    "projectmanager.exe"
    goto end
)

if exist "tools\projectmanager\projectmanager.exe" (
    cls
    "tools\projectmanager\projectmanager.exe"
    goto end
)

if exist "tools\projectmanager.exe" (
    cls
    "tools\projectmanager.exe"
    goto end
)

:: 2. Fallback via Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe et projectmanager.exe est introuvable.
    echo Veuillez installer Node.js ou compiler l'executable avec tools\projectmanager\build.ps1.
    pause
    exit /b 1
)

cd /d "%~dp0tools\projectmanager"
if not exist "node_modules" (
    echo [INFO] Installation des dependances du gestionnaire de projets...
    call npm install
)

cls
node index.js

:end
if %errorlevel% neq 0 pause
