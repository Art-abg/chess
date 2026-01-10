import React, { useEffect, useState } from 'react';
import ChessBoard from '../components/ChessBoard';
import EvaluationBar from '../components/EvaluationBar';
import GameReviewModal from '../components/GameReviewModal';
import { useGame } from '../context/GameContext'; // Hook into context
import { BOTS, getBotById } from '../game/Bots';
import '../styles/board.css';
import '../styles/analysis.css';
import '../styles/responsive.css';

const PlayPage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showReview, setShowReview] = useState(false);

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
    lastMoveAnalysis,
    setShowAnalysis,
    showAnalysis
  } = useGame();

  const currentBot = getBotById(currentBotId);
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  // Trigger AI if it's Black's turn and we are in the Play view
  // Since this component unmounts when not in Play view, this effect is safe
  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      makeAiMove();
    }
  }, [game.fen(), makeAiMove, game]);

  const handleNewGame = () => {
    resetGame();
    setShowReview(false);
  };

  return (
    <div className="main-content">
      {/* Left Side: Evaluation Bar */}
      <div className="eval-section">
        <EvaluationBar evaluation={currentEval} />
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
          hint={hint}
          lastMoveAnalysis={lastMoveAnalysis}
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
          <button className="settings-btn" onClick={() => setShowSettings(!showSettings)} title="Settings">
            ⚙️
          </button>
        </div>
        
        {showSettings && (
           <div className="settings-panel">
               <div className="setting-row">
                   <label>Show Evaluation Bar</label>
                   <input type="checkbox" checked={true} readOnly />
               </div>
               <div className="setting-row">
                   <label>Move Analysis & Coach</label>
                   <input 
                    type="checkbox" 
                    checked={showAnalysis} 
                    onChange={(e) => setShowAnalysis(e.target.checked)} 
                   />
               </div>
           </div>
        )}
        
        <div className="game-status">
          {status}
          {hint && <div className="hint-text">Hint: Try moving to {hint}</div>}
          
          {/* Game Over Action */}
          {game.isGameOver() && (
              <button 
                  className="primary" 
                  onClick={() => setShowReview(true)}
                  style={{width: '100%', marginTop: '10px'}}
              >
                  💎 Game Review
              </button>
          )}

          {/* Move Analysis Feedback */}
          {showAnalysis && lastMoveAnalysis && (
            <div className={`analysis-feedback ${lastMoveAnalysis.classification}`}>
              <div className="feedback-header">
                  <span className="label" style={{textTransform: 'capitalize'}}>{lastMoveAnalysis.classification}</span>
              </div>
              <div className="feedback-text">
                 {lastMoveAnalysis.explanation}
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
             <label>Opponent (Skill):</label>
             <div className="bot-list">
               {BOTS.map(bot => (
                 <button 
                   key={bot.id}
                   className={`bot-chip ${bot.id === currentBotId ? 'active' : ''}`}
                   onClick={() => setCurrentBotId(bot.id)}
                   disabled={history.length > 0} // Lock during game
                   title={`Elo: ${bot.elo}`}
                 >
                   {bot.name}
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
            <button onClick={handleNewGame} className="primary full-width">
              New Game
            </button>
          </div>
        </div>
      </div>

      {showReview && (
          <GameReviewModal 
              game={game} 
              onClose={() => setShowReview(false)} 
              playerColor="w"
          />
      )}
    </div>
  );
};

export default PlayPage;
