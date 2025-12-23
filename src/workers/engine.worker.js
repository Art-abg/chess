import { Chess } from 'chess.js';

// --- Reusing the Evaluation Logic (Copied to Worker) ---
// In a larger app, we might share this code via a common module, but for Vite + Worker simplicity, we inline/import.
// Since we can't easily import standard JS modules into a worker without type="module" complications in some setups,
// I'll replicate the pure logic helper functions here to be safe and self-contained.

const pst = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

const mirrorPst = (table) => [...table].reverse();

const evaluateBoard = (game) => {
  let totalEvaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        // Use copy of PST to prevent mutation issues if any
        let table = pst[piece.type];
        const pstValue = piece.color === 'w' ? table[i][j] : table[7-i][j]; // Simple mirror logic or use helper
        
        if (piece.color === 'w') {
          totalEvaluation += (value + pstValue);
        } else {
          totalEvaluation -= (value + pstValue);
        }
      }
    }
  }
  return totalEvaluation;
};

// --- Search ---

const minimax = (game, depth, alpha, beta, isMaximizingPlayer) => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves();

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

const getBestMove = (fen, depth = 3) => {
  const game = new Chess(fen);
  // Re-seed randomness every time? No need for pure calc, but for gameplay variety:
  const moves = game.moves();
  if (moves.length === 0) return { move: null, eval: 0 };

  let bestMove = null;
  let bestValue = game.turn() === 'w' ? -Infinity : Infinity;

  // Shuffle for variety
  moves.sort(() => Math.random() - 0.5);

  for (const move of moves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, game.turn() === 'w');
    game.undo();

    if (game.turn() === 'w') {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }
  
  return { move: bestMove || moves[0], eval: bestValue };
};

// --- Worker Message Handler ---
self.onmessage = (e) => {
  const { type, fen, depth, id } = e.data;

  if (type === 'CALCULATE_MOVE') {
    const start = performance.now();
    const result = getBestMove(fen, depth);
    const end = performance.now();
    
    self.postMessage({
      type: 'MOVE_RESULT',
      id,
      move: result.move,
      eval: result.eval,
      time: end - start
    });
  } else if (type === 'ANALYZE') {
    // Just evaluate the current position
    const game = new Chess(fen);
    const score = evaluateBoard(game);
    self.postMessage({
      type: 'ANALYSIS_RESULT',
      eval: score
    });
  } else if (type === 'ANALYZE_MOVE') {
    // 1. Calculate best move from the PREVIOUS position (before user moved)
    // We need to know what the 'best' possible score was.
    const prevGame = new Chess(fen); // 'fen' is the position BEFORE the move
    const bestMoveResult = getBestMove(fen, 3); // Depth 3 for quick feedback
    const bestEval = bestMoveResult.eval;

    // 2. Calculate the score of the USER'S move
    // We simulate the user's move, then find the evaluation from that new position.
    // Note: evaluateBoard returns score from perspective of side to move.
    // getBestMove returns score from perspective of the side whose turn it is in 'fen'.
    
    // Let's create the board AFTER the user's move
    const userGame = new Chess(fen);
    try {
      userGame.move(e.data.move);
      
      // key: The evaluation of the resulting board is usually from the next player's perspective if we use a simple static eval or search.
      // But we want to know the score for the player who JUST moved.
      
      // Let's use minimax to evaluate the new position (depth 2 is enough for quick check)
      // minimax returns value for the current turn player.
      // After user moves, it's opponent's turn. 
      // So minimax will return a value that is GOOD for opponent (maximized for them).
      // We want to minimize that / inverse it.
      
      const responseScore = minimax(userGame, 2, -Infinity, Infinity, userGame.turn() === 'w');
      
      // If it was White's turn to move (user is White), then 'responseScore' is Black's advantage.
      // So the value for White is logic dependent.
      
      // current turn in 'fen' was user's turn.
      const userTurn = prevGame.turn();
      
      // If user is White:
      // bestEval is high positive (good for white).
      // responseScore is from Black's perspective?
      // minimax implementation returns "maxEval" if maximizing player.
      
      // Let's look at minimax implementation:
      // evaluateBoard returns: + for White, - for Black.
      // minimax returns the board evaluation from the perspective of the Maximizing/Minimizing logic internally,
      // but it returns the raw evaluateBoard score which is absolute (+White, -Black).
      // EXCEPT: getBestMove logic:
      // if (game.turn() === 'w') bestValue = -Infinity, search for max.
      // So 'bestEval' is always absolute score (+White, -Black).
      
      // So 'responseScore' (minimax output) is also absolute score.
      // So we can directly compare bestEval and responseScore (which is the user's move eval).
      
      const userMoveEval = responseScore;
      
      const diff = Math.abs(bestEval - userMoveEval);
      
      // Provide feedback
      // This is a simplified "Classification".
      // We need to know if it's "Winning for us" or "Losing".
      // But diff is enough. If I could have got +500 but got +100, that's a mistake.
      
      let classification = 'Good';
      // Scores are roughly centipawns but our static eval is high numbers (100 = pawn).
      // Pawn = 100.
      
      // Note: Our engine is weak, so "best" might not be truly best, but relative to engine.
      
      // If user move is significantly worse than best move for that user:
      // If user is White, bestEval=500, userMoveEval=100 -> Diff = 400 (Bad).
      // If user is Black, bestEval=-500, userMoveEval=-100 -> Diff = 400 (Bad: Black wanted -500).
      
      let evalDiff = 0;
       if (userTurn === 'w') {
         evalDiff = bestEval - userMoveEval; // Positive means we lost advantage
       } else {
         evalDiff = userMoveEval - bestEval; // If best was -500 and we got -100, -100 - (-500) = 400 (lost advantage)
       }

       if (evalDiff < 25) classification = 'Best';
       else if (evalDiff < 60) classification = 'Excellent';
       else if (evalDiff < 120) classification = 'Good';
       else if (evalDiff < 250) classification = 'Inaccuracy';
       else if (evalDiff < 500) classification = 'Mistake';
       else classification = 'Blunder';

      self.postMessage({
        type: 'MOVE_ANALYSIS',
        classification,
        diff: evalDiff,
        bestEval,
        userEval: userMoveEval
      });

    } catch (err) {
      // Invalid move or error
    }
  }
};
