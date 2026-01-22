#!/bin/bash

# Script de prueba para la API de Bingo
# Uso: ./test-api.sh

API_URL="http://localhost:3000/api"
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}   Bingo API - Test Script${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}\n"

# Función para imprimir títulos
print_title() {
    echo -e "\n${COLOR_BLUE}>>> $1${COLOR_RESET}"
}

# Función para imprimir resultados exitosos
print_success() {
    echo -e "${COLOR_GREEN}✓ $1${COLOR_RESET}"
}

# Función para imprimir errores
print_error() {
    echo -e "${COLOR_RED}✗ $1${COLOR_RESET}"
}

# 1. Registro de usuario
print_title "1. Registrando nuevo usuario..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }')

if echo "$REGISTER_RESPONSE" | jq -e '.data.access_token' > /dev/null 2>&1; then
    TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.access_token')
    USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id')
    print_success "Usuario registrado correctamente"
    echo "  User ID: $USER_ID"
    echo "  Token: ${TOKEN:0:20}..."
else
    print_error "Error al registrar usuario"
    echo "$REGISTER_RESPONSE" | jq .
    exit 1
fi

# 2. Login
print_title "2. Login con credenciales..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }')

if echo "$LOGIN_RESPONSE" | jq -e '.data.access_token' > /dev/null 2>&1; then
    print_success "Login exitoso"
else
    print_error "Error en login"
    echo "$LOGIN_RESPONSE" | jq .
fi

# 3. Validar token
print_title "3. Validando token..."
VALIDATE_RESPONSE=$(curl -s $API_URL/auth/validate \
  -H "Authorization: Bearer $TOKEN")

if echo "$VALIDATE_RESPONSE" | jq -e '.data.valid' > /dev/null 2>&1; then
    print_success "Token válido"
else
    print_error "Token inválido"
fi

# 4. Obtener perfil
print_title "4. Obteniendo perfil de usuario..."
PROFILE_RESPONSE=$(curl -s $API_URL/users/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | jq -e '.data.id' > /dev/null 2>&1; then
    print_success "Perfil obtenido correctamente"
    CREDITS=$(echo $PROFILE_RESPONSE | jq -r '.data.credits')
    echo "  Créditos actuales: $CREDITS"
else
    print_error "Error al obtener perfil"
fi

# 5. Agregar créditos
print_title "5. Agregando 50 créditos..."
ADD_CREDITS_RESPONSE=$(curl -s -X POST $API_URL/users/$USER_ID/credits/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}')

if echo "$ADD_CREDITS_RESPONSE" | jq -e '.data.credits' > /dev/null 2>&1; then
    NEW_CREDITS=$(echo $ADD_CREDITS_RESPONSE | jq -r '.data.credits')
    print_success "Créditos agregados correctamente"
    echo "  Nuevos créditos: $NEW_CREDITS"
else
    print_error "Error al agregar créditos"
fi

# 6. Deducir créditos
print_title "6. Deduciendo 20 créditos..."
DEDUCT_CREDITS_RESPONSE=$(curl -s -X POST $API_URL/users/$USER_ID/credits/deduct \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 20}')

if echo "$DEDUCT_CREDITS_RESPONSE" | jq -e '.data.credits' > /dev/null 2>&1; then
    FINAL_CREDITS=$(echo $DEDUCT_CREDITS_RESPONSE | jq -r '.data.credits')
    print_success "Créditos deducidos correctamente"
    echo "  Créditos finales: $FINAL_CREDITS"
else
    print_error "Error al deducir créditos"
fi

# 7. Intentar acceder sin token
print_title "7. Intentando acceder sin token (debe fallar)..."
NO_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/users/me)
HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    print_success "Acceso denegado correctamente (401)"
else
    print_error "Debería haber retornado 401"
fi

# 8. Login con credenciales incorrectas
print_title "8. Intentando login con contraseña incorrecta (debe fallar)..."
BAD_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }')
HTTP_CODE=$(echo "$BAD_LOGIN_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    print_success "Login rechazado correctamente (401)"
else
    print_error "Debería haber retornado 401"
fi

# 9. Listar usuarios
print_title "9. Listando usuarios (paginado)..."
LIST_RESPONSE=$(curl -s "$API_URL/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LIST_RESPONSE" | jq -e '.data.data' > /dev/null 2>&1; then
    TOTAL_USERS=$(echo $LIST_RESPONSE | jq -r '.data.meta.total')
    print_success "Usuarios listados correctamente"
    echo "  Total de usuarios: $TOTAL_USERS"
else
    print_error "Error al listar usuarios"
fi

# 10. Eliminar usuario
print_title "10. Eliminando usuario de prueba..."
DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE $API_URL/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "204" ]; then
    print_success "Usuario eliminado correctamente"
else
    print_error "Error al eliminar usuario (HTTP $HTTP_CODE)"
fi

echo -e "\n${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}   Pruebas completadas!${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}\n"
