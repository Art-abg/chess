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
    if (isCheckmate) {
        // If this move causes checkmate, it's generally best or excellent
        return Classification.BEST;
    }

    // If evaluations are missing (parsing error or start of game), return Book
    if (!prevEval || !currentEval) return Classification.BOOK;

    // WintrChess uses absolute eval (positive for winning side)
    // The `Engine.js` returns centipawns relative to White (positive = white winning) usually, or relative to side to move?
    // Stockfish returns score relative to side to move usually, but my engine worker normalizes it?
    // Let's assume standard Stockfish CP: relative to 'side to move' if untweaked, but `engine.worker.js` has `normalizeScore` that converts to White-relative?
    // Let's check `engine.worker.js`: `return currentActiveColor === 'w' ? score : -score;` 
    // Wait, if it normalized to be ALWAYS relative to white, then +100 means white is winning.
    
    // WintrChess expects `absoluteEvaluation` where positive = "current side is winning".
    // "let absoluteEvaluation = evaluation.value * (moveColour == "white" ? 1 : -1);"
    // So if I have White-relative score, I need to convert it to "Side-to-move-relative".
    
    const moveColor = move.color; // 'w' or 'b'
    
    // Ensure we handle "forced mate" scores (10000/-10000)
    // If prevEval is 10000 (White has mate), and I am White, absolute is positive.
    
    let prevVal = prevEval;
    let currVal = currentEval; // This is the eval AFTER the move, so now it's opponent's turn. 
    // Wait, `currentEval` from worker is for the resulting position.
    // If I lay as White, I make a move. The resulting board has Black to move.
    // Stockfish analyzes this new board. It says "Score for Black is -500" (Black is losing).
    // White-relative score would be +500.
    
    // WintrChess Comparison: 
    // `previousEvaluation`: Eval of position BEFORE move (Side A to move).
    // `evaluation`: Eval of position AFTER move (Side B to move).
    
    // Convert both to be from perspective of the player making the move (Side A).
    // If White moves:
    // PrevEval (White relative) -> +100
    // CurrEval (White relative) -> +90
    // Loss: 10 cp.
    
    // If Black moves:
    // PrevEval (White relative) -> -100 (Black is +100 ahead)
    // CurrEval (White relative) -> -200 (White is winning now? No.)
    // If Black moves and creates a position where White is -200 (Black winning +200).
    // Loss: (-100) - (-200) = +100 (Gain?)
    // Actually eval loss is (Ideal Outcome) - (Actual Outcome).
    
    // WintrChess logic:
    // `evalLoss = Math.min(evalLoss, cutoffEvalLoss, lastLineEvalLoss);`
    // It basically calculates generic drop in *winning probability* or CP.
    
    // Let's simplify:
    // We want the difference in advantage for the player who just moved.
    
    const multiplier = moveColor === 'w' ? 1 : -1;
    const prevAbs = prevVal * multiplier;
    const currAbs = currVal * multiplier;
    
    const evalLoss = prevAbs - currAbs;
    
    // Check for Mate
    const isPrevMate = Math.abs(prevVal) > 9000;
    const isCurrMate = Math.abs(currVal) > 9000;
    
    let classification = Classification.BOOK; 

    // If forced line (only 1 legal move), usually Forced. (We skip this for now or pass `isForced` param)
    
    // === Logic adaptation ===
    
    const noMate = !isPrevMate && !isCurrMate;
    
    // 1. Check if it was the Best Move
    // If `prevBestMove` matches our move?
    // Or if loss is very small.
    // WintrChess uses `topMove` comparison.
    // We'll rely on evalLoss if we don't have perfect line matching.
    
    if (prevBestMove && move.lan === prevBestMove) { // LAN: e2e4
        classification = Classification.BEST;
    } else {
        if (noMate) {
            for (let classif of centipawnClassifications) {
                if (evalLoss <= getEvaluationLossThreshold(classif, prevAbs)) {
                    classification = classif;
                    break;
                }
            }
        }
        else if (!isPrevMate && isCurrMate) {
            // Blundered into a mate
            if (currAbs > 0) classification = Classification.BEST; // You now have mate?
            else if (currAbs >= -2) classification = Classification.BLUNDER; // Mate in 1/2 against you?
            else if (currAbs >= -5) classification = Classification.MISTAKE;
            else classification = Classification.INACCURACY;
        }
        else if (isPrevMate && !isCurrMate) {
             // Lost a forced mate
             if (prevAbs < 0 && currAbs < 0) classification = Classification.BEST; // Still losing
             else if (currAbs >= 400) classification = Classification.GOOD;
             else if (currAbs >= 150) classification = Classification.INACCURACY;
             else if (currAbs >= -100) classification = Classification.MISTAKE;
             else classification = Classification.BLUNDER;
        }
        else if (isPrevMate && isCurrMate) {
            // Mate to Mate
            if (prevAbs > 0) { // We were winning
                if (currAbs <= -4) classification = Classification.MISTAKE; // Now losing mate
                else if (currAbs < 0) classification = Classification.BLUNDER;
                else if (currAbs < prevAbs) classification = Classification.BEST; // Faster mate? Wintr uses relative comparison
                else if (currAbs <= prevAbs + 2) classification = Classification.EXCELLENT;
                else classification = Classification.GOOD;
            } else {
                 if (currAbs === prevAbs) classification = Classification.BEST;
                 else classification = Classification.GOOD;
            }
        }
    }
    
    // Brilliancy Check (Simplified)
    if (classification === Classification.BEST || classification === Classification.GREAT || classification === Classification.EXCELLENT) {
        // Need to check for sacrifices
        // Using `isPieceHanging` logic if possible
        if (currAbs >= 0) { // Must be winning or equal
             // Check if we gave up a piece
             // Use board diffs? Or logic from WintrChess
             // WintrChess Brillancy requires:
             // 1. Move is BEST
             // 2. Not winning anyways (diff < 700?)
             // 3. Sacrifices a piece (piece was hanging/captured, and capture was good?)
             
             // Simplification: Check isPieceHanging on the piece we moved to? 
             // Or rather, did we *leave* a piece hanging?
             // WintrChess iterates all pieces to see if any *other* piece is sacrificed.
             
             // For now, let's treat "Great" moves as finding complex winning lines (high eval diff from 2nd best).
             // Since we only get 1 line from engine.worker currently, we can't compare to 2nd best easily.
        }
    }
    
    // Safety clamp
    if (classification === Classification.BLUNDER && currAbs >= 600) classification = Classification.GOOD;
    
    return classification;
}
