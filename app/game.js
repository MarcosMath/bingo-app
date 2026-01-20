import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useBingoGame from '../hooks/useBingoGame';
import BingoCard from '../components/BingoCard';
import NumberBall from '../components/NumberBall';
import WinnerModal from '../components/WinnerModal';

export default function GameScreen() {
  const {
    bingoCard,
    markedCells,
    drawnNumbers,
    currentNumber,
    isWinner,
    startNewGame,
    drawNextNumber,
    toggleCell,
  } = useBingoGame();

  // Inicializar juego al montar el componente
  useEffect(() => {
    startNewGame();
  }, []);

  if (!bingoCard) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Número actual */}
        <NumberBall number={currentNumber} />

        {/* Información del juego */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Números sorteados: {drawnNumbers.length} / 75
          </Text>
          <Text style={styles.infoText}>
            Marcados: {markedCells.length - 1} / 24
          </Text>
        </View>

        {/* Botón de sorteo */}
        <Pressable
          style={[styles.drawButton, drawnNumbers.length >= 75 && styles.disabledButton]}
          onPress={drawNextNumber}
          disabled={drawnNumbers.length >= 75 || isWinner}
        >
          <Text style={styles.drawButtonText}>
            {drawnNumbers.length >= 75 ? 'Sin números' : 'Sortear Número'}
          </Text>
        </Pressable>

        {/* Cartón de bingo */}
        <BingoCard
          card={bingoCard}
          markedCells={markedCells}
          onCellPress={toggleCell}
        />

        {/* Historial de números sorteados */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Números Sorteados:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.historyList}>
              {drawnNumbers.map((num, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyNumber}>{num}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Botón de reiniciar */}
        <Pressable style={styles.resetButton} onPress={startNewGame}>
          <Text style={styles.resetButtonText}>Nuevo Juego</Text>
        </Pressable>
      </ScrollView>

      {/* Modal de ganador */}
      <WinnerModal visible={isWinner} onPlayAgain={startNewGame} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  drawButton: {
    backgroundColor: '#50C878',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  drawButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historyContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  historyList: {
    flexDirection: 'row',
    gap: 8,
  },
  historyItem: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  historyNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#E94B4B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
