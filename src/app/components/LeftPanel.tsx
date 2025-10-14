// src/components/LeftPanel.tsx

import React from 'react';
import { GameState, COLORS, TETROMINOS } from '../types/tetris';

interface LeftPanelProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
}

/**
 * 暫存方塊預覽組件
 */
const HoldPieceDisplay: React.FC<{ holdPiece: GameState['holdPiece'], canHold: boolean }> = ({ holdPiece, canHold }) => {
  const maxSize = 4;

  return (
    <div className={`bg-gray-800 p-4 rounded-lg ${!canHold ? 'opacity-50' : ''}`}>
      <h3 className="text-white font-bold text-xl mb-3">HOLD</h3>
      <div className="grid grid-cols-4 gap-[2px] bg-gray-700 p-2">
        {holdPiece ? (
          (() => {
            const shape = TETROMINOS[holdPiece.type];
            const offsetY = Math.floor((maxSize - shape.length) / 2);
            const offsetX = Math.floor((maxSize - shape[0].length) / 2);

            return Array.from({ length: maxSize }, (_, y) =>
              Array.from({ length: maxSize }, (_, x) => {
                const shapeY = y - offsetY;
                const shapeX = x - offsetX;
                const hasBlock = 
                  shapeY >= 0 && 
                  shapeY < shape.length && 
                  shapeX >= 0 && 
                  shapeX < shape[0].length && 
                  shape[shapeY][shapeX];
                
                return (
                  <div
                    key={`${y}-${x}`}
                    className={`aspect-square rounded-sm ${
                      hasBlock ? COLORS[holdPiece.type] : 'bg-gray-900'
                    }`}
                  />
                );
              })
            ).flat();
          })()
        ) : (
          Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-900 rounded-sm"
            />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * 左側資訊面板組件
 */
const LeftPanel: React.FC<LeftPanelProps> = ({ gameState, onStart, onPause }) => {
  const { score, lines, level, holdPiece, canHold, gameOver, isPaused, timeRemaining } = gameState;

  return (
    <div className="left-panel space-y-4 w-48">
      {/* Hold 區域 */}
      <HoldPieceDisplay holdPiece={holdPiece} canHold={canHold} />

      {/* Score 顯示 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white font-bold text-xl mb-2">SCORE</h3>
        <p className="text-3xl text-cyan-400 font-bold">{score}</p>
      </div>

      {/* Lines 顯示 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white font-bold text-xl mb-2">LINES</h3>
        <p className="text-3xl text-green-400 font-bold">{lines}</p>
      </div>

      {/* Level 顯示 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white font-bold text-xl mb-2">LEVEL</h3>
        <p className="text-3xl text-yellow-400 font-bold">{level}</p>
      </div>

      {/* 控制按鈕 */}
      <div className="controls space-y-2">
        {!gameState.currentPiece || gameOver ? (
          <button
            onClick={onStart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
          >
            {gameOver ? 'RESTART' : 'START'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        )}
      </div>

      {/* 遊戲結束提示 */}
      {gameOver && (
        <div className="game-over bg-red-800 p-4 rounded-lg">
          <p className="text-white font-bold text-center text-lg">GAME OVER!</p>
          {timeRemaining === 0 && (
            <p className="text-sm text-white text-center mt-2">Time&apos;s up!</p>
          )}
        </div>
      )}

      {/* 操作說明 */}
      <div className="controls-info bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
        <h3 className="text-white font-bold mb-3 text-center">CONTROLS</h3>
        <ul className="space-y-2">
          <li className="flex justify-between">
            <span>← →</span>
            <span>移動</span>
          </li>
          <li className="flex justify-between">
            <span>↓</span>
            <span>加速降落</span>
          </li>
          <li className="flex justify-between">
            <span>↑ / X</span>
            <span>右旋(順時針)</span>
          </li>
          <li className="flex justify-between">
            <span>Z</span>
            <span>左旋(逆時針)</span>
          </li>
          <li className="flex justify-between">
            <span>Space</span>
            <span>瞬間降落</span>
          </li>
          <li className="flex justify-between">
            <span className="text-red-400 font-bold">C</span>
            <span>Hold</span>
          </li>
          <li className="flex justify-between">
            <span>ESC</span>
            <span>Pause</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeftPanel;