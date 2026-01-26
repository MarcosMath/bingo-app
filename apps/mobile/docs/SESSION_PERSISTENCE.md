# Implementación de Persistencia de Sesión

## Resumen

El sistema de autenticación ahora incluye persistencia de sesión usando `@react-native-async-storage/async-storage`. Esto permite que los usuarios permanezcan autenticados incluso después de cerrar y reabrir la aplicación.

## Arquitectura

### 1. Storage Service (`services/storage.service.js`)

Servicio singleton que maneja la persistencia de datos usando AsyncStorage.

**Métodos principales:**
- `saveAuthToken(token)` - Guarda el JWT token
- `getAuthToken()` - Recupera el token guardado
- `removeAuthToken()` - Elimina el token
- `saveUserData(userData)` - Guarda información del usuario
- `getUserData()` - Recupera información del usuario
- `clearAuthData()` - Limpia todos los datos de autenticación
- `hasSession()` - Verifica si existe una sesión guardada

**Claves de almacenamiento:**
- `@bingo:auth_token` - JWT token
- `@bingo:user_data` - Datos del usuario (username, email, credits, etc.)

### 2. Auth Service (`services/auth.service.js`)

Actualizado para integrar persistencia:

**Cambios principales:**
- `register()` y `login()` ahora guardan el token y datos del usuario en persistencia
- `logout()` ahora es asíncrono y limpia tanto memoria como persistencia
- **Nuevo método:** `restoreSession()` - Restaura la sesión desde el almacenamiento persistente

**Flujo de `restoreSession()`:**
1. Intenta obtener el token del almacenamiento
2. Si existe, lo configura en el API service
3. Valida el token con el backend
4. Si es válido, retorna los datos del usuario
5. Si es inválido, limpia todo y retorna null

### 3. Auth Context (`contexts/AuthContext.js`)

Context global para manejar el estado de autenticación en toda la app.

**Estado:**
- `user` - Datos del usuario actual
- `loading` - Indica si está verificando la sesión
- `isAuthenticated` - Boolean que indica si hay un usuario autenticado

**Métodos:**
- `login(credentials)` - Inicia sesión y actualiza el contexto
- `register(userData)` - Registra usuario y actualiza el contexto
- `logout()` - Cierra sesión y limpia el contexto
- `updateUserCredits(newCredits)` - Actualiza los créditos del usuario

**Hook personalizado:**
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```

### 4. App Layout (`app/_layout.js`)

Actualizado para envolver toda la app con `AuthProvider`:

```javascript
<AuthProvider>
  <BingoGameProvider>
    <Stack>
      {/* screens */}
    </Stack>
  </BingoGameProvider>
</AuthProvider>
```

Esto asegura que el contexto de autenticación esté disponible en todas las pantallas.

### 5. Pantallas Actualizadas

#### `app/index.js` (Home Screen)

Ahora tiene tres estados:

1. **Loading:** Muestra un spinner mientras verifica la sesión
2. **No autenticado:** Muestra botones de Login y Registro
3. **Autenticado:** Muestra información del usuario, créditos y botón para ir al lobby

**Características:**
- Auto-verifica la sesión al cargar
- Muestra créditos del usuario
- Botón de cerrar sesión
- Redirección condicional según el estado de autenticación

#### `app/login.js` y `app/register.js`

Actualizados para usar `useAuth()` en lugar de llamar directamente a `authService`.

**Ventajas:**
- El contexto se actualiza automáticamente
- El estado global de la app se sincroniza inmediatamente
- Mejor manejo de estado en toda la aplicación

## Flujo de Usuario

### Primera vez (Registro):
1. Usuario se registra en `/register`
2. AuthService guarda el token y datos del usuario en AsyncStorage
3. AuthContext actualiza el estado global
4. Usuario es redirigido a `/` (home autenticado)

### Sesión subsecuente (Auto-login):
1. App se abre
2. AuthContext llama a `restoreSession()` en el `useEffect`
3. Si hay token válido, el usuario se autentica automáticamente
4. Si el token es inválido o no existe, se muestra la pantalla de login/registro

### Login manual:
1. Usuario ingresa credenciales en `/login`
2. AuthService guarda el token y datos en AsyncStorage
3. AuthContext actualiza el estado global
4. Usuario es redirigido a `/` (home autenticado)

### Logout:
1. Usuario presiona "Cerrar Sesión"
2. AuthContext llama a `logout()`
3. AuthService limpia AsyncStorage y memoria
4. AuthContext actualiza el estado a no autenticado
5. Usuario ve la pantalla de login/registro

## Seguridad

### Validación de Token
- Cada vez que se restaura una sesión, se valida el token con el backend
- Si el token ha expirado, se limpia automáticamente
- Previene el uso de tokens inválidos o expirados

### Almacenamiento Seguro
- AsyncStorage es específico de la app (no accesible desde otras apps)
- En iOS, AsyncStorage usa archivos protegidos
- En Android, usa SharedPreferences en modo privado

### Mejores Prácticas Implementadas
- Nunca se almacena la contraseña
- Solo se guarda el JWT token
- El token se valida antes de usarse
- Limpieza automática de datos inválidos

## Testing

### Probar el Auto-Login:
1. Registra un usuario nuevo o inicia sesión
2. Cierra completamente la app
3. Vuelve a abrir la app
4. Deberías estar autenticado automáticamente

### Probar Token Expirado:
1. Inicia sesión
2. Espera a que el token expire (configurado en el backend)
3. Cierra y vuelve a abrir la app
4. Deberías ver la pantalla de login (auto-limpieza de token inválido)

### Probar Logout:
1. Inicia sesión
2. Presiona "Cerrar Sesión"
3. Deberías ver la pantalla de login/registro
4. Cierra y vuelve a abrir la app
5. Deberías seguir viendo la pantalla de login (datos limpiados correctamente)

## Próximos Pasos

1. **Protected Routes:** Crear un wrapper para rutas protegidas que requieran autenticación
2. **Refresh Token:** Implementar refresh token para extender sesiones sin re-login
3. **Offline Support:** Manejar casos donde la app está offline durante la validación
4. **Biometric Auth:** Agregar autenticación biométrica (FaceID/TouchID) como opción adicional
5. **Token Refresh Automático:** Actualizar el token antes de que expire si el usuario está activo

## Dependencias

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

## Archivos Relacionados

- `apps/mobile/services/storage.service.js` - Servicio de persistencia
- `apps/mobile/services/auth.service.js` - Servicio de autenticación (actualizado)
- `apps/mobile/contexts/AuthContext.js` - Context global de autenticación
- `apps/mobile/app/_layout.js` - Layout raíz con providers
- `apps/mobile/app/index.js` - Pantalla principal con lógica de autenticación
- `apps/mobile/app/login.js` - Pantalla de login (actualizada)
- `apps/mobile/app/register.js` - Pantalla de registro (actualizada)
