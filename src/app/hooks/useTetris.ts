// src/hooks/useTetris.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  Position,
  GAME_DURATION
} from '../types/tetris';
import {
  createEmptyBoard,
  randomTetrominoType,
  resetTetrominoBag,
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
    holdPiece: null,        // 暫存方塊
    canHold: true,          // 可以暫存
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    isPaused: false,
    ComboNumber: 0,
    timeRemaining: GAME_DURATION
  });

  // 獨立的遊戲運行狀態標記
  const [isGameRunning, setIsGameRunning] = useState(false);

  // 用於儲存遊戲循環計時器的參考
  const gameLoopRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>(gameState);

  // 保持 ref 和 state 同步
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  

  /**
   * 開始新遊戲
   * 重置所有狀態並生成初始方塊
   */
  const startGame = useCallback(() => {
    resetTetrominoBag();
    console.log("StartGame");
    const firstPiece = createTetromino(randomTetrominoType());
    const nextPiece = createTetromino(randomTetrominoType());
  
    setGameState({
      board: createEmptyBoard(),
      currentPiece: firstPiece,
      nextPiece: nextPiece,
      holdPiece: null,        // 重置暫存方塊
      canHold: true,          // 重置暫存狀態
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      isPaused: false,
      ComboNumber: 0,
      timeRemaining: GAME_DURATION
    });

    // 設定遊戲為運行狀態
    setIsGameRunning(true);
  }, []);

  /**
   * 暫停/繼續遊戲
   */
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  /**
   * 暫存方塊功能（Hold Piece）
   * 規則：
   * 1. 如果暫存區是空的，將當前方塊放入暫存區，使用下一個方塊
   * 2. 如果暫存區有方塊，交換當前方塊和暫存區方塊
   * 3. 每次方塊固定後才能再次使用暫存功能（防止無限暫存）
   */
  const holdCurrentPiece = useCallback(() => {
    setGameState(prev => {
      // 檢查是否可以暫存
      if (!prev.currentPiece || prev.gameOver || prev.isPaused || !prev.canHold) {
        console.log('Cannot hold:', { 
          hasPiece: !!prev.currentPiece, 
          gameOver: prev.gameOver, 
          isPaused: prev.isPaused, 
          canHold: prev.canHold 
        });
        return prev;
      }

      console.log('Holding piece:', prev.currentPiece.type);

      // 如果暫存區是空的
      if (!prev.holdPiece) {
        // 將當前方塊放入暫存區（重置位置和旋轉）
        const pieceToHold = createTetromino(prev.currentPiece.type);
        
        // 使用下一個方塊作為新的當前方塊
        const newCurrentPiece = prev.nextPiece;
        const newNextPiece = createTetromino(randomTetrominoType());

        return {
          ...prev,
          currentPiece: newCurrentPiece,
          nextPiece: newNextPiece,
          holdPiece: pieceToHold,
          canHold: false  // 設定為不可暫存，直到方塊固定
        };
      } 
      // 如果暫存區有方塊，交換
      else {
        // 從暫存區取出方塊（重置位置）
        const pieceFromHold = createTetromino(prev.holdPiece.type);
        
        // 將當前方塊放入暫存區（重置位置和旋轉）
        const pieceToHold = createTetromino(prev.currentPiece.type);

        // 檢查從暫存區取出的方塊是否可以放置
        if (!isValidMove(prev.board, pieceFromHold, pieceFromHold.position)) {
          console.log('Cannot place held piece - position invalid');
          return prev;
        }

        return {
          ...prev,
          currentPiece: pieceFromHold,
          holdPiece: pieceToHold,
          canHold: false  // 設定為不可暫存，直到方塊固定
        };
      }
    });
  }, []);

  /**
   * 旋轉方塊
   * 包含牆踢(wall kick)邏輯,允許方塊在邊界附近旋轉
   */
  const left_rotate = useCallback(() => {
    setGameState(prev => {
      //console.log('Left rotate triggered, gameOver:', prev.gameOver, 'isPaused:', prev.isPaused, 'hasPiece:', !!prev.currentPiece);
      
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

      return prev;
    });
  }, []);

  const right_rotate = useCallback(() => {
    setGameState(prev => {
      //console.log('Right rotate triggered, gameOver:', prev.gameOver, 'isPaused:', prev.isPaused, 'hasPiece:', !!prev.currentPiece);

      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const rotated = right_rotatePiece(prev.currentPiece);
      
      if (isValidMove(prev.board, rotated, rotated.position)) {
        return { ...prev, currentPiece: rotated };
      }

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

      return prev;
    });
  }, []);

  /**
   * 移動方塊
   * @param direction - 移動方向:'left'(左)、'right'(右)、'down'(下)
   */
  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const newPosition: Position = {
        x: prev.currentPiece.position.x + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
        y: prev.currentPiece.position.y + (direction === 'down' ? 1 : 0)
      };

      if (isValidMove(prev.board, prev.currentPiece, newPosition)) {
        return {
          ...prev,
          currentPiece: { ...prev.currentPiece, position: newPosition }
        };
      }

      // 如果是向下移動且無法繼續,固定方塊
      if (direction === 'down') {
        const boardWithPiece = mergePieceToBoard(prev.board, prev.currentPiece);
        const { board: clearedBoard, linesCleared, ComboNumber } = clearLines(boardWithPiece, prev.ComboNumber);
        
        const newScore = prev.score + calculatePoints(linesCleared, ComboNumber);
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1; // 每10行升一級

        const newCurrentPiece = prev.nextPiece;
        const newNextPiece = createTetromino(randomTetrominoType());

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
          ComboNumber: ComboNumber,
          canHold: true  // 方塊固定後，重新允許暫存
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

      const dropPosition = getDropPosition(prev.board, prev.currentPiece);
      const droppedPiece = { ...prev.currentPiece, position: dropPosition };
      const boardWithPiece = mergePieceToBoard(prev.board, droppedPiece);
      const { board: clearedBoard, linesCleared, ComboNumber } = clearLines(boardWithPiece, prev.ComboNumber);

      const newScore = prev.score + calculatePoints(linesCleared, ComboNumber);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;

      const newCurrentPiece = prev.nextPiece;
      const newNextPiece = createTetromino(randomTetrominoType());

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
        ComboNumber: ComboNumber,
        canHold: true  // 方塊固定後，重新允許暫存
      };
    });
  }, []);

  /**
   * 監控遊戲結束狀態,停止遊戲運行標記
   */
  useEffect(() => {
    if (gameState.gameOver) {
      setIsGameRunning(false);
    }
  }, [gameState.gameOver]);

  /**
   * 倒數計時器 Effect
   */
  useEffect(() => {
    //console.log('Timer effect triggered. isGameRunning:', isGameRunning, 'isPaused:', gameState.isPaused);
    
    if (!isGameRunning || gameState.isPaused) {
      if (countdownTimerRef.current) {
        //console.log('Clearing countdown timer');
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    if (countdownTimerRef.current) {
      //console.log('Timer already exists, skipping creation');
      return;
    }

    //console.log('Creating new countdown timer');
    countdownTimerRef.current = window.setInterval(() => {
      //console.log('Timer tick');
      setGameState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          //console.log("Time's up! Game Over");
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

    return () => {
      if (countdownTimerRef.current) {
        //console.log('Cleanup: clearing countdown timer');
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [isGameRunning, gameState.isPaused]);
  
  /**
   * 遊戲循環 - 自動下落
   */
  useEffect(() => {
    const shouldRun = gameState.currentPiece && !gameState.gameOver && !gameState.isPaused;
    
    if (!shouldRun) {
      if (gameLoopRef.current) {
        //console.log('Clearing game loop timer');
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    if (gameLoopRef.current) {
      //console.log('Game loop timer already running');
      return;
    }

    const speed = Math.max(100, 1000 - (gameState.level - 1) * 100);
    
    //console.log('Creating game loop timer with speed:', speed);
    
    gameLoopRef.current = window.setInterval(() => {
      const currentState = gameStateRef.current;
      
      if (!currentState.currentPiece || currentState.gameOver || currentState.isPaused) {
        return;
      }

      const newPosition: Position = {
        x: currentState.currentPiece.position.x,
        y: currentState.currentPiece.position.y + 1
      };

      if (isValidMove(currentState.board, currentState.currentPiece, newPosition)) {
        setGameState(prev => ({
          ...prev,
          currentPiece: prev.currentPiece ? { ...prev.currentPiece, position: newPosition } : null
        }));
        return;
      }

      const boardWithPiece = mergePieceToBoard(currentState.board, currentState.currentPiece);
      const { board: clearedBoard, linesCleared, ComboNumber } = clearLines(boardWithPiece, currentState.ComboNumber);
      
      const newScore = currentState.score + calculatePoints(linesCleared, ComboNumber);
      const newLines = currentState.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;

      const newCurrentPiece = currentState.nextPiece;
      const newNextPiece = createTetromino(randomTetrominoType());
      //console.log("AUTO DROP - Piece locked");

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
        ComboNumber: ComboNumber,
        canHold: true  // 方塊固定後，重新允許暫存
      });
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        //console.log('Cleanup: clearing game loop timer');
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState.gameOver, gameState.isPaused, gameState.level, gameState.currentPiece ? 'exists' : 'none']);

  // 返回遊戲狀態和控制函數
  return {
    gameState,
    startGame,
    pauseGame,
    movePiece,
    left_rotate,
    right_rotate,
    hardDrop,
    holdCurrentPiece  // 導出暫存功能
  };
};