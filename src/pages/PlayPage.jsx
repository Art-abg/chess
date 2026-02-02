import React, { useEffect, useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import confetti from 'canvas-confetti';
import ChessBoard from '../components/ChessBoard';
import EvaluationBar from '../components/EvaluationBar';
import GameReviewModal from '../components/GameReviewModal';
import SidebarTabs from '../components/common/SidebarTabs';
import ThemeSelector from '../components/common/ThemeSelector';
import CapturedPieces from '../components/CapturedPieces';
import { useGame } from '../context/GameContext'; 
import { BOTS, getBotById } from '../game/Bots';
import '../styles/board.css';
import '../styles/analysis.css';
import '../styles/review.css';
import '../styles/responsive.css';

const PlayPage = () => {
  const [activeTab, setActiveTab] = useState('game'); // game, moves, chat
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
    currentOpening,
    botChat
  } = useGame();

  const currentBot = getBotById(currentBotId);
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  const displayGame = useMemo(() => {
    if (viewIndex === -1 || viewIndex >= history.length - 1) return game;
    const newGame = new Chess();
    for (let i = 0; i <= viewIndex; i++) {
        newGame.move(history[i].san);
    }
    return newGame;
  }, [game, history, viewIndex]);

  const displayLastMove = useMemo(() => {
    if (viewIndex === -1) return lastMove;
    if (viewIndex < 0) return null;
    return history[viewIndex];
  }, [history, lastMove, viewIndex]);

  // Calculate captured pieces
  const { whiteCaptures, blackCaptures } = useMemo(() => {
    const w = [];
    const b = [];
    history.forEach(move => {
      if (move.captured) {
        if (move.color === 'w') w.push(move.captured); // White captured something (so it's a black piece)
        else b.push(move.captured); // Black captured something (so it's a white piece)
      }
    });
    return { whiteCaptures: w, blackCaptures: b };
  }, [history]);

  const currentAnalysis = useMemo(() => {
    if (viewIndex === -1) return lastMoveAnalysis;
    return analysisCache[viewIndex] || null;
  }, [viewIndex, lastMoveAnalysis, analysisCache]);

  const evaluationMarkers = useMemo(() => {
    const markers = {};
    const indexToShow = viewIndex === -1 ? history.length - 1 : viewIndex;
    if (indexToShow >= 0 && analysisCache[indexToShow] && history[indexToShow]) {
      const move = history[indexToShow];
      markers[move.to] = { type: analysisCache[indexToShow].classificationClass };
    }
    return markers;
  }, [viewIndex, history, analysisCache]);

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      makeAiMove();
    }
  }, [game.fen(), makeAiMove, game]);

  // Confetti Effect on Win
  useEffect(() => {
    if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        if (winner === 'White') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
  }, [game]); // Depend on game state changes

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setViewIndex(prev => {
          if (prev === -1) return history.length - 2;
          return Math.max(-1, prev - 1);
        });
      } else if (e.key === 'ArrowRight') {
        setViewIndex(prev => {
          if (prev === -1 || prev === history.length - 1) return -1;
          return prev + 1 === history.length - 1 ? -1 : prev + 1;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history.length, setViewIndex]);

  const handleNewGame = () => {
    resetGame();
    setShowReview(false);
  };

  const jumpToNextMistake = () => {
    const startIndex = viewIndex === -1 ? history.length - 1 : viewIndex;
    for (let i = startIndex + 1; i < history.length; i++) {
        const analysis = analysisCache[i];
        if (analysis && (analysis.classificationClass === 'mistake' || analysis.classificationClass === 'blunder' || analysis.classificationClass === 'inaccuracy')) {
            setViewIndex(i);
            return;
        }
    }
    // Loop back to start if not found after current
    for (let i = 0; i <= startIndex; i++) {
        const analysis = analysisCache[i];
        if (analysis && (analysis.classificationClass === 'mistake' || analysis.classificationClass === 'blunder' || analysis.classificationClass === 'inaccuracy')) {
            setViewIndex(i);
            return;
        }
    }
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
          <div className="player-details">
            <div className={`avatar ai ${isAiThinking ? 'thinking-pulse' : ''}`} style={{ backgroundColor: currentBot.color }}>
               {currentBot.name[0]}
            </div>
            <div className="username">
              <span className="name">{currentBot.name}</span>
              <span className="rating">({currentBot.elo})</span>
            </div>
            {/* Bot (Black) captured White pieces */}
            <CapturedPieces captured={blackCaptures} color="w" />
          </div>
          
          <div className="bot-message">
             {isAiThinking ? (
                <div className="thinking-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
             ) : (
                <div className="bot-chat-bubble">
                   {botChat || currentBot.description}
                </div>
             )}
          </div>
        </div>

        <ChessBoard 
          game={displayGame} 
          onMove={makeMove} 
          disabled={game.turn() === 'b' || isAiThinking || game.isGameOver() || viewIndex !== -1}
          lastMove={displayLastMove}
          hint={hint}
          evaluationMarkers={evaluationMarkers}
          analysisCache={analysisCache}
        />
        
        {/* Player Info */}
        <div className="player-info bottom">
          <div className="player-details">
            <div className="avatar human">ME</div>
            <div className="username">
              <span className="name">You</span>
              <span className="rating">(1200)</span>
            </div>
            {/* Player (White) captured Black pieces */}
            <CapturedPieces captured={whiteCaptures} color="b" />
          </div>
        </div>
      </div>

      <div className="sidebar">
        <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="sidebar-content">
          {activeTab === 'game' && (
             <div className="controls">
                <div className="game-status">
                  {status}
                  {isAnalyzingHint && <div className="hint-text thinking">Coach is thinking...</div>}
                  {hint && !isAnalyzingHint && <div className="hint-text">Hint: Try moving {hint.from} to {hint.to}</div>}
                  
                  {currentAnalysis && (
                    <div className={`analysis-feedback ${currentAnalysis.style}`}>
                      <div className="feedback-header">
                        <span className="label">
                            {currentAnalysis.classification.toUpperCase()}
                        </span>
                      </div>
                      <div className="explanation">
                        {currentAnalysis.explanation}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bot-selector">
                   <label>Opponent (Skill):</label>
                   <div className="bot-list">
                     {BOTS.map(bot => (
                       <button 
                         key={bot.id}
                         className={`bot-chip ${bot.id === currentBotId ? 'active' : ''}`}
                         onClick={() => setCurrentBotId(bot.id)}
                         disabled={history.length > 0} 
                       >
                         {bot.name} ({bot.elo})
                       </button>
                     ))}
                   </div>
                </div>

                <div className="action-buttons grid">
                  <button onClick={undo} disabled={history.length === 0 || isAiThinking}>
                    ↶ Undo
                  </button>
                  <button onClick={requestHint} disabled={isAiThinking || game.isGameOver()}>
                    💡 Hint
                  </button>
                  <button onClick={handleNewGame} className="primary full-width">
                     New Game
                  </button>
                  {game.isGameOver() && (
                    <button className="primary full-width" onClick={() => setShowReview(true)}>
                        💎 Game Review
                    </button>
                  )}
                </div>
                
                <div style={{marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)'}}>
                        <input 
                            type="checkbox" 
                            checked={showAnalysis} 
                            onChange={(e) => setShowAnalysis(e.target.checked)} 
                        />
                        <span>Show Analysis / Coach</span>
                    </label>
                </div>
                {viewIndex !== -1 && (
                  <button className="primary full-width" style={{marginTop: '10px'}} onClick={() => setViewIndex(-1)}>
                    Return to Live Game
                  </button>
                )}
             </div>
          )}

          {activeTab === 'moves' && (
            <div className="moves-history">
              {currentOpening && (
                <div className="opening-name" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                  📖 {currentOpening}
                </div>
              )}
              {history.map((move, i) => {
                if (i % 2 === 0) {
                  return (
                    <div key={i} className="move-row">
                      <span className="move-num">{Math.floor(i/2) + 1}.</span>
                      <span 
                        className={`move white ${viewIndex === i ? 'active' : ''}`}
                        onClick={() => setViewIndex(i)}
                      >
                        {move.san}
                      </span>
                      {history[i+1] && (
                        <span 
                          className={`move black ${viewIndex === i + 1 ? 'active' : ''}`}
                          onClick={() => setViewIndex(i + 1)}
                        >
                          {history[i+1].san}
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              })}
              <div ref={el => { if (viewIndex === -1) el?.scrollIntoView({ behavior: 'smooth' }); }} />
            </div>
          )}
          
          {activeTab === 'chat' && (
              <div style={{padding: '20px', color: 'var(--text-secondary)', textAlign: 'center'}}>
                  <p>Chat is disabled vs Computer.</p>
                  <p><i>{currentBot.description}</i></p>
              </div>
          )}

          {activeTab === 'review' && (
            <div className="review-tab">
              {!isReviewing ? (
                <div className="review-start">
                  <h3>Game Review</h3>
                  <p>Get a detailed analysis of your game with accuracy scores and coach explanations.</p>
                  <button className="primary-btn" onClick={startFullGameReview}>
                    Start Game Review
                  </button>
                </div>
              ) : (
                <div className="review-content" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                  <div className="accuracy-summary">
                    <div className="accuracy-card white">
                      <div className="percentage">{Math.round(accuracy.white)}%</div>
                      <div className="label">White Accuracy</div>
                    </div>
                    <div className="accuracy-card black">
                      <div className="percentage">{Math.round(accuracy.black)}%</div>
                      <div className="label">Black Accuracy</div>
                    </div>
                  </div>

                  <div className="review-controls">
                    <button 
                      className="primary-btn full-width"
                      onClick={() => setViewIndex(0)}
                    >
                      Step through moves
                    </button>
                    <div className="navigation" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px'}}>
                      <button onClick={() => setViewIndex(prev => Math.max(-1, prev - 1))}>← Prev</button>
                      <button onClick={() => setViewIndex(prev => prev < history.length - 1 ? prev + 1 : -1)}>Next →</button>
                    </div>
                    <button 
                        className="mistake-btn full-width" 
                        style={{marginTop: '8px'}}
                        onClick={jumpToNextMistake}
                    >
                        🚩 Next Mistake
                    </button>
                  </div>

                  <div className="coach-segment">
                    <h4>Coach Insights</h4>
                    {currentAnalysis ? (
                      <div className={`coach-feedback ${currentAnalysis.classificationClass}`}>
                         <div className="badge">{currentAnalysis.style.icon} {currentAnalysis.classificationClass.toUpperCase()}</div>
                         <p>{currentAnalysis.explanation}</p>
                      </div>
                    ) : (
                      <p className="no-analysis">Select a move in history to see coach insights.</p>
                    )}
                  </div>

                  <div className="stats-comparison">
                     <div className="stat-header">
                        <span>White</span>
                        <span>Classification</span>
                        <span>Black</span>
                     </div>
                     {['brilliant', 'great', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'].map(c => (
                       <div key={c} className={`stat-line ${c}`}>
                          <span>{moveStats.white[c]}</span>
                          <span className="name">{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                          <span>{moveStats.black[c]}</span>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'settings' && (
              <div className="settings-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <ThemeSelector currentTheme={boardTheme} onThemeChange={setBoardTheme} />
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                              type="checkbox" 
                              checked={showAnalysis} 
                              onChange={(e) => setShowAnalysis(e.target.checked)} 
                          />
                          <span style={{ fontWeight: '600' }}>Enable Coach Analysis</span>
                      </label>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                          Provides real-time feedback and move classifications.
                      </p>
                  </div>
              </div>
          )}
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
