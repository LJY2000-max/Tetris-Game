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
    nextPieces: [],  // 改為陣列，存放 4 個方塊
    holdPiece: null,
    canHold: true,
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
  
  // Lock Delay 相關的 ref
  const lockDelayTimerRef = useRef<number | null>(null);
  const isLockDelayActiveRef = useRef<boolean>(false);
  const lockDelayDuration = 500; // 0.5 秒的延遲鎖定時間
  const maxLockResets = 15; // 最大重置次數（防止無限延遲）
  const lockResetCountRef = useRef<number>(0);

  // 保持 ref 和 state 同步
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  /**
   * 清除 Lock Delay 計時器
   */
  const clearLockDelay = useCallback(() => {
    if (lockDelayTimerRef.current) {
      clearTimeout(lockDelayTimerRef.current);
      lockDelayTimerRef.current = null;
    }
    isLockDelayActiveRef.current = false;
    lockResetCountRef.current = 0;
  }, []);

  /**
   * 重置 Lock Delay（當方塊移動或旋轉時）
   */
  const resetLockDelay = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.currentPiece || state.gameOver || state.isPaused) return;

    // 檢查方塊是否在底部
    const isAtBottom = !isValidMove(
      state.board,
      state.currentPiece,
      { x: state.currentPiece.position.x, y: state.currentPiece.position.y + 1 }
    );

    if (!isAtBottom) {
      // 如果不在底部，清除 Lock Delay
      clearLockDelay();
      return;
    }

    // 如果已達到最大重置次數，立即鎖定
    if (lockResetCountRef.current >= maxLockResets) {
      clearLockDelay();
      lockPiece();
      return;
    }

    // 增加重置計數
    lockResetCountRef.current++;

    // 清除舊的計時器
    if (lockDelayTimerRef.current) {
      clearTimeout(lockDelayTimerRef.current);
    }

    // 設置新的 Lock Delay
    isLockDelayActiveRef.current = true;
    lockDelayTimerRef.current = window.setTimeout(() => {
      lockPiece();
    }, lockDelayDuration);
  }, [lockDelayDuration, maxLockResets]);

  /**
   * 鎖定方塊（固定到遊戲板）
   */
  const lockPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const boardWithPiece = mergePieceToBoard(prev.board, prev.currentPiece);
      const { board: clearedBoard, linesCleared, ComboNumber, isPerfectClear } = clearLines(boardWithPiece, prev.ComboNumber);
      
      const newScore = prev.score + calculatePoints(linesCleared, ComboNumber, isPerfectClear);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;

      // 如果是完美消除，在控制台記錄
      if (isPerfectClear) {
        console.log('🎉 PERFECT CLEAR! +10 分');
      }

      // 使用第一個 next 方塊作為新的當前方塊
      const newCurrentPiece = prev.nextPieces[0];
      // 移除第一個，並在末尾補充新的方塊
      const newNextPieces = [
        ...prev.nextPieces.slice(1),
        createTetromino(randomTetrominoType())
      ];

      const gameOver = newCurrentPiece ? 
        !isValidMove(clearedBoard, newCurrentPiece, newCurrentPiece.position) : false;

      // 清除 Lock Delay
      clearLockDelay();

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: newCurrentPiece,
        nextPieces: newNextPieces,
        score: newScore,
        lines: newLines,
        level: newLevel,
        gameOver,
        ComboNumber: ComboNumber,
        canHold: true
      };
    });
  }, [clearLockDelay]);
  

  /**
   * 開始新遊戲
   * 重置所有狀態並生成初始方塊
   */
  const startGame = useCallback(() => {
    resetTetrominoBag();
    console.log("StartGame");
    
    // 清除所有 Lock Delay
    clearLockDelay();
    
    // 生成初始的 6 個方塊（1 個當前 + 5 個 next）
    const firstPiece = createTetromino(randomTetrominoType());
    const nextPieces = Array.from({ length: 5 }, () => 
      createTetromino(randomTetrominoType())
    );
  
    setGameState({
      board: createEmptyBoard(),
      currentPiece: firstPiece,
      nextPieces: nextPieces,
      holdPiece: null,
      canHold: true,
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
  }, [clearLockDelay]);

  /**
   * 暫停/繼續遊戲
   */
  const pauseGame = useCallback(() => {
    setGameState(prev => {
      const newPaused = !prev.isPaused;
      if (newPaused) {
        // 暫停時清除 Lock Delay
        clearLockDelay();
      }
      return { ...prev, isPaused: newPaused };
    });
  }, [clearLockDelay]);

  /**
   * 暫存方塊功能（Hold Piece）
   */
  const holdCurrentPiece = useCallback(() => {
    setGameState(prev => {
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

      // 清除 Lock Delay
      clearLockDelay();

      // 如果暫存區是空的
      if (!prev.holdPiece) {
        const pieceToHold = createTetromino(prev.currentPiece.type);
        
        // 使用第一個 next 方塊作為新的當前方塊
        const newCurrentPiece = prev.nextPieces[0];
        // 移除第一個，並在末尾補充新的方塊
        const newNextPieces = [
          ...prev.nextPieces.slice(1),
          createTetromino(randomTetrominoType())
        ];

        return {
          ...prev,
          currentPiece: newCurrentPiece,
          nextPieces: newNextPieces,
          holdPiece: pieceToHold,
          canHold: false
        };
      } 
      // 如果暫存區有方塊，交換
      else {
        const pieceFromHold = createTetromino(prev.holdPiece.type);
        const pieceToHold = createTetromino(prev.currentPiece.type);

        if (!isValidMove(prev.board, pieceFromHold, pieceFromHold.position)) {
          console.log('Cannot place held piece - position invalid');
          return prev;
        }

        return {
          ...prev,
          currentPiece: pieceFromHold,
          holdPiece: pieceToHold,
          canHold: false
        };
      }
    });
  }, [clearLockDelay]);

  /**
   * 旋轉方塊（左旋）
   */
  const left_rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const rotated = left_rotatePiece(prev.currentPiece);
      
      if (isValidMove(prev.board, rotated, rotated.position)) {
        // 旋轉成功，重置 Lock Delay
        resetLockDelay();
        return { ...prev, currentPiece: rotated };
      }

      const kicks = [
        { x: 0, y: 0 },
        { x: -1, y: 1},
        { x: 1, y: 1},
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 }
      ];

      for (const kick of kicks) {
        const newPosition = {
          x: rotated.position.x + kick.x,
          y: rotated.position.y + kick.y
        };
        if (isValidMove(prev.board, rotated, newPosition)) {
          // Wall kick 成功，重置 Lock Delay
          resetLockDelay();
          return {
            ...prev,
            currentPiece: { ...rotated, position: newPosition }
          };
        }
      }

      return prev;
    });
  }, [resetLockDelay]);

  /**
   * 旋轉方塊（右旋）
   */
  const right_rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const rotated = right_rotatePiece(prev.currentPiece);
      
      if (isValidMove(prev.board, rotated, rotated.position)) {
        // 旋轉成功，重置 Lock Delay
        resetLockDelay();
        return { ...prev, currentPiece: rotated };
      }

      const kicks = [
        { x: 0, y: 0 },
        { x: -1, y: 1},
        { x: 1, y: 1},
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 }
      ];

      for (const kick of kicks) {
        const newPosition = {
          x: rotated.position.x + kick.x,
          y: rotated.position.y + kick.y
        };
        if (isValidMove(prev.board, rotated, newPosition)) {
          // Wall kick 成功，重置 Lock Delay
          resetLockDelay();
          return {
            ...prev,
            currentPiece: { ...rotated, position: newPosition }
          };
        }
      }

      return prev;
    });
  }, [resetLockDelay]);

  /**
   * 移動方塊
   */
  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const newPosition: Position = {
        x: prev.currentPiece.position.x + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
        y: prev.currentPiece.position.y + (direction === 'down' ? 1 : 0)
      };

      if (isValidMove(prev.board, prev.currentPiece, newPosition)) {
        // 移動成功
        const movedPiece = { ...prev.currentPiece, position: newPosition };
        
        // 檢查移動後是否在底部
        const isNowAtBottom = !isValidMove(
          prev.board,
          movedPiece,
          { x: newPosition.x, y: newPosition.y + 1 }
        );
        
        if (isNowAtBottom) {
          // 到達底部，啟動 Lock Delay
          resetLockDelay();
        } else {
          // 不在底部，清除 Lock Delay
          clearLockDelay();
        }
        
        return {
          ...prev,
          currentPiece: movedPiece
        };
      }

      // 如果是向下移動且無法繼續
      if (direction === 'down') {
        // 如果 Lock Delay 未啟動，啟動它
        if (!isLockDelayActiveRef.current) {
          resetLockDelay();
        }
        // 不立即鎖定，等待 Lock Delay 計時器
        return prev;
      }

      return prev;
    });
  }, [resetLockDelay, clearLockDelay]);

  /**
   * 硬降(直接落下)
   */
  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const dropPosition = getDropPosition(prev.board, prev.currentPiece);
      const droppedPiece = { ...prev.currentPiece, position: dropPosition };
      const boardWithPiece = mergePieceToBoard(prev.board, droppedPiece);
      const { board: clearedBoard, linesCleared, ComboNumber, isPerfectClear } = clearLines(boardWithPiece, prev.ComboNumber);

      const newScore = prev.score + calculatePoints(linesCleared, ComboNumber, isPerfectClear);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;

      // 如果是完美消除，在控制台記錄
      if (isPerfectClear) {
        console.log('🎉 PERFECT CLEAR! +10 分');
      }

      // 使用第一個 next 方塊作為新的當前方塊
      const newCurrentPiece = prev.nextPieces[0];
      // 移除第一個，並在末尾補充新的方塊
      const newNextPieces = [
        ...prev.nextPieces.slice(1),
        createTetromino(randomTetrominoType())
      ];

      const gameOver = newCurrentPiece ? 
        !isValidMove(clearedBoard, newCurrentPiece, newCurrentPiece.position) : false;

      // 硬降時清除 Lock Delay
      clearLockDelay();

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: newCurrentPiece,
        nextPieces: newNextPieces,
        score: newScore,
        lines: newLines,
        level: newLevel,
        gameOver,
        ComboNumber: ComboNumber,
        canHold: true
      };
    });
  }, [clearLockDelay]);

  /**
   * 監控遊戲結束狀態
   */
  useEffect(() => {
    if (gameState.gameOver) {
      setIsGameRunning(false);
      clearLockDelay();
    }
  }, [gameState.gameOver, clearLockDelay]);

  /**
   * 倒數計時器 Effect
   */
  useEffect(() => {
    if (!isGameRunning || gameState.isPaused) {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    if (countdownTimerRef.current) {
      return;
    }

    countdownTimerRef.current = window.setInterval(() => {
      setGameState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
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
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    if (gameLoopRef.current) {
      return;
    }

    const speed = Math.max(100, 1000 - (gameState.level - 1) * 100);
    
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

      // 無法繼續下落，啟動 Lock Delay（如果尚未啟動）
      if (!isLockDelayActiveRef.current) {
        resetLockDelay();
      }
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState.gameOver, gameState.isPaused, gameState.level, gameState.currentPiece ? 'exists' : 'none', resetLockDelay]);

  // 返回遊戲狀態和控制函數
  return {
    gameState,
    startGame,
    pauseGame,
    movePiece,
    left_rotate,
    right_rotate,
    hardDrop,
    holdCurrentPiece
  };
};