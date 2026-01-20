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
        <Text style={styles.rulesTitle}>Reglas del Juego:</Text>
        <Text style={styles.rulesText}>• Sortea números del 1 al 75</Text>
        <Text style={styles.rulesText}>• Marca los números en tu cartón</Text>
        <Text style={styles.rulesText}>• Completa TODO el cartón para ganar</Text>
        <Text style={styles.rulesText}>• ¡El primero en lograrlo grita BINGO!</Text>
      </View>

      <Link href="/game" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Jugar Ahora</Text>
        </Pressable>
      </Link>

      <Text style={styles.footer}>¡Buena suerte!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    color: '#4A90E2',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '600',
  },
  rulesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  rulesText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    color: '#999999',
    fontStyle: 'italic',
  },
});
