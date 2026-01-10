// Log that the worker has started
console.log('Worker: Starting (Module Mode)...');

const STOCKFISH_URL = 'https://unpkg.com/stockfish@11.0.0/src/stockfish.js';

let engine = null;
let engineReady = false;
let messageQueue = [];
let pendingRequest = null;
let pendingAnalysis = null;
let lastEval = 0;
let currentActiveColor = 'w';

// Robust loader for module workers
async function loadEngine() {
  try {
    console.log('Worker: Fetching Stockfish...');
    const response = await fetch(STOCKFISH_URL);
    const scriptContent = await response.text();
    
    // Some versions of stockfish.js use 'var STOCKFISH = ...'
    // In a Module, 'var' doesn't create a global on 'self'.
    // We wrap and explicitly export it if needed.
    
    const wrapper = new Function('self', `
      ${scriptContent}
      if (typeof STOCKFISH !== 'undefined') self.STOCKFISH = STOCKFISH;
      if (typeof Stockfish !== 'undefined') self.Stockfish = Stockfish;
    `);
    
    wrapper(self);
    console.log('Worker: Stockfish script evaluated and exported to self');
    
    const initFunc = self.STOCKFISH || self.Stockfish;
    
    if (initFunc) {
      console.log('Worker: Initializing engine instance...');
      engine = initFunc();
      engine.onmessage = (line) => {
        handleEngineMessage(line);
      };
      engine.postMessage('uci');
    } else {
       console.error('Worker: Stockfish init function STILL not found after eval. Available keys:', Object.keys(self).filter(k => k.toLowerCase().includes('stock')));
    }
  } catch (e) {
    console.error('Worker: Failed to load Stockfish script via fetch/eval', e);
  }
}

loadEngine();

function handleEngineMessage(line) {
  if (line === 'uciok') {
    console.log('Worker: Engine UCI OK');
    engineReady = true;
    engine.postMessage('isready');
  } else if (line === 'readyok') {
    console.log('Worker: Engine Ready');
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
    } else if (pendingAnalysis) {
       // Also send the final best move for the analyzed position
       self.postMessage({
        type: 'ANALYSIS_RESULT',
        eval: normalizeScore(lastEval),
        bestMove: bestMove, // NEW: Include best move
        depth: 12 // approximate
       });
       pendingAnalysis = null;
    }
  } else if (line.startsWith('info')) {
    const scoreMatch = line.match(/score cp (-?\d+)/);
    const mateMatch = line.match(/score mate (-?\d+)/);
    const depthMatch = line.match(/depth (\d+)/);
    
    if (scoreMatch) {
      lastEval = parseInt(scoreMatch[1]);
    } else if (mateMatch) {
      lastEval = parseInt(mateMatch[1]) > 0 ? 10000 : -10000;
    }

    if (pendingAnalysis && depthMatch) {
        // Send intermediate updates
        self.postMessage({
            type: 'ANALYSIS_RESULT',
            eval: normalizeScore(lastEval),
            depth: parseInt(depthMatch[1]),
             // We don't have bestMove yet, but we have eval
        });
    }
  }
}

function normalizeScore(score) {
    return currentActiveColor === 'w' ? score : -score;
}

self.onmessage = (e) => {
  const { type, fen, depth, id, move } = e.data;
  console.log('Worker Received:', type);

  if (!engineReady || !engine) {
    console.log('Worker: Engine not ready yet, queuing...', type);
    messageQueue.push(`position fen ${fen}`);
    if (type === 'CALCULATE_MOVE') {
        pendingRequest = { id, start: performance.now() };
        messageQueue.push(`go depth ${depth || 10}`);
    } else {
        messageQueue.push(`go depth ${depth || 12}`);
    }
    return;
  }

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
    sendCommand(`go depth 20`); // Deeper analysis for the UI
  } else if (type === 'UCI_CMD') {
    sendCommand(e.data.cmd);
  } else if (type === 'STOP') {
    sendCommand('stop');
    pendingRequest = null;
    pendingAnalysis = null;
  }
};

function sendCommand(cmd) {
  if (engineReady && engine) {
    engine.postMessage(cmd);
  } else {
    messageQueue.push(cmd);
  }
}
