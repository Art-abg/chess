import React from 'react';
import './Landing.css';

const Landing = ({ onStartPlay, onStartLearn }) => {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <h1>Play Chess.<br/><span className="accent">Get Better.</span></h1>
          <p>Challenge our AI, solve puzzles, and master the game with interactive lessons.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onStartPlay}>Play Now</button>
            <button className="btn-secondary" onClick={onStartLearn}>Learn Chess</button>
          </div>
        </div>
        <div className="hero-board">
          <div className="mini-board">
            {[...Array(64)].map((_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isLight = (row + col) % 2 === 0;
              return <div key={i} className={`mini-square ${isLight ? 'light' : 'dark'}`}></div>;
            })}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">🤖</div>
          <h3>Smart AI</h3>
          <p>Powered by Stockfish engine for professional-level analysis and play.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🧩</div>
          <h3>Puzzles</h3>
          <p>Sharpen your tactics with curated puzzle challenges.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📖</div>
          <h3>Lessons</h3>
          <p>Interactive tutorials for beginners to advanced players.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
