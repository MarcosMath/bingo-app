# Servicios de API - Mobile App

Servicios para conectar la aplicación móvil con el backend NestJS.

## Configuración

### 1. Configurar la URL del Backend

Edita `config/api.config.js` y actualiza las URLs según tu entorno:

```javascript
const API_URLS = {
  development: {
    // Para Android Emulator
    android: 'http://10.0.2.2:3000/api',

    // Para dispositivo físico o iOS - Reemplaza con tu IP local
    ios: 'http://192.168.1.100:3000/api', // ← Cambia esto

    // Para web
    web: 'http://localhost:3000/api',
  },
};
```

**¿Cómo obtener tu IP local?**

Windows:
```bash
ipconfig
# Busca "Dirección IPv4" en tu conexión Wi-Fi
```

Mac/Linux:
```bash
ifconfig
# Busca "inet" en tu conexión Wi-Fi
```

### 2. Asegúrate de que el Backend esté Corriendo

```bash
# Desde la raíz del monorepo
npm run dev:backend

# Deberías ver:
# 🚀 Application is running on: http://localhost:3000/api
```

### 3. Probar la Conexión

Desde Postman o curl:
```bash
curl http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123"}'
```

## Uso de los Servicios

### Auth Service

#### Registrar Usuario

```javascript
import authService from './services/auth.service';

const handleRegister = async () => {
  try {
    const response = await authService.register({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123',
    });

    console.log('Registro exitoso:', response);
    // response = { access_token: '...', user: { id, username, email, credits, ... } }
  } catch (error) {
    console.error('Error:', error.userMessage);
  }
};
```

#### Iniciar Sesión

```javascript
const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: 'john@example.com',
      password: 'Password123',
    });

    console.log('Login exitoso:', response);
    // El token se guarda automáticamente
  } catch (error) {
    console.error('Error:', error.userMessage);
  }
};
```

#### Obtener Perfil

```javascript
const getProfile = async () => {
  try {
    const user = await authService.getProfile();
    console.log('Usuario:', user);
  } catch (error) {
    console.error('Error:', error.userMessage);
  }
};
```

#### Cerrar Sesión

```javascript
authService.logout();
```

### API Service (Genérico)

Para endpoints personalizados:

```javascript
import apiService from './services/api.service';

// GET
const users = await apiService.get('/users');

// POST
const game = await apiService.post('/games', {
  mode: 'CLASSIC',
  betAmount: 10,
  maxPlayers: 6,
});

// PATCH
const updated = await apiService.patch('/users/123', {
  username: 'newname',
});

// DELETE
await apiService.delete('/games/456');
```

## Pantallas de Ejemplo

### Pantalla de Registro

Navega a `/register` en tu app:

```javascript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/register');
```

### Pantalla de Login

Navega a `/login` en tu app:

```javascript
router.push('/login');
```

## Manejo de Errores

Los servicios manejan automáticamente los errores y proporcionan mensajes amigables:

```javascript
try {
  await authService.register(data);
} catch (error) {
  // error.status - Código HTTP (400, 401, etc.)
  // error.message - Mensaje original del servidor
  // error.userMessage - Mensaje amigable para mostrar al usuario
  // error.errors - Array de errores de validación (si hay)

  Alert.alert('Error', error.userMessage);
}
```

## Tipos de Errores

- **400 - Validación**: Datos inválidos (email mal formado, contraseña débil, etc.)
- **401 - No autorizado**: Credenciales incorrectas o token expirado
- **409 - Conflicto**: Usuario ya existe
- **Network Error**: No se pudo conectar con el servidor
- **Timeout**: La petición tardó demasiado

## Próximos Pasos

1. Crear servicios para Games:
   - `services/game.service.js`
   - Crear juego, unirse, obtener estado, etc.

2. Crear servicios para Users:
   - `services/user.service.js`
   - Actualizar perfil, ver créditos, historial, etc.

3. Integrar WebSockets para tiempo real:
   - `services/socket.service.js`
   - Eventos de juego en vivo

## Debugging

### Ver logs de red

En el código:
```javascript
// En api.service.js, agrega console.log
console.log('Request URL:', url);
console.log('Request config:', config);
console.log('Response:', data);
```

### Verificar conectividad

```javascript
// Probar si el backend está accesible
fetch('http://10.0.2.2:3000/api/auth/validate')
  .then(res => console.log('Backend accesible:', res.status))
  .catch(err => console.error('Backend no accesible:', err));
```

## Notas Importantes

1. **CORS**: El backend debe permitir peticiones desde tu app móvil
2. **HTTPS**: En producción, usa HTTPS
3. **Tokens**: Los tokens se guardan en memoria, considera usar AsyncStorage para persistencia
4. **Timeout**: El timeout por defecto es 10 segundos
5. **IP Local**: Si cambias de red Wi-Fi, actualiza la IP en `api.config.js`
