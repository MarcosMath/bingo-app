/**
 * Auth Service
 * Servicio para autenticación (registro, login, logout)
 */

import apiService from './api.service';

class AuthService {
  /**
   * Registrar nuevo usuario
   * @param {Object} userData - { username, email, password }
   * @returns {Promise<Object>} - { access_token, user }
   */
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);

      // Si el registro es exitoso, guardar el token
      if (response.access_token) {
        apiService.setAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      console.log('Auth Service - Original error:', error);
      const handledError = this.handleAuthError(error);
      console.log('Auth Service - Handled error:', handledError);
      // Re-lanzar el error con un mensaje más amigable
      throw handledError;
    }
  }

  /**
   * Iniciar sesión
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { access_token, user }
   */
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', credentials);

      // Si el login es exitoso, guardar el token
      if (response.access_token) {
        apiService.setAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * @returns {Promise<Object>} - User profile
   */
  async getProfile() {
    try {
      return await apiService.get('/auth/profile');
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Validar token actual
   * @returns {Promise<boolean>} - True si el token es válido
   */
  async validateToken() {
    try {
      await apiService.get('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cerrar sesión
   */
  logout() {
    apiService.setAuthToken(null);
  }

  /**
   * Manejar errores de autenticación
   */
  handleAuthError(error) {
    // Error de validación
    if (error.status === 400 && error.errors) {
      const errorMessages = error.errors
        .map(err => {
          const field = err.property;
          const messages = Object.values(err.constraints || {});
          return `${field}: ${messages.join(', ')}`;
        })
        .join('\n');

      return {
        ...error,
        userMessage: `Errores de validación:\n${errorMessages}`,
      };
    }

    // Credenciales inválidas
    if (error.status === 401) {
      return {
        ...error,
        userMessage: 'Credenciales incorrectas. Verifica tu email y contraseña.',
      };
    }

    // Usuario ya existe (código 409 - Conflict)
    if (error.status === 409) {
      // Usar el mensaje específico del backend si está disponible
      const backendMessage = error.message || error.data?.message || 'Este usuario ya existe.';
      let userMessage;

      if (backendMessage.toLowerCase().includes('username')) {
        userMessage = 'Este nombre de usuario ya está en uso. Intenta con otro username.';
      } else if (backendMessage.toLowerCase().includes('email')) {
        userMessage = 'Este email ya está registrado. Intenta con otro email o inicia sesión.';
      } else {
        userMessage = backendMessage;
      }

      return {
        ...error,
        userMessage,
      };
    }

    // Error de red
    if (error.isNetworkError) {
      return {
        ...error,
        userMessage: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
      };
    }

    // Error de timeout
    if (error.isTimeout) {
      return {
        ...error,
        userMessage: 'La petición tardó demasiado. Intenta nuevamente.',
      };
    }

    // Error genérico
    return {
      ...error,
      userMessage: error.message || 'Error desconocido. Intenta nuevamente.',
    };
  }
}

export default new AuthService();
