import React, { useState } from 'react';
import Piece from './Piece';
import PromotionModal from './PromotionModal';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard(props) {
  const { game, onMove, disabled, lastMove, hint, evaluationMarkers, analysisCache } = props;
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [pendingPromotion, setPendingPromotion] = useState(null);

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
      const moves = possibleMoves.filter(m => m.to === square);
      if (moves.length > 0) {
        // Promotion detection
        const isPromotion = moves.some(m => m.promotion);
        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square, color: game.turn() });
          return;
        }

        onMove(moves[0]);
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
            const isHint = props.hint && (props.hint.from === square || props.hint.to === square);

            // Analysis Icon logic: Look through the last 2 moves in history 
            // to ensure player moves stay visible after an instant bot response.
            let analysisIcon = null;
            if (analysisCache) {
                const history = game.history({ verbose: true });
                if (history.length > 0) {
                    const startIdx = Math.max(0, history.length - 2);
                    for (let i = history.length - 1; i >= startIdx; i--) {
                        const m = history[i];
                        if (m.to === square && analysisCache[i]) {
                            analysisIcon = analysisCache[i];
                            break; 
                        }
                    }
                }
            }

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

                {/* Evaluation Marker (from Real-time Analysis or Game Review) */}
                {(evaluationMarkers && evaluationMarkers[square]) || analysisIcon ? (
                    <div 
                        className={`evaluation-marker ${(evaluationMarkers && evaluationMarkers[square]) ? evaluationMarkers[square].type : (analysisIcon.classificationClass || analysisIcon)}`}
                        title={(evaluationMarkers && evaluationMarkers[square]) ? evaluationMarkers[square].type : (analysisIcon.classificationClass || analysisIcon)}
                    >
                        {getScoreIcon((evaluationMarkers && evaluationMarkers[square]) ? evaluationMarkers[square].type : (analysisIcon.classificationClass || analysisIcon))}
                    </div>
                ) : null}

                {/* Piece */}
                <div className="piece-container">
                  <Piece type={piece?.type} color={piece?.color} />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {pendingPromotion && (
        <PromotionModal 
          color={pendingPromotion.color} 
          onSelect={(piece) => {
            onMove({ 
              from: pendingPromotion.from, 
              to: pendingPromotion.to, 
              promotion: piece 
            });
            setPendingPromotion(null);
            setSelectedSquare(null);
            setPossibleMoves([]);
          }} 
        />
      )}
    </div>
  );
}


function getScoreIcon(type) {
    switch (type) {
        case 'brilliant': return '!!';
        case 'best': return '★';
        case 'excellent': return '✓';
        case 'good': return '✓';
        case 'inaccuracy': return '?!';
        case 'mistake': return '?';
        case 'blunder': return '??';
        default: return '';
    }
}
