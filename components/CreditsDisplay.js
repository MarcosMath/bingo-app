import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreditsDisplay({ credits, currentPot, betAmount }) {
  return (
    <View style={styles.container}>
      <View style={styles.creditsBox}>
        <Text style={styles.label}>Tus Créditos</Text>
        <Text style={styles.credits}>💰 {credits}</Text>
      </View>

      {currentPot > 0 && (
        <View style={styles.potBox}>
          <Text style={styles.potLabel}>Premio</Text>
          <Text style={styles.potAmount}>🏆 {currentPot}</Text>
        </View>
      )}

      <View style={styles.betBox}>
        <Text style={styles.betLabel}>Apuesta</Text>
        <Text style={styles.betAmount}>{betAmount} créditos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  creditsBox: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  credits: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  potBox: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  potLabel: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  potAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  betBox: {
    alignItems: 'center',
  },
  betLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  betAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E94B4B',
  },
});
