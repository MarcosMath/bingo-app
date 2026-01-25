# Users Module Documentation

## 📋 Descripción

El módulo Users gestiona todo lo relacionado con los usuarios de la aplicación de bingo, incluyendo registro, perfiles, gestión de créditos y operaciones CRUD.

## 🏗️ Estructura

```
users/
├── dto/
│   ├── create-user.dto.ts       # DTO para crear usuarios
│   ├── update-user.dto.ts       # DTO para actualizar usuarios
│   ├── user-response.dto.ts     # DTO para respuestas (sin password)
│   ├── update-credits.dto.ts    # DTO para actualizar créditos
│   └── index.ts
├── entities/
│   └── user.entity.ts           # Entidad User con TypeORM
├── users.controller.ts          # Controlador REST
├── users.service.ts             # Lógica de negocio
├── users.module.ts              # Módulo de NestJS
└── index.ts
```

## 📊 Entidad User

### Campos

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único | Primary Key, Auto-generado |
| `username` | string | Nombre de usuario | Único, 3-50 caracteres, alfanumérico |
| `email` | string | Email del usuario | Único, formato email válido |
| `password` | string | Contraseña hasheada | Mínimo 6 caracteres, requiere mayúscula, minúscula y número |
| `credits` | decimal | Créditos del usuario | Decimal(10,2), por defecto 100 |
| `isActive` | boolean | Estado del usuario | Por defecto true |
| `avatar` | string | URL del avatar | Opcional, máximo 255 caracteres |
| `createdAt` | timestamp | Fecha de creación | Auto-generado |
| `updatedAt` | timestamp | Fecha de actualización | Auto-actualizado |

### Características

- **Hash automático de contraseñas**: Usa bcrypt con salt de 10 rounds
- **Método `comparePassword()`**: Para verificar contraseñas
- **Método `toJSON()`**: Excluye automáticamente el password de las respuestas
- **Select false en password**: El campo password no se incluye por defecto en las queries

## 🔌 API Endpoints

### Base URL: `/api/users`

### 1. Crear Usuario (Público)
```http
POST /api/users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123",
  "avatar": "https://example.com/avatar.jpg" // opcional
}
```

**Respuesta (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "credits": 100,
    "isActive": true,
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Obtener Todos los Usuarios (Paginado)
```http
GET /api/users?page=1&limit=10
Authorization: Bearer {token}
```

**Respuesta (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "data": [...],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 3. Obtener Perfil Propio
```http
GET /api/users/me
Authorization: Bearer {token}
```

### 4. Obtener Usuario por ID
```http
GET /api/users/:id
Authorization: Bearer {token}
```

### 5. Actualizar Perfil Propio
```http
PATCH /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com",
  "password": "NewPassword123",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### 6. Actualizar Usuario por ID
```http
PATCH /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "isActive": false
}
```

### 7. Eliminar Usuario
```http
DELETE /api/users/:id
Authorization: Bearer {token}
```

**Respuesta: 204 No Content**

### 8. Actualizar Créditos (Establecer valor absoluto)
```http
PATCH /api/users/:id/credits
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500
}
```

### 9. Agregar Créditos
```http
POST /api/users/:id/credits/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100
}
```

### 10. Deducir Créditos
```http
POST /api/users/:id/credits/deduct
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50
}
```

## 🔒 Validaciones

### CreateUserDto
- `username`:
  - Requerido
  - 3-50 caracteres
  - Solo letras, números, guiones y guiones bajos
- `email`:
  - Requerido
  - Formato email válido
  - Máximo 100 caracteres
- `password`:
  - Requerido
  - Mínimo 6 caracteres
  - Al menos una mayúscula, una minúscula y un número
- `avatar`: Opcional, máximo 255 caracteres

### UpdateUserDto
Todos los campos son opcionales (partial de CreateUserDto) + `isActive`

### UpdateCreditsDto
- `amount`: Número requerido, mínimo 0

## 🔧 Métodos del Servicio

### Principales
- `create(createUserDto)`: Crea un nuevo usuario con créditos iniciales
- `findAll(paginationDto)`: Obtiene usuarios paginados
- `findOne(id)`: Busca usuario por ID
- `findByEmail(email)`: Busca usuario por email (incluye password para auth)
- `findByUsername(username)`: Busca usuario por username (incluye password para auth)
- `update(id, updateUserDto)`: Actualiza usuario
- `remove(id)`: Elimina usuario

### Gestión de Créditos
- `updateCredits(id, amount)`: Establece créditos a un valor específico
- `addCredits(id, amount)`: Suma créditos al balance actual
- `deductCredits(id, amount)`: Resta créditos del balance actual
- `hasCredits(id, amount)`: Verifica si el usuario tiene créditos suficientes

## ⚠️ Manejo de Errores

### ConflictException (409)
- Username ya existe
- Email ya existe

### NotFoundException (404)
- Usuario no encontrado

### BadRequestException (400)
- Créditos insuficientes
- Cantidad inválida (menor o igual a 0)
- Validación de DTOs fallida

## 🔐 Seguridad

1. **Contraseñas Hasheadas**: bcrypt con salt de 10 rounds
2. **Password excluido por defecto**: No se incluye en queries regulares
3. **Validación estricta**: Regex y validadores de class-validator
4. **UserResponseDto**: Asegura que el password nunca se exponga en respuestas

## 🧪 Testing

Para probar el módulo Users:

```bash
# Iniciar el servidor en modo desarrollo
cd backend
npm run start:dev

# El servidor estará disponible en http://localhost:3000/api
```

### Probar con cURL

```bash
# Crear usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Obtener usuarios
curl http://localhost:3000/api/users?page=1&limit=10 \
  -H "Authorization: Bearer {token}"
```

## 📝 Notas

1. El endpoint `POST /api/users` es **público** (decorado con `@Public()`) para permitir el registro
2. Todos los demás endpoints requieren autenticación (se implementará en el Auth Module)
3. Los créditos iniciales se configuran en `.env` con la variable `INITIAL_CREDITS`
4. La entidad usa `@BeforeInsert()` y `@BeforeUpdate()` para hashear passwords automáticamente
5. Los métodos `findByEmail` y `findByUsername` incluyen el password en el select para usarse en autenticación

## 🔄 Integración con otros módulos

- **Auth Module**: Usará `findByEmail` y `comparePassword` para login
- **Games Module**: Usará métodos de créditos para apuestas
- **Payments Module**: Usará `addCredits` para recargas
