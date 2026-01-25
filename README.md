# 🎰 Bingo Game - Multiplayer Monorepo

Aplicación completa de Bingo con aplicación móvil React Native y backend NestJS, organizada en una arquitectura de monorepo eficiente.

> **Nota**: Este proyecto recientemente migró a una arquitectura de monorepo. Ver [MONOREPO.md](./MONOREPO.md) para detalles de la estructura.

## 📱 Stack Tecnológico

### Frontend (Mobile App)
- **React Native** - Framework para aplicaciones móviles multiplataforma
- **Expo** - Plataforma de desarrollo y distribución
- **Expo Router** - Navegación basada en archivos
- **TypeScript** - Tipado estático

### Backend (API)
- **NestJS** - Framework progresivo de Node.js
- **Prisma** - ORM moderno de TypeScript
- **PostgreSQL** - Base de datos (Supabase)
- **JWT** - Autenticación
- **Socket.io** - WebSockets para tiempo real

### Monorepo
- **npm workspaces** - Gestión de múltiples paquetes
- **TypeScript** - Compartido entre frontend y backend

## 🏗️ Estructura del Proyecto

```
bingo-game/
├── apps/
│   ├── mobile/              # Aplicación React Native + Expo
│   │   ├── app/            # Rutas de Expo Router
│   │   ├── components/     # Componentes UI
│   │   ├── contexts/       # React Contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── package.json
│   │
│   └── backend/             # API NestJS + Prisma
│       ├── src/
│       │   ├── auth/       # Autenticación JWT
│       │   ├── users/      # Gestión de usuarios
│       │   ├── games/      # Lógica de juego y WebSockets
│       │   └── prisma/     # Servicio de base de datos
│       ├── prisma/         # Schema y migraciones
│       └── package.json
│
├── packages/
│   └── shared/              # Tipos TypeScript compartidos
│       ├── src/types/
│       │   ├── user.types.ts
│       │   ├── game.types.ts
│       │   └── api.types.ts
│       └── package.json
│
├── docs/                    # Documentación
├── MONOREPO.md             # Guía del monorepo
└── package.json            # Root - workspaces config
```

Ver [MONOREPO.md](./MONOREPO.md) para información detallada sobre la estructura.

## 🎮 Características

### Sistema de Autenticación
- Registro e inicio de sesión con JWT
- Gestión de usuarios con Prisma
- Protección de rutas con Passport
- Sistema de créditos virtuales

### Juego de Bingo
- Cartones de 5x5 con números aleatorios por columnas (B-I-N-G-O)
- Celda central "FREE" automáticamente marcada
- Auto-marcado de números cuando se sortean
- Detección automática de ganador
- Historial visual de números sorteados

### Multiplayer en Tiempo Real
- WebSockets con Socket.io
- 6 jugadores por partida
- Sincronización en tiempo real
- Lobby de espera
- Notificaciones de eventos (jugador unido, número sorteado, ganador)

### Sistema de Créditos
- Créditos iniciales al registrarse
- Costo por juego configurable
- Premio acumulado (pozo)
- Validación de créditos suficientes
- Actualización en tiempo real

## 🚀 Instalación y Ejecución

### Prerequisitos
- Node.js v18 o superior
- npm v9 o superior
- PostgreSQL (o cuenta de Supabase)
- Expo CLI (opcional)
- Dispositivo móvil con Expo Go o emulador

### Instalación Inicial

1. **Clonar el repositorio**
```bash
git clone https://github.com/MarcosMath/bingo-app.git
cd bingo-app
```

2. **Instalar todas las dependencias del monorepo**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear `apps/backend/.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:8081

# Game Settings
INITIAL_CREDITS=100
MIN_BET=10
MAX_BET=1000
```

4. **Generar cliente de Prisma y ejecutar migraciones**
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Construir paquete shared**
```bash
npm run build --workspace=@bingo/shared
```

### Desarrollo

```bash
# Terminal 1: Iniciar backend
npm run dev:backend

# Terminal 2: Iniciar mobile app
npm run dev:mobile

# O iniciar ambos simultáneamente
npm run dev:all
```

### Scripts Disponibles

Ver [MONOREPO.md](./MONOREPO.md#comandos-principales) para la lista completa de scripts.

## 📡 API Endpoints

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `GET /users` - Listar usuarios (paginado)
- `GET /users/:id` - Obtener usuario por ID
- `PATCH /users/:id` - Actualizar usuario
- `POST /users/:id/credits` - Actualizar créditos

### Juegos
- `POST /games` - Crear nuevo juego
- `GET /games` - Listar juegos
- `GET /games/:id` - Obtener juego por ID
- `POST /games/:id/join` - Unirse a un juego
- `POST /games/:id/start` - Iniciar juego (host)
- `POST /games/:id/draw` - Sortear número

### WebSocket Events
- `game:created` - Juego creado
- `game:started` - Juego iniciado
- `player:joined` - Jugador se unió
- `number:drawn` - Número sorteado
- `bingo:claimed` - Bingo reclamado

## 🧪 Testing

```bash
# Tests del backend
npm run test:backend

# Tests con cobertura
npm run test:backend -- --coverage

# Tests en modo watch
npm run test:backend -- --watch
```

## 📦 Build y Despliegue

### Backend

```bash
# Construir backend
npm run build:backend

# Iniciar en producción
cd apps/backend
npm run start:prod
```

Desplegar en:
- Railway
- Render
- Heroku
- Google Cloud Run
- AWS Elastic Beanstalk

### Mobile

```bash
# Desde apps/mobile
cd apps/mobile

# Build para Android
npx expo build:android

# Build para iOS
npx expo build:ios

# Publicar actualización OTA
npx expo publish
```

## 🎨 Personalización

### Modificar Créditos Iniciales

En `apps/backend/.env`:
```env
INITIAL_CREDITS=100
MIN_BET=10
MAX_BET=1000
```

### Agregar Nuevos Tipos Compartidos

1. Editar `packages/shared/src/types/*.ts`
2. Exportar en `packages/shared/src/index.ts`
3. Reconstruir: `npm run build --workspace=@bingo/shared`
4. Usar en backend/mobile:
```typescript
import { MyNewType } from '@bingo/shared';
```

## 📚 Documentación

- [Guía del Monorepo](./MONOREPO.md) - Estructura y workflow
- [Migración de Prisma](./apps/backend/docs/PRISMA_MIGRATION.md) - Detalles de la migración TypeORM → Prisma
- [Paquete Shared](./packages/shared/README.md) - Tipos compartidos

## 🔮 Próximas Características

- [x] Backend NestJS con Prisma
- [x] Autenticación JWT
- [x] Sistema de créditos
- [x] WebSockets para tiempo real
- [x] Estructura de monorepo
- [ ] Lobby de juegos públicos
- [ ] Diferentes modos de juego (línea, diagonal, esquinas)
- [ ] Tabla de posiciones (leaderboard)
- [ ] Sistema de amigos
- [ ] Chat en juego
- [ ] Notificaciones push
- [ ] Compra de créditos (integración de pagos)

## 🛠️ Tecnologías y Herramientas

### Backend
- NestJS 10.x
- Prisma 7.x con PostgreSQL adapter
- Socket.io 4.x
- JWT + Passport
- bcrypt para hashing
- class-validator y class-transformer

### Frontend
- React Native 0.76.x
- Expo 52.x
- Expo Router 4.x
- TypeScript 5.x

### DevOps
- npm workspaces
- Git
- PostgreSQL (Supabase)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

**MarcosMath**
- GitHub: [@MarcosMath](https://github.com/MarcosMath)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Contribución

1. Lee [MONOREPO.md](./MONOREPO.md) para entender la estructura
2. Agrega tipos compartidos en `packages/shared` cuando sea necesario
3. Sigue las convenciones de código existentes
4. Escribe tests para nuevas features
5. Actualiza la documentación

## 🙏 Agradecimientos

- Desarrollado con la asistencia de Claude Sonnet 4.5
- Inspirado en el juego tradicional de Bingo
- Comunidad de NestJS, React Native y Expo

---

**¡Diviértete jugando Bingo!** 🎉

Para más información sobre la estructura del proyecto, ver [MONOREPO.md](./MONOREPO.md).
