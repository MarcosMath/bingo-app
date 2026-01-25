# Bingo Game - Estructura Monorepo

Este proyecto utiliza una arquitectura de **monorepo con npm workspaces** para gestionar eficientemente la aplicación móvil React Native y el backend NestJS.

## Estructura del Proyecto

```
bingo-game/
├── apps/
│   ├── mobile/              # Aplicación React Native + Expo
│   │   ├── app/            # Rutas de Expo Router
│   │   ├── components/     # Componentes UI
│   │   ├── contexts/       # React Contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilidades
│   │   ├── assets/         # Recursos (imágenes, fuentes)
│   │   └── package.json    # Dependencias del mobile
│   │
│   └── backend/             # API NestJS + Prisma
│       ├── src/            # Código fuente
│       ├── prisma/         # Schema y migraciones
│       └── package.json    # Dependencias del backend
│
├── packages/
│   └── shared/              # Tipos TypeScript compartidos
│       ├── src/
│       │   ├── types/      # Definiciones de tipos
│       │   └── index.ts    # Exportaciones centralizadas
│       └── package.json
│
├── docs/                    # Documentación del proyecto
├── package.json            # Root - configuración de workspaces
└── README.md               # Documentación principal
```

## Ventajas de esta Estructura

### 1. **Código Compartido**
- El paquete `@bingo/shared` contiene tipos TypeScript compartidos entre frontend y backend
- Garantiza consistencia en las interfaces de datos
- Evita duplicación de código

### 2. **Gestión Simplificada**
- Un solo `npm install` en la raíz instala todas las dependencias
- Scripts centralizados para ejecutar/construir todos los proyectos
- Versionado coherente entre proyectos

### 3. **Desarrollo Eficiente**
- Los cambios en `@bingo/shared` se reflejan inmediatamente en ambas apps
- Desarrollo paralelo de frontend y backend sin conflictos
- Mejor experiencia para el desarrollador

### 4. **Despliegue Independiente**
- Cada aplicación se puede desplegar por separado
- `apps/mobile` → Expo/App Stores
- `apps/backend` → Railway/Render/Vercel

## Comandos Principales

### Instalación Inicial

```bash
# Instalar todas las dependencias del monorepo
npm install
```

### Desarrollo

```bash
# Iniciar solo el backend
npm run dev:backend

# Iniciar solo el mobile
npm run dev:mobile

# Iniciar ambos simultáneamente
npm run dev:all
```

### Build

```bash
# Construir backend
npm run build:backend

# Construir mobile
npm run build:mobile

# Construir todo
npm run build:all
```

### Testing

```bash
# Tests del backend
npm run test:backend

# Tests del mobile
npm run test:mobile

# Todos los tests
npm run test:all
```

### Prisma (Base de Datos)

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio
```

### Linting

```bash
# Lint backend
npm run lint:backend

# Lint mobile
npm run lint:mobile

# Lint todo
npm run lint:all
```

### Limpieza

```bash
# Limpiar node_modules y build outputs
npm run clean
```

## Workspaces

Este proyecto utiliza **npm workspaces** para gestionar múltiples paquetes:

- `@bingo/mobile` - Aplicación React Native
- `@bingo/backend` - API NestJS
- `@bingo/shared` - Tipos compartidos

### Agregar Dependencias

```bash
# Agregar dependencia al backend
npm install <package> --workspace=@bingo/backend

# Agregar dependencia al mobile
npm install <package> --workspace=@bingo/mobile

# Agregar dependencia compartida (shared)
npm install <package> --workspace=@bingo/shared
```

### Ejecutar Scripts Específicos

```bash
# Ejecutar script en un workspace específico
npm run <script> --workspace=@bingo/backend
npm run <script> --workspace=@bingo/mobile
```

## Paquete Shared (@bingo/shared)

El paquete `@bingo/shared` exporta tipos comunes:

### Tipos de Usuario
- `UserPayload`, `UserResponse`, `LoginDto`, `RegisterDto`, `AuthResponse`

### Tipos de Juego
- `GameStatus`, `GameMode`, `GameResponse`, `CreateGameDto`, `BingoCardResponse`
- Eventos WebSocket

### Tipos de API
- `PaginationDto`, `PaginatedResult`, `ApiError`, `ApiResponse`

### Uso

```typescript
// En backend (apps/backend/src/)
import { UserResponse, GameStatus } from '@bingo/shared';

// En mobile (apps/mobile/)
import { AuthResponse, GameMode } from '@bingo/shared';
```

## Flujo de Trabajo Recomendado

### 1. Definir Tipos en Shared
Cuando agregues una nueva feature:
1. Define los tipos/interfaces en `packages/shared/src/types/`
2. Expórtalos en `packages/shared/src/index.ts`
3. Ejecuta `npm run build --workspace=@bingo/shared`

### 2. Implementar Backend
1. Importa los tipos de `@bingo/shared`
2. Implementa servicios, controladores, DTOs
3. Prueba con `npm run test:backend`

### 3. Implementar Mobile
1. Importa los tipos de `@bingo/shared`
2. Crea componentes, hooks, screens
3. Conecta con la API del backend

## Migración desde Estructura Anterior

La estructura anterior tenía el backend anidado dentro del proyecto mobile:

```
bingo/                     (Antes)
├── app/
├── components/
├── backend/              # Anidado - problemático
└── package.json
```

Ahora está organizado como monorepo:

```
bingo-game/               (Ahora)
├── apps/
│   ├── mobile/          # Separado
│   └── backend/         # Separado
├── packages/
│   └── shared/          # Nuevo - tipos compartidos
└── package.json         # Root
```

### Script de Migración

Se ha creado un script de migración para mover archivos de la estructura antigua a la nueva.

## Despliegue

### Backend (NestJS)
1. Construir: `npm run build:backend`
2. Desplegar `apps/backend/dist/` a:
   - Railway
   - Render
   - Heroku
   - Google Cloud Run
   - AWS Elastic Beanstalk

### Mobile (React Native)
1. Desde `apps/mobile/`:
2. `expo build:android` o `expo build:ios`
3. Publicar en:
   - Google Play Store
   - Apple App Store
   - Expo Updates (OTA)

### Variables de Entorno

Cada app tiene su propio `.env`:
- `apps/backend/.env` - Configuración del backend
- `apps/mobile/.env` (si es necesario) - Configuración del mobile

## Solución de Problemas

### "Cannot find module '@bingo/shared'"

```bash
# Reconstruir el paquete shared
npm run build --workspace=@bingo/shared

# Reinstalar dependencias
npm install
```

### Conflictos de node_modules

```bash
# Limpiar todo
npm run clean

# Reinstalar
npm install
```

### Prisma no encuentra el schema

```bash
# Asegúrate de estar en la raíz del monorepo
npm run prisma:generate
```

## Recursos

- [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Monorepo best practices](https://monorepo.tools/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)

## Contribución

1. Crea una rama desde `main`
2. Implementa cambios en el workspace correspondiente
3. Actualiza tipos en `@bingo/shared` si es necesario
4. Ejecuta tests: `npm run test:all`
5. Ejecuta linting: `npm run lint:all`
6. Crea Pull Request
