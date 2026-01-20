import { useState, useCallback, useEffect } from 'react';
import {
  generateBingoCard,
  drawNumber,
  checkWinner,
  toggleCellMark,
  autoMarkNumber,
} from '../utils/bingoLogic';
import { FREE_CELL_POSITION } from '../utils/constants';

const INITIAL_CREDITS = 10;
const BET_AMOUNT = 2;
const NUM_OPPONENTS = 5;

export default function useBingoGame() {
  const [bingoCard, setBingoCard] = useState(null);
  const [markedCells, setMarkedCells] = useState([]);
  const [opponentCards, setOpponentCards] = useState([]);
  const [opponentMarkedCells, setOpponentMarkedCells] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isWinner, setIsWinner] = useState(false);
  const [winner, setWinner] = useState(null); // null, 'player', o índice del oponente

  // Sistema de créditos
  const [playerCredits, setPlayerCredits] = useState(INITIAL_CREDITS);
  const [opponentCredits, setOpponentCredits] = useState(Array(NUM_OPPONENTS).fill(INITIAL_CREDITS));
  const [currentPot, setCurrentPot] = useState(0);
  const [creditsWon, setCreditsWon] = useState(0);

  // Inicializar el juego
  const startNewGame = useCallback(() => {
    // Verificar que el jugador tenga créditos suficientes
    if (playerCredits < BET_AMOUNT) {
      return false; // No se puede iniciar el juego
    }

    // Filtrar oponentes que tienen créditos suficientes
    const activeOpponents = opponentCredits
      .map((credits, index) => ({ credits, index }))
      .filter(opponent => opponent.credits >= BET_AMOUNT);

    if (activeOpponents.length === 0) {
      // Si no hay oponentes con créditos, no iniciar el juego
      return false;
    }

    // Descontar créditos a los jugadores activos
    const totalPlayers = 1 + activeOpponents.length;
    const pot = totalPlayers * BET_AMOUNT;

    setPlayerCredits(prev => prev - BET_AMOUNT);
    setOpponentCredits(prev =>
      prev.map((credits, index) =>
        activeOpponents.some(opp => opp.index === index)
          ? credits - BET_AMOUNT
          : credits
      )
    );
    setCurrentPot(pot);

    const newCard = generateBingoCard();
    setBingoCard(newCard);
    setMarkedCells([FREE_CELL_POSITION]); // La celda FREE siempre está marcada

    // Generar cartones solo para oponentes activos
    const opponents = Array(NUM_OPPONENTS).fill(null).map((_, index) => {
      if (activeOpponents.some(opp => opp.index === index)) {
        return generateBingoCard();
      }
      return null;
    });
    setOpponentCards(opponents);
    setOpponentMarkedCells(opponents.map(card => card ? [FREE_CELL_POSITION] : []));

    setDrawnNumbers([]);
    setCurrentNumber(null);
    setIsWinner(false);
    setWinner(null);
    setCreditsWon(0);

    return true; // Juego iniciado correctamente
  }, [playerCredits, opponentCredits]);

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
        // Otorgar premio al jugador
        setPlayerCredits(prev => prev + currentPot);
        setCreditsWon(currentPot);
        return;
      }

      // Verificar si algún oponente ganó
      for (let i = 0; i < opponentMarkedCells.length; i++) {
        if (opponentCards[i]) { // Solo verificar oponentes activos
          const opponentWon = checkWinner(opponentMarkedCells[i]);
          if (opponentWon) {
            setIsWinner(true);
            setWinner(i);
            // Otorgar premio al oponente
            setOpponentCredits(prev =>
              prev.map((credits, index) => (index === i ? credits + currentPot : credits))
            );
            setCreditsWon(currentPot);
            return;
          }
        }
      }
    }
  }, [markedCells, opponentMarkedCells, bingoCard, winner, currentPot, opponentCards]);

  return {
    bingoCard,
    markedCells,
    opponentCards,
    opponentMarkedCells,
    drawnNumbers,
    currentNumber,
    isWinner,
    winner,
    playerCredits,
    opponentCredits,
    currentPot,
    creditsWon,
    betAmount: BET_AMOUNT,
    startNewGame,
    drawNextNumber,
    toggleCell,
  };
}
