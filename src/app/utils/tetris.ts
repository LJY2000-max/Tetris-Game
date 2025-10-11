// src/utils/tetris.ts

import {
  TetrominoType,
  Tetromino,
  Position,
  TETROMINOS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  POINTS
} from '../types/tetris';

/**
 * 建立一個空的遊戲板
 * @returns 20x10的二維陣列，所有格子都是null（空的）
 */
export const createEmptyBoard = (): (TetrominoType | null)[][] => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
};

/**
 * 隨機選擇一種俄羅斯方塊類型
 * @returns 隨機的方塊類型（I, O, T, S, Z, J, L其中之一）
 */
export const randomTetrominoType = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

/**
 * 建立一個新的俄羅斯方塊
 * @param type - 方塊類型
 * @returns 包含類型、初始位置和形狀的俄羅斯方塊物件
 */
export const createTetromino = (type: TetrominoType): Tetromino => {
  return {
    type,
    // 將方塊置中於頂部
    position: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[type][0].length / 2),
      y: 0
    },
    shape: TETROMINOS[type]
  };
};

/**
 * 將方塊順時針旋轉90度
 * 旋轉算法：將矩陣轉置後，每一行反轉
 * @param piece - 要旋轉的方塊
 * @returns 旋轉後的新方塊物件
 */
export const rotatePiece = (piece: Tetromino): Tetromino => {
  // 矩陣旋轉：先轉置（行列互換），再將每行反轉
  const rotated = piece.shape[0].map((_, index) =>
    piece.shape.map(row => row[index]).reverse()
  );
  return { ...piece, shape: rotated };
};

/**
 * 檢查方塊在指定位置是否有效（不越界、不重疊）
 * @param board - 當前遊戲板
 * @param piece - 要檢查的方塊
 * @param position - 要檢查的位置
 * @returns true表示位置有效，false表示無效
 */
export const isValidMove = (
  board: (TetrominoType | null)[][],
  piece: Tetromino,
  position: Position
): boolean => {
  // 遍歷方塊的每個格子
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      // 如果這個位置有方塊
      if (piece.shape[y][x]) {
        const newX = position.x + x;
        const newY = position.y + y;

        // 檢查是否越界或與現有方塊重疊
        if (
          newX < 0 ||                    // 超出左邊界
          newX >= BOARD_WIDTH ||          // 超出右邊界
          newY >= BOARD_HEIGHT ||         // 超出底部
          (newY >= 0 && board[newY][newX]) // 與現有方塊重疊
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

/**
 * 將方塊固定到遊戲板上
 * @param board - 當前遊戲板
 * @param piece - 要固定的方塊
 * @returns 包含方塊的新遊戲板
 */
export const mergePieceToBoard = (
  board: (TetrominoType | null)[][],
  piece: Tetromino
): (TetrominoType | null)[][] => {
  // 建立遊戲板的副本，避免修改原始陣列
  const newBoard = board.map(row => [...row]);
  
  // 將方塊的每個格子寫入遊戲板
  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        // 確保不越界
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    });
  });
  
  return newBoard;
};

/**
 * 清除已填滿的行
 * @param board - 當前遊戲板
 * @returns 物件包含：清除後的遊戲板和清除的行數
 */
export const clearLines = (board: (TetrominoType | null)[][]): {
  board: (TetrominoType | null)[][];
  linesCleared: number;
} => {
  let linesCleared = 0;
  
  // 過濾掉已填滿的行
  const newBoard = board.filter(row => {
    const isFull = row.every(cell => cell !== null);
    if (isFull) linesCleared++;
    return !isFull; // 保留未填滿的行
  });

  // 在頂部補充空行，維持遊戲板高度
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { board: newBoard, linesCleared };
};

/**
 * 根據清除的行數計算得分
 * @param linesCleared - 清除的行數
 * @returns 獲得的分數
 */
export const calculatePoints = (linesCleared: number): number => {
  switch (linesCleared) {
    case 1:
      return POINTS.SINGLE;   // 100分
    case 2:
      return POINTS.DOUBLE;   // 300分
    case 3:
      return POINTS.TRIPLE;   // 500分
    case 4:
      return POINTS.TETRIS;   // 800分（俄羅斯方塊）
    default:
      return 0;
  }
};

/**
 * 計算方塊直落到底的位置
 * @param board - 當前遊戲板
 * @param piece - 要計算的方塊
 * @returns 方塊落到底部的最終位置
 */
export const getDropPosition = (
  board: (TetrominoType | null)[][],
  piece: Tetromino
): Position => {
  let dropPosition = { ...piece.position };
  
  // 持續向下移動直到不能再移動
  while (isValidMove(board, piece, { x: dropPosition.x, y: dropPosition.y + 1 })) {
    dropPosition.y++;
  }
  
  return dropPosition;
};

/**
 * 取得幽靈方塊（預覽方塊落下位置）
 * @param board - 當前遊戲板
 * @param piece - 當前方塊
 * @returns 位於最終落下位置的幽靈方塊
 */
export const getGhostPiece = (
  board: (TetrominoType | null)[][],
  piece: Tetromino
): Tetromino => {
  const dropPosition = getDropPosition(board, piece);
  return { ...piece, position: dropPosition };
};