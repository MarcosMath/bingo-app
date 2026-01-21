import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>🎉 BINGO 🎉</Text>
        <Text style={styles.subtitle}>Juego Clásico</Text>
      </View>

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>Modo Multijugador:</Text>
        <Text style={styles.rulesText}>• Compite contra otros jugadores</Text>
        <Text style={styles.rulesText}>• Cada juego cuesta 2 créditos</Text>
        <Text style={styles.rulesText}>• Completa TODO el cartón para ganar</Text>
        <Text style={styles.rulesText}>• El ganador se lleva todo el premio</Text>
      </View>

      <Link href="/lobby" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Ir al Lobby</Text>
        </Pressable>
      </Link>

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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 20,
    color: '#a0a0a0',
    fontWeight: '600',
  },
  rulesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    width: '100%',
    maxWidth: 350,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  rulesText: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 5,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    minWidth: 250,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    fontSize: 16,
    color: '#a0a0a0',
    fontStyle: 'italic',
  },
});
