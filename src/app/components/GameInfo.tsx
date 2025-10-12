// src/components/GameInfo.tsx

import React from 'react';
import { GameState, COLORS, TETROMINOS } from '../types/tetris';

/**
 * GameInfo組件的屬性介面
 */
interface GameInfoProps {
  gameState: GameState;       // 遊戲狀態
  onStart: () => void;        // 開始遊戲的回調函數
  onPause: () => void;        // 暫停遊戲的回調函數
}

/**
 * 下一個方塊預覽組件
 * 在4x4的網格中顯示下一個將要出現的方塊
 */
const NextPieceDisplay: React.FC<{ nextPiece: GameState['nextPiece'] }> = ({ nextPiece }) => {
  if (!nextPiece) return null;

  // 從常數中取得方塊形狀
  const shape = TETROMINOS[nextPiece.type];
  const maxSize = 4;  // 預覽區域大小
  // 計算偏移量，使方塊置中顯示
  const offsetY = Math.floor((maxSize - shape.length) / 2);
  const offsetX = Math.floor((maxSize - shape[0].length) / 2);

  return (
    <div className="bg-gray-800 p-3 rounded">
      <h3 className="text-white font-semibold mb-2">Next</h3>
      {/* 4x4的預覽網格 */}
      <div className="grid grid-cols-4 gap-[1px]">
        {/* 生成16個格子（4x4） */}
        {Array.from({ length: maxSize }, (_, y) =>
          Array.from({ length: maxSize }, (_, x) => {
            // 計算在形狀陣列中的位置
            const shapeY = y - offsetY;
            const shapeX = x - offsetX;
            // 檢查這個位置是否有方塊
            const hasBlock = 
              shapeY >= 0 && 
              shapeY < shape.length && 
              shapeX >= 0 && 
              shapeX < shape[0].length && 
              shape[shapeY][shapeX];
            
            return (
              <div
                key={`${y}-${x}`}
                className={`aspect-square ${
                  hasBlock ? COLORS[nextPiece.type] : 'bg-gray-700'
                }`}
                data-testid={`next-cell-${y}-${x}`}
              />
            );
          })
        ).flat()}
      </div>
    </div>
  );
};

  /**
   * 🔴 新增：格式化時間顯示組件
   * 將秒數轉換為 MM:SS 格式
   */
  const TimeDisplay: React.FC<{ timeRemaining: number }> = ({ timeRemaining }) => {
  // 計算分鐘和秒數
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  // 格式化為兩位數（例如：01:05）
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // 根據剩餘時間改變顏色：30秒以下顯示紅色警告
  const timeColorClass = timeRemaining <= 30 ? 'text-red-400' : 'text-cyan-400';
  
  return (
    <div className="time-display bg-gray-800 p-3 rounded">
      <h3 className="text-white font-semibold">Time</h3>
      <p className={`text-2xl ${timeColorClass} font-bold`} data-testid="time">
        {formattedTime}
      </p>
      {timeRemaining <= 30 && timeRemaining > 0 && (
        <p className="text-xs text-red-300 mt-1">Time running out!</p>
      )}
    </div>
  );
};

/**
 * 遊戲資訊面板組件
 * 顯示分數、等級、控制按鈕等遊戲資訊
 */
const GameInfo: React.FC<GameInfoProps> = ({ gameState, onStart, onPause }) => {
  const { score, lines, level, gameOver, isPaused, nextPiece, timeRemaining } = gameState;

  return (
    
    <div className="game-info bg-gray-900 p-4 rounded-lg shadow-2xl space-y-4">
      {/* 🔴 新增：時間顯示區（放在最上方，最重要） */}
      <TimeDisplay timeRemaining={timeRemaining} />
      {/* 分數顯示區 */}
      <div className="score-display bg-gray-800 p-3 rounded">
        <h3 className="text-white font-semibold">Score</h3>
        <p className="text-2xl text-cyan-400 font-bold" data-testid="score">{score}</p>
      </div>

      {/* 消除行數顯示區 */}
      <div className="lines-display bg-gray-800 p-3 rounded">
        <h3 className="text-white font-semibold">Lines</h3>
        <p className="text-2xl text-green-400 font-bold" data-testid="lines">{lines}</p>
      </div>

      {/* 等級顯示區 */}
      <div className="level-display bg-gray-800 p-3 rounded">
        <h3 className="text-white font-semibold">Level</h3>
        <p className="text-2xl text-yellow-400 font-bold" data-testid="level">{level}</p>
      </div>

      {/* 下一個方塊預覽 */}
      <NextPieceDisplay nextPiece={nextPiece} />

      {/* 控制按鈕區 */}
      <div className="controls space-y-2">
        {/* 根據遊戲狀態顯示不同按鈕 */}
        {!gameState.currentPiece || gameOver ? (
          // 顯示開始/重新開始按鈕
          <button
            onClick={onStart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            data-testid="start-button"
          >
            {gameOver ? 'Restart' : 'Start Game'}
          </button>
        ) : (
          // 顯示暫停/繼續按鈕
          <button
            onClick={onPause}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
            data-testid="pause-button"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      {/* 遊戲結束提示 */}
      {gameOver && (
        <div className="game-over-display bg-red-800 p-3 rounded">
          <p className="text-white font-bold text-center">Game Over!</p>
          {timeRemaining === 0 && (
            <p className="text-sm text-white text-center mt-1">Time&apos;s up!</p>
          )}
        </div>
      )}

      {/* 操作說明 */}
      <div className="controls-info bg-gray-800 p-3 rounded text-sm text-gray-300">
        <h3 className="text-white font-semibold mb-2">Controls</h3>
        <ul className="space-y-1">
          <li>← → : Move</li>
          <li>↓ : Soft Drop</li>
          <li>↑ : Rotate</li>
          <li>Space : Hard Drop</li>
        </ul>
      </div>
    </div>
  );
};

export default GameInfo;