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
  rotation: number;         // 當前旋轉狀態（0, 1, 2, 3）
}

/**
 * 遊戲狀態介面 - 包含遊戲的所有狀態資訊
 */
export interface GameState {
  board: (TetrominoType | null)[][];  // 遊戲板：20x10的二維陣列，null表示空格
  currentPiece: Tetromino | null;     // 當前正在下落的方塊
  nextPiece: Tetromino | null;        // 下一個將要出現的方塊
  holdPiece: Tetromino | null;        // 暫存的方塊
  canHold: boolean;                   // 是否可以暫存（防止連續暫存）
  score: number;                      // 當前分數
  lines: number;                      // 已消除的總行數
  level: number;                      // 當前等級（影響下落速度）
  gameOver: boolean;                  // 遊戲是否結束
  isPaused: boolean;                  // 遊戲是否暫停
  ComboNumber: number;
  timeRemaining: number;              // 剩餘時間（秒）
}

// 遊戲板尺寸常數
export const BOARD_WIDTH = 10;   // 遊戲板寬度（格數）
export const BOARD_HEIGHT = 20;  // 遊戲板高度（格數）
export const GAME_DURATION = 120; // 遊戲時長：120秒（2分鐘）

/**
 * 定義所有俄羅斯方塊的所有旋轉狀態
 * 每個方塊有 4 個旋轉狀態（0, 1, 2, 3）
 * 0 = 預設狀態，1/2/3 = 順時針旋轉 90/180/270 度
 */
export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  // I 形：4 種旋轉狀態
  I: [
    // 狀態 0（預設）：橫向
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // 狀態 1：直立（右側）
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0]
    ],
    // 狀態 2：橫向（下方）
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0]
    ],
    // 狀態 3：直立（左側）
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ]
  ],

  // O 形：所有旋轉狀態相同
  O: [
    [
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 1]
    ]
  ],

  // T 形：4 種旋轉狀態
  T: [
    // 狀態 0（預設）
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    // 狀態 1
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0]
    ],
    // 狀態 2
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    // 狀態 3
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]
  ],

  // S 形：4 種旋轉狀態
  S: [
    // 狀態 0（預設）
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    // 狀態 1
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1]
    ],
    // 狀態 2
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0]
    ],
    // 狀態 3
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]
  ],

  // Z 形：4 種旋轉狀態
  Z: [
    // 狀態 0（預設）
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    // 狀態 1
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0]
    ],
    // 狀態 2
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ],
    // 狀態 3
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0]
    ]
  ],

  // L 形：4 種旋轉狀態
  L: [
    // 狀態 0（預設）
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    // 狀態 1
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
    ],
    // 狀態 2
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0]
    ],
    // 狀態 3
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0]
    ]
  ],

  // J 形：4 種旋轉狀態
  J: [
    // 狀態 0（預設）
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    // 狀態 1
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0]
    ],
    // 狀態 2
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1]
    ],
    // 狀態 3
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0]
    ]
  ]
};

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
export const CLEAR_POINTS = {
  SINGLE: 1,      // 消除1行
  DOUBLE: 2,      // 同時消除2行
  TRIPLE: 3,      // 同時消除3行
  TETRIS: 4,      // 同時消除4行（俄羅斯方塊）
  PERFECT_CLEAR: 10,
  //SOFT_DROP: 0,     // 按下鍵加速下降（每格1分）
  HARD_DROP: 0      // 空白鍵直接落下（每格2分）
} as const;

export const SPECIAL_POINTS = {
  T_SPIN: 2,      // T_SPIN
  I_SPIN: 1,      // I_SPIN
  L_SPIN: 1,      // L_SPIN
  J_SPIN: 1,      // J_SPIN
  Z_SPIN: 1,      // Z_SPIN
  S_SPIN: 1       // S_SPIN
} as const;

export const COMBO_POINTS = {
  COMBO_0:      0,
  COMBO_1to2:   1,    // COMBO 1~2
  COMBO_3to4:   2,    // COMBO 3~4
  COMBO_5to6:   3,    // COMBO 5~6
  COMBO_7to8:   4,    // COMBO 7~8
  COMBO_9to10:  5,    // COMBO 9~10
  COMBO_11to12: 6,    // COMBO 11~12
  COMBO_13to14: 7,    // COMBO 13~14
  COMBO_15to16: 8,    // COMBO 15~16
  COMBO_17up:  10     // COMBO 17+
} as const;