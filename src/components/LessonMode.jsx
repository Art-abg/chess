import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from './ChessBoard';

const LESSONS = [
  {
    id: 'l1',
    title: 'Controlled Center',
    category: 'Openings',
    description: 'Learn why the center is vital in chess.',
    steps: [
      {
        text: 'The four central squares (d4, d5, e4, e5) are the most important territory. Controlling them gives your pieces more space and activity.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      },
      {
        text: 'Moving the King\'s pawn to e4 is a classic way to start. It controls d5 and opens paths for the Queen and Bishop.',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
      },
      {
        text: 'If Black responds with e5, they are also claiming their share of the center. This lead to many tactical openings.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2'
      }
    ]
  },
  {
    id: 'l2',
    title: 'Back Rank Mate Basics',
    category: 'Tactics',
    description: 'The most common checkmate for beginners.',
    steps: [
      {
        text: 'A back rank mate occurs when a King is trapped behind its own pawns and is attacked by a Rook or Queen.',
        fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1'
      },
      {
        text: 'White plays Rd8#. The King has no escape squares because the pawns on f7, g7, and h7 act as a wall.',
        fen: '3R2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1'
      }
    ]
  }
];

export default function LessonMode({ onBack }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [game, setGame] = useState(new Chess());

  const lesson = LESSONS[currentLessonIndex];
  const step = lesson.steps[stepIndex];

  useEffect(() => {
    setGame(new Chess(step.fen));
  }, [step]);

  const nextStep = () => {
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      // Completed lesson
      if (currentLessonIndex < LESSONS.length - 1) {
        setCurrentLessonIndex(prev => prev + 1);
        setStepIndex(0);
      } else {
        setStepIndex(0);
        setCurrentLessonIndex(0);
      }
    }
  }

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  }

  return (
    <div className="lesson-mode">
      <div className="puzzle-header">
        <button className="back-btn" onClick={onBack}>← Training Center</button>
        <div className="puzzle-info">
            <h3>{lesson.title}</h3>
            <span className="difficulty">{lesson.category}</span>
        </div>
      </div>

      <div className="puzzle-layout">
        <div className="board-section">
          <ChessBoard 
            game={game} 
            onMove={() => {}} // Non-interactive for lessons unless we add specific tasks
            disabled={true}
          />
        </div>

        <div className="puzzle-sidebar">
          <div className="lesson-content">
            <div className="step-progress">
               Step {stepIndex + 1} of {lesson.steps.length}
            </div>
            <p className="lesson-text">{step.text}</p>
          </div>

          <div className="puzzle-controls">
            <button onClick={prevStep} className="secondary" disabled={stepIndex === 0}>
                ← Previous
            </button>
            <button onClick={nextStep} className="primary">
                {stepIndex === lesson.steps.length - 1 ? 'Finish Lesson' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
