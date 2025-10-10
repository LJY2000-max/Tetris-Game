// src/hooks/useTetris.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  Tetromino,
  Position,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  POINTS
} from '../types/tetris';
import {
  createEmptyBoard,
  randomTetrominoType,
  createTetromino,
  rotatePiece,
  isValidMove,
  mergePieceToBoard,
  clearLines,
  calculatePoints,
  getDropPosition
} from '../utils/tetris';

export const useTetris = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    isPaused: false
  });

  const gameLoopRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
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
      isPaused: false
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const newPosition: Position = {
        x: prev.currentPiece.position.x + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
        y: prev.currentPiece.position.y + (direction === 'down' ? 1 : 0)
      };

      if (isValidMove(prev.board, prev.currentPiece, newPosition)) {
        const newScore = direction === 'down' ? prev.score + POINTS.SOFT_DROP : prev.score;
        return {
          ...prev,
          currentPiece: { ...prev.currentPiece, position: newPosition },
          score: newScore
        };
      }

      if (direction === 'down') {
        // Piece can't move down, lock it in place
        const boardWithPiece = mergePieceToBoard(prev.board, prev.currentPiece);
        const { board: clearedBoard, linesCleared } = clearLines(boardWithPiece);
        
        const newScore = prev.score + calculatePoints(linesCleared);
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;

        const newCurrentPiece = prev.nextPiece;
        const newNextPiece = createTetromino(randomTetrominoType());

        // Check for game over
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
          gameOver
        };
      }

      return prev;
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const rotated = rotatePiece(prev.currentPiece);
      
      if (isValidMove(prev.board, rotated, rotated.position)) {
        return { ...prev, currentPiece: rotated };
      }

      // Wall kick logic
      const kicks = [
        { x: 0, y: 0 },
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
          return {
            ...prev,
            currentPiece: { ...rotated, position: newPosition }
          };
        }
      }

      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.isPaused) return prev;

      const dropPosition = getDropPosition(prev.board, prev.currentPiece);
      const distance = dropPosition.y - prev.currentPiece.position.y;
      const newScore = prev.score + (distance * POINTS.HARD_DROP);

      const droppedPiece = { ...prev.currentPiece, position: dropPosition };
      const boardWithPiece = mergePieceToBoard(prev.board, droppedPiece);
      const { board: clearedBoard, linesCleared } = clearLines(boardWithPiece);
      
      const pointsFromLines = calculatePoints(linesCleared);
      const totalScore = newScore + pointsFromLines;
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
        score: totalScore,
        lines: newLines,
        level: newLevel,
        gameOver
      };
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const speed = Math.max(100, 1000 - (gameState.level - 1) * 100);
    
    gameLoopRef.current = window.setInterval(() => {
      movePiece('down');
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.currentPiece, gameState.gameOver, gameState.isPaused, gameState.level, movePiece]);

  return {
    gameState,
    startGame,
    pauseGame,
    movePiece,
    rotate,
    hardDrop
  };
};