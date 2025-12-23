import React from 'react';

const EvaluationBar = ({ score }) => {
  // Score is in centipawns. +100 = +1 pawn advantage for White.
  // We want to map this to a percentage 0% (Black win) to 100% (White win).
  // 50% is equal.
  // Sigmoid-like clamp: 
  // Let's say +/- 1000 (10 pawns/Queen) is max visual advantage.
  
  const MAX_VAL = 1000;
  const clamped = Math.max(-MAX_VAL, Math.min(MAX_VAL, score));
  
  // Map -1000..1000 to 0..100
  const percentage = 50 + (clamped / MAX_VAL) * 50;

  return (
    <div className="eval-bar-container">
       <div 
         className="eval-fill" 
         style={{ height: `${percentage}%` }}
       >
         <span className={`eval-score ${percentage > 50 ? 'white-score' : 'black-score'}`}>
           {score > 0 ? `+${(score/100).toFixed(1)}` : (score/100).toFixed(1)}
         </span>
       </div>
    </div>
  );
};

export default EvaluationBar;
