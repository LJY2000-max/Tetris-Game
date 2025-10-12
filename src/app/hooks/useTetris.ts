// src/hooks/useTetris.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  //Tetromino,
  Position,
  //BOARD_HEIGHT,
  //BOARD_WIDTH,
  //CLEAR_POINTS,
  //COMBO_POINTS
  GAME_DURATION  // 🔴 新增：匯入遊戲時長常數
} from '../types/tetris';
import {
  createEmptyBoard,
  randomTetrominoType,
  resetTetrominoBag, // 🔴 新增：匯入重置函數
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
    timeRemaining: GAME_DURATION  // 🔴 新增：初始化剩餘時間
  });

  // 🔴 新增：獨立的遊戲運行狀態標記
  // 用簡單的布林值來控制計時器，避免物件比較問題
  const [isGameRunning, setIsGameRunning] = useState(false);

  // 用於儲存遊戲循環計時器的參考
  const gameLoopRef = useRef<number | null>(null);
  // 🔴 新增：用於儲存倒數計時器的參考
  const countdownTimerRef = useRef<number | null>(null);
  

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
      timeRemaining: GAME_DURATION  // 🔴 新增：重置倒數時間
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
   * 包含牆踢（wall kick）邏輯，允許方塊在邊界附近旋轉
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

      // 牆踢邏輯：嘗試不同的偏移位置
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

      // 如果所有位置都無效，不旋轉
      return prev;
    });
  }, []);

  const right_rotate = useCallback(() => {
    setGameState(prev => {
      // 🔴 添加調試日誌
      console.log('Left rotate triggered, gameOver:', prev.gameOver, 'isPaused:', prev.isPaused, 'hasPiece:', !!prev.currentPiece);

      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      // 旋轉方塊
      const rotated = right_rotatePiece(prev.currentPiece);
      
      // 檢查旋轉後的位置是否有效
      if (isValidMove(prev.board, rotated, rotated.position)) {
        return { ...prev, currentPiece: rotated };
      }

      // 牆踢邏輯：嘗試不同的偏移位置
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

      // 如果所有位置都無效，不旋轉
      return prev;
    });
  }, []);

  /**
   * 移動方塊
   * @param direction - 移動方向：'left'(左)、'right'(右)、'down'(下)
   */
  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    setGameState(prev => {
      // 如果沒有當前方塊、遊戲結束或暫停，不執行操作
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      // 計算新位置
      const newPosition: Position = {
        x: prev.currentPiece.position.x + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
        y: prev.currentPiece.position.y + (direction === 'down' ? 1 : 0)
      };

      // 檢查新位置是否有效
      if (isValidMove(prev.board, prev.currentPiece, newPosition)) {
        // 如果是向下移動，增加軟降分數
        //const newScore = direction === 'down' ? prev.score + CLEAR_POINTS.SOFT_DROP : prev.score;
        return {
          ...prev,
          currentPiece: { ...prev.currentPiece, position: newPosition },
          //score: newScore
        };
      }

      // 如果是向下移動且無法繼續，固定方塊
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

        // 檢查遊戲是否結束（新方塊無法放置）
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
   * 硬降（直接落下）
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
     * 🔴 修正：監控遊戲結束狀態，停止遊戲運行標記
     */
    useEffect(() => {
      if (gameState.gameOver) {
        setIsGameRunning(false);
      }
    }, [gameState.gameOver]);

    /**
   * 🔴 完全重寫：倒數計時器 Effect
   * 關鍵：只依賴 isGameRunning 和 isPaused 這兩個簡單的布林值
   */
    useEffect(() => {
    console.log('Timer effect triggered. isGameRunning:', isGameRunning, 'isPaused:', gameState.isPaused);
    
    // 如果遊戲沒在運行或者暫停，清除計時器
    if (!isGameRunning || gameState.isPaused) {
      if (countdownTimerRef.current) {
        console.log('Clearing countdown timer');
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    // 如果計時器已經存在，不要重複創建
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
          // 🔴 不在這裡設定 isGameRunning，讓另一個 effect 處理
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
  // 🔴 關鍵：只依賴這兩個簡單的布林值！
  
  /**
   * 遊戲循環 - 自動下落
   * 根據等級調整下落速度
   */
  useEffect(() => {
    // 如果沒有方塊、遊戲結束或暫停，清除計時器
    if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    // 計算下落速度（毫秒）
    // 等級1: 1000ms，等級2: 900ms，以此類推，最快100ms
    const speed = Math.max(100, 1000 - (gameState.level - 1) * 100);
    
    // 設定計時器，定期自動下落
    gameLoopRef.current = window.setInterval(() => {
      movePiece('down');
    }, speed);

    // 清理函數：組件卸載時清除計時器
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.currentPiece, gameState.gameOver, gameState.isPaused, gameState.level, movePiece]); //此行叫做依賴項，這些變數只要其中一個有改變，useEffect就會重新執行函數。

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