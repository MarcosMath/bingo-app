/**
 * API Configuration
 * Configure your backend URL here
 */

// Detectar el entorno
const isDevelopment = __DEV__;

// URLs según el entorno
const API_URLS = {
  // Para desarrollo local
  development: {
    // Si estás usando el emulador de Android
    android: 'http://10.0.2.2:3000/api',
    // Si estás usando dispositivo físico o iOS (reemplaza con tu IP local)
    ios: 'http://192.168.1.3:3000/api', // Cambiado de 8081 a 3000 (puerto del backend)
    // Para web
    web: 'http://localhost:3000/api',
  },
  // Para producción (cuando despliegues el backend)
  production: {
    default: 'https://tu-backend.railway.app/api', // Reemplaza con tu URL de producción
  },
};

/**
 * Obtener la URL base de la API según la plataforma
 */
export const getApiUrl = () => {
  if (!isDevelopment) {
    return API_URLS.production.default;
  }

  // En desarrollo, detectar plataforma
  const { Platform } = require('react-native');

  switch (Platform.OS) {
    case 'android':
      return API_URLS.development.android;
    case 'ios':
      return API_URLS.development.ios;
    case 'web':
      return API_URLS.development.web;
    default:
      return API_URLS.development.web;
  }
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 10000, // 10 segundos
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
