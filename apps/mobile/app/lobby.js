import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useBingoGameContext } from '../contexts/BingoGameContext';
import CreditsDisplay from '../components/CreditsDisplay';

export default function LobbyScreen() {
  const router = useRouter();
  const { playerCredits, betAmount, initiateMatchmaking } = useBingoGameContext();

  const canPlay = playerCredits >= betAmount;

  const handlePlayNow = () => {
    const success = initiateMatchmaking();
    if (success) {
      router.push('/waiting');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎰 Bingo Multiplayer</Text>
        <Text style={styles.subtitle}>¡Juega y gana créditos!</Text>
      </View>

      <CreditsDisplay
        credits={playerCredits}
        betAmount={betAmount}
      />

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Cómo Jugar</Text>
        <Text style={styles.infoText}>• Cada juego cuesta {betAmount} créditos</Text>
        <Text style={styles.infoText}>• Compite contra 3-5 jugadores</Text>
        <Text style={styles.infoText}>• El ganador se lleva todo el premio</Text>
      </View>

      <Pressable
        style={[styles.playButton, !canPlay && styles.playButtonDisabled]}
        onPress={handlePlayNow}
        disabled={!canPlay}
      >
        <Text style={styles.playButtonText}>
          {canPlay ? `Jugar Ahora (${betAmount} créditos)` : 'Créditos Insuficientes'}
        </Text>
      </Pressable>

      {!canPlay && (
        <Text style={styles.warningText}>
          Necesitas al menos {betAmount} créditos para jugar
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#a0a0a0',
  },
  infoBox: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginVertical: 30,
    width: '100%',
    maxWidth: 400,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 8,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 20,
    minWidth: 250,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonDisabled: {
    backgroundColor: '#555',
    shadowColor: '#000',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
});
