import { COLUMN_RANGES, COLUMNS, CARD_SIZE, MAX_BINGO_NUMBER, FREE_CELL_POSITION } from './constants';

/**
 * Genera un número aleatorio dentro de un rango
 */
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Genera números únicos para una columna específica
 */
const generateColumnNumbers = (columnName, count) => {
  const { min, max } = COLUMN_RANGES[columnName];
  const numbers = [];
  const used = new Set();

  while (numbers.length < count) {
    const num = getRandomNumber(min, max);
    if (!used.has(num)) {
      used.add(num);
      numbers.push(num);
    }
  }

  return numbers;
};

/**
 * Genera un cartón de bingo completo
 * Retorna un array de 25 elementos donde el índice 12 es 'FREE'
 */
export const generateBingoCard = () => {
  const card = [];

  // Generar números para cada columna
  COLUMNS.forEach((column) => {
    const columnNumbers = generateColumnNumbers(column, CARD_SIZE);
    card.push(...columnNumbers);
  });

  // Convertir a estructura de grid y marcar el centro como FREE
  const cardData = card.map((num, index) => ({
    value: index === FREE_CELL_POSITION ? 'FREE' : num,
    isFree: index === FREE_CELL_POSITION,
    column: COLUMNS[Math.floor(index / CARD_SIZE)],
    index,
  }));

  return cardData;
};

/**
 * Sortea un número aleatorio que no haya sido sorteado antes
 */
export const drawNumber = (drawnNumbers) => {
  if (drawnNumbers.length >= MAX_BINGO_NUMBER) {
    return null; // Todos los números ya fueron sorteados
  }

  let newNumber;
  do {
    newNumber = getRandomNumber(1, MAX_BINGO_NUMBER);
  } while (drawnNumbers.includes(newNumber));

  return newNumber;
};

/**
 * Verifica si el cartón está completo (ganador)
 * Para ganar, todas las 24 celdas deben estar marcadas (25 - 1 FREE)
 */
export const checkWinner = (markedCells) => {
  // El cartón tiene 25 celdas, una es FREE (siempre marcada)
  // Para ganar, necesitamos 24 celdas marcadas (sin contar FREE)
  const totalCells = CARD_SIZE * CARD_SIZE;
  const requiredMarks = totalCells - 1; // 24 celdas

  return markedCells.length >= requiredMarks;
};

/**
 * Busca automáticamente un número en el cartón y lo marca si existe
 */
export const autoMarkNumber = (card, number, markedCells) => {
  const cellIndex = card.findIndex((cell) => cell.value === number);

  if (cellIndex !== -1 && !markedCells.includes(cellIndex)) {
    return [...markedCells, cellIndex];
  }

  return markedCells;
};

/**
 * Verifica si una celda específica está marcada
 */
export const isCellMarked = (cellIndex, markedCells) => {
  return markedCells.includes(cellIndex);
};

/**
 * Alterna el estado de marcado de una celda
 */
export const toggleCellMark = (cellIndex, markedCells) => {
  if (markedCells.includes(cellIndex)) {
    return markedCells.filter((index) => index !== cellIndex);
  }
  return [...markedCells, cellIndex];
};
