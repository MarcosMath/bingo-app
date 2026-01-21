import { createContext, useContext } from 'react';
import useBingoGame from '../hooks/useBingoGame';

const BingoGameContext = createContext(null);

export function BingoGameProvider({ children }) {
  const gameValue = useBingoGame();

  return (
    <BingoGameContext.Provider value={gameValue}>
      {children}
    </BingoGameContext.Provider>
  );
}

export function useBingoGameContext() {
  const context = useContext(BingoGameContext);
  if (!context) {
    throw new Error('useBingoGameContext must be used within a BingoGameProvider');
  }
  return context;
}
