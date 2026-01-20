// Constantes del juego de Bingo

// Rangos de números por columna
export const COLUMN_RANGES = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 },
};

// Nombres de las columnas
export const COLUMNS = ['B', 'I', 'N', 'G', 'O'];

// Colores por columna
export const COLUMN_COLORS = {
  B: '#4A90E2', // Azul
  I: '#E94B4B', // Rojo
  N: '#FFFFFF', // Blanco
  G: '#50C878', // Verde
  O: '#FF8C42', // Naranja
};

// Tamaño del cartón
export const CARD_SIZE = 5;

// Número total de números posibles en bingo
export const MAX_BINGO_NUMBER = 75;

// Posición de la celda FREE (centro del cartón)
export const FREE_CELL_POSITION = 12; // Índice 12 en un array de 25 elementos (posición central)
