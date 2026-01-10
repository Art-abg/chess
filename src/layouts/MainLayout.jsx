import React from 'react';
import '../styles/nav.css';

const MainLayout = ({ currentView, setView, children }) => {
  return (
    <div className="app-container">
      <nav className="main-nav">
        <div 
          className="nav-logo" 
          onClick={() => setView('home')} 
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          Chess Pro
        </div>
        <div className="nav-links">
          <button 
            className={currentView === 'home' ? 'active' : ''} 
            onClick={() => setView('home')}
          >
            Home
          </button>
          <button 
            className={currentView === 'play' ? 'active' : ''} 
            onClick={() => setView('play')}
          >
            Play
          </button>
          <button 
            className={currentView === 'learn' ? 'active' : ''} 
            onClick={() => setView('learn')}
          >
            Learn
          </button>
        </div>
      </nav>

      {children}
    </div>
  );
};

export default MainLayout;
