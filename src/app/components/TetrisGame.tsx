// src/components/TetrisGame.tsx

'use client';

import React, { useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import GameInfo from './GameInfo';
import { useTetris } from '..//hooks/useTetris';

const TetrisGame: React.FC = () => {
  const { gameState, startGame, pauseGame, movePiece, rotate, hardDrop } = useTetris();

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver || !gameState.currentPiece) return;
    
    // Prevent default behavior for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }

    if (gameState.isPaused && event.key !== 'Escape') return;

    switch (event.key) {
      case 'ArrowLeft':
        movePiece('left');
        break;
      case 'ArrowRight':
        movePiece('right');
        break;
      case 'ArrowDown':
        movePiece('down');
        break;
      case 'ArrowUp':
        rotate();
        break;
      case ' ':
        hardDrop();
        break;
      case 'Escape':
        pauseGame();
        break;
    }
  }, [gameState, movePiece, rotate, hardDrop, pauseGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="tetris-game min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="game-container flex flex-col md:flex-row gap-6">
        <div className="game-wrapper">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">TETRIS</h1>
          <GameBoard gameState={gameState} />
        </div>
        <GameInfo 
          gameState={gameState} 
          onStart={startGame}
          onPause={pauseGame}
        />
      </div>
    </div>
  );
};

export default TetrisGame;