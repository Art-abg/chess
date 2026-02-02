import React from 'react';
import Piece from './Piece';

const PromotionModal = ({ color, onSelect }) => {
  const pieces = ['q', 'r', 'b', 'n'];
  
  return (
    <div className="promotion-overlay">
      <div className="promotion-modal">
        <h3>Select Promotion</h3>
        <div className="promotion-options">
          {pieces.map((p) => (
            <div 
              key={p} 
              className="promotion-option"
              onClick={() => onSelect(p)}
            >
              <Piece type={p} color={color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
