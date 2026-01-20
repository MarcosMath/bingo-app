import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FREE_CELL_POSITION, COLUMN_COLORS } from '../utils/constants';

export default function OpponentCard({ card, markedCells, playerNumber, isWinner }) {
  if (!card) return null;

  const isCellMarked = (index) => markedCells.includes(index);

  return (
    <View style={[styles.container, isWinner && styles.winnerContainer]}>
      <Text style={styles.playerName}>Jugador {playerNumber}</Text>
      <View style={styles.grid}>
        {card.map((cell, index) => {
          const marked = isCellMarked(index);
          const { value, isFree, column } = cell;

          const backgroundColor = marked || isFree ? COLUMN_COLORS[column] : '#FFFFFF';
          const textColor = marked || isFree ? '#FFFFFF' : '#333333';
          const opacity = marked || isFree ? 0.8 : 1;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                { backgroundColor, opacity },
                marked && styles.markedCell,
                isWinner && marked && styles.winnerCell,
              ]}
            >
              <Text style={[styles.cellText, { color: textColor }]}>
                {value}
              </Text>
            </View>
          );
        })}
      </View>
      {isWinner && <Text style={styles.winnerBadge}>🏆 GANADOR</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  winnerContainer: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  cell: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  markedCell: {
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  winnerCell: {
    borderColor: '#FFD700',
    borderWidth: 1.5,
  },
  cellText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  winnerBadge: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
});
