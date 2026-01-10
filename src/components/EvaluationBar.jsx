import React from 'react';

export default function EvaluationBar({ evaluation }) {
  // Evaluation is in centipawns (positive = White winning)
  // Clamp between -500 and +500 for the visual bar (roughly 5 pawns advantage is "winning")
  
  // Normalize to 0-100% for the black bar height (or white bar).
  // If eval is +1000 (White winning), White bar should be full.
  // Standard design: Bar is vertical. White at bottom? 
  // Normally White at bottom. If White is +5 (winning), White bar takes up more space.
  
  // Let's assume evaluation is relative to WHITE.
  // range: -1000 to 1000 visually.
  
  const MAX_CP = 1000;
  const clampedEval = Math.max(-MAX_CP, Math.min(MAX_CP, evaluation));
  
  // Percentage of WHITE bar:
  // 0 evaluation -> 50%
  // +1000 -> 100%
  // -1000 -> 0%
  
  const whiteHeightPercent = 50 + (clampedEval / MAX_CP) * 50;
  
  // If mate (large numbers), force full or empty
  let height = whiteHeightPercent;
  if (evaluation > 9000) height = 100;
  if (evaluation < -9000) height = 0;

  const scoreText = evaluation > 9000 ? 'M' : evaluation < -9000 ? '-M' : (evaluation / 100).toFixed(1);

  return (
    <div className="evaluation-bar-container" style={{
        width: '20px',
        height: '600px', // Match board height roughly
        backgroundColor: '#262421',
        position: 'relative',
        marginRight: '10px',
        borderRadius: '4px',
        overflow: 'hidden'
    }}>
      {/* Black background is default */}
      
      {/* White Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${height}%`,
        backgroundColor: '#ffffff',
        transition: 'height 0.5s ease-out'
      }}></div>
      
      {/* Score Label */}
      <div style={{
        position: 'absolute',
        top: height > 50 ? 'auto' : '5px',
        bottom: height > 50 ? '5px' : 'auto',
        left: 0, 
        right: 0,
        textAlign: 'center',
        color: height > 50 ? '#000' : '#fff',
        fontSize: '10px',
        fontWeight: 'bold',
        pointerEvents: 'none'
      }}>
        {Math.abs(scoreText)}
      </div>
    </div>
  );
}
