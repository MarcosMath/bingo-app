import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BingoCell from './BingoCell';
import { COLUMNS, COLUMN_COLORS } from '../utils/constants';

export default function BingoCard({ card, markedCells, onCellPress }) {
  const isCellMarked = (index) => markedCells.includes(index);

  return (
    <View style={styles.container}>
      {/* Header con letras B-I-N-G-O */}
      <View style={styles.header}>
        {COLUMNS.map((column) => (
          <View
            key={column}
            style={[styles.headerCell, { backgroundColor: COLUMN_COLORS[column] }]}
          >
            <Text style={styles.headerText}>{column}</Text>
          </View>
        ))}
      </View>

      {/* Grid de 5x5 */}
      <View style={styles.grid}>
        {card.map((cell, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;

          return (
            <View key={index} style={styles.cellWrapper}>
              <BingoCell
                cell={cell}
                isMarked={isCellMarked(index)}
                onPress={() => onCellPress(index)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  headerCell: {
    width: 64,
    height: 40,
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 340,
    justifyContent: 'center',
  },
  cellWrapper: {
    // Cada celda ocupa 1/5 del ancho
  },
});
