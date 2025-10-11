// src/types/tetris.ts

/**
 * 俄羅斯方塊的七種類型
 * I: 長條形（4格直線）
 * O: 方塊形（2x2正方形）
 * T: T字形
 * S: S形（綠色）
 * Z: Z形（紅色）
 * J: J形（藍色L）
 * L: L形（橘色L）
 */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/**
 * 位置介面 - 用於定義方塊在遊戲板上的座標
 */
export interface Position {
  x: number;  // 水平位置（0-9）
  y: number;  // 垂直位置（0-19）
}

/**
 * 俄羅斯方塊介面 - 定義單個俄羅斯方塊的完整資訊
 */
export interface Tetromino {
  type: TetrominoType;      // 方塊類型
  position: Position;        // 當前在遊戲板上的位置
  shape: number[][];        // 方塊形狀的二維陣列（1表示有方塊，0表示空）
}

/**
 * 遊戲狀態介面 - 包含遊戲的所有狀態資訊
 */
export interface GameState {
  board: (TetrominoType | null)[][];  // 遊戲板：20x10的二維陣列，null表示空格
  currentPiece: Tetromino | null;     // 當前正在下落的方塊
  nextPiece: Tetromino | null;        // 下一個將要出現的方塊
  score: number;                      // 當前分數
  lines: number;                      // 已消除的總行數
  level: number;                      // 當前等級（影響下落速度）
  gameOver: boolean;                  // 遊戲是否結束
  isPaused: boolean;                  // 遊戲是否暫停
}

// 遊戲板尺寸常數
export const BOARD_WIDTH = 10;   // 遊戲板寬度（格數）
export const BOARD_HEIGHT = 20;  // 遊戲板高度（格數）

/**
 * 定義所有俄羅斯方塊的形狀
 * 使用二維陣列表示，1表示有方塊，0表示空
 */
export const TETROMINOS: Record<TetrominoType, number[][]> = {
  // I形：一條直線
  I: [
    [1, 1, 1, 1]
  ],
  // O形：2x2的正方形
  O: [
    [1, 1],
    [1, 1]
  ],
  // T形：像字母T
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  // S形：像字母S
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  // Z形：像字母Z
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  // J形：像反向的L
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  // L形：像字母L
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ]
};

/**
 * 定義每種方塊的顏色（使用Tailwind CSS類別）
 */
export const COLORS: Record<TetrominoType | 'empty', string> = {
  I: 'bg-cyan-400',     // 青色
  O: 'bg-yellow-400',   // 黃色
  T: 'bg-purple-400',   // 紫色
  S: 'bg-green-400',    // 綠色
  Z: 'bg-red-400',      // 紅色
  J: 'bg-blue-400',     // 藍色
  L: 'bg-orange-400',   // 橘色
  empty: 'bg-gray-800'  // 空格顏色
};

/**
 * 計分系統常數
 */
export const POINTS = {
  SINGLE: 100,      // 消除1行
  DOUBLE: 300,      // 同時消除2行
  TRIPLE: 500,      // 同時消除3行
  TETRIS: 800,      // 同時消除4行（俄羅斯方塊）
  SOFT_DROP: 1,     // 按下鍵加速下降（每格1分）
  HARD_DROP: 2      // 空白鍵直接落下（每格2分）
} as const;