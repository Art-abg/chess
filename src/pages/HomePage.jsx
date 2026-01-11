import React from 'react';
import '../styles/home.css';
import heroImage from '../assets/hero_chess_board.png'; // We will assume this path after generation

const HomePage = ({ onStartPlay, onStartLearn }) => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Play Chess Online <br />
            on the <span>#1 Site!</span>
          </h1>
          <p className="hero-subtitle">
            Play interactively with our advanced AI bots, analyze your games, 
            and solve daily puzzles. Join the community today.
          </p>
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={onStartPlay}>
              <span>Play Computer</span>
            </button>
            <button className="hero-btn secondary" onClick={onStartLearn}>
              <span>Solve Puzzles</span>
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          <img 
            src={heroImage} 
            alt="Chess Board" 
            className="hero-board-img"
            onError={(e) => {e.target.style.display = 'none'}} // Fallback if image fails
          />
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card" onClick={onStartPlay}>
          <div className="feature-icon">🤖</div>
          <h3 className="feature-title">Play vs Computer</h3>
          <p className="feature-desc">Challenge bots from beginner to grandmaster level.</p>
        </div>
        
        <div className="feature-card" onClick={onStartLearn}>
          <div className="feature-icon">🧩</div>
          <h3 className="feature-title">Puzzles</h3>
          <p className="feature-desc">Train your tactical skills with thousands of puzzles.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🎓</div>
          <h3 className="feature-title">Lessons</h3>
          <p className="feature-desc">Master strategy with interactive lessons.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
