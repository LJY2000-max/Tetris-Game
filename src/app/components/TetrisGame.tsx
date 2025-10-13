// src/components/TetrisGame.tsx

'use client';

import React, { useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import { useTetris } from '../hooks/useTetris';

/**
 * 主遊戲組件 - 整合所有子組件和遊戲邏輯
 */
const TetrisGame: React.FC = () => {
  const { 
    gameState, 
    startGame, 
    pauseGame, 
    movePiece, 
    left_rotate, 
    right_rotate, 
    hardDrop,
    holdCurrentPiece
  } = useTetris();

  /**
   * 處理鍵盤輸入
   */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver || !gameState.currentPiece) return;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'c', 'C'].includes(event.key)) {
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
        right_rotate();
        break;
      case 'x':
      case 'X':
        right_rotate();
        break;
      case 'z':
      case 'Z':
        left_rotate();
        break;
      case ' ':
        hardDrop();
        break;
      case 'c':
      case 'C':
        holdCurrentPiece();
        break;
      case 'Escape':
        pauseGame();
        break;
    }
  }, [gameState, movePiece, left_rotate, right_rotate, hardDrop, pauseGame, holdCurrentPiece]);

  /**
   * 設置鍵盤事件監聽器
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="tetris-game min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-8">
      {/* 主遊戲容器 - 三欄佈局 */}
      <div className="game-container flex gap-6 items-start">
        {/* 左側面板：Hold、Score、Lines、Level、Pause/Resume、Controls */}
        <LeftPanel 
          gameState={gameState}
          onStart={startGame}
          onPause={pauseGame}
        />
        
        {/* 中間：遊戲板（時間顯示在遊戲板上方） */}
        <div className="game-center">
          <GameBoard 
            gameState={gameState} 
            timeRemaining={gameState.timeRemaining}
          />
        </div>
        
        {/* 右側面板：5 個 Next */}
        <RightPanel gameState={gameState} />
      </div>
    </div>
  );
};

export default TetrisGame;