import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NumberBall({ number }) {
  if (!number) {
    return (
      <View style={styles.container}>
        <View style={styles.ball}>
          <Text style={styles.text}>?</Text>
        </View>
        <Text style={styles.label}>Sortear número</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.ball, styles.activeBall]}>
        <Text style={styles.text}>{number}</Text>
      </View>
      <Text style={styles.label}>Último número</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  ball: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#999999',
  },
  activeBall: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  text: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333333',
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
});
