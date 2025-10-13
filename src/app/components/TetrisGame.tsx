// src/components/TetrisGame.tsx

'use client';

import React, { useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import GameInfo from './GameInfo';
import { useTetris } from '../hooks/useTetris';

/**
 * 主遊戲組件 - 整合所有子組件和遊戲邏輯
 * 負責：
 * 1. 鍵盤事件處理
 * 2. 組合遊戲板和資訊面板
 * 3. 管理遊戲狀態（透過useTetris hook）
 */
const TetrisGame: React.FC = () => {
  // 從自定義Hook獲取遊戲狀態和控制函數
  const { 
    gameState, 
    startGame, 
    pauseGame, 
    movePiece, 
    left_rotate, 
    right_rotate, 
    hardDrop,
    holdCurrentPiece  // 取得暫存功能
  } = useTetris();

  /**
   * 處理鍵盤輸入
   * 使用useCallback避免在每次渲染時重新創建函數
   */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // 如果遊戲結束或沒有當前方塊，不處理輸入
    if (gameState.gameOver || !gameState.currentPiece) return;
    
    // 防止遊戲按鍵的預設行為（如方向鍵滾動頁面）
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'c', 'C'].includes(event.key)) {
      event.preventDefault();
    }

    // 如果遊戲暫停，只允許ESC鍵（取消暫停）
    if (gameState.isPaused && event.key !== 'Escape') return;

    // 根據按鍵執行對應操作
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
        console.log("press x");
        right_rotate();
        break;
      case 'z':
        console.log("press z");
        left_rotate();
        break;
      case ' ':
        hardDrop();
        break;
      case 'c':  // C 鍵暫存方塊（小寫）
      case 'C':  // C 鍵暫存方塊（大寫）
        console.log("press C - Hold piece");
        holdCurrentPiece();
        break;
      case 'Escape':
        pauseGame();
        break;
    }
  }, [gameState, movePiece, left_rotate, right_rotate, hardDrop, pauseGame, holdCurrentPiece]);

  /**
   * 設置鍵盤事件監聽器
   * 在組件掛載時添加，卸載時移除
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="tetris-game min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      {/* 主遊戲容器 - 響應式佈局 */}
      <div className="game-container flex flex-col md:flex-row gap-6">
        {/* 左側：遊戲板區域 */}
        <div className="game-wrapper">
          {/* 遊戲標題 */}
          <h1 className="text-4xl font-bold text-white mb-4 text-center">TETRIS</h1>
          {/* 遊戲板組件 */}
          <GameBoard gameState={gameState} />
        </div>
        
        {/* 右側：遊戲資訊面板 */}
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