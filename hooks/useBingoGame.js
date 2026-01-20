import { useState, useCallback, useEffect } from 'react';
import {
  generateBingoCard,
  drawNumber,
  checkWinner,
  toggleCellMark,
  autoMarkNumber,
} from '../utils/bingoLogic';
import { FREE_CELL_POSITION } from '../utils/constants';

export default function useBingoGame() {
  const [bingoCard, setBingoCard] = useState(null);
  const [markedCells, setMarkedCells] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isWinner, setIsWinner] = useState(false);

  // Inicializar el juego
  const startNewGame = useCallback(() => {
    const newCard = generateBingoCard();
    setBingoCard(newCard);
    setMarkedCells([FREE_CELL_POSITION]); // La celda FREE siempre está marcada
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setIsWinner(false);
  }, []);

  // Sortear siguiente número
  const drawNextNumber = useCallback(() => {
    if (!bingoCard || isWinner) return;

    const newNumber = drawNumber(drawnNumbers);

    if (newNumber) {
      setCurrentNumber(newNumber);
      setDrawnNumbers((prev) => [...prev, newNumber]);

      // Auto-marcar el número si está en el cartón
      setMarkedCells((prev) => autoMarkNumber(bingoCard, newNumber, prev));
    }
  }, [bingoCard, drawnNumbers, isWinner]);

  // Alternar marca manual de celda
  const toggleCell = useCallback((cellIndex) => {
    if (cellIndex === FREE_CELL_POSITION) return; // No se puede desmarcar FREE

    setMarkedCells((prev) => toggleCellMark(cellIndex, prev));
  }, []);

  // Verificar si ganó cada vez que cambian las celdas marcadas
  useEffect(() => {
    if (bingoCard && markedCells.length > 0) {
      const hasWon = checkWinner(markedCells);
      setIsWinner(hasWon);
    }
  }, [markedCells, bingoCard]);

  return {
    bingoCard,
    markedCells,
    drawnNumbers,
    currentNumber,
    isWinner,
    startNewGame,
    drawNextNumber,
    toggleCell,
  };
}
