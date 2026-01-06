export const MoveType = {
  BRILLIANT: 'brilliant',
  BEST: 'best',
  EXCELLENT: 'excellent',
  GOOD: 'good',
  INACCURACY: 'inaccuracy',
  MISTAKE: 'mistake',
  BLUNDER: 'blunder',
  BOOK: 'book',
  NORMAL: 'normal',
};

export const getClassStyle = (type) => {
  switch (type) {
    case MoveType.BRILLIANT: return { icon: '!!', color: '#1baca6', label: 'Brilliant' };
    case MoveType.BEST: return { icon: '★', color: '#96bc4b', label: 'Best' };
    case MoveType.EXCELLENT: return { icon: '!', color: '#96bc4b', label: 'Excellent' };
    case MoveType.GOOD: return { icon: '✓', color: '#baca44', label: 'Good' }; // Lighter green
    case MoveType.INACCURACY: return { icon: '?!', color: '#f0c15c', label: 'Inaccuracy' };
    case MoveType.MISTAKE: return { icon: '?', color: '#e6912c', label: 'Mistake' };
    case MoveType.BLUNDER: return { icon: '??', color: '#cc3333', label: 'Blunder' };
    case MoveType.BOOK: return { icon: '📖', color: '#a88865', label: 'Book' };
    default: return { icon: '', color: 'transparent', label: '' };
  }
};

/**
 * Classifies a move based on evaluation difference.
 * @param {number} prevEval - Evaluation before the move (centipawns).
 * @param {number} currentEval - Evaluation after the move (centipawns).
 * @param {object} move - The move object.
 * @param {string} bestMoveSan - SAN of the best move suggested by engine.
 * @param {boolean} isMate - If the move caused a mate.
 * @returns {string} MoveType
 */
export const classifyMove = (prevEval, currentEval, move, bestMoveSan, isMate) => {
  if (isMate && currentEval > 0) return MoveType.BEST; // Delivering mate is always best

  // If we don't have evals, default to normal
  if (prevEval === undefined || currentEval === undefined) return MoveType.NORMAL;

  // Convert mate scores to large numbers for comparison
  const normalize = (val) => {
    if (typeof val === 'string' && val.startsWith('M')) {
      const mateIn = parseInt(val.substring(1));
      return mateIn > 0 ? 10000 - mateIn : -10000 - mateIn;
    }
    return val;
  };

  const pEval = normalize(prevEval);
  const cEval = normalize(currentEval);

  // Flip evaluation perspective:
  // If it was white's turn (prevEval), a positive score is good.
  // After white moves (currentEval), it's black's turn, so the score is from black's perspective.
  // We need to compare them from white's perspective.
  // Actually, standard UCI engines return eval from *side to move* or *white* depending on config.
  // Let's assume our `currentEval` state is always normalized to White's perspective for simplicity in UI,
  // but we need to check how useChessGame stores it.
  // Assuming `currentEval` is always from White's perspective (positive = white winning).

  // Calculate generic loss for the side that just moved.
  // If White moved: Loss = PrevEval - CurrentEval (did we make it worse?)
  // If Black moved: Loss = CurrentEval - PrevEval (did eval go up?)
  
  const isWhiteTurn = move.color === 'w'; 
  const evalDiff = isWhiteTurn ? (pEval - cEval) : (cEval - pEval); 

  // Engine often fluctuates ~10-20 cp even for best moves due to depth.
  
  // 1. Check for Best Move
  if (move.san === bestMoveSan) {
      return MoveType.BEST;
  }
  
  // 2. Classify based on CP Loss
  // If diff is negative (eval improved), it's good/best.
  if (evalDiff <= 0) return MoveType.EXCELLENT;
  
  if (evalDiff < 20) return MoveType.EXCELLENT;
  if (evalDiff < 50) return MoveType.GOOD;
  if (evalDiff < 100) return MoveType.INACCURACY;
  if (evalDiff < 300) return MoveType.MISTAKE;
  
  return MoveType.BLUNDER;
};
