import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useBingoGame from '../hooks/useBingoGame';
import BingoCard from '../components/BingoCard';
import NumberBall from '../components/NumberBall';
import WinnerModal from '../components/WinnerModal';
import CreditsDisplay from '../components/CreditsDisplay';

export default function GameScreen() {
  const {
    bingoCard,
    markedCells,
    opponentCards,
    opponentMarkedCells,
    drawnNumbers,
    currentNumber,
    isWinner,
    winner,
    playerCredits,
    currentPot,
    creditsWon,
    betAmount,
    startNewGame,
    drawNextNumber,
    toggleCell,
  } = useBingoGame();

  const [gameStarted, setGameStarted] = useState(false);

  // Función para iniciar un nuevo juego
  const handleStartNewGame = () => {
    if (playerCredits < betAmount) {
      Alert.alert(
        'Sin créditos',
        'No tienes suficientes créditos para jugar. Necesitas al menos ' + betAmount + ' créditos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const success = startNewGame();
    if (success) {
      setGameStarted(true);
    } else {
      Alert.alert(
        'No se puede iniciar',
        'No hay suficientes jugadores con créditos para iniciar la partida.',
        [{ text: 'OK' }]
      );
    }
  };

  // Inicializar juego al montar el componente
  useEffect(() => {
    handleStartNewGame();
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
        {/* Display de créditos */}
        <CreditsDisplay
          credits={playerCredits}
          currentPot={currentPot}
          betAmount={betAmount}
        />

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

        {/* Cartón del jugador */}
        <BingoCard
          card={bingoCard}
          markedCells={markedCells}
          onCellPress={toggleCell}
        />

        {/* Historial de números sorteados */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Números Sorteados: {drawnNumbers.length}</Text>
          <View style={styles.historyGrid}>
            {drawnNumbers.map((num, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyNumber}>{num}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botón de reiniciar */}
        <Pressable
          style={[
            styles.resetButton,
            playerCredits < betAmount && styles.disabledButton
          ]}
          onPress={handleStartNewGame}
          disabled={playerCredits < betAmount}
        >
          <Text style={styles.resetButtonText}>
            {playerCredits < betAmount ? 'Sin créditos' : 'Nuevo Juego'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Modal de ganador */}
      <WinnerModal
        visible={isWinner}
        onPlayAgain={handleStartNewGame}
        winner={winner === 'player' ? 'Tú' : `Jugador ${winner + 1}`}
        creditsWon={creditsWon}
      />
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
    textAlign: 'center',
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  historyItem: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
