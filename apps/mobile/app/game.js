import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Redirect } from 'expo-router';
import { useBingoGameContext } from '../contexts/BingoGameContext';
import BingoCard from '../components/BingoCard';
import NumberBall from '../components/NumberBall';
import WinnerModal from '../components/WinnerModal';
import CreditsDisplay from '../components/CreditsDisplay';

export default function GameScreen() {
  const router = useRouter();
  const {
    bingoCard,
    markedCells,
    drawnNumbers,
    currentNumber,
    isWinner,
    winner,
    playerCredits,
    currentPot,
    creditsWon,
    playersInRoom,
    gameState,
    GAME_STATES,
    drawNextNumber,
    toggleCell,
    returnToLobby,
  } = useBingoGameContext();

  // Sorteo automático de números cada 3-5 segundos
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING && drawnNumbers.length < 75 && !isWinner) {
      const randomDelay = 3000 + Math.random() * 2000; // 3-5 segundos
      const interval = setTimeout(() => {
        drawNextNumber();
      }, randomDelay);

      return () => clearTimeout(interval);
    }
  }, [gameState, drawnNumbers, isWinner, GAME_STATES, drawNextNumber]);

  // Redirigir al lobby si no hay juego activo
  if (!bingoCard || gameState !== GAME_STATES.PLAYING) {
    return <Redirect href="/lobby" />;
  }

  // Manejar regreso al lobby
  const handleReturnToLobby = () => {
    returnToLobby();
    router.push('/lobby');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Display de créditos */}
        <CreditsDisplay
          credits={playerCredits}
          currentPot={currentPot}
        />

        {/* Estado del juego */}
        <View style={styles.gameStatusContainer}>
          <Text style={styles.gameStatusText}>
            Jugadores: {playersInRoom.length}
          </Text>
          <Text style={styles.gameStatusText}>
            Sorteo automático ⚡
          </Text>
        </View>

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
      </ScrollView>

      {/* Modal de ganador */}
      <WinnerModal
        visible={isWinner}
        onPlayAgain={handleReturnToLobby}
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  gameStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#16213e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  gameStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
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
});
