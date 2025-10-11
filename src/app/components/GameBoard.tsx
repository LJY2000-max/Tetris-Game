// src/components/GameBoard.tsx

import React from 'react';
import { GameState, COLORS, TetrominoType } from '../types/tetris';
import { getGhostPiece } from '../utils/tetris';

/**
 * GameBoard組件的屬性介面
 */
interface GameBoardProps {
  gameState: GameState;  // 從父組件傳入的遊戲狀態
}

/**
 * 遊戲板組件 - 負責渲染20x10的遊戲板
 * 功能：
 * 1. 顯示已固定的方塊
 * 2. 顯示當前下落的方塊
 * 3. 顯示幽靈方塊（預覽落下位置）
 */
const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  const { board, currentPiece } = gameState;

  // 建立顯示用的遊戲板副本
  const displayBoard = board.map(row => [...row]);
  
  // 步驟1：添加幽靈方塊（半透明預覽）
  if (currentPiece) {
    // 計算幽靈方塊位置
    const ghostPiece = getGhostPiece(board, currentPiece);
    
    // 將幽靈方塊繪製到顯示板上
    ghostPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = ghostPiece.position.y + y;
          const boardX = ghostPiece.position.x + x;
          // 確保在邊界內且該位置為空
          if (
            boardY >= 0 && 
            boardY < displayBoard.length && 
            boardX >= 0 && 
            boardX < displayBoard[0].length &&
            !displayBoard[boardY][boardX]  // 只在空格顯示幽靈方塊
          ) {
            displayBoard[boardY][boardX] = 'ghost' as any;  // 特殊標記
          }
        }
      });
    });
  }

  // 步驟2：添加當前下落的方塊（覆蓋幽靈方塊）
  if (currentPiece) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;
          // 確保在邊界內
          if (
            boardY >= 0 && 
            boardY < displayBoard.length && 
            boardX >= 0 && 
            boardX < displayBoard[0].length
          ) {
            displayBoard[boardY][boardX] = currentPiece.type;
          }
        }
      });
    });
  }

  return (
    <div className="game-board bg-gray-900 p-2 rounded-lg shadow-2xl">
      {/* 遊戲板網格容器 */}
      <div className="grid grid-cols-10 gap-[1px] bg-gray-700 p-1">
        {/* 渲染每個格子 */}
        {displayBoard.map((row, y) => (
          row.map((cell, x) => {
            // 判斷是否為幽靈方塊
            const isGhost = cell === 'ghost';
            
            // 根據格子內容決定樣式
            const cellClass = isGhost 
              ? 'bg-gray-700 opacity-30 border border-gray-500'  // 幽靈方塊：半透明
              : cell 
                ? `${COLORS[cell as TetrominoType]} border border-gray-800`  // 實體方塊：對應顏色
                : 'bg-gray-800 border border-gray-700';  // 空格：深灰色
            
            return (
              <div
                key={`${y}-${x}`}
                className={`aspect-square ${cellClass} transition-all duration-100`}
                data-testid={`cell-${y}-${x}`}  // 測試用ID
              />
            );
          })
        ))}
      </div>
    </div>
  );
};

export default GameBoard;