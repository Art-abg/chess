// This is a classic Web Worker script (type: 'classic')
// It resides in /public/engine/worker.js

importScripts('stockfish.js');

let engine = null;
let engineReady = false;
let messageQueue = [];
let pendingRequest = null;
let pendingAnalysis = null;
let lastEval = 0;
let currentActiveColor = 'w';

// Initialize Stockfish
try {
  const initFunc = (typeof STOCKFISH === 'function' ? STOCKFISH : 
                   (typeof Stockfish === 'function' ? Stockfish : null));
  
  if (initFunc) {
    engine = initFunc();
    engine.onmessage = (line) => {
      handleEngineMessage(line);
    };
    engine.postMessage('uci');
  }
} catch (e) {
  console.error('Classic Worker: Error during engine initialization', e);
}

function handleEngineMessage(line) {
  if (line === 'uciok') {
    engineReady = true;
    engine.postMessage('isready');
  } else if (line === 'readyok') {
    while (messageQueue.length > 0) {
      engine.postMessage(messageQueue.shift());
    }
  } else if (line.startsWith('bestmove')) {
    const parts = line.split(' ');
    const bestMove = parts[1];
    
    if (pendingRequest) {
      const end = performance.now();
      self.postMessage({
        type: 'MOVE_RESULT',
        id: pendingRequest.id,
        move: bestMove,
        eval: normalizeScore(lastEval),
        time: end - pendingRequest.start
      });
      pendingRequest = null;
    }
  } else if (line.startsWith('info')) {
    const scoreMatch = line.match(/score cp (-?\d+)/);
    const mateMatch = line.match(/score mate (-?\d+)/);
    const depthMatch = line.match(/depth (\d+)/);
    const pvMatch = line.match(/ pv (\w+)/); // Extract first move of Principal Variation
    
    if (scoreMatch) {
      lastEval = parseInt(scoreMatch[1]);
    } else if (mateMatch) {
      lastEval = parseInt(mateMatch[1]) > 0 ? 10000 : -10000;
    }

    if (pendingAnalysis && depthMatch) {
        const msg = {
            type: 'ANALYSIS_RESULT',
            eval: normalizeScore(lastEval),
            depth: parseInt(depthMatch[1])
        };
        
        if (pvMatch) {
            msg.bestMove = pvMatch[1];
        }
        
        self.postMessage(msg);
    }
  }
}

function normalizeScore(score) {
    return currentActiveColor === 'w' ? score : -score;
}

self.onmessage = (e) => {
  const { type, fen, depth, id, move } = e.data;

  if (!engine) return;

  const fenParts = fen ? fen.split(' ') : [];
  currentActiveColor = fenParts[1] || 'w';

  if (type === 'CALCULATE_MOVE') {
    pendingRequest = { id, start: performance.now() };
    sendCommand('stop');
    sendCommand(`position fen ${fen}`);
    sendCommand(`go depth ${depth || 10}`);
  } else if (type === 'ANALYZE') {
    pendingAnalysis = { fen };
    sendCommand('stop');
    sendCommand(`position fen ${fen}`);
    sendCommand(`go depth ${depth || 12}`);
  } else if (type === 'ANALYZE_MOVE') {
    sendCommand('stop');
    sendCommand(`position fen ${fen} moves ${move}`);
    sendCommand(`go depth 10`);
  }
};

function sendCommand(cmd) {
  if (engineReady) {
    engine.postMessage(cmd);
  } else {
    messageQueue.push(cmd);
  }
}
