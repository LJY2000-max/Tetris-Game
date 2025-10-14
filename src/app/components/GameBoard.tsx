// src/components/GameBoard.tsx

import React from 'react';
import { GameState, COLORS, TetrominoType, VISIBLE_HEIGHT } from '../types/tetris';
import { getGhostPiece } from '../utils/tetris';

/**
 * GameBoard組件的屬性介面
 */
interface GameBoardProps {
  gameState: GameState;
  timeRemaining: number;
}

/**
 * 時間顯示組件
 */
const TimeDisplay: React.FC<{ timeRemaining: number }> = ({ timeRemaining }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const timeColorClass = timeRemaining <= 30 ? 'text-red-400' : 'text-cyan-400';
  
  return (
    <div className="time-display text-center mb-4">
      <h1 className={`text-6xl font-bold ${timeColorClass} tracking-wider`}>
        {formattedTime}
      </h1>
      {/*
      {timeRemaining <= 30 && timeRemaining > 0 && (
        <p className="text-red-300 mt-2 text-lg font-semibold animate-pulse">
          ⚠ Time running out!
        </p>
      )}
      */}
    </div>
  );
};

/**
 * 遊戲板組件
 */
const GameBoard: React.FC<GameBoardProps> = ({ gameState, timeRemaining }) => {
  const { board, currentPiece } = gameState;

  // 建立顯示用的遊戲板副本
  const displayBoard = board.map(row => [...row]);
  
  // 添加幽靈方塊
  if (currentPiece) {
    const ghostPiece = getGhostPiece(board, currentPiece);
    
    ghostPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = ghostPiece.position.y + y;
          const boardX = ghostPiece.position.x + x;
          if (
            boardY >= 0 && 
            boardY < displayBoard.length && 
            boardX >= 0 && 
            boardX < displayBoard[0].length &&
            !displayBoard[boardY][boardX]
          ) {
            displayBoard[boardY][boardX] = 'ghost' as TetrominoType;
          }
        }
      });
    });
  }

  // 添加當前方塊
  if (currentPiece) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;
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

  // 只顯示從第 1 行開始的 20 行（隱藏第 0 行的隱藏層）
  const visibleBoard = displayBoard.slice(1, 1 + VISIBLE_HEIGHT);

  return (
    <div className="game-board-container">
      {/* 時間顯示在遊戲板上方 */}
      <TimeDisplay timeRemaining={timeRemaining} />
      
      {/* 遊戲板 */}
      <div className="game-board bg-gray-900 p-2 rounded-lg shadow-2xl">
        <div className="grid grid-cols-10 gap-[2px] bg-gray-700 p-1">
          {visibleBoard.map((row, y) => (
            row.map((cell, x) => {
              const isGhost = (cell as string) === 'ghost';
              
              const cellClass = isGhost 
                ? 'bg-gray-700 opacity-30 border border-gray-500'
                : cell 
                  ? `${COLORS[cell as TetrominoType]} border border-gray-800`
                  : 'bg-gray-800 border border-gray-700';
              
              return (
                <div
                  key={`${y}-${x}`}
                  className={`w-8 h-8 ${cellClass} transition-all duration-100 rounded-sm`}
                />
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;