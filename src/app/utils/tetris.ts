// src/utils/tetris.ts

import {
  TetrominoType,
  Tetromino,
  Position,
  TETROMINOS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINO_SHAPES,
  CLEAR_POINTS,
  COMBO_POINTS
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
 * 7-bag 隨機系統：每 7 個方塊為一包，確保每包都包含所有 7 種方塊各一次
 */
class TetrominoBag {
  private bag: TetrominoType[] = [];
  
  /**
   * 洗牌演算法（Fisher-Yates Shuffle）
   */
  private shuffle(array: TetrominoType[]): TetrominoType[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * 生成新的一包方塊（包含所有 7 種類型，順序隨機）
   */
  private generateNewBag(): void {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    this.bag = this.shuffle(types);
  }
  
  /**
   * 取得下一個方塊類型
   */
  public next(): TetrominoType {
    // 如果包空了，生成新的一包
    console.log("bag.length:",this.bag.length);
    if (this.bag.length === 0) {
      this.generateNewBag();
    }
    
    // 從包中取出一個方塊（從後面取，效能較好）
    return this.bag.pop()!;
  }

  /**
   * 🔴 新增：重置方塊包
   * 清空當前的包，下次呼叫 next() 時會生成新的一包
   */
  public reset(): void {
    this.bag = [];
  }
}

// 建立全域的方塊包實例
const tetrominoBag = new TetrominoBag();

/**
 * 隨機選擇一種俄羅斯方塊類型（使用 7-bag 系統）
 * @returns 下一個方塊類型（確保每 7 個方塊都不重複）
 */
export const randomTetrominoType = (): TetrominoType => {
  return tetrominoBag.next();
};

/**
 * 🔴 新增：重置方塊包（遊戲開始或結束時呼叫）
 */
export const resetTetrominoBag = (): void => {
  tetrominoBag.reset();
};

/**
 * 建立一個新的俄羅斯方塊
 * @param type - 方塊類型
 * @returns 包含類型、初始位置和形狀的俄羅斯方塊物件
 */
export const createTetromino = (type: TetrominoType): Tetromino => {
  const shape = TETROMINO_SHAPES[type][0]; // 🔴 使用第 0 個旋轉狀態
  return {
    type,
    shape,
    // 將方塊置中於頂部
    position: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[type][0].length / 2),
      y: 0
    },
    rotation: 0
  };
};

/**
 * 逆時針旋轉方塊（左旋轉）
 * @param piece - 要旋轉的方塊
 * @returns 旋轉後的新方塊物件
 */
export const left_rotatePiece = (piece: Tetromino): Tetromino => {
  // 計算上一個旋轉狀態（0 → 3 → 2 → 1 → 0）
  const nextRotation = (piece.rotation - 1 + 4) % 4;
  
  // 從預定義的形狀中取得旋轉後的形狀
  const rotatedShape = TETROMINO_SHAPES[piece.type][nextRotation];
  
  return {
    ...piece,
    shape: rotatedShape,
    rotation: nextRotation
  };
};

/**
 * 順時針旋轉方塊（右旋轉）
 * @param piece - 要旋轉的方塊
 * @returns 旋轉後的新方塊物件
 */
export const right_rotatePiece = (piece: Tetromino): Tetromino => {
  // 計算下一個旋轉狀態（0 → 1 → 2 → 3 → 0）
  const nextRotation = (piece.rotation + 1) % 4;
  
  // 從預定義的形狀中取得旋轉後的形狀
  const rotatedShape = TETROMINO_SHAPES[piece.type][nextRotation];
  
  return {
    ...piece,
    shape: rotatedShape,
    rotation: nextRotation
  };
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
export const clearLines = (board: (TetrominoType | null)[][], ComboNumber: number): {
  board: (TetrominoType | null)[][];
  linesCleared: number;
  ComboNumber: number;
} => {
  let linesCleared = 0;

  // 過濾掉已填滿的行
  let ComboClearFlag = true;
  const newBoard = board.filter(row => {
    const isFull = row.every(cell => cell !== null);
    if (isFull) {
      linesCleared++;
      ComboClearFlag = false;
    }
    return !isFull; // 保留未填滿的行
  });

  if (ComboClearFlag == true) ComboNumber = 0
  else ComboNumber+=1;;

  // 在頂部補充空行，維持遊戲板高度
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { board: newBoard, linesCleared, ComboNumber };
};

/**
 * 根據清除的行數計算得分
 * @param linesCleared - 清除的行數
 * @returns 獲得的分數
 */
export const calculatePoints = (linesCleared: number, ComboNumber: number): number => {
  let TOTAL_POINTS = 0;
  switch (linesCleared) {
    case 1:
      TOTAL_POINTS += CLEAR_POINTS.SINGLE;   // 1分
      break;
    case 2:
      TOTAL_POINTS += CLEAR_POINTS.DOUBLE;   // 2分
      break;
    case 3:
      TOTAL_POINTS += CLEAR_POINTS.TRIPLE;   // 3分
      break;
    case 4:
      TOTAL_POINTS += CLEAR_POINTS.TETRIS;   // 4分（俄羅斯方塊）
      break;
  }

  switch (ComboNumber) {
    case 0:
    case 1:
      TOTAL_POINTS += COMBO_POINTS.COMBO_0;
      break;
    case 2:
    case 3:
      TOTAL_POINTS += COMBO_POINTS.COMBO_1to2;
      break;
    case 3:
    case 4:
      TOTAL_POINTS += COMBO_POINTS.COMBO_3to4;
      break;
    case 5:
    case 6:
      TOTAL_POINTS += COMBO_POINTS.COMBO_5to6;
      break;
    case 7:
    case 8:
      TOTAL_POINTS += COMBO_POINTS.COMBO_7to8;
      break;
    case 9:
    case 10:
      TOTAL_POINTS += COMBO_POINTS.COMBO_9to10;
      break;
    case 11:
    case 12:
      TOTAL_POINTS += COMBO_POINTS.COMBO_11to12;
      break;
    case 13:
    case 14:
      TOTAL_POINTS += COMBO_POINTS.COMBO_13to14;
      break;
    case 15:
    case 16:
      TOTAL_POINTS += COMBO_POINTS.COMBO_15to16;
      break;
    default:
      TOTAL_POINTS += COMBO_POINTS.COMBO_17up;
  }

  return TOTAL_POINTS;
};

/**
 * 計算方塊直落到底的位置
 * @param board - 當前遊戲板
 * @param piece - 要計算的方塊
 * @returns 方塊落到底部的最終位置ghost
 */
export const getDropPosition = (
  board: (TetrominoType | null)[][],
  piece: Tetromino
): Position => {
  const dropPosition = { ...piece.position };
  
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