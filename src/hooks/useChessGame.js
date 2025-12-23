import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import EngineWorker from '../workers/engine.worker?worker';
import { getBotById } from '../game/Bots';

export default function useChessGame() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentBotId, setCurrentBotId] = useState('martin');
  const [currentEval, setCurrentEval] = useState(0); // Centipawns
  const [hint, setHint] = useState(null);
  const [lastMoveAnalysis, setLastMoveAnalysis] = useState(null);

  const workerRef = useRef(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new EngineWorker();
    
    workerRef.current.onmessage = (e) => {
      const { type, move, eval: score } = e.data;
      
      if (type === 'MOVE_RESULT') {
        if (move) {
          setGame(g => {
            const newGame = new Chess(g.fen());
            try { newGame.move(move); } catch(e) {/* ignore */}
            setFen(newGame.fen());
            updateStatus(newGame);
            
            // Post-move analysis
            workerRef.current.postMessage({ type: 'ANALYZE', fen: newGame.fen() });
            return newGame;
          });
        }
        setIsAiThinking(false);
      } else if (type === 'ANALYSIS_RESULT') {
        setCurrentEval(score);
      } else if (type === 'MOVE_ANALYSIS') {
        setLastMoveAnalysis(e.data);
      }
    };

    return () => workerRef.current.terminate();
  }, []);

  const updateStatus = useCallback((currentGame) => {
    let status = '';
    if (currentGame.isCheckmate()) {
      status = `Checkmate! ${currentGame.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (currentGame.isDraw()) {
      status = 'Draw!';
    } else {
      status = `Turn: ${currentGame.turn() === 'w' ? 'White' : 'Black'}`;
      if (currentGame.isCheck()) status += ' (Check!)';
    }
    setStatus(status);
    setHistory(currentGame.history({ verbose: true }));
  }, []);

  const makeMove = useCallback((move) => {
    try {
      const preMoveFen = game.fen(); // Capture state BEFORE move
      
      // Optimistic update
      const result = game.move(move);
      if (result) {
        setFen(game.fen());
        updateStatus(game);
        setHint(null);
        
        // Trigger Analysis for the move just made
        workerRef.current.postMessage({ 
          type: 'ANALYZE_MOVE', 
          fen: preMoveFen, // Send OLD fen
          move: move 
        });
        setLastMoveAnalysis(null); // Clear previous

        // Trigger Analysis for the new position (eval bar)
        setTimeout(() => {
           workerRef.current.postMessage({ type: 'ANALYZE', fen: game.fen() });
        }, 0);

        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game, updateStatus]);

  const makeAiMove = useCallback(() => {
    if (game.isGameOver()) return;
    setIsAiThinking(true);
    
    const bot = getBotById(currentBotId);
    
    // Simulate "thinking time" based on depth/elo (optional polish)
    // The worker handles the heavy lift, but we want it to feel valid.
    workerRef.current.postMessage({
      type: 'CALCULATE_MOVE',
      fen: game.fen(),
      depth: bot.depth,
      id: Date.now()
    });

  }, [game, currentBotId]);

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setHistory([]);
    setStatus('New Game');
    setCurrentEval(0);
    setHint(null);
  };

  const undo = () => {
    game.undo(); // Undo AI
    game.undo(); // Undo Player
    setFen(game.fen());
    updateStatus(game);
    // Re-analyze
    workerRef.current.postMessage({ type: 'ANALYZE', fen: game.fen() });
  };

  const requestHint = () => {
    // Ask worker for best move at high depth
    // Ideally we'd have a separate message type, but simplified:
    // We can just calculate move but NOT execute it.
    // For now, let's just use a simple heuristic or "cheat" by peeking valid moves
    // Real implementation: We'd ask worker. Current MVP: pick a random good move or center control
    const moves = game.moves({ verbose: true });
    // Simple verification check to capture
    const capture = moves.find(m => m.flags.includes('c'));
    setHint(capture ? capture.to : moves[0].to);
  };

  return {
    game,
    fen,
    status,
    history,
    makeMove,
    makeAiMove,
    resetGame,
    undo,
    isAiThinking,
    currentBotId,
    setCurrentBotId,
    currentEval,
    requestHint,
    requestHint,
    hint,
    lastMoveAnalysis
  };
}
