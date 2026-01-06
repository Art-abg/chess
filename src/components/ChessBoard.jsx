import React, { useState } from 'react';
import Piece from './Piece';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard(props) {
  const { game, onMove, disabled, lastMove, hint, lastMoveAnalysis } = props;
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  // Helper to get square color
  const isDark = (fileIndex, rankIndex) => (fileIndex + rankIndex) % 2 !== 0;

  const handleSquareClick = (square) => {
    if (disabled) return;

    // If we have a selected square, try to move
    if (selectedSquare) {
      if (square === selectedSquare) {
        // Deselect if clicking same square
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Check if clicked square is a valid move
      const move = possibleMoves.find(m => m.to === square);
      if (move) {
        onMove(move);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
    }

    // Select piece
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      // Get valid moves for this square
      const moves = game.moves({ square, verbose: true });
      setPossibleMoves(moves);
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  return (
    <div className="chess-board">
      {RANKS.map((rank, rankIndex) => (
        <div key={rank} className="rank-row">
          {FILES.map((file, fileIndex) => {
            const square = `${file}${rank}`;
            const piece = game.get(square);
            const isSelected = square === selectedSquare;
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isPossibleMove = possibleMoves.find(m => m.to === square);
            const isCapture = isPossibleMove && piece;
            const isHint = props.hint === square;

            // Check for analysis icon on this square (only if it's the destination of the last move)
            const analysisIcon = (lastMoveAnalysis && lastMoveAnalysis.moveSan === props.lastMove?.san && props.lastMove?.to === square) 
                                ? lastMoveAnalysis.style 
                                : null;

            return (
              <div
                key={square}
                className={`square ${isDark(fileIndex, rankIndex) ? 'dark' : 'light'} 
                  ${isSelected ? 'selected' : ''} 
                  ${isLastMove ? 'highlight' : ''}
                  ${isHint ? 'hint-highlight' : ''}`}
                onClick={() => handleSquareClick(square)}
              >
                {/* Rank/File Labels (Chess.com style) */}
                {fileIndex === 0 && (
                  <span className={`label rank-label ${isDark(fileIndex, rankIndex) ? 'dark-text' : 'light-text'}`}>
                    {rank}
                  </span>
                )}
                {rankIndex === 7 && (
                  <span className={`label file-label ${isDark(fileIndex, rankIndex) ? 'dark-text' : 'light-text'}`}>
                    {file}
                  </span>
                )}

                {/* Move Hint (Dots/Captures) */}
                {isPossibleMove && !isCapture && <div className="hint-dot" />}
                {isCapture && <div className="hint-capture" />}

                {/* Analysis Icon Overlay */}
                {analysisIcon && (
                    <div className="analysis-icon-overlay" style={{ backgroundColor: analysisIcon.color }}>
                        {analysisIcon.icon}
                    </div>
                )}

                {/* Piece */}
                <div className="piece-container">
                  <Piece type={piece?.type} color={piece?.color} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
