#!/bin/bash

# Script de migración a estructura de monorepo
# Ejecutar desde la raíz del proyecto

set -e  # Detener en caso de error

echo "================================================"
echo "Migrando a estructura de monorepo..."
echo "================================================"

# Paso 1: Renombrar package.json actual y usar el nuevo
echo "✓ Paso 1: Configurando package.json raíz..."
if [ -f "package.json" ]; then
    mv package.json package-old-frontend.json.bak
fi
mv package-root.json package.json

# Paso 2: Crear backup de las carpetas originales
echo "✓ Paso 2: Creando backups..."
mkdir -p _old_structure

# Backup de carpetas frontend originales
for dir in app components contexts hooks utils assets docs; do
    if [ -d "$dir" ]; then
        echo "  - Backup de $dir"
        cp -r "$dir" "_old_structure/$dir"
    fi
done

# Backup de backend original
if [ -d "backend" ]; then
    echo "  - Backup de backend"
    cp -r "backend" "_old_structure/backend"
fi

# Paso 3: Limpiar archivos duplicados en raíz
echo "✓ Paso 3: Limpiando archivos duplicados..."
rm -f app.json babel.config.js metro.config.js tsconfig.json

# Paso 4: Instalar dependencias del monorepo
echo "✓ Paso 4: Instalando dependencias..."
npm install

# Paso 5: Construir paquete shared
echo "✓ Paso 5: Construyendo paquete @bingo/shared..."
npm run build --workspace=@bingo/shared

# Paso 6: Generar cliente de Prisma
echo "✓ Paso 6: Generando cliente de Prisma..."
cd apps/backend
npx prisma generate
cd ../..

echo ""
echo "================================================"
echo "✓ Migración completada exitosamente!"
echo "================================================"
echo ""
echo "Estructura del monorepo:"
echo "  apps/"
echo "    ├── mobile/       (React Native)"
echo "    └── backend/      (NestJS)"
echo "  packages/"
echo "    └── shared/       (Tipos compartidos)"
echo ""
echo "Backups creados en: _old_structure/"
echo ""
echo "Próximos pasos:"
echo "  1. Verificar la estructura: ls -la apps/ packages/"
echo "  2. Ejecutar backend: npm run dev:backend"
echo "  3. Ejecutar mobile: npm run dev:mobile"
echo "  4. Revisar MONOREPO.md para más información"
echo ""
echo "Si algo sale mal, los backups están en _old_structure/"
echo "================================================"
