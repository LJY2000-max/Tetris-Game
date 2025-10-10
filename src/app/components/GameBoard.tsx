// src/components/GameBoard.tsx

import React from 'react';
import { GameState, COLORS, TetrominoType } from '..//types/tetris';
import { getGhostPiece } from '..//utils/tetris';

interface GameBoardProps {
  gameState: GameState;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  const { board, currentPiece } = gameState;

  // Create display board with current piece and ghost piece
  const displayBoard = board.map(row => [...row]);
  
  // Add ghost piece
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
            displayBoard[boardY][boardX] = 'ghost' as any;
          }
        }
      });
    });
  }

  // Add current piece
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

  return (
    <div className="game-board bg-gray-900 p-2 rounded-lg shadow-2xl">
      <div className="grid grid-cols-10 gap-[1px] bg-gray-700 p-1">
        {displayBoard.map((row, y) => (
          row.map((cell, x) => {
            const isGhost = cell === 'ghost';
            const cellClass = isGhost 
              ? 'bg-gray-700 opacity-30 border border-gray-500'
              : cell 
                ? `${COLORS[cell as TetrominoType]} border border-gray-800`
                : 'bg-gray-800 border border-gray-700';
            
            return (
              <div
                key={`${y}-${x}`}
                className={`aspect-square ${cellClass} transition-all duration-100`}
                data-testid={`cell-${y}-${x}`}
              />
            );
          })
        ))}
      </div>
    </div>
  );
};

export default GameBoard;