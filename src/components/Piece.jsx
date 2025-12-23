import React from 'react';

const Piece = ({ type, color }) => {
  if (!type || !color) return null;

  const isWhite = color === 'w';
  const fill = isWhite ? '#f8f9fa' : '#212529'; // White (Off-white) / Black (Dark-gray)
  const stroke = isWhite ? '#212529' : '#f8f9fa'; // Contrast stroke

  const pieces = {
    // Pawn
    p: (
      <svg viewBox="0 0 45 45" className="piece">
        <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" 
              stroke={stroke} fill={fill} strokeWidth="1.5" />
      </svg>
    ),
    // Rook
    r: (
      <svg viewBox="0 0 45 45" className="piece">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt"/>
          <path d="M34 14l-3 3H14l-3-3"/>
          <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter"/>
          <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
          <path d="M11 14h23" fill="none" stroke={stroke} strokeLinejoin="miter"/>
        </g>
      </svg>
    ),
    // Knight
    n: (
      <svg viewBox="0 0 45 45" className="piece">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 10-21" />
          <path d="M24 18c.38 2.32-4.68 1.97-5 0 2.02-2.48 4.2-5.89 5-8"/>
          <path d="M9.5 25.5A23 23 0 0 1 20 10c0-6 4-10 6-6 4 1 8 4 8 4l2 3h.5c.31.29 1.14 1.12 2.5 3 .5-3.5-3.5-5.5-3.5-5.5s-4-2.5-12.5-1c-1.25.26-12.5 1.5-13.5 11.5z"/>
        </g>
      </svg>
    ),
    // Bishop
    b: (
      <svg viewBox="0 0 45 45" className="piece">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 36c3.39-.97 9.11-1.45 13.5-1.45 4.38 0 10.11.48 13.5 1.45"/>
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    // Queen
    q: (
      <svg viewBox="0 0 45 45" className="piece">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM10.5 20.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38.5 20.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/>
          <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-5.5-13.5V25l-7-11-2 12z"/>
          <path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 3 2.5 3 2.5H30.5s2 0 3-2.5c1-2 2.5-2 2.5-4"/>
          <path d="M9 26c0-1.5 1.5-2 2.5-4 1-2.5 3-2.5 3-2.5H30.5s2 0 3 2.5c1 2 2.5 2.5 2.5 4"/>
        </g>
      </svg>
    ),
    // King
    k: (
      <svg viewBox="0 0 45 45" className="piece">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 11.63V6M20 8h5"/>
          <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
          <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 2-8 2s-4-4-8-4-5 5-8 4-5-3-8-2c-3 6 6 10.5 6 10.5v7z"/>
          <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/>
        </g>
      </svg>
    ),
  };

  return pieces[type] || null;
};

export default Piece;
