// src/components/RightPanel.tsx

import React from 'react';
import { GameState, COLORS, TETROMINOS, Tetromino } from '../types/tetris';

interface RightPanelProps {
  gameState: GameState;
}

/**
 * 單個 Next 方塊預覽組件 - 使用與主遊戲板相同的格子大小
 */
const NextPieceDisplay: React.FC<{ piece: Tetromino; index: number }> = ({ piece, index }) => {
  const shape = TETROMINOS[piece.type];
  const maxSize = 4;
  const offsetY = Math.floor((maxSize - shape.length) / 2);
  const offsetX = Math.floor((maxSize - shape[0].length) / 2);

  return (
    <div className="bg-gray-800 p-2 rounded-lg">
      <h3 className="text-white font-semibold text-xs mb-1 text-center">
        NEXT {index + 1}
      </h3>
      <div className="grid grid-cols-4 gap-[2px] bg-gray-700 p-1">
        {Array.from({ length: maxSize }, (_, y) =>
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
                className={`w-8 h-8 rounded-sm ${
                  hasBlock ? COLORS[piece.type] : 'bg-gray-900'
                }`}
              />
            );
          })
        ).flat()}
      </div>
    </div>
  );
};

/**
 * 空的 Next 格子顯示組件
 */
const EmptyNextDisplay: React.FC<{ index: number }> = ({ index }) => {
  const maxSize = 4;

  return (
    <div className="bg-gray-800 p-2 rounded-lg">
      <h3 className="text-white font-semibold text-xs mb-1 text-center">
        NEXT {index + 1}
      </h3>
      <div className="grid grid-cols-4 gap-[2px] bg-gray-700 p-1">
        {Array.from({ length: maxSize * maxSize }, (_, i) => (
          <div
            key={i}
            className="w-8 h-8 bg-gray-900 rounded-sm"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * 右側資訊面板組件 - 顯示 5 個 Next 方塊（遊戲前顯示空格子）
 */
const RightPanel: React.FC<RightPanelProps> = ({ gameState }) => {
  const { nextPieces } = gameState;

  return (
    <div className="right-panel space-y-3">
      {/* 5 個 Next 方塊預覽 */}
      {Array.from({ length: 5 }, (_, index) => {
        const piece = nextPieces[index];
        
        // 如果有方塊，顯示方塊；否則顯示空格子
        return piece ? (
          <NextPieceDisplay key={index} piece={piece} index={index} />
        ) : (
          <EmptyNextDisplay key={index} index={index} />
        );
      })}
    </div>
  );
};

export default RightPanel;