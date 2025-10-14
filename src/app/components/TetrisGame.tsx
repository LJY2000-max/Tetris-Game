// src/components/TetrisGame.tsx

'use client';

import React, { useEffect, useCallback, useRef } from 'react';
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

  // 用於追蹤按鍵和計時器
  const initialDelayTimerRef = useRef<number | null>(null);
  const continuousMoveTimerRef = useRef<number | null>(null);
  const downKeyTimerRef = useRef<number | null>(null);  // 新增：下鍵專用計時器
  const currentDirectionRef = useRef<'left' | 'right' | null>(null);
  const isDownKeyPressedRef = useRef<boolean>(false);  // 新增：追蹤下鍵狀態
  const movePieceRef = useRef(movePiece);
  const gameStateRef = useRef(gameState);

  // 保持 refs 最新
  useEffect(() => {
    movePieceRef.current = movePiece;
    gameStateRef.current = gameState;
  }, [movePiece, gameState]);

  /**
   * 清除所有計時器
   */
  const clearAllTimers = useCallback(() => {
    if (initialDelayTimerRef.current) {
      console.log('Clearing initial delay timer');
      clearTimeout(initialDelayTimerRef.current);
      initialDelayTimerRef.current = null;
    }
    if (continuousMoveTimerRef.current) {
      console.log('Clearing continuous move timer');
      clearInterval(continuousMoveTimerRef.current);
      continuousMoveTimerRef.current = null;
    }
    if (downKeyTimerRef.current) {
      console.log('Clearing down key timer');
      clearInterval(downKeyTimerRef.current);
      downKeyTimerRef.current = null;
    }
    currentDirectionRef.current = null;
    isDownKeyPressedRef.current = false;
  }, []);

  /**
   * 開始連續移動
   */
  const startContinuousMove = useCallback((direction: 'left' | 'right') => {
    console.log(`Starting continuous move: ${direction}`);
    
    // 只清除左右移動的計時器，不清除下鍵計時器
    if (initialDelayTimerRef.current) {
      clearTimeout(initialDelayTimerRef.current);
      initialDelayTimerRef.current = null;
    }
    if (continuousMoveTimerRef.current) {
      clearInterval(continuousMoveTimerRef.current);
      continuousMoveTimerRef.current = null;
    }
    
    // 檢查遊戲狀態（使用 ref）
    const state = gameStateRef.current;
    if (state.gameOver || state.isPaused || !state.currentPiece) {
      console.log('Game not active, not starting move');
      return;
    }
    
    // 立即移動一次
    movePieceRef.current(direction);
    currentDirectionRef.current = direction;
    
    // 0.1 秒後開始連續移動
    initialDelayTimerRef.current = window.setTimeout(() => {
      console.log(`Starting interval for ${direction}`);
      
      continuousMoveTimerRef.current = window.setInterval(() => {
        // 每次移動前都檢查遊戲狀態（使用 ref）
        const currentState = gameStateRef.current;
        if (currentState.gameOver || currentState.isPaused || !currentState.currentPiece) {
          console.log('Game state changed during interval, stopping');
          if (initialDelayTimerRef.current) clearTimeout(initialDelayTimerRef.current);
          if (continuousMoveTimerRef.current) clearInterval(continuousMoveTimerRef.current);
          initialDelayTimerRef.current = null;
          continuousMoveTimerRef.current = null;
          currentDirectionRef.current = null;
          return;
        }
        console.log(`Continuous moving ${direction}`);
        movePieceRef.current(direction);
      }, 50); // 每 50ms 移動一次
    }, 100); // 初次延遲 0.1 秒
  }, []);

  /**
   * 停止連續移動（只停止左右移動）
   */
  const stopContinuousMove = useCallback(() => {
    console.log('Stopping continuous move');
    if (initialDelayTimerRef.current) {
      clearTimeout(initialDelayTimerRef.current);
      initialDelayTimerRef.current = null;
    }
    if (continuousMoveTimerRef.current) {
      clearInterval(continuousMoveTimerRef.current);
      continuousMoveTimerRef.current = null;
    }
    currentDirectionRef.current = null;
  }, []);

  /**
   * 開始連續下降
   */
  const startContinuousDown = useCallback(() => {
    console.log('Starting continuous down');
    
    // 如果已經在下降，不重複啟動
    if (isDownKeyPressedRef.current) {
      return;
    }
    
    // 檢查遊戲狀態
    const state = gameStateRef.current;
    if (state.gameOver || state.isPaused || !state.currentPiece) {
      console.log('Game not active, not starting down');
      return;
    }
    
    // 立即下降一次
    movePieceRef.current('down');
    isDownKeyPressedRef.current = true;
    
    // 清除舊的下鍵計時器（如果有）
    if (downKeyTimerRef.current) {
      clearInterval(downKeyTimerRef.current);
    }
    
    // 開始連續下降（無延遲，直接開始）
    downKeyTimerRef.current = window.setInterval(() => {
      const currentState = gameStateRef.current;
      if (currentState.gameOver || currentState.isPaused || !currentState.currentPiece) {
        console.log('Game state changed during down, stopping');
        if (downKeyTimerRef.current) {
          clearInterval(downKeyTimerRef.current);
          downKeyTimerRef.current = null;
        }
        isDownKeyPressedRef.current = false;
        return;
      }
      console.log('Continuous moving down');
      movePieceRef.current('down');
    }, 75); // 每 75ms 下降一次
  }, []);

  /**
   * 停止連續下降
   */
  const stopContinuousDown = useCallback(() => {
    console.log('Stopping continuous down');
    if (downKeyTimerRef.current) {
      clearInterval(downKeyTimerRef.current);
      downKeyTimerRef.current = null;
    }
    isDownKeyPressedRef.current = false;
  }, []);

  /**
   * 處理鍵盤按下
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 使用 ref 檢查遊戲狀態
    const state = gameStateRef.current;
    if (state.gameOver || !state.currentPiece) return;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'c', 'C'].includes(event.key)) {
      event.preventDefault();
    }

    if (state.isPaused && event.key !== 'Escape') return;

    // 防止左右下方向鍵的瀏覽器重複觸發（我們用自己的計時器）
    if (event.repeat && (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowDown')) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        startContinuousMove('left');
        break;
      case 'ArrowRight':
        startContinuousMove('right');
        break;
      case 'ArrowDown':
        // 使用自己的連續下降邏輯
        startContinuousDown();
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
  }, [startContinuousMove, startContinuousDown, left_rotate, right_rotate, hardDrop, pauseGame, holdCurrentPiece]);

  /**
   * 處理鍵盤放開
   */
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const direction = event.key === 'ArrowLeft' ? 'left' : 'right';
      // 只有當前方向匹配時才停止
      if (currentDirectionRef.current === direction) {
        console.log(`Key up: ${direction}`);
        stopContinuousMove();
      }
    } else if (event.key === 'ArrowDown') {
      console.log('Key up: down');
      stopContinuousDown();
    }
  }, [stopContinuousMove, stopContinuousDown]);

  /**
   * 當遊戲狀態改變時清除計時器
   */
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) {
      console.log('Game state changed, clearing timers');
      clearAllTimers();
    }
  }, [gameState.gameOver, gameState.isPaused, clearAllTimers]);

  /**
   * 設置鍵盤事件監聽器
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearAllTimers();
    };
  }, [handleKeyDown, handleKeyUp, clearAllTimers]);

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