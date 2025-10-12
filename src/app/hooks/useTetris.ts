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
    ComboNumber: 0
  });

  // 用於儲存遊戲循環計時器的參考
  const gameLoopRef = useRef<number | null>(null);

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
      ComboNumber: 0
    });
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