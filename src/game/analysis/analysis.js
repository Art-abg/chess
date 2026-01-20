import { Chess } from "chess.js";
import {
    Classification,
    centipawnClassifications,
    getEvaluationLossThreshold
} from "./classification";
import { isPieceHanging, pieceValues, promotions, getAttackers } from "./board";

// Simplified function to classify a single move based on previous and current evaluation
// Adapted from the loop in `analyse` function in WintrChess
export function classifyMove(prevEval, currentEval, move, prevBestMove, isCheckmate, lastFen, currentFen) {
    if (isCheckmate) return Classification.BEST;

    // We expect evaluations to be white-relative centipawns
    const moveColor = move.color;
    const multiplier = moveColor === 'w' ? 1 : -1;
    
    // Normalize evaluations to be from the perspective of the player who just moved
    const prevAbs = prevEval * multiplier;
    const currAbs = currentEval * multiplier;
    
    // Note: Stockfish evaluations for the resulting position are for the NEXT player.
    // However, our worker normalizes them to be White-relative.
    // So if White moves, currAbs is the new White-relative eval.
    // If Black moves, currAbs is -currEval (Black-relative).
    
    const evalLoss = prevAbs - currAbs;
    
    // Thresholds (simplified and more intuitive)
    const MATE_THRESHOLD = 9000;
    const isPrevMate = Math.abs(prevEval) > MATE_THRESHOLD;
    const isCurrMate = Math.abs(currentEval) > MATE_THRESHOLD;

    // Handle Best Move match
    if (prevBestMove && move.lan === prevBestMove) {
        // If we found the engine's suggested best move, it's BEST.
        return Classification.BEST;
    }

    // Centipawn-based classification (for non-mate positions)
    if (!isPrevMate && !isCurrMate) {
        if (evalLoss <= 0) return Classification.BEST; // Gained advantage
        if (evalLoss <= 10) return Classification.BEST;
        if (evalLoss <= 30) return Classification.EXCELLENT;
        if (evalLoss <= 65) return Classification.GOOD;
        if (evalLoss <= 150) return Classification.INACCURACY;
        if (evalLoss <= 300) return Classification.MISTAKE;
        return Classification.BLUNDER;
    }

    // Mate logic
    if (!isPrevMate && isCurrMate) {
        // Blundered into a mate being possible against you
        if (currAbs < -MATE_THRESHOLD) return Classification.BLUNDER;
        // You actually found a mate!
        if (currAbs > MATE_THRESHOLD) return Classification.BEST;
    }

    if (isPrevMate && !isCurrMate) {
        // Lost a winning mate
        if (prevAbs > MATE_THRESHOLD) {
            if (currAbs >= 500) return Classification.INACCURACY;
            if (currAbs >= 100) return Classification.MISTAKE;
            return Classification.BLUNDER;
        }
        // Escaped a losing mate
        if (prevAbs < -MATE_THRESHOLD) return Classification.BEST;
    }

    if (isPrevMate && isCurrMate) {
        if (prevAbs > MATE_THRESHOLD && currAbs > MATE_THRESHOLD) {
            // Still winning mate, check if it's slower
            // Stockfish's score mate X is X half-moves to mate
            // We use 10000 for simplicity now, so check if it's still positive
            return Classification.BEST;
        }
        if (prevAbs < -MATE_THRESHOLD && currAbs < -MATE_THRESHOLD) return Classification.BEST;
        if (prevAbs > MATE_THRESHOLD && currAbs < -MATE_THRESHOLD) return Classification.BLUNDER;
    }

    return Classification.INACCURACY; // Fallback
}
