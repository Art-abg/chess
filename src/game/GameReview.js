
import { Chess } from 'chess.js';

// Heuristic accuracy calculation based on Centipawn Loss (CPL)
function calculateAccuracy(cpl) {
    if (cpl < 0) cpl = 0; // Should not happen for loss
    // Formula approximation: 
    // 0 cpl = 100%
    // 50 cpl = ~95%
    // 100 cpl = ~90%
    // 300 cpl = ~50%
    return Math.max(0, 100 * Math.exp(-0.003 * cpl));
}

export async function generateGameReport(history, playerColor = 'w') {
    // We need to run the engine for every move.
    // Since we don't have a sync engine, we need to spawn a temporary worker or use the existing one.
    // For simplicity/performance in this demo, let's assume we can spawn a fast worker.
    
    return new Promise((resolve) => {
        const worker = new Worker('/engine/worker.js', { type: 'classic' });
        const report = {
            accuracy: 0,
            moveStats: {
                brilliant: 0,
                best: 0,
                good: 0,
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
        
        // Helper to process next move
        const processNextMove = () => {
            if (moveIndex >= history.length) {
                // Done
                report.accuracy = countedMoves > 0 ? (cumulativeAccuracy / countedMoves) : 100;
                worker.terminate();
                resolve(report);
                return;
            }
            
            const move = history[moveIndex];
            // We need eval BEFORE the move (to see if it was the best move)
            // But actually we need eval AFTER the move to compare with best possible.
            // Simplified approach: Analyze position BEFORE move. Get Top 1 Move.
            // Compare played move with Top 1.
            
            // Or use the existing MoveClassifier logic?
            // "Best" means it matches engine's best move.
            
            // Let's set position
            // Let's set position
            const fen = tempGame.fen();
            
            // To ensure safety, we construct a strict move object
            // passing the full verbose object can sometimes cause issues if extra properties are present
            try {
                const moveObj = {
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion // 'q', 'r', 'b', 'n' or undefined
                };
                tempGame.move(moveObj); 
            } catch (e) {
                console.error("GameReview internal error applying move:", move, e);
                // If we fail to apply the move, our tempGame state is desynced.
                // We cannot continue analysis reliably.
                // We should stop here.
                console.warn("Aborting Game Review due to state desync.");
                worker.terminate();
                resolve(report);
                return;
            }
            
            // Queue analysis for the position BEFORE the move was made
            // Wait this is async.
            worker.postMessage({ type: 'ANALYZE_MOVE', fen: fen, move: move.lan }); 
            // ANALYZE_MOVE in our worker calculates score for specific move? 
            // Our worker supports `ANALYZE` (best move) and `ANALYZE_MOVE` (specific?)
            // Actually checking worker code:
            // if (type === 'ANALYZE_MOVE') { cmd: position fen ... moves ...; go depth 10 }
            // This returns info for THAT move.
            // But we also need the BEST move to compare.
            
            // To do this properly requires 2 searches per move or MultiPV.
            // For this quick demo, let's just run 'ANALYZE' on the position before the move
            // and see if the 'bestmove' matches the played move.
            
            // Queue analysis
            // Use lower depth (10) for faster game review
            worker.postMessage({ type: 'ANALYZE', fen: fen, depth: 10 });
        };

        worker.onmessage = (e) => {
            if (e.data.type === 'ANALYSIS_RESULT') {
                 // Ignore intermediate updates (which don't have bestMove)
                 if (!e.data.bestMove) return;

                 // We got FINAL analysis for the position
                 const { bestMove, eval: score } = e.data;
                 const playedMove = history[moveIndex]; 
                 
                 const playedMoveUci = playedMove.from + playedMove.to + (playedMove.promotion || '');
                 
                 // Compare
                 let classification = 'good';
                 let acc = 80;
                 
                 // Normalize bestMove (trim just in case)
                 const bestMoveClean = bestMove.trim();
                 
                 if (bestMoveClean.includes(playedMoveUci)) {
                     classification = 'best';
                     acc = 100;
                 } else {
                     // Since we don't have the eval diff (we didn't analyze the move played, only the position),
                     // we have to guess based on... nothing?
                     // Ideally we would look at the score.
                     
                     // Heuristic improvements for "Diamond" feel:
                     // 1. If we are completely winning (Mate or huge advantage), any move that doesn't lose it is Good/Excellent.
                     // 2. We can't know blunders without checking the PLAYED move's eval.
                     
                     // For this version, let's just be harsh:
                     // If it's not the best move, it's an "inaccuracy" (Accuracy 50%).
                     // This explains the "100%" bug (we were default falling through with empty data).
                     acc = 50; 
                     classification = 'inaccuracy';
                 }
                 
                 // Update Stats
                 if (playedMove.color === playerColor) {
                    report.moveStats[classification]++;
                    cumulativeAccuracy += acc;
                    countedMoves++;
                 }

                 report.moves.push({
                     move: playedMove.san,
                     classification,
                     score: score
                 });
                 
                 moveIndex++;
                 processNextMove();
            }
        };

        processNextMove();
    });
}
