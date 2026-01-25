# Bingo Backend API

Backend API construida con NestJS para la aplicación de Bingo multijugador.

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── common/              # Módulo común con utilidades compartidas
│   │   ├── decorators/      # Decoradores personalizados (@CurrentUser, @Public)
│   │   ├── filters/         # Filtros de excepciones HTTP
│   │   ├── guards/          # Guards de autenticación y autorización
│   │   ├── interceptors/    # Interceptores (Transform, Logging)
│   │   ├── pipes/           # Pipes de validación
│   │   ├── dto/             # DTOs compartidos (Pagination)
│   │   └── interfaces/      # Interfaces compartidas
│   ├── config/              # Módulo de configuración
│   │   ├── env.config.ts    # Configuración de variables de entorno
│   │   ├── database.config.ts # Configuración de TypeORM
│   │   └── config.module.ts # Módulo de configuración
│   ├── users/               # ✅ Módulo de usuarios
│   ├── auth/                # ✅ Módulo de autenticación
│   ├── games/               # (Próximo) Módulo de juegos
│   ├── payments/            # (Próximo) Módulo de pagos
│   ├── app.module.ts        # Módulo raíz de la aplicación
│   └── main.ts              # Punto de entrada de la aplicación
├── .env                     # Variables de entorno (no commitear)
├── .env.example             # Ejemplo de variables de entorno
├── tsconfig.json            # Configuración de TypeScript
├── nest-cli.json            # Configuración de Nest CLI
└── package.json             # Dependencias y scripts
```

## 🚀 Configuración Inicial

### Prerrequisitos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn

### Instalación

1. Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
cd backend
npm install
```

2. Configurar variables de entorno:

```bash
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

3. Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE bingo_db;
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Inicia el servidor en modo desarrollo con hot-reload

# Producción
npm run build              # Compila el proyecto
npm run start:prod         # Inicia el servidor en modo producción

# Otros
npm run format             # Formatea el código con Prettier
npm run lint               # Ejecuta el linter
npm test                   # Ejecuta los tests
npm run test:watch         # Ejecuta los tests en modo watch
```

## 🛠️ Módulos Implementados

### 1. Config Module
- ✅ Gestión de variables de entorno
- ✅ Configuración de base de datos TypeORM
- ✅ Configuración global de la aplicación

### 2. Common Module
- ✅ **Decorators**: `@CurrentUser()`, `@Public()`
- ✅ **Filters**: `HttpExceptionFilter` para manejo de errores
- ✅ **Pipes**: `ValidationPipe` para validación de DTOs
- ✅ **Interceptors**: `TransformInterceptor` para formatear respuestas
- ✅ **DTOs**: `PaginationDto` para paginación estándar
- ✅ **Interfaces**: `UserPayload` para JWT

### 3. Users Module
- ✅ **Entidad User**: Gestión completa de usuarios con TypeORM
- ✅ **Hash de contraseñas**: Bcrypt con salt de 10 rounds
- ✅ **CRUD completo**: Crear, leer, actualizar y eliminar usuarios
- ✅ **Gestión de créditos**: Agregar, deducir y actualizar créditos
- ✅ **Validaciones robustas**: Username, email y password con regex
- ✅ **Paginación**: Endpoint con paginación estándar
- ✅ **DTOs seguros**: UserResponseDto excluye password de respuestas
- ✅ **Endpoints**: 10 endpoints REST (ver [documentación](./docs/USERS_MODULE.md))

### 4. Auth Module
- ✅ **JWT Authentication**: Tokens con Passport y JWT
- ✅ **Registro**: Endpoint público para crear cuenta
- ✅ **Login**: Validación de credenciales y generación de token
- ✅ **JwtAuthGuard**: Guard global con soporte para @Public()
- ✅ **JwtStrategy**: Estrategia de validación de tokens
- ✅ **@CurrentUser() decorator**: Acceso fácil al usuario autenticado
- ✅ **Token expiration**: Configurable via variables de entorno
- ✅ **Endpoints**: 4 endpoints (register, login, profile, validate)

## 🔧 Características Implementadas

### Gestión de Errores
- Filtro global de excepciones HTTP
- Respuestas de error estandarizadas con formato:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "errors": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Validación
- Pipe de validación global usando `class-validator`
- Transformación automática de DTOs con `class-transformer`

### Transform de Respuestas
- Interceptor global que formatea todas las respuestas exitosas:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {...}
}
```

### CORS
- Configurado para permitir solicitudes del frontend en `http://localhost:8081`
- Credenciales habilitadas para cookies/sesiones

## 📦 Próximos Módulos

1. ✅ ~~**Users Module**~~ - Completado
2. ✅ ~~**Auth Module**~~ - Completado
3. 🔄 **Games Module** - 60% (core lógica completa, falta Gateway y Controller)
4. **Payments Module** - Sistema de créditos y transacciones (próximo)

## 📚 Documentación Detallada

- [Users Module](./docs/USERS_MODULE.md) - Documentación completa del módulo de usuarios
- [Auth Module](./docs/AUTH_MODULE.md) - Documentación completa del módulo de autenticación
- [Games Module Progress](./docs/GAMES_MODULE_PROGRESS.md) - Estado del módulo de juegos
- [Testing](./docs/TESTING.md) - Documentación de pruebas unitarias
- [API Examples](./docs/API_EXAMPLES.md) - Ejemplos de uso de la API
- [Progress](./docs/PROGRESS.md) - Estado actual del proyecto

## 🧪 Testing

El proyecto cuenta con pruebas unitarias para validar la lógica crítica:

- **42 tests pasados** (100% success rate)
- **Cobertura**:
  - GamesService: 88.88%
  - BingoCardGenerator: 100%
- **Tiempo de ejecución**: ~4 segundos

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar con reporte de cobertura
npm run test:cov

# Modo watch para desarrollo
npm run test:watch
```

## 🔐 Variables de Entorno

Ver `.env.example` para la lista completa de variables necesarias.

## 🗄️ Base de Datos

- **ORM**: TypeORM
- **Base de datos**: PostgreSQL
- **Sincronización automática**: Habilitada en desarrollo (deshabilitada en producción)
- **Logging**: Habilitado en desarrollo

## 📄 Licencia

ISC
