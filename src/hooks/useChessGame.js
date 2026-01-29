import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { getBotById } from '../game/Bots';
import { classifyMove } from '../game/analysis/analysis';
// Class names match the Classification enum values effectively, so we can use them directly.
import {
    Classification,
    getClassificationStyle,
    classificationValues
} from "../game/analysis/classification";
import useSound from './useSound';
import { detectOpening } from '../game/openings';

export const BOARD_THEMES = {
  green: {
    name: 'Green (Classic)',
    light: '#ebecd0',
    dark: '#779556'
  },
  blue: {
    name: 'Blue',
    light: '#dee3e6',
    dark: '#8ca2ad'
  },
  wood: {
    name: 'Wood',
    light: '#f0d9b5',
    dark: '#b58863'
  },
  metal: {
    name: 'Metal',
    light: '#d1d1d1',
    dark: '#7a7a7a'
  },
  purple: {
    name: 'Purple',
    light: '#efefef',
    dark: '#8877b7'
  },
  neon: {
    name: 'Neon',
    light: '#1a1a1a',
    dark: '#00ff41'
  },
  ocean: {
    name: 'Ocean',
    light: '#e0f7fa',
    dark: '#006064'
  }
};

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
  const [viewIndex, setViewIndex] = useState(-1); // -1 means live (end of history)
  const [boardTheme, setBoardTheme] = useState('green');
  const [analysisCache, setAnalysisCache] = useState({}); // Key: moveIndex, Value: { classification, explanation, style, eval, depth }
  const [isAnalyzingHint, setIsAnalyzingHint] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [accuracy, setAccuracy] = useState({ white: 0, black: 0 });
  const [moveStats, setMoveStats] = useState({
      white: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, blunder: 0, forced: 0 },
      black: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, blunder: 0, forced: 0 }
  });
  const [currentOpening, setCurrentOpening] = useState(null);
  const [botChat, setBotChat] = useState('');
  
  // Sounds
  const { playMove, playCapture, playCheck, playGameEnd } = useSound();
  
  // Settings
  const [showAnalysis, setShowAnalysis] = useState(true);

  const botWorker = useRef(null);
  const analysisWorker = useRef(null);
  const prevGameState = useRef({ eval: 0, bestMove: null });
  const analysisCacheRef = useRef({});

  // Stable refs for worker callbacks
  const gameRef = useRef(game);
  const showAnalysisRef = useRef(showAnalysis);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const processAnalysisUpdate = useCallback((score, depth, moveIndex, bestMove) => {
    if (!showAnalysisRef.current) return;
    
    const movesHistory = gameRef.current.history({ verbose: true });
    if (moveIndex === undefined || moveIndex < 0 || moveIndex >= movesHistory.length) return;

    const lastMove = movesHistory[moveIndex];
    
    // Skip if we already have a deeper analysis for this move
    const existing = analysisCacheRef.current[moveIndex];
    if (existing && existing.depth >= depth) return;

    // For classification, we need prev eval.
    const prevAnalysis = moveIndex > 0 ? analysisCacheRef.current[moveIndex - 1] : null;
    const prevEvalVal = prevAnalysis ? prevAnalysis.eval : 0;
    const prevBestMoveVal = prevAnalysis ? prevAnalysis.bestMove : null;

    const classification = classifyMove(
        prevEvalVal,
        score,
        lastMove,
        prevBestMoveVal,
        gameRef.current.isCheckmate() && moveIndex === movesHistory.length - 1,
        null, 
        null
    );
    
    const style = getClassificationStyle(classification);
    
    const explanations = {
        [Classification.BRILLIANT]: "An unbelievable sacrifice that improves your position! You found a move that the computer initially didn't even see.",
        [Classification.GREAT]: "A very strong move that finds a critical line and keeps the pressure on.",
        [Classification.BEST]: "This was the best move in the position, exactly what the engine recommended.",
        [Classification.EXCELLENT]: "A very strong move, maintaining your advantage and following the right plan.",
        [Classification.GOOD]: "A solid move that keeps the game steady without making things worse.",
        [Classification.BOOK]: "A standard theoretical move from the opening book.",
        [Classification.INACCURACY]: "A slight mistake that lets some of your advantage slip away. There was a better way.",
        [Classification.MISTAKE]: "A bad move that significantly hurts your position. You've given your opponent an opening.",
        [Classification.BLUNDER]: "A terrible mistake that loses material or the game immediately. Watch out!",
        [Classification.FORCED]: "The only move that keeps you in the game. You had no choice!"
    };

    const newAnalysis = {
        classification,
        explanation: explanations[classification] || `This move is ${classification}.`,
        style: style,
        classificationClass: classification,
        moveSan: lastMove.san,
        eval: score,
        depth: depth,
        bestMove: bestMove
    };

    analysisCacheRef.current[moveIndex] = newAnalysis;
    setAnalysisCache({ ...analysisCacheRef.current });
    
        if (moveIndex === movesHistory.length - 1) {
        setLastMoveAnalysis(newAnalysis);
        
        // Trigger Bot Chatter
        const bot = getBotById(currentBotId);
        if (bot && bot.personality) {
            const isBotMove = lastMove.color === (gameRef.current.turn() === 'w' ? 'b' : 'w'); // Simplification: turn already swapped?
            // Actually, gameRef.current is the state *after* the move.
            // If it's White's turn now, Black just moved.
            
            const justMovedColor = lastMove.color;
            const isBotTurn = (justMovedColor === 'b'); 

            if (classification === Classification.BLUNDER || classification === Classification.MISTAKE) {
                const templates = isBotTurn ? bot.personality.onBotBlunder : bot.personality.onPlayerBlunder;
                if (templates) setBotChat(templates[Math.floor(Math.random() * templates.length)]);
            } else if (lastMove.captured) {
                if (isBotTurn && bot.personality.onCapture) {
                    setBotChat(bot.personality.onCapture[Math.floor(Math.random() * bot.personality.onCapture.length)]);
                }
            }
        }
    }
  }, [currentBotId]);

  useEffect(() => {
    showAnalysisRef.current = showAnalysis;
  }, [showAnalysis]);

  const updateStatus = useCallback((currentGame, latestMoveResult) => {
    let status = '';
    const isCheck = currentGame.isCheck();
    
    if (currentGame.isCheckmate()) {
      status = `Checkmate! ${currentGame.turn() === 'w' ? 'Black' : 'White'} wins!`;
      playGameEnd();
    } else if (currentGame.isDraw()) {
      status = 'Draw!';
      playGameEnd();
    } else {
      status = `Turn: ${currentGame.turn() === 'w' ? 'White' : 'Black'}`;
      if (isCheck) status += ' (Check!)';
      
      // Play move sounds if not game over
      if (latestMoveResult) {
          if (isCheck) playCheck();
          else if (latestMoveResult.flags.includes('c')) playCapture();
          else playMove();
      }
    }
    setStatus(status);
    const newHistory = currentGame.history({ verbose: true });
    setHistory(newHistory);
    
    // Opening Detection
    const opening = detectOpening(newHistory);
    if (opening) setCurrentOpening(opening);

    // Game End Chatter
    if (currentGame.isGameOver()) {
        const bot = getBotById(currentBotId);
        if (bot && bot.personality) {
            const isWin = (currentGame.isCheckmate() && currentGame.turn() === 'w'); // Black (Bot) wins if it's White's turn and checkmate
            const templates = isWin ? bot.personality.onWin : bot.personality.onLoss;
            if (templates) setBotChat(templates[Math.floor(Math.random() * templates.length)]);
        }
    }
  }, [currentBotId]);

  // Initialize Workers
  useEffect(() => {
    // Worker 1: Bot Opponent
    botWorker.current = new Worker('/engine/worker.js', { type: 'classic' });
    
    botWorker.current.onmessage = (e) => {
      const { type, move, eval: botEval } = e.data;
      
      if (type === 'MOVE_RESULT') {
        // Diamond Fix: Use the bot's own internal search eval to immediately classify the player's move
        if (botEval !== undefined) {
            const moves = gameRef.current.history({ verbose: true });
            if (moves.length > 0) {
                // Classify the move that led to the bot searching (the player's move)
                processAnalysisUpdate(botEval, 10, moves.length - 1, move);
            }
        }

        if (move) {
          setGame(g => {
            const newGame = new Chess();
            try {
                newGame.loadPgn(g.pgn());
            } catch {
                newGame.load(g.fen()); 
            }
            
            // Snapshot state before AI move
            prevGameState.current = { eval: currentEval, bestMove: currentBestMove };

            try { 
              const moveResult = newGame.move(move);
              if (moveResult) {
                setFen(newGame.fen());
                updateStatus(newGame, moveResult); // Pass move result for sound
                
                // Trigger Analysis for the new position (on the separate worker)
                if (analysisWorker.current) {
                    const moves = newGame.history({ verbose: true });
                    analysisWorker.current.postMessage({ 
                        type: 'ANALYZE', 
                        fen: newGame.fen(),
                        moveIndex: moves.length - 1 // Analyze the move that was JUST played
                    });
                }
              }
            } catch { console.error('Invalid AI move', move); }
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
            const depth = e.data.depth;
            const moveIndex = e.data.moveIndex; // New: Get move index from worker
            
            setCurrentEval(score);
            if (bestMove) {
                setCurrentBestMove(bestMove);
                setIsAnalyzingHint(false);
            }
    
            // Use general analysis worker results (Diamond Sync)
            processAnalysisUpdate(score, depth, moveIndex, bestMove);
        }
    };

    analysisWorker.current.postMessage({ type: 'ANALYZE', fen: gameRef.current.fen() });

    // Initial Greeting
    const bot = getBotById(currentBotId);
    if (bot && bot.personality && bot.personality.greetings) {
        setBotChat(bot.personality.greetings[Math.floor(Math.random() * bot.personality.greetings.length)]);
    }

    return () => {
        if (botWorker.current) botWorker.current.terminate();
        if (analysisWorker.current) analysisWorker.current.terminate();
    };
  }, [updateStatus]); 

  // Apply Theme
  useEffect(() => {
    const theme = BOARD_THEMES[boardTheme] || BOARD_THEMES.green;
    document.documentElement.style.setProperty('--board-light', theme.light);
    document.documentElement.style.setProperty('--board-dark', theme.dark);
  }, [boardTheme]);

  const makeMove = useCallback((move) => {
    try {
      // Snapshot state before Player move
      prevGameState.current = { eval: currentEval, bestMove: currentBestMove };

      const moveResult = game.move(move);
      if (moveResult) {
        setFen(game.fen());
        updateStatus(game, moveResult); // Pass move result for sound
        setHint(null);
        setCurrentBestMove(null);
        
        // Trigger Analysis for the new position
        if (analysisWorker.current) {
            const moves = game.history({ verbose: true });
            analysisWorker.current.postMessage({ 
                type: 'ANALYZE', 
                fen: game.fen(),
                moveIndex: moves.length - 1
            });
        }
        
        // Reset analysis until new result comes
        // setLastMoveAnalysis(null); // Optional: keep old until new arrives? Better to clear to show "analyzing..."

        setViewIndex(-1); // Reset view to live on new move
        setHint(null);
        setCurrentBestMove(null);
        setIsAnalyzingHint(false);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [game, updateStatus, currentEval, currentBestMove]);

  const makeAiMove = useCallback(() => {
    if (game.isGameOver()) return;
    setHint(null);
    setCurrentBestMove(null);
    setIsAnalyzingHint(false);
    setIsAiThinking(true);
    
    const bot = getBotById(currentBotId);
    
    if (botWorker.current) {
        // Configure Bot Strength
        botWorker.current.postMessage({ type: 'UCI_CMD', cmd: `setoption name Skill Level value ${bot.skillLevel || 20}` });
        botWorker.current.postMessage({ type: 'UCI_CMD', cmd: `setoption name UCI_LimitStrength value ${bot.skillLevel < 15 ? 'true' : 'false'}` });
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
    setViewIndex(-1);
    setAnalysisCache({});
    analysisCacheRef.current = {};
    setIsReviewing(false);
    setAccuracy({ white: 0, black: 0 });
    setMoveStats({
        white: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, blunder: 0, forced: 0 },
        black: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, blunder: 0, forced: 0 }
    });
    setCurrentOpening(null);
  };

  const undo = () => {
    // Stop triggers for AI
    setIsAiThinking(false);
    if (botWorker.current) botWorker.current.postMessage({ type: 'STOP' });
    
    // Undo Logic
    // If it's Player's turn (White), it means Black (AI) just moved. We need to undo 2 moves (Black + White) to get back to Player's turn.
    // Unless Player just moved and AI hasn't responded yet (still White's turn? No, if Player moved, it's Black's turn).
    
    // Case 1: Player (White) moved. Now Black's turn. AI is thinking.
    // Action: Undo 1 move. Stop AI.
    
    // Case 2: AI (Black) moved. Now White's turn.
    // Action: Undo 2 moves (AI last move, then Player last move) to retry.
    
    setGame(g => {
        const newG = new Chess();
        try {
            newG.loadPgn(g.pgn());
        } catch {
           newG.load(g.fen()); // Fallback
        }

        const history = newG.history();
        
        if (history.length === 0) return newG;
        
        // 1. Undo the last move (could be AI or Player)
        newG.undo();
        
        // If it was AI's move we just undid (so now it's Black's turn again), 
        // we likely want to undo Player's move too so Player can try again.
        // Assuming Player = White, AI = Black.
        if (newG.turn() === 'b' && history.length >= 2) {
            newG.undo(); // Undo Player's move
        }
        
        setFen(newG.fen());
        updateStatus(newG);
        return newG;
    });

    // Reset Analysis State
    setHint(null);
    setLastMoveAnalysis(null);
    setCurrentBestMove(null);
    prevGameState.current = { eval: 0, bestMove: null };
    setViewIndex(-1);
    
    // Restart Analysis for the restored position
    // We need to wait for state update or just use the new fen logic?
    // Since setFend is async, we can't trust `game` immediately here if we used functional update.
    // But we can trigger analysis in useEffect when `fen` changes? 
    // Existing useEffect only sets up workers.
    // Let's manually trigger analysis after a short delay or rely on the game state ref if we had one.
    // Better: Helper function for analysis trigger.
    
    setTimeout(() => {
        // Safe bet to re-trigger analysis on current fen state accessible then
        // But `game` in closure is stale. 
        // We really should use `useEffect` to trigger analysis on `fen` change, but `makeMove` triggers it manually.
        // Let's just fire it with the logic we know:
        // We can't know the exact FEN here easily without race conditions in this architecture.
        // But `setFen` will trigger a re-render.
        // Let's add a useEffect for `fen` changes to trigger analysis?
        // CURRENT IMPLEMENTATION: `makeMove` triggers `ANALYZE`. `botWorker` triggers `ANALYZE`.
        // So `undo` needs to trigger `ANALYZE`.
        
        // Hack: read the DOM or just send a "STOP" to analysis worker first.
         if (analysisWorker.current) {
            analysisWorker.current.postMessage({ type: 'STOP' });
            // We'll let the user make a move to restart analysis or ...
            // Ideally we want to see the eval of the position we went back to.
         }
    }, 10);
  };

  const requestHint = () => {
    // If we have a best move from analysis, use it!
    if (currentBestMove) {
        // currentBestMove is UCI (e.g. "e2e4")
        const from = currentBestMove.substring(0, 2);
        const to = currentBestMove.substring(2, 4);
        setHint({ from, to });
        setIsAnalyzingHint(false);
    } else {
        // No quality move yet, show thinking state
        setIsAnalyzingHint(true);
    }
  };

  const startFullGameReview = useCallback(async () => {
    setIsReviewing(true);
    const movesHistory = game.history({ verbose: true });
    
    // Clear cache if we want a fresh review, or keep it.
    // Let's keep it to save time on moves already analyzed.
    
    const analyzeMoveSequential = async (index) => {
        if (index >= movesHistory.length) {
            calculateFinalAccuracy();
            return;
        }

        // Check cache
        if (analysisCacheRef.current[index] && analysisCacheRef.current[index].depth >= 14) {
             analyzeMoveSequential(index + 1);
             return;
        }

        // Reconstruct position
        const tempG = new Chess();
        for (let i = 0; i <= index; i++) {
            tempG.move(movesHistory[i].san);
        }

        // Send request
        analysisWorker.current.postMessage({ 
            type: 'ANALYZE', 
            fen: tempG.fen(), 
            depth: 14, 
            moveIndex: index 
        });

        // We need to wait for the analysis to be "finished" (reached depth)
        // This is tricky because the worker sends many updates.
        // We'll use a simple interval or a promise that resolves when cache[index] hits depth.
        
        const checkDone = setInterval(() => {
            const cached = analysisCacheRef.current[index];
            if (cached && cached.depth >= 14) {
                clearInterval(checkDone);
                analyzeMoveSequential(index + 1);
            }
        }, 100);
    };

    analyzeMoveSequential(0);
  }, [game]);

  const calculateFinalAccuracy = useCallback(() => {
      const movesHistory = game.history({ verbose: true });
      const stats = {
          white: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, blunder: 0, forced: 0 },
          black: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, blunder: 0, forced: 0 }
      };
      
      let whiteTotalAcc = 0;
      let whiteMoves = 0;
      let blackTotalAcc = 0;
      let blackMoves = 0;

      movesHistory.forEach((move, index) => {
          const analysis = analysisCacheRef.current[index];
          if (analysis) {
              const color = move.color === 'w' ? 'white' : 'black';
              stats[color][analysis.classificationClass]++;
              
              const accValue = classificationValues[analysis.classificationClass] * 100;
              if (move.color === 'w') {
                  whiteTotalAcc += accValue;
                  whiteMoves++;
              } else {
                  blackTotalAcc += accValue;
                  blackMoves++;
              }
          }
      });

      setMoveStats(stats);
      setAccuracy({
          white: whiteMoves > 0 ? whiteTotalAcc / whiteMoves : 100,
          black: blackMoves > 0 ? blackTotalAcc / blackMoves : 100
      });
  }, [game]);

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
    showAnalysis,
    viewIndex,
    setViewIndex,
    boardTheme,
    setBoardTheme,
    analysisCache,
    isAnalyzingHint,
    isReviewing,
    accuracy,
    moveStats,
    startFullGameReview,
    calculateFinalAccuracy,
    currentOpening,
    botChat
  };
}
