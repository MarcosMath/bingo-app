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
  const [opponentCards, setOpponentCards] = useState([]);
  const [opponentMarkedCells, setOpponentMarkedCells] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isWinner, setIsWinner] = useState(false);
  const [winner, setWinner] = useState(null); // null, 'player', o índice del oponente

  // Inicializar el juego
  const startNewGame = useCallback(() => {
    const newCard = generateBingoCard();
    setBingoCard(newCard);
    setMarkedCells([FREE_CELL_POSITION]); // La celda FREE siempre está marcada

    // Generar 5 cartones de oponentes
    const opponents = Array(5).fill(null).map(() => generateBingoCard());
    setOpponentCards(opponents);
    setOpponentMarkedCells(opponents.map(() => [FREE_CELL_POSITION]));

    setDrawnNumbers([]);
    setCurrentNumber(null);
    setIsWinner(false);
    setWinner(null);
  }, []);

  // Sortear siguiente número
  const drawNextNumber = useCallback(() => {
    if (!bingoCard || isWinner) return;

    const newNumber = drawNumber(drawnNumbers);

    if (newNumber) {
      setCurrentNumber(newNumber);
      setDrawnNumbers((prev) => [...prev, newNumber]);

      // Auto-marcar el número en el cartón del jugador
      setMarkedCells((prev) => autoMarkNumber(bingoCard, newNumber, prev));

      // Auto-marcar el número en los cartones de los oponentes
      setOpponentMarkedCells((prevOpponents) =>
        prevOpponents.map((marked, index) =>
          autoMarkNumber(opponentCards[index], newNumber, marked)
        )
      );
    }
  }, [bingoCard, opponentCards, drawnNumbers, isWinner]);

  // Alternar marca manual de celda
  const toggleCell = useCallback((cellIndex) => {
    if (cellIndex === FREE_CELL_POSITION) return; // No se puede desmarcar FREE

    setMarkedCells((prev) => toggleCellMark(cellIndex, prev));
  }, []);

  // Verificar si ganó cada vez que cambian las celdas marcadas
  useEffect(() => {
    if (bingoCard && markedCells.length > 0 && !winner) {
      // Verificar si el jugador ganó
      const playerWon = checkWinner(markedCells);
      if (playerWon) {
        setIsWinner(true);
        setWinner('player');
        return;
      }

      // Verificar si algún oponente ganó
      for (let i = 0; i < opponentMarkedCells.length; i++) {
        const opponentWon = checkWinner(opponentMarkedCells[i]);
        if (opponentWon) {
          setIsWinner(true);
          setWinner(i);
          return;
        }
      }
    }
  }, [markedCells, opponentMarkedCells, bingoCard, winner]);

  return {
    bingoCard,
    markedCells,
    opponentCards,
    opponentMarkedCells,
    drawnNumbers,
    currentNumber,
    isWinner,
    winner,
    startNewGame,
    drawNextNumber,
    toggleCell,
  };
}
