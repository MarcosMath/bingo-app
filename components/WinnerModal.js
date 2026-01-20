import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

export default function WinnerModal({ visible, onPlayAgain, winner = 'Tú' }) {
  const isPlayerWinner = winner === 'Tú';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onPlayAgain}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>¡BINGO!</Text>
          <Text style={[styles.subtitle, !isPlayerWinner && styles.lostSubtitle]}>
            {isPlayerWinner ? '¡Felicitaciones!' : '¡Fin del juego!'}
          </Text>
          <Text style={styles.message}>
            {isPlayerWinner
              ? 'Has ganado el juego'
              : `Ganó ${winner}`}
          </Text>

          <Pressable style={styles.button} onPress={onPlayAgain}>
            <Text style={styles.buttonText}>Jugar de Nuevo</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textShadowColor: '#FFA500',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  lostSubtitle: {
    color: '#E94B4B',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
