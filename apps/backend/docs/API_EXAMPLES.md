# API Examples - Ejemplos de Uso

## 📝 Ejemplos prácticos para probar la API

### Prerrequisitos

Para probar estos ejemplos necesitas:
- El servidor backend corriendo en `http://localhost:3000`
- Una herramienta como cURL, Postman, o Insomnia
- (Opcional) jq para formatear JSON en terminal

```bash
# Iniciar el servidor en modo desarrollo
cd backend
npm run start:dev
```

## 🔐 Auth Module

### 1. Registrar nuevo usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player1@example.com",
    "password": "Player123"
  }'
```

**Respuesta esperada:**
```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoicGxheWVyMUBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoicGxheWVyMSIsImlhdCI6MTcwNjEwMDAwMCwiZXhwIjoxNzA2NzA0ODAwfQ.abc123...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "player1",
      "email": "player1@example.com",
      "credits": 100,
      "isActive": true,
      "avatar": null,
      "createdAt": "2024-01-22T12:00:00.000Z",
      "updatedAt": "2024-01-22T12:00:00.000Z"
    }
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player1@example.com",
    "password": "Player123"
  }'
```

**Guardar el token para requests posteriores:**
```bash
# Extraer y guardar el token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@example.com","password":"Player123"}' \
  | jq -r '.data.access_token')

echo "Token guardado: $TOKEN"
```

### 3. Login con credenciales incorrectas (Error)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player1@example.com",
    "password": "wrongpassword"
  }'
```

**Respuesta esperada:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2024-01-22T12:00:00.000Z"
}
```

### 4. Validar token

```bash
curl http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "valid": true,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "player1@example.com",
      "username": "player1"
    }
  }
}
```

### 5. Acceder sin token (Error)

```bash
curl http://localhost:3000/api/users/me
```

**Respuesta esperada:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## 🧪 Users Module

### 1. Crear un nuevo usuario (Registro)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player1@example.com",
    "password": "Player123"
  }'
```

**Respuesta esperada:**
```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player1",
    "email": "player1@example.com",
    "credits": 100,
    "isActive": true,
    "avatar": null,
    "createdAt": "2024-01-22T12:00:00.000Z",
    "updatedAt": "2024-01-22T12:00:00.000Z"
  }
}
```

### 2. Intentar crear usuario duplicado (Error)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player2@example.com",
    "password": "Player123"
  }'
```

**Respuesta esperada:**
```json
{
  "statusCode": 409,
  "message": "Username already exists",
  "timestamp": "2024-01-22T12:00:00.000Z"
}
```

### 3. Crear usuario con contraseña débil (Error de validación)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player2",
    "email": "player2@example.com",
    "password": "weak"
  }'
```

**Respuesta esperada:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "property": "password",
      "constraints": {
        "minLength": "password must be longer than or equal to 6 characters",
        "matches": "Password must contain at least one uppercase letter, one lowercase letter and one number"
      }
    }
  ],
  "timestamp": "2024-01-22T12:00:00.000Z"
}
```

### 4. Obtener lista de usuarios (requiere autenticación)

```bash
curl http://localhost:3000/api/users?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Obtener usuario por ID

```bash
curl http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Actualizar usuario

```bash
curl -X PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar": "https://example.com/avatar.jpg"
  }'
```

### 7. Agregar créditos a un usuario

```bash
curl -X POST http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000/credits/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50
  }'
```

**Respuesta esperada:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player1",
    "email": "player1@example.com",
    "credits": 150,
    "isActive": true,
    "avatar": null,
    "createdAt": "2024-01-22T12:00:00.000Z",
    "updatedAt": "2024-01-22T12:05:00.000Z"
  }
}
```

### 8. Deducir créditos

```bash
curl -X POST http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000/credits/deduct \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 20
  }'
```

### 9. Intentar deducir más créditos de los disponibles (Error)

```bash
curl -X POST http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000/credits/deduct \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000
  }'
```

**Respuesta esperada:**
```json
{
  "statusCode": 400,
  "message": "Insufficient credits",
  "timestamp": "2024-01-22T12:00:00.000Z"
}
```

### 10. Eliminar usuario

```bash
curl -X DELETE http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta: 204 No Content**

## 📋 Postman Collection

Puedes importar esta colección en Postman para probar fácilmente todos los endpoints:

```json
{
  "info": {
    "name": "Bingo API - Users",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"player1\",\n  \"email\": \"player1@example.com\",\n  \"password\": \"Player123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/users",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "users"]
        }
      }
    },
    {
      "name": "Get Users",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/users?page=1&limit=10",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "users"],
          "query": [
            {"key": "page", "value": "1"},
            {"key": "limit", "value": "10"}
          ]
        }
      }
    }
  ]
}
```

## 🔑 Nota sobre Autenticación

**Importante**: Actualmente los endpoints que requieren autenticación retornarán un error porque el módulo Auth aún no está implementado.

Una vez implementado el módulo Auth, podrás:
1. Hacer login para obtener un JWT token
2. Usar ese token en el header `Authorization: Bearer {token}`
3. Acceder a los endpoints protegidos

Ejemplo de flujo completo:
```bash
# 1. Crear usuario (público)
curl -X POST http://localhost:3000/api/users -d '...'

# 2. Login (próximamente)
curl -X POST http://localhost:3000/api/auth/login -d '{"email":"...","password":"..."}'
# Respuesta: { "access_token": "eyJhbGc..." }

# 3. Usar token para acceder a endpoints protegidos
curl http://localhost:3000/api/users/me -H "Authorization: Bearer eyJhbGc..."
```

## 🧪 Testing con scripts

Puedes crear un script bash para probar rápidamente:

```bash
#!/bin/bash
# test-users.sh

API_URL="http://localhost:3000/api"

echo "1. Creating user..."
USER_RESPONSE=$(curl -s -X POST $API_URL/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }')

echo $USER_RESPONSE | jq .

USER_ID=$(echo $USER_RESPONSE | jq -r '.data.id')
echo "User ID: $USER_ID"

echo -e "\n2. Getting user by ID..."
curl -s $API_URL/users/$USER_ID | jq .
```

Ejecutar:
```bash
chmod +x test-users.sh
./test-users.sh
```
