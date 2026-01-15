import React from 'react';

const CapturedPieces = ({ captured, color }) => {
  // Map logic to icons or unicode.
  // Assuming captured is an array of piece types chars: 'p', 'n', 'b', 'r', 'q'
  // Color prop determines if we are showing white or black pieces that were captured.
  // Wait, usually if I am White, I want to see what Black pieces I captured.
  
  const pieceIcons = {
    p: '♟',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
    k: '♚',
  };

  return (
    <div className="captured-pieces" style={{ 
      display: 'flex', 
      gap: '4px', 
      minHeight: '24px', 
      alignItems: 'center',
      padding: '4px',
      color: color === 'w' ? '#eee' : '#111', // If white pieces captured, they look white? Or opposite? 
      // Typically:
      // "Captured pieces of opponent" are shown.
      // If I am White, I see captured Black pieces next to me (or correct place).
      // Let's stick to standard unicode chars which have white/black variants or just colorize one shape.
      fontSize: '20px',
      flexWrap: 'wrap'
    }}>
      {captured.map((p, i) => (
        <span key={i} style={{ 
          filter: `drop-shadow(0 0 1px ${color === 'w' ? '#000' : '#fff'})` 
        }}>
          {pieceIcons[p] || p}
        </span>
      ))}
    </div>
  );
};

export default CapturedPieces;
