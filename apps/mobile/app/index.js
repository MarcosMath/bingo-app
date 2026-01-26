import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  // Si no está autenticado, mostrar opciones de login/registro
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.title}>🎉 BINGO 🎉</Text>
        <Text style={styles.subtitle}>Juego Clásico</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>¡Inicia sesión para jugar!</Text>
      </View>
    );
  }

  // Si está autenticado, mostrar pantalla principal
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>🎉 BINGO 🎉</Text>
      <Text style={styles.subtitle}>Juego Clásico</Text>

      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>¡Hola, {user?.username}!</Text>
        <View style={styles.creditsContainer}>
          <Text style={styles.creditsLabel}>💰 Créditos Totales:</Text>
          <Text style={styles.creditsTotalText}>{user?.creditsTotal || 0}</Text>
        </View>
        <View style={styles.creditsBreakdown}>
          <View style={styles.creditItem}>
            <Text style={styles.creditType}>CASH</Text>
            <Text style={styles.creditsCashText}>{user?.creditsCash || 0}</Text>
          </View>
          <View style={styles.creditItem}>
            <Text style={styles.creditType}>BONUS</Text>
            <Text style={styles.creditsBonusText}>{user?.creditsBonus || 0}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.lobbyButton}
        onPress={() => router.push('/lobby')}
      >
        <Text style={styles.buttonText}>Ir al Lobby</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          router.replace('/');
        }}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>¡Buena suerte!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#a0a0a0',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#a0a0a0',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  lobbyButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: 250,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  creditsContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  creditsLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  creditsTotalText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  creditsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  creditItem: {
    alignItems: 'center',
    backgroundColor: '#0f1b2e',
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  creditType: {
    fontSize: 10,
    color: '#a0a0a0',
    marginBottom: 5,
    fontWeight: '600',
  },
  creditsCashText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  creditsBonusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  logoutButton: {
    marginTop: 15,
    padding: 10,
  },
  logoutText: {
    color: '#ff6b6b',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 20,
    fontSize: 16,
    color: '#a0a0a0',
  },
});
