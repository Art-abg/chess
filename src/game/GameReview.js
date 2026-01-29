
import { Chess } from 'chess.js';

// Heuristic accuracy calculation based on Centipawn Loss (CPL)
function calculateAccuracy(cpl) {
    if (cpl < 0) cpl = 0;
    return Math.max(0, 100 * Math.exp(-0.003 * cpl));
}

function classifyMove(diff, isBest, beforeEval) {
    // Diff is the loss for the player who just moved
    if (isBest) {
        // Brilliant: If it's best AND it was a tough position or a sacrifice
        // (Simplification: if it was the only move that didn't lose evaluation significantly)
        return 'best';
    }
    
    if (diff <= 20) return 'excellent';
    if (diff <= 50) return 'good';
    if (diff <= 150) return 'inaccuracy';
    if (diff <= 300) return 'mistake';
    return 'blunder';
}

export async function generateGameReport(history, playerColor = 'w') {
    return new Promise((resolve) => {
        const worker = new Worker('/engine/worker.js', { type: 'classic' });
        const report = {
            accuracy: 0,
            moveStats: {
                brilliant: 0,
                best: 0,
                excellent: 0,
                good: 0,
                inaccuracy: 0,
                mistake: 0,
                blunder: 0,
                book: 0
            },
            moves: []
        };
        
        let moveIndex = 0;
        let cumulativeAccuracy = 0;
        let countedMoves = 0;
        const tempGame = new Chess();
        
        let state = 'WAITING_BEFORE'; // 'WAITING_BEFORE' or 'WAITING_AFTER'
        let currentBeforeEval = 0;
        let currentBestMove = '';

        const processNextMove = () => {
            if (moveIndex >= history.length) {
                report.accuracy = countedMoves > 0 ? (cumulativeAccuracy / countedMoves) : 100;
                worker.terminate();
                resolve(report);
                return;
            }
            
            state = 'WAITING_BEFORE';
            worker.postMessage({ 
                type: 'ANALYZE', 
                fen: tempGame.fen(), 
                depth: 10 
            });
        };

        worker.onmessage = (e) => {
            if (e.data.type === 'ANALYSIS_RESULT') {
                 if (!e.data.bestMove && e.data.depth < 10) return; 

                 if (state === 'WAITING_BEFORE') {
                     currentBeforeEval = e.data.eval;
                     currentBestMove = e.data.bestMove;
                     
                     // Now apply the move and get eval after
                     const move = history[moveIndex];
                     try {
                         const moveObj = {
                             from: move.from,
                             to: move.to,
                             promotion: move.promotion || 'q'
                         };
                         tempGame.move(moveObj);
                     } catch (err) {
                         console.error("Review Error:", err);
                         worker.terminate();
                         resolve(report);
                         return;
                     }
                     
                     state = 'WAITING_AFTER';
                     worker.postMessage({ 
                         type: 'ANALYZE', 
                         fen: tempGame.fen(), 
                         depth: 10 
                     });
                 } else if (state === 'WAITING_AFTER') {
                     const currentAfterEval = e.data.eval;
                     const playedMove = history[moveIndex];
                     const playedMoveUci = playedMove.from + playedMove.to + (playedMove.promotion || '');
                     
                     const isBest = currentBestMove === playedMoveUci;
                     
                     // Calculate CP loss
                     // If white moved, loss = before - after
                     // If black moved, loss = after - before (worker returns normalized score w.r.t current turn)
                     // Actually worker.js normalizeScore returns: currentActiveColor === 'w' ? score : -score;
                     // So result.eval is always relative to White.
                     
                     const diff = playedMove.color === 'w' 
                        ? (currentBeforeEval - currentAfterEval) 
                        : (currentAfterEval - currentBeforeEval);
                     
                     const classification = classifyMove(diff, isBest, currentBeforeEval);
                     const acc = calculateAccuracy(Math.max(0, diff));

                     if (playedMove.color === playerColor) {
                        if (report.moveStats[classification] !== undefined) {
                            report.moveStats[classification]++;
                        }
                        cumulativeAccuracy += acc;
                        countedMoves++;
                     }

                     report.moves.push({
                         move: playedMove.san,
                         from: playedMove.from,
                         to: playedMove.to,
                         classification,
                         score: currentAfterEval,
                         acc
                     });
                     
                     moveIndex++;
                     processNextMove();
                 }
            }
        };

        processNextMove();
    });
}
