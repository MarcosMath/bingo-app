import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useBingoGameContext } from '../contexts/BingoGameContext';

export default function WaitingRoomScreen() {
  const router = useRouter();
  const { playersInRoom, addAIPlayer, startGame, opponentCredits, betAmount } = useBingoGameContext();
  const [countdown, setCountdown] = useState(null);

  // Simular jugadores uniéndose
  useEffect(() => {
    // Solo ejecutar una vez al montar
    const intervals = [];
    const usedOpponents = new Set(); // Track which opponents we've already scheduled

    // Helper function to get a random available opponent
    const getRandomAvailableOpponent = () => {
      const availableOpponents = opponentCredits
        .map((credits, index) => ({ credits, index }))
        .filter(opp => opp.credits >= betAmount && !usedOpponents.has(opp.index))
        .map(opp => opp.index);

      if (availableOpponents.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * availableOpponents.length);
      const selectedOpponent = availableOpponents[randomIndex];
      usedOpponents.add(selectedOpponent); // Mark as used
      return selectedOpponent;
    };

    // Primer oponente después de 500-1000ms
    const opponent1 = getRandomAvailableOpponent();
    if (opponent1 !== null) {
      intervals.push(setTimeout(() => {
        addAIPlayer(opponent1);
      }, 500 + Math.random() * 500));
    }

    // Segundo oponente después de 1000-2000ms
    const opponent2 = getRandomAvailableOpponent();
    if (opponent2 !== null) {
      intervals.push(setTimeout(() => {
        addAIPlayer(opponent2);
      }, 1000 + Math.random() * 1000));
    }

    // Tercer oponente después de 1500-2500ms
    const opponent3 = getRandomAvailableOpponent();
    if (opponent3 !== null) {
      intervals.push(setTimeout(() => {
        addAIPlayer(opponent3);
      }, 1500 + Math.random() * 1000));
    }

    // Posible cuarto oponente (aleatorio)
    if (Math.random() > 0.3) {
      const opponent4 = getRandomAvailableOpponent();
      if (opponent4 !== null) {
        intervals.push(setTimeout(() => {
          addAIPlayer(opponent4);
        }, 2000 + Math.random() * 1000));
      }
    }

    // Posible quinto oponente (menos probable)
    if (Math.random() > 0.6) {
      const opponent5 = getRandomAvailableOpponent();
      if (opponent5 !== null) {
        intervals.push(setTimeout(() => {
          addAIPlayer(opponent5);
        }, 2500 + Math.random() * 1000));
      }
    }

    return () => {
      intervals.forEach(interval => clearTimeout(interval));
    };
  }, []); // Solo ejecutar una vez al montar

  // Iniciar countdown cuando hay suficientes jugadores
  useEffect(() => {
    if (playersInRoom.length >= 4 && countdown === null) {
      setCountdown(3);
    }
  }, [playersInRoom, countdown]);

  // Manejar countdown
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      startGame();
      router.replace('/game');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, startGame, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sala de Espera</Text>

      <View style={styles.playerCountBox}>
        <Text style={styles.playerCount}>{playersInRoom.length}/6</Text>
        <Text style={styles.playerCountLabel}>Jugadores</Text>
      </View>

      {countdown !== null ? (
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownLabel}>El juego comienza en...</Text>
        </View>
      ) : (
        <View style={styles.searchingBox}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.searchingText}>Buscando jugadores...</Text>
        </View>
      )}

      <View style={styles.playersList}>
        {playersInRoom.map((player, index) => (
          <View key={player.id} style={styles.playerItem}>
            <Text style={styles.playerIcon}>
              {player.isPlayer ? '👤' : '🤖'}
            </Text>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerStatus}>✓</Text>
          </View>
        ))}
      </View>

      {playersInRoom.length < 4 && (
        <Text style={styles.minPlayersText}>
          Mínimo 4 jugadores para comenzar
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 40,
    marginBottom: 30,
  },
  playerCountBox: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    minWidth: 150,
  },
  playerCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  playerCountLabel: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 5,
  },
  countdownBox: {
    alignItems: 'center',
    marginVertical: 30,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  countdownLabel: {
    fontSize: 18,
    color: '#e0e0e0',
    marginTop: 10,
  },
  searchingBox: {
    alignItems: 'center',
    marginVertical: 30,
  },
  searchingText: {
    fontSize: 18,
    color: '#a0a0a0',
    marginTop: 15,
  },
  playersList: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  playerIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  playerName: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
  },
  playerStatus: {
    fontSize: 20,
    color: '#4CAF50',
  },
  minPlayersText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
});
