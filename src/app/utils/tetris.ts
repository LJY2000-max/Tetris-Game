// src/utils/tetris.ts

import {
  TetrominoType,
  Tetromino,
  Position,
  TETROMINOS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  POINTS
} from '..//types/tetris';

export const createEmptyBoard = (): (TetrominoType | null)[][] => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
};

export const randomTetrominoType = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

export const createTetromino = (type: TetrominoType): Tetromino => {
  return {
    type,
    position: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[type][0].length / 2),
      y: 0
    },
    shape: TETROMINOS[type]
  };
};

export const rotatePiece = (piece: Tetromino): Tetromino => {
  const rotated = piece.shape[0].map((_, index) =>
    piece.shape.map(row => row[index]).reverse()
  );
  return { ...piece, shape: rotated };
};

export const isValidMove = (
  board: (TetrominoType | null)[][],
  piece: Tetromino,
  position: Position
): boolean => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = position.x + x;
        const newY = position.y + y;

        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

export const mergePieceToBoard = (
  board: (TetrominoType | null)[][],
  piece: Tetromino
): (TetrominoType | null)[][] => {
  const newBoard = board.map(row => [...row]);
  
  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    });
  });
  
  return newBoard;
};

export const clearLines = (board: (TetrominoType | null)[][]): {
  board: (TetrominoType | null)[][];
  linesCleared: number;
} => {
  let linesCleared = 0;
  const newBoard = board.filter(row => {
    const isFull = row.every(cell => cell !== null);
    if (isFull) linesCleared++;
    return !isFull;
  });

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { board: newBoard, linesCleared };
};

export const calculatePoints = (linesCleared: number): number => {
  switch (linesCleared) {
    case 1:
      return POINTS.SINGLE;
    case 2:
      return POINTS.DOUBLE;
    case 3:
      return POINTS.TRIPLE;
    case 4:
      return POINTS.TETRIS;
    default:
      return 0;
  }
};

export const getDropPosition = (
  board: (TetrominoType | null)[][],
  piece: Tetromino
): Position => {
  let dropPosition = { ...piece.position };
  
  while (isValidMove(board, piece, { x: dropPosition.x, y: dropPosition.y + 1 })) {
    dropPosition.y++;
  }
  
  return dropPosition;
};

export const getGhostPiece = (
  board: (TetrominoType | null)[][],
  piece: Tetromino
): Tetromino => {
  const dropPosition = getDropPosition(board, piece);
  return { ...piece, position: dropPosition };
};