import React from 'react';
import { BOARD_THEMES } from '../../hooks/useChessGame';

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="theme-selector">
      <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>Board Theme</h4>
      <div className="theme-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '12px'
      }}>
        {Object.entries(BOARD_THEMES).map(([id, theme]) => (
          <div 
            key={id} 
            className={`theme-option ${currentTheme === id ? 'active' : ''}`}
            onClick={() => onThemeChange(id)}
            style={{
              cursor: 'pointer',
              borderRadius: '8px',
              padding: '8px',
              backgroundColor: currentTheme === id ? 'var(--accent)' : 'var(--bg-primary)',
              transition: 'all 0.2s',
              border: `2px solid ${currentTheme === id ? 'var(--accent)' : 'transparent'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div className="theme-preview" style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <div style={{ backgroundColor: theme.light }} />
              <div style={{ backgroundColor: theme.dark }} />
              <div style={{ backgroundColor: theme.dark }} />
              <div style={{ backgroundColor: theme.light }} />
            </div>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: '600',
              color: currentTheme === id ? 'white' : 'var(--text-primary)',
              textAlign: 'center'
            }}>
              {theme.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
