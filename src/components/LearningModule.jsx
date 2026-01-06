import React, { useState } from 'react';
import PuzzleMode from './PuzzleMode';
import LessonMode from './LessonMode';
import '../styles/learning.css';

export default function LearningModule({ onBack }) {
  const [activeSubMode, setActiveSubMode] = useState('selection'); // selection, puzzles, lessons

  if (activeSubMode === 'puzzles') {
    return <PuzzleMode onBack={() => setActiveSubMode('selection')} />;
  }

  if (activeSubMode === 'lessons') {
    return <LessonMode onBack={() => setActiveSubMode('selection')} />;
  }

  return (
    <div className="learning-module selection-screen">
      <div className="learning-header">
        <div className="header-nav">
          <button className="back-btn" onClick={onBack}>← Home</button>
        </div>
        <h2>Training Center</h2>
        <p>Master the board with tactical challenges and guided lessons.</p>
      </div>

      <div className="selection-grid">
        <div className="selection-card puzzles" onClick={() => setActiveSubMode('puzzles')}>
          <div className="card-icon">🧩</div>
          <h3>Tactical Puzzles</h3>
          <p>Improve your calculation and pattern recognition by solving curated chess positions.</p>
          <button className="primary">Solve Puzzles</button>
        </div>

        <div className="selection-card lessons" onClick={() => setActiveSubMode('lessons')}>
          <div className="card-icon">📚</div>
          <h3>Interactive Lessons</h3>
          <p>Learn core concepts from openings to endgame techniques with step-by-step guidance.</p>
          <button className="primary">Start Learning</button>
        </div>
      </div>

      <div className="learning-footer">
        <h3>Why train?</h3>
        <p>Regular practice of puzzles is the fastest way to improve your rating. Understanding fundamental principles through lessons ensures you build a solid foundation for every game.</p>
      </div>
    </div>
  );
}
