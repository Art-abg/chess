import React, { createContext, useContext } from 'react';
import useChessGame from '../hooks/useChessGame';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const gameState = useChessGame();

  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
