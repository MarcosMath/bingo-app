import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLUMN_COLORS } from '../utils/constants';

export default function BingoCell({ cell, isMarked, onPress }) {
  const { value, column, isFree } = cell;

  const backgroundColor = isMarked || isFree ? COLUMN_COLORS[column] : '#FFFFFF';
  const textColor = isMarked || isFree ? '#FFFFFF' : '#333333';
  const opacity = isMarked || isFree ? 0.8 : 1;

  return (
    <Pressable
      style={[
        styles.cell,
        { backgroundColor, opacity },
        isMarked && styles.markedCell,
      ]}
      onPress={() => !isFree && onPress()}
      disabled={isFree}
    >
      <Text style={[styles.cellText, { color: textColor }]}>
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 60,
    height: 60,
    margin: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markedCell: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
