# Script de migración a estructura de monorepo (PowerShell)
# Ejecutar desde la raíz del proyecto con: .\migrate-to-monorepo.ps1

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Migrando a estructura de monorepo..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Paso 1: Renombrar package.json actual y usar el nuevo
Write-Host "`n✓ Paso 1: Configurando package.json raíz..." -ForegroundColor Green
if (Test-Path "package.json") {
    Move-Item -Path "package.json" -Destination "package-old-frontend.json.bak" -Force
}
Move-Item -Path "package-root.json" -Destination "package.json" -Force

# Paso 2: Crear backup de las carpetas originales
Write-Host "✓ Paso 2: Creando backups..." -ForegroundColor Green
if (-not (Test-Path "_old_structure")) {
    New-Item -ItemType Directory -Path "_old_structure" | Out-Null
}

# Backup de carpetas frontend originales
$frontendDirs = @("app", "components", "contexts", "hooks", "utils", "assets", "docs")
foreach ($dir in $frontendDirs) {
    if (Test-Path $dir) {
        Write-Host "  - Backup de $dir" -ForegroundColor Gray
        Copy-Item -Path $dir -Destination "_old_structure\$dir" -Recurse -Force
    }
}

# Backup de backend original
if (Test-Path "backend") {
    Write-Host "  - Backup de backend" -ForegroundColor Gray
    Copy-Item -Path "backend" -Destination "_old_structure\backend" -Recurse -Force
}

# Paso 3: Limpiar archivos duplicados en raíz
Write-Host "✓ Paso 3: Limpiando archivos duplicados..." -ForegroundColor Green
$filesToRemove = @("app.json", "babel.config.js", "metro.config.js", "tsconfig.json")
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
    }
}

# Paso 4: Instalar dependencias del monorepo
Write-Host "✓ Paso 4: Instalando dependencias..." -ForegroundColor Green
npm install

# Paso 5: Construir paquete shared
Write-Host "✓ Paso 5: Construyendo paquete @bingo/shared..." -ForegroundColor Green
npm run build --workspace=@bingo/shared

# Paso 6: Generar cliente de Prisma
Write-Host "✓ Paso 6: Generando cliente de Prisma..." -ForegroundColor Green
Set-Location apps\backend
npx prisma generate
Set-Location ..\..

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "✓ Migración completada exitosamente!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`nEstructura del monorepo:" -ForegroundColor Yellow
Write-Host "  apps/"
Write-Host "    ├── mobile/       (React Native)"
Write-Host "    └── backend/      (NestJS)"
Write-Host "  packages/"
Write-Host "    └── shared/       (Tipos compartidos)"

Write-Host "`nBackups creados en: _old_structure/" -ForegroundColor Yellow

Write-Host "`nPróximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Verificar la estructura: dir apps, dir packages"
Write-Host "  2. Ejecutar backend: npm run dev:backend"
Write-Host "  3. Ejecutar mobile: npm run dev:mobile"
Write-Host "  4. Revisar MONOREPO.md para más información"

Write-Host "`nSi algo sale mal, los backups están en _old_structure/" -ForegroundColor Yellow
Write-Host "================================================`n" -ForegroundColor Cyan
