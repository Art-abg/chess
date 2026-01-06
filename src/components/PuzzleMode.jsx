import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from './ChessBoard';
import puzzles from '../data/puzzles.json';

export default function PuzzleMode({ onBack }) {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState('Solve the puzzle!');
  const [moveIndex, setMoveIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [lastMove, setLastMove] = useState(null);

  const puzzle = puzzles[currentPuzzleIndex];

  useEffect(() => {
    const newGame = new Chess(puzzle.fen);
    setGame(newGame);
    setStatus(`Puzzle: ${puzzle.title}. ${newGame.turn() === 'w' ? 'White' : 'Black'} to move.`);
    setMoveIndex(0);
    setIsCompleted(false);
    setShowHint(false);
    setLastMove(null);
  }, [currentPuzzleIndex]);

  const handleMove = useCallback((move) => {
    if (isCompleted) return;

    const expectedMove = puzzle.solution[moveIndex];
    const moveCopy = { ...move };
    
    // Check if move matches solution (simple comparison of SAN or from/to)
    // We'll use a copy to test the move
    const testGame = new Chess(game.fen());
    const result = testGame.move(moveCopy);
    
    if (!result) return;

    if (result.san === expectedMove || `${result.from}${result.to}` === expectedMove) {
      // Correct move
      game.move(moveCopy);
      setGame(new Chess(game.fen()));
      setLastMove(result);
      
      const nextMoveIndex = moveIndex + 1;
      if (nextMoveIndex >= puzzle.solution.length) {
        setStatus('Correct! Puzzle Solved.');
        setIsCompleted(true);
      } else {
        setMoveIndex(nextMoveIndex);
        setStatus('Correct! Keep going...');
        // If there's an opponent response expected in the puzzle data, we should play it here.
        // But for now, our puzzles are "White/Black to move and win" sequences.
      }
    } else {
      // Wrong move
      setStatus('Wrong move! Try again.');
      setTimeout(() => {
        setStatus(`Puzzle: ${puzzle.title}. Find the best move.`);
      }, 2000);
    }
  }, [game, moveIndex, puzzle, isCompleted]);

  const nextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      setCurrentPuzzleIndex(0); // Loop back for now
    }
  };

  const getHint = () => {
    setShowHint(true);
    setStatus(`Hint: The move starts with ${puzzle.solution[moveIndex].substring(0, 2)}`);
  };

  return (
    <div className="puzzle-mode">
      <div className="puzzle-header">
        <button className="back-btn" onClick={onBack}>← Training Center</button>
        <div className="puzzle-info">
            <h3>{puzzle.title}</h3>
            <span className={`difficulty ${puzzle.difficulty.toLowerCase()}`}>{puzzle.difficulty} • {puzzle.rating}</span>
        </div>
      </div>

      <div className="puzzle-layout">
        <div className="board-section">
          <ChessBoard 
            game={game} 
            onMove={handleMove} 
            disabled={isCompleted}
            lastMove={lastMove}
          />
        </div>

        <div className="puzzle-sidebar">
          <div className="puzzle-status">
            <h4 className={isCompleted ? 'success' : ''}>{status}</h4>
            <p className="description">{puzzle.description}</p>
          </div>

          <div className="puzzle-stats">
             <div className="stat">
               <label>Theme</label>
               <span>{puzzle.theme}</span>
             </div>
             <div className="stat">
               <label>Progress</label>
               <span>{moveIndex} / {puzzle.solution.length} moves</span>
             </div>
          </div>

          <div className="puzzle-controls">
            {!isCompleted ? (
              <button onClick={getHint} className="secondary" disabled={showHint}>
                💡 Need a Hint?
              </button>
            ) : (
              <button onClick={nextPuzzle} className="primary">
                Next Puzzle →
              </button>
            )}
            <button onClick={() => setCurrentPuzzleIndex(currentPuzzleIndex)} className="secondary">
              ↺ Reset Puzzle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
