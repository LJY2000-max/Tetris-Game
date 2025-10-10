// src/components/GameInfo.tsx

import React from 'react';
import { GameState, COLORS, TETROMINOS } from '..//types/tetris';

interface GameInfoProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
}

const NextPieceDisplay: React.FC<{ nextPiece: GameState['nextPiece'] }> = ({ nextPiece }) => {
  if (!nextPiece) return null;

  const shape = TETROMINOS[nextPiece.type];
  const maxSize = 4;
  const offsetY = Math.floor((maxSize - shape.length) / 2);
  const offsetX = Math.floor((maxSize - shape[0].length) / 2);

  return (
    <div className="bg-gray-800 p-3 rounded">
      <h3 className="text-white font-semibold mb-2">Next</h3>
      <div className="grid grid-cols-4 gap-[1px]">
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

const GameInfo: React.FC<GameInfoProps> = ({ gameState, onStart, onPause }) => {
  const { score, lines, level, gameOver, isPaused, nextPiece } = gameState;

  return (
    <div className="game-info bg-gray-900 p-4 rounded-lg shadow-2xl space-y-4">
      <div className="score-display bg-gray-800 p-3 rounded">
        <h3 className="text-white font-semibold">Score</h3>
        <p className="text-2xl text-cyan-400 font-bold" data-testid="score">{score}</p>
      </div>

      <div className="lines-display bg-gray-800 p-3 rounded">
        <h3 className="text-white font-semibold">Lines</h3>
        <p className="text-2xl text-green-400 font-bold" data-testid="lines">{lines}</p>
      </div>

      <div className="level-display bg-gray-800 p-3 rounded">
        <h3 className="text-white font-semibold">Level</h3>
        <p className="text-2xl text-yellow-400 font-bold" data-testid="level">{level}</p>
      </div>

      <NextPieceDisplay nextPiece={nextPiece} />

      <div className="controls space-y-2">
        {!gameState.currentPiece || gameOver ? (
          <button
            onClick={onStart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            data-testid="start-button"
          >
            {gameOver ? 'Restart' : 'Start Game'}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
            data-testid="pause-button"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      {gameOver && (
        <div className="game-over-display bg-red-800 p-3 rounded">
          <p className="text-white font-bold text-center">Game Over!</p>
        </div>
      )}

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