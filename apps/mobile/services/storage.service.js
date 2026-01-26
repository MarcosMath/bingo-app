/**
 * Storage Service
 * Servicio para persistencia de datos con AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves para el almacenamiento
const STORAGE_KEYS = {
  AUTH_TOKEN: '@bingo:auth_token',
  USER_DATA: '@bingo:user_data',
};

class StorageService {
  /**
   * Guardar token de autenticación
   */
  async saveAuthToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      console.log('Token guardado correctamente');
    } catch (error) {
      console.error('Error al guardar token:', error);
      throw error;
    }
  }

  /**
   * Obtener token de autenticación
   */
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  /**
   * Eliminar token de autenticación
   */
  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('Token eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar token:', error);
      throw error;
    }
  }

  /**
   * Guardar datos del usuario
   */
  async saveUserData(userData) {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
      console.log('Datos de usuario guardados');
    } catch (error) {
      console.error('Error al guardar datos de usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener datos del usuario
   */
  async getUserData() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      return null;
    }
  }

  /**
   * Eliminar datos del usuario
   */
  async removeUserData() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      console.log('Datos de usuario eliminados');
    } catch (error) {
      console.error('Error al eliminar datos de usuario:', error);
      throw error;
    }
  }

  /**
   * Limpiar todo el almacenamiento de autenticación
   */
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      console.log('Todos los datos de autenticación eliminados');
    } catch (error) {
      console.error('Error al limpiar datos de autenticación:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay una sesión guardada
   */
  async hasSession() {
    try {
      const token = await this.getAuthToken();
      return token !== null && token !== '';
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      return false;
    }
  }
}

// Exportar instancia única (singleton)
export default new StorageService();
