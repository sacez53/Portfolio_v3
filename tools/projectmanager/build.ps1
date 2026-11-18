# Script de compilation Single Executable Application (SEA)
# Génère projectmanager.exe et PortfolioManager.exe autonomes avec interface graphique (GUI)

$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
Set-Location -Path $scriptDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  COMPILATION DE PROJECTMANAGER.EXE (Node.js SEA + GUI)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier Node.js et libérer les processus existants
Write-Host "[1/7] Verification de l'environnement Node.js..." -ForegroundColor Yellow
try {
    Stop-Process -Name "projectmanager" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "PortfolioManager" -Force -ErrorAction SilentlyContinue
} catch {}
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Error "Node.js n'a pas ete trouve dans le PATH. Veuillez installer Node.js 18+."
    exit 1
}
$nodeVersion = & node -v
Write-Host "  -> Node.js version $nodeVersion detectee" -ForegroundColor Gray

# 2. Vérifier les dépendances
Write-Host "[2/7] Verification des dependances npm..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  -> Installation des packages via npm install..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "  -> node_modules deja present." -ForegroundColor Gray
}

# 3. Préparer les assets UI embarqués
Write-Host "[3/7] Compilation et intégration des assets UI (HTML, CSS, JS)..." -ForegroundColor Yellow
node scripts/prepare-assets.js
if (-not (Test-Path "src/embedded-assets.js")) {
    Write-Error "Echec de generation de src/embedded-assets.js"
    exit 1
}
Write-Host "  -> src/embedded-assets.js pret." -ForegroundColor Gray

# 4. Bundler le code JavaScript avec esbuild
Write-Host "[4/7] Creation du bundle CJS avec esbuild..." -ForegroundColor Yellow
npx esbuild index.js --bundle --platform=node --outfile=bundle.js --format=cjs
if (-not (Test-Path "bundle.js")) {
    Write-Error "Echec de generation de bundle.js"
    exit 1
}
Write-Host "  -> bundle.js genere avec succes." -ForegroundColor Gray

# 5. Generer le blob SEA
Write-Host "[5/7] Generation du blob SEA (node --experimental-sea-config)..." -ForegroundColor Yellow
node --experimental-sea-config sea-config.json
if (-not (Test-Path "sea-prep.blob")) {
    Write-Error "Echec de generation de sea-prep.blob"
    exit 1
}
Write-Host "  -> sea-prep.blob genere avec succes." -ForegroundColor Gray

# 6. Cloner node.exe et injecter le blob
Write-Host "[6/7] Cloner l'executable node et injection via postject..." -ForegroundColor Yellow
$nodeExePath = $nodeCmd.Source

# Les executables restent dans un seul dossier.
$binDir = Join-Path $scriptDir 'bin'
New-Item -ItemType Directory -Path $binDir -Force | Out-Null
$exePath = Join-Path $binDir 'projectmanager.exe'
Copy-Item -LiteralPath $nodeExePath -Destination $exePath -Force
npx postject $exePath NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
if ($LASTEXITCODE -ne 0) { throw 'Echec de creation de l executable.' }
Copy-Item -LiteralPath $exePath -Destination (Join-Path $binDir 'PortfolioManager.exe') -Force

# 7. Nettoyage
Write-Host "[7/7] Nettoyage des fichiers temporaires..." -ForegroundColor Yellow
if (Test-Path "bundle.js") { Remove-Item "bundle.js" -Force }
if (Test-Path "sea-prep.blob") { Remove-Item "sea-prep.blob" -Force }

Write-Host ""
Write-Host "Verification de l'executable genere..." -ForegroundColor Yellow
$testOutput = & $exePath --version
Write-Host "  -> Sortie : $testOutput" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  SUCCES : projectmanager.exe est pret a l'emploi !       " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
