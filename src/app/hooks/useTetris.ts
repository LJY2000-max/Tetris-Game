// src/hooks/useTetris.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  Position,
  GAME_DURATION  // 🔴 新增:匯入遊戲時長常數
} from '../types/tetris';
import {
  createEmptyBoard,
  randomTetrominoType,
  resetTetrominoBag, // 🔴 新增:匯入重置函數
  createTetromino,
  left_rotatePiece,
  right_rotatePiece,
  isValidMove,
  mergePieceToBoard,
  clearLines,
  calculatePoints,
  getDropPosition
} from '../utils/tetris';

/**
 * 自定義Hook - 管理整個俄羅斯方塊遊戲的狀態和邏輯
 * @returns 遊戲狀態和控制函數
 */
export const useTetris = () => {
  // 遊戲主要狀態
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    isPaused: false,
    ComboNumber: 0,
    timeRemaining: GAME_DURATION  // 🔴 新增:初始化剩餘時間
  });

  // 🔴 新增:獨立的遊戲運行狀態標記
  // 用簡單的布林值來控制計時器,避免物件比較問題
  const [isGameRunning, setIsGameRunning] = useState(false);

  // 用於儲存遊戲循環計時器的參考
  const gameLoopRef = useRef<number | null>(null);
  // 🔴 新增:用於儲存倒數計時器的參考
  const countdownTimerRef = useRef<number | null>(null);
  // 🔴 核心修復:用 ref 保存最新的遊戲狀態，計時器可以訪問但不會因狀態改變而重置
  const gameStateRef = useRef<GameState>(gameState);

  // 🔴 保持 ref 和 state 同步
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  

  /**
   * 開始新遊戲
   * 重置所有狀態並生成初始方塊
   */
  const startGame = useCallback(() => {
    resetTetrominoBag(); // 🔴 重置方塊包
    console.log("StartGame");
    const firstPiece = createTetromino(randomTetrominoType());
    const nextPiece = createTetromino(randomTetrominoType());
  
    setGameState({
      board: createEmptyBoard(),
      currentPiece: firstPiece,
      nextPiece: nextPiece,
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      isPaused: false,
      ComboNumber: 0,
      timeRemaining: GAME_DURATION  // 🔴 新增:重置倒數時間
    });

      // 🔴 設定遊戲為運行狀態
      setIsGameRunning(true);
  }, []);

  /**
   * 暫停/繼續遊戲
   */
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  /**
   * 旋轉方塊
   * 包含牆踢(wall kick)邏輯,允許方塊在邊界附近旋轉
   */
  const left_rotate = useCallback(() => {
    setGameState(prev => {
      // 🔴 添加調試日誌
      console.log('Left rotate triggered, gameOver:', prev.gameOver, 'isPaused:', prev.isPaused, 'hasPiece:', !!prev.currentPiece);
      
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      // 旋轉方塊
      const rotated = left_rotatePiece(prev.currentPiece);
      
      // 檢查旋轉後的位置是否有效
      if (isValidMove(prev.board, rotated, rotated.position)) {
        return { ...prev, currentPiece: rotated };
      }

      // 牆踢邏輯:嘗試不同的偏移位置
      const kicks = [
        { x: 0, y: 0 },    // 原位置
        { x: -1, y: 1},    // 左下
        { x: 1, y: 1},     // 右下
        { x: -1, y: 0 },   // 向左移動1格
        { x: 1, y: 0 },    // 向右移動1格
        { x: 0, y: -1 },   // 向上移動1格
        { x: -1, y: -1 },  // 左上
        { x: 1, y: -1 }    // 右上
      ];

      // 嘗試每個偏移位置
      for (const kick of kicks) {
        const newPosition = {
          x: rotated.position.x + kick.x,
          y: rotated.position.y + kick.y
        };
        if (isValidMove(prev.board, rotated, newPosition)) {
          return {
            ...prev,
            currentPiece: { ...rotated, position: newPosition }
          };
        }
      }

      // 如果所有位置都無效,不旋轉
      return prev;
    });
  }, []);

  const right_rotate = useCallback(() => {
    setGameState(prev => {
      // 🔴 添加調試日誌
      console.log('Right rotate triggered, gameOver:', prev.gameOver, 'isPaused:', prev.isPaused, 'hasPiece:', !!prev.currentPiece);

      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      // 旋轉方塊
      const rotated = right_rotatePiece(prev.currentPiece);
      
      // 檢查旋轉後的位置是否有效
      if (isValidMove(prev.board, rotated, rotated.position)) {
        return { ...prev, currentPiece: rotated };
      }

      // 牆踢邏輯:嘗試不同的偏移位置
      const kicks = [
        { x: 0, y: 0 },    // 原位置
        { x: -1, y: 1},    // 左下
        { x: 1, y: 1},     // 右下
        { x: -1, y: 0 },   // 向左移動1格
        { x: 1, y: 0 },    // 向右移動1格
        { x: 0, y: -1 },   // 向上移動1格
        { x: -1, y: -1 },  // 左上
        { x: 1, y: -1 }    // 右上
      ];

      // 嘗試每個偏移位置
      for (const kick of kicks) {
        const newPosition = {
          x: rotated.position.x + kick.x,
          y: rotated.position.y + kick.y
        };
        if (isValidMove(prev.board, rotated, newPosition)) {
          return {
            ...prev,
            currentPiece: { ...rotated, position: newPosition }
          };
        }
      }

      // 如果所有位置都無效,不旋轉
      return prev;
    });
  }, []);

  /**
   * 移動方塊
   * @param direction - 移動方向:'left'(左)、'right'(右)、'down'(下)
   */
  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    setGameState(prev => {
      // 如果沒有當前方塊、遊戲結束或暫停,不執行操作
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      // 計算新位置
      const newPosition: Position = {
        x: prev.currentPiece.position.x + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
        y: prev.currentPiece.position.y + (direction === 'down' ? 1 : 0)
      };

      // 檢查新位置是否有效
      if (isValidMove(prev.board, prev.currentPiece, newPosition)) {
        // 如果是向下移動,增加軟降分數
        return {
          ...prev,
          currentPiece: { ...prev.currentPiece, position: newPosition }
        };
      }

      // 如果是向下移動且無法繼續,固定方塊
      if (direction === 'down') {
        // 將方塊固定到遊戲板
        const boardWithPiece = mergePieceToBoard(prev.board, prev.currentPiece);
        // 清除完整的行
        const { board: clearedBoard, linesCleared, ComboNumber } = clearLines(boardWithPiece, prev.ComboNumber);
        
        // 計算分數和等級
        const newScore = prev.score + calculatePoints(linesCleared, ComboNumber);
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1; // 每10行升一級

        // 生成新方塊
        const newCurrentPiece = prev.nextPiece;
        const newNextPiece = createTetromino(randomTetrominoType());
        console.log("IN SOFT DROP");

        // 檢查遊戲是否結束(新方塊無法放置)
        const gameOver = newCurrentPiece ? 
          !isValidMove(clearedBoard, newCurrentPiece, newCurrentPiece.position) : false;

        return {
          ...prev,
          board: clearedBoard,
          currentPiece: newCurrentPiece,
          nextPiece: newNextPiece,
          score: newScore,
          lines: newLines,
          level: newLevel,
          gameOver,
          ComboNumber:ComboNumber
        };
      }

      return prev;
    });
  }, []);

  /**
   * 硬降(直接落下)
   * 方塊立即落到底部並獲得額外分數
   */
  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      // 計算落下位置
      const dropPosition = getDropPosition(prev.board, prev.currentPiece);

      // 將方塊放到最終位置
      const droppedPiece = { ...prev.currentPiece, position: dropPosition };
      const boardWithPiece = mergePieceToBoard(prev.board, droppedPiece);
      const { board: clearedBoard, linesCleared, ComboNumber } = clearLines(boardWithPiece, prev.ComboNumber);

      // 計算總分數
      const newScore = prev.score + calculatePoints(linesCleared, ComboNumber);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;

      // 生成新方塊
      const newCurrentPiece = prev.nextPiece;
      const newNextPiece = createTetromino(randomTetrominoType());
      console.log("IN HARD DROP");

      // 檢查遊戲是否結束
      const gameOver = newCurrentPiece ? 
        !isValidMove(clearedBoard, newCurrentPiece, newCurrentPiece.position) : false;

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: newCurrentPiece,
        nextPiece: newNextPiece,
        score: newScore,
        lines: newLines,
        level: newLevel,
        gameOver,
        ComboNumber:ComboNumber
      };
    });
  }, []);

    /**
     * 🔴 修正:監控遊戲結束狀態,停止遊戲運行標記
     */
    useEffect(() => {
      if (gameState.gameOver) {
        setIsGameRunning(false);
      }
    }, [gameState.gameOver]);

    /**
   * 🔴 完全重寫:倒數計時器 Effect
   * 關鍵:只依賴 isGameRunning 和 isPaused 這兩個簡單的布林值
   */
    useEffect(() => {
    console.log('Timer effect triggered. isGameRunning:', isGameRunning, 'isPaused:', gameState.isPaused);
    
    // 如果遊戲沒在運行或者暫停,清除計時器
    if (!isGameRunning || gameState.isPaused) {
      if (countdownTimerRef.current) {
        console.log('Clearing countdown timer');
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    // 如果計時器已經存在,不要重複創建
    if (countdownTimerRef.current) {
      console.log('Timer already exists, skipping creation');
      return;
    }

      // 創建新的計時器
      console.log('Creating new countdown timer');
    countdownTimerRef.current = window.setInterval(() => {
      console.log('Timer tick');
      setGameState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          console.log("Time's up! Game Over");
          // 🔴 不在這裡設定 isGameRunning,讓另一個 effect 處理
          return {
            ...prev,
            timeRemaining: 0,
            gameOver: true
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining
        };
      });
    }, 1000);

    // 清理函數
    return () => {
      if (countdownTimerRef.current) {
        console.log('Cleanup: clearing countdown timer');
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [isGameRunning, gameState.isPaused]); 
  // 🔴 關鍵:只依賴這兩個簡單的布林值!
  
  /**
   * 🔴 終極修復:遊戲循環 - 自動下落
   * 使用 ref 訪問最新狀態，只在必要時重新創建計時器
   */
  useEffect(() => {
    // 決定是否需要運行計時器
    const shouldRun = gameState.currentPiece && !gameState.gameOver && !gameState.isPaused;
    
    // 如果不需要運行，清除計時器
    if (!shouldRun) {
      if (gameLoopRef.current) {
        console.log('Clearing game loop timer');
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    // 如果計時器已存在，不要重複創建
    if (gameLoopRef.current) {
      console.log('Game loop timer already running');
      return;
    }

    // 計算下落速度(毫秒)
    const speed = Math.max(100, 1000 - (gameState.level - 1) * 100);
    
    console.log('Creating game loop timer with speed:', speed);
    
    // 創建新計時器
    gameLoopRef.current = window.setInterval(() => {
      // 🔴 核心:從 ref 讀取最新狀態，不依賴閉包中的舊狀態
      const currentState = gameStateRef.current;
      
      if (!currentState.currentPiece || currentState.gameOver || currentState.isPaused) {
        return;
      }

      // 計算向下移動的新位置
      const newPosition: Position = {
        x: currentState.currentPiece.position.x,
        y: currentState.currentPiece.position.y + 1
      };

      // 檢查新位置是否有效
      if (isValidMove(currentState.board, currentState.currentPiece, newPosition)) {
        // 可以繼續下落
        setGameState(prev => ({
          ...prev,
          currentPiece: prev.currentPiece ? { ...prev.currentPiece, position: newPosition } : null
        }));
        return;
      }

      // 無法繼續下落，固定方塊
      const boardWithPiece = mergePieceToBoard(currentState.board, currentState.currentPiece);
      const { board: clearedBoard, linesCleared, ComboNumber } = clearLines(boardWithPiece, currentState.ComboNumber);
      
      const newScore = currentState.score + calculatePoints(linesCleared, ComboNumber);
      const newLines = currentState.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;

      const newCurrentPiece = currentState.nextPiece;
      const newNextPiece = createTetromino(randomTetrominoType());
      console.log("AUTO DROP - Piece locked");

      const gameOver = newCurrentPiece ? 
        !isValidMove(clearedBoard, newCurrentPiece, newCurrentPiece.position) : false;

      setGameState({
        ...currentState,
        board: clearedBoard,
        currentPiece: newCurrentPiece,
        nextPiece: newNextPiece,
        score: newScore,
        lines: newLines,
        level: newLevel,
        gameOver,
        ComboNumber: ComboNumber
      });
    }, speed);

    // 清理函數
    return () => {
      if (gameLoopRef.current) {
        console.log('Cleanup: clearing game loop timer');
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState.gameOver, gameState.isPaused, gameState.level, gameState.currentPiece ? 'exists' : 'none']); 
  // 🔴 關鍵:只在這些關鍵狀態改變時重新創建計時器
  // currentPiece 只判斷存在與否，不關心其內容變化

  // 返回遊戲狀態和控制函數
  return {
    gameState,
    startGame,
    pauseGame,
    movePiece,
    left_rotate,
    right_rotate,
    hardDrop
  };
};