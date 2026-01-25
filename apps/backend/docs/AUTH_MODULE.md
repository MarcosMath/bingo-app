# Auth Module Documentation

## 📋 Descripción

El módulo Auth gestiona la autenticación y autorización de usuarios usando JWT (JSON Web Tokens). Proporciona endpoints para registro, login y validación de tokens.

## 🏗️ Estructura

```
auth/
├── dto/
│   ├── login.dto.ts             # DTO para login
│   ├── register.dto.ts          # DTO para registro (extiende CreateUserDto)
│   ├── auth-response.dto.ts     # DTO para respuestas con token
│   └── index.ts
├── guards/
│   ├── jwt-auth.guard.ts        # Guard JWT que respeta @Public()
│   └── index.ts
├── strategies/
│   └── jwt.strategy.ts          # Estrategia de validación JWT
├── auth.controller.ts           # Controlador REST
├── auth.service.ts              # Lógica de autenticación
├── auth.module.ts               # Módulo de NestJS
└── index.ts
```

## 🔐 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AuthService
    participant UsersService
    participant JWT

    %% Registro
    Client->>API: POST /api/auth/register
    API->>AuthService: register(registerDto)
    AuthService->>UsersService: create(user)
    UsersService-->>AuthService: user
    AuthService->>JWT: sign(payload)
    JWT-->>AuthService: access_token
    AuthService-->>API: {access_token, user}
    API-->>Client: 201 Created

    %% Login
    Client->>API: POST /api/auth/login
    API->>AuthService: login(loginDto)
    AuthService->>UsersService: findByEmail(email)
    UsersService-->>AuthService: user
    AuthService->>AuthService: comparePassword()
    AuthService->>JWT: sign(payload)
    JWT-->>AuthService: access_token
    AuthService-->>API: {access_token, user}
    API-->>Client: 200 OK

    %% Requests protegidos
    Client->>API: GET /api/users/me (Bearer token)
    API->>JwtAuthGuard: canActivate()
    JwtAuthGuard->>JwtStrategy: validate(payload)
    JwtStrategy->>UsersService: findOne(id)
    UsersService-->>JwtStrategy: user
    JwtStrategy-->>JwtAuthGuard: user payload
    JwtAuthGuard-->>API: authorized
    API-->>Client: 200 OK + data
```

## 🔌 API Endpoints

### Base URL: `/api/auth`

### 1. Registro de Usuario (Público)
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "Player123",
  "avatar": "https://example.com/avatar.jpg" // opcional
}
```

**Respuesta (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "player1",
      "email": "player1@example.com",
      "credits": 100,
      "isActive": true,
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-22T00:00:00.000Z",
      "updatedAt": "2024-01-22T00:00:00.000Z"
    }
  }
}
```

### 2. Login (Público)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player1@example.com",
  "password": "Player123"
}
```

**Respuesta (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "player1",
      "email": "player1@example.com",
      "credits": 100,
      "isActive": true,
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-22T00:00:00.000Z",
      "updatedAt": "2024-01-22T00:00:00.000Z"
    }
  }
}
```

**Errores posibles:**
- 401 Unauthorized: Credenciales inválidas
- 401 Unauthorized: Usuario inactivo

### 3. Obtener Perfil (Protegido)
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid",
    "email": "player1@example.com",
    "username": "player1"
  }
}
```

### 4. Validar Token (Protegido)
```http
GET /api/auth/validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "valid": true,
    "user": {
      "id": "uuid",
      "email": "player1@example.com",
      "username": "player1"
    }
  }
}
```

## 🔒 JWT Token

### Estructura del Payload

```typescript
{
  id: string;        // UUID del usuario
  email: string;     // Email del usuario
  username: string;  // Username del usuario
  iat: number;       // Issued at (timestamp)
  exp: number;       // Expiration (timestamp)
}
```

### Configuración

- **Secret**: Configurado en `.env` como `JWT_SECRET`
- **Expiración**: Configurado en `.env` como `JWT_EXPIRATION` (default: '7d')
- **Algoritmo**: HS256 (HMAC SHA-256)

### Uso del Token

Todas las requests a endpoints protegidos deben incluir el header:

```
Authorization: Bearer {access_token}
```

## 🛡️ Guards y Decoradores

### JwtAuthGuard

Guard global que protege todos los endpoints excepto los marcados con `@Public()`.

**Implementación:**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### @Public() Decorator

Marca un endpoint como público (sin autenticación requerida).

**Uso:**
```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return await this.authService.login(loginDto);
}
```

### @CurrentUser() Decorator

Extrae el usuario actual del request (del token JWT).

**Uso:**
```typescript
@Get('profile')
async getProfile(@CurrentUser() user: UserPayload) {
  return user;
}

// O extrae un campo específico
@Get('me')
async getMe(@CurrentUser('id') userId: string) {
  return await this.usersService.findOne(userId);
}
```

## 🔧 Métodos del Servicio

### register(registerDto: RegisterDto)
- Crea un nuevo usuario usando UsersService
- Genera un JWT token
- Retorna token y datos del usuario
- Lanza ConflictException si el usuario ya existe

### login(loginDto: LoginDto)
- Valida credenciales del usuario
- Verifica que el usuario esté activo
- Genera un JWT token
- Retorna token y datos del usuario
- Lanza UnauthorizedException si las credenciales son inválidas

### validateUser(payload: UserPayload)
- Valida que el usuario existe y está activo
- Usado por JwtStrategy
- Lanza UnauthorizedException si el usuario no existe o está inactivo

## ⚠️ Manejo de Errores

### UnauthorizedException (401)
- Credenciales inválidas
- Usuario inactivo
- Token expirado o inválido
- Token no proporcionado

### ConflictException (409)
- Username ya existe (en registro)
- Email ya existe (en registro)

## 🔐 Seguridad

1. **Passwords hasheados**: Usando bcrypt del módulo Users
2. **JWT Secret**: Debe ser una cadena larga y aleatoria en producción
3. **Token Expiration**: Configurable, por defecto 7 días
4. **Validación de usuario activo**: Los usuarios inactivos no pueden autenticarse
5. **Extracción de token**: Solo desde header Authorization Bearer

## 📝 Validaciones

### LoginDto
- `email`: Requerido, formato email válido
- `password`: Requerido, string

### RegisterDto
- Extiende `CreateUserDto` del módulo Users
- Ver [USERS_MODULE.md](./USERS_MODULE.md#validaciones) para detalles

## 🧪 Testing

### Flujo completo de autenticación

```bash
# 1. Registrar nuevo usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Respuesta incluye access_token
# TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# 3. Validar token
curl http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer $TOKEN"

# 4. Acceder a endpoints protegidos
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Login fallido

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'

# Respuesta: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2024-01-22T00:00:00.000Z"
}
```

## 🔄 Integración con otros módulos

### Users Module
- Usa `UsersService.create()` para registro
- Usa `UsersService.findByEmail()` para login
- Usa `UsersService.findOne()` para validación

### Todos los módulos
- Todos los endpoints están protegidos por defecto con `JwtAuthGuard`
- Usar `@Public()` para marcar endpoints públicos
- Usar `@CurrentUser()` para acceder al usuario autenticado

## 📦 Configuración Global

El guard JWT está configurado globalmente en `main.ts`:

```typescript
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

Esto significa que **todos los endpoints requieren autenticación por defecto**, excepto los marcados con `@Public()`.

## 🔑 Endpoints Públicos Actuales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/users` (crear usuario directamente)

Todos los demás endpoints requieren token JWT.

## 🚀 Próximas Mejoras

- [ ] Refresh tokens
- [ ] Logout (blacklist de tokens)
- [ ] Rate limiting en login
- [ ] 2FA (autenticación de dos factores)
- [ ] OAuth providers (Google, Facebook)
- [ ] Password reset flow
