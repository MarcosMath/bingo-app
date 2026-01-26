/**
 * Auth Context
 * Context global para el estado de autenticación
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restaurar sesión al iniciar la app
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      console.log('Restaurando sesión...');
      const userData = await authService.restoreSession();

      if (userData) {
        console.log('Sesión restaurada:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('No hay sesión guardada');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const userData = response.user || response;

      setUser(userData);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const user = response.user || response;

      setUser(user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUserCredits = (newCredits) => {
    if (user) {
      setUser({ ...user, credits: newCredits });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUserCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
};

export default AuthContext;
