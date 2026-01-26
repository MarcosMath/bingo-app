/**
 * API Service
 * Servicio base para todas las llamadas a la API
 */

import { API_CONFIG } from '../config/api.config';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  /**
   * Realizar petición HTTP genérica
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Agregar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      console.log('API Request:', url, config);
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      console.log('API Response status:', response.status);

      // Parsear respuesta JSON
      const data = await response.json();
      console.log('API Response data:', data);

      // Si la respuesta no es exitosa, lanzar error
      if (!response.ok) {
        console.error('API Error:', data);
        throw {
          status: response.status,
          message: data.message || 'Error en la petición',
          errors: data.errors || [],
          data,
        };
      }

      // El backend envuelve las respuestas exitosas en {statusCode, message, data}
      // Si existe el campo 'data', extraerlo; si no, retornar la respuesta completa
      if (data && typeof data === 'object' && 'data' in data) {
        console.log('Extracting data from wrapped response:', data.data);
        return data.data;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Manejar errores de red
      if (error.name === 'AbortError') {
        throw {
          status: 0,
          message: 'La petición ha excedido el tiempo de espera',
          isTimeout: true,
        };
      }

      // Si es un error de fetch (red)
      if (!error.status) {
        throw {
          status: 0,
          message: 'Error de conexión. Verifica tu conexión a internet y que el backend esté corriendo.',
          isNetworkError: true,
        };
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Establecer token de autenticación
   */
  setAuthToken(token) {
    if (token) {
      this.defaultHeaders.Authorization = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders.Authorization;
    }
  }
}

// Exportar instancia única (singleton)
export default new ApiService();
