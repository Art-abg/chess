import { useEffect } from 'react';
import ChessBoard from './components/ChessBoard';
import EvaluationBar from './components/EvaluationBar';
import useChessGame from './hooks/useChessGame';
import { BOTS, getBotById } from './game/Bots';
import './styles/board.css';
import './styles/analysis.css';

function App() {
  const { 
    game, 
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
    lastMoveAnalysis
  } = useChessGame();

  const currentBot = getBotById(currentBotId);

  // Trigger AI if it's Black's turn
  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      makeAiMove();
    }
  }, [game.fen(), makeAiMove, game]);

  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="app-container">
      <div className="main-content">
        
        {/* Left Side: Evaluation Bar */}
        <div className="eval-section">
          <EvaluationBar score={currentEval} />
        </div>

        <div className="board-container">
          {/* Opponent (Bot) Info */}
          <div className="player-info top">
            <div className="avatar ai" style={{ backgroundColor: currentBot.color }}>
               {/* Simple Initials or Icon */}
               {currentBot.name[0]}
            </div>
            <div className="username">
              <span className="name">{currentBot.name}</span>
              <span className="rating">({currentBot.elo})</span>
            </div>
            <div className="bot-message">
               {isAiThinking ? "Thinking..." : currentBot.description}
            </div>
          </div>

          <ChessBoard 
            game={game} 
            onMove={makeMove} 
            disabled={game.turn() === 'b' || isAiThinking || game.isGameOver()}
            lastMove={lastMove}
          />
          
          {/* Player Info */}
          <div className="player-info bottom">
            <div className="avatar human">ME</div>
            <div className="username">
              <span className="name">You</span>
              <span className="rating">(1200)</span>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Chess Pro</h2>
          </div>
          
          <div className="game-status">
            {status}
            {hint && <div className="hint-text">Hint: Try moving to {hint}</div>}
            
            {/* Move Analysis Feedback */}
            {lastMoveAnalysis && (
              <div className={`analysis-feedback ${lastMoveAnalysis.classification.toLowerCase()}`}>
                <div className="badge">{lastMoveAnalysis.classification}</div>
                <div className="details">
                  {lastMoveAnalysis.diff === 0 ? 'Best Move!' : `Lost ${lastMoveAnalysis.diff.toFixed(1)} cp`}
                </div>
              </div>
            )}
          </div>

          <div className="moves-history">
            <h3>Moves</h3>
            <div className="moves-list">
              {history.map((move, i) => {
                if (i % 2 === 0) {
                  return (
                    <div key={i} className="move-row">
                      <span className="move-num">{Math.floor(i/2) + 1}.</span>
                      <span className="move white">{move.san}</span>
                      {history[i+1] && <span className="move black">{history[i+1].san}</span>}
                    </div>
                  );
                }
                return null;
              })}
              <div ref={el => el?.scrollIntoView()} />
            </div>
          </div>

          <div className="controls">
            
            <div className="bot-selector">
               <label>Opponent:</label>
               <div className="bot-list">
                 {BOTS.map(bot => (
                   <button 
                     key={bot.id}
                     className={`bot-chip ${bot.id === currentBotId ? 'active' : ''}`}
                     onClick={() => setCurrentBotId(bot.id)}
                     disabled={history.length > 0} // Lock during game
                   >
                     {bot.name} ({bot.elo})
                   </button>
                 ))}
               </div>
            </div>

            <div className="action-buttons grid">
              <button 
                onClick={undo} 
                className="secondary" 
                disabled={history.length === 0 || isAiThinking}
                title="Takeback Move"
              >
                ↶ Undo
              </button>
              <button 
                 onClick={requestHint} 
                 className="secondary"
                 disabled={isAiThinking || game.isGameOver()}
                 title="Get a Hint"
              >
                💡 Hint
              </button>
              <button onClick={resetGame} className="primary full-width">
                New Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
