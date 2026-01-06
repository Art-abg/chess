import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { getBotById } from '../game/Bots';

export default function useChessGame() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentBotId, setCurrentBotId] = useState('martin');
  const [currentEval, setCurrentEval] = useState(0); // Centipawns
  const [currentBestMove, setCurrentBestMove] = useState(null);
  const [hint, setHint] = useState(null);
  const [lastMoveAnalysis, setLastMoveAnalysis] = useState(null);
  
  // Settings
  const [showAnalysis, setShowAnalysis] = useState(true);

  const botWorker = useRef(null);
  const analysisWorker = useRef(null);
  const prevGameState = useRef({ eval: 0, bestMove: null });

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

  // Initialize Workers
  useEffect(() => {
    // Worker 1: Bot Opponent
    botWorker.current = new Worker('/engine/worker.js', { type: 'classic' });
    
    botWorker.current.onmessage = (e) => {
      const { type, move } = e.data;
      
      if (type === 'MOVE_RESULT') {
        if (move) {
          setGame(g => {
            const newGame = new Chess(g.fen());
            
            // Snapshot state before AI move
            prevGameState.current = { eval: currentEval, bestMove: currentBestMove };

            try { 
              if (newGame.move(move)) {
                setFen(newGame.fen());
                updateStatus(newGame);
                
                // Trigger Analysis for the new position (on the separate worker)
                analysisWorker.current.postMessage({ type: 'ANALYZE', fen: newGame.fen() });
              }
            } catch(e) { console.error('Invalid AI move', move); }
            return newGame;
          });
        }
        setIsAiThinking(false);
      }
    };

    // Worker 2: Analysis Engine (Diamond Feature: Continuous Analysis)
    analysisWorker.current = new Worker('/engine/worker.js', { type: 'classic' });
    
    analysisWorker.current.onmessage = (e) => {
        const { type, eval: score, bestMove } = e.data;

        if (type === 'ANALYSIS_RESULT') {
            setCurrentEval(score);
            if (bestMove) setCurrentBestMove(bestMove);
    
            // Classify the LAST move played (if settings on)
            if (showAnalysis) {
                 setGame(currentG => {
                     const history = currentG.history({ verbose: true });
                     if (history.length > 0) {
                         const lastMove = history[history.length - 1];
                         
                         // We need the eval BEFORE this move to look for blunders.
                         // stored in prevGameState.current.eval
                         
                         import('../game/MoveClassifier').then(({ classifyMove, getClassStyle }) => {
                             import('../game/MoveExplainer').then(({ explainMove }) => {
                                 const classification = classifyMove(
                                     prevGameState.current.eval,
                                     score, // current eval (Position B)
                                     lastMove,
                                     prevGameState.current.bestMove,
                                     currentG.isCheckmate()
                                 );
                                 
                                 const explanation = explainMove(classification, lastMove, currentG.isCheck());
                                 const style = getClassStyle(classification);
                                 
                                 setLastMoveAnalysis({
                                     classification,
                                     explanation,
                                     style,
                                     moveSan: lastMove.san
                                 });
                             });
                         });
                     }
                     return currentG;
                 });
            }
        }
    };

    return () => {
        botWorker.current.terminate();
        analysisWorker.current.terminate();
    };
  }, [updateStatus, currentEval, currentBestMove, showAnalysis]);

  const makeMove = useCallback((move) => {
    try {
      // Snapshot state before Player move
      prevGameState.current = { eval: currentEval, bestMove: currentBestMove };

      const result = game.move(move);
      if (result) {
        setFen(game.fen());
        updateStatus(game);
        setHint(null);
        
        // Trigger Analysis for the new position
        if (analysisWorker.current) {
            analysisWorker.current.postMessage({ type: 'ANALYZE', fen: game.fen() });
        }
        
        // Reset analysis until new result comes
        // setLastMoveAnalysis(null); // Optional: keep old until new arrives? Better to clear to show "analyzing..."

        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game, updateStatus, currentEval, currentBestMove]);

  const makeAiMove = useCallback(() => {
    if (game.isGameOver()) return;
    setIsAiThinking(true);
    
    const bot = getBotById(currentBotId);
    
    if (botWorker.current) {
        // Configure Bot Strength
        botWorker.current.postMessage({ type: 'UCI_CMD', cmd: `setoption name Skill Level value ${bot.skillLevel || 20}` });
        botWorker.current.postMessage({ type: 'UCI_CMD', cmd: `setoption name UCI_LimitStrength value ${bot.skillLevel < 20 ? 'true' : 'false'}` });
        botWorker.current.postMessage({ type: 'UCI_CMD', cmd: `setoption name UCI_Elo value ${bot.elo || 3000}` });
    
        botWorker.current.postMessage({
          type: 'CALCULATE_MOVE',
          fen: game.fen(),
          depth: bot.depth,
          id: Date.now()
        });
    }

  }, [game, currentBotId]);

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setHistory([]);
    setStatus('New Game');
    setCurrentEval(0);
    setCurrentBestMove(null);
    prevGameState.current = { eval: 0, bestMove: null };
    setHint(null);
    setLastMoveAnalysis(null);
  };

  const undo = () => {
    // If empty history, nothing to undo
    if (game.history().length === 0) return;

    // If AI is thinking, just cancel? Or wait? 
    // Ideally we shouldn't allow undo while AI triggers, but if we do, we need to stop worker.
    
    // Logic:
    // If it's Player's turn (White), it means Black (AI) just moved. We need to undo 2 moves (Black + White) to get back to Player's turn.
    // If it's Black's turn (game.turn() === 'b'), it means Player just moved and AI hasn't moved yet. Undo 1 move.
    
    const turn = game.turn();
    
    // Undo 1 move (Player's move or AI's move)
    game.undo();
    
    // If we are now on Black's turn (meaning we undid AI's move and now it's Black's turn again?), 
    // wait...
    // Standard flow:
    // Start (White) -> Player Move -> Black Turn -> AI Move -> White Turn.
    
    // If we are at White Turn:
    // Undo 1 (removes AI move) -> Black Turn.
    // Undo 2 (removes Player move) -> White Turn.
    
    // So if current turn is White, we likely want to go back to White.
    if (turn === 'w') {
        game.undo(); // Undo the second one (Player's move)
    }
    
    setFen(game.fen());
    updateStatus(game);
    setHistory(game.history({ verbose: true }));
    
    // Reset Analysis/Hints
    setHint(null);
    setLastMoveAnalysis(null);
    setCurrentBestMove(null);
    
    // Stop any thinking
    setIsAiThinking(false);
    
    // Re-analyze new position
    if (analysisWorker.current) {
        analysisWorker.current.postMessage({ type: 'ANALYZE', fen: game.fen() });
    }
  };

  const requestHint = () => {
    // If we have a best move from analysis, use it!
    if (currentBestMove) {
        // Convert 'e2e4' to 'e4' (destination)
        // Actually formatted as 'e2e4' usually.
        // bestMove is usually long algebraic.
        // hint expects 'e4' or 'to' square?
        // view_file earlier said: setHint(capture ? capture.to : moves[0].to);
        
        // currentBestMove is algebraic source+dest (e.g. e2e4).
        const toSquare = currentBestMove.substring(2, 4);
        setHint(toSquare);
    } else {
        const moves = game.moves({ verbose: true });
        const capture = moves.find(m => m.flags.includes('c'));
        setHint(capture ? capture.to : moves[0].to);
    }
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
    hint,
    lastMoveAnalysis,
    setShowAnalysis, // Expose toggle
    showAnalysis
  };
}
