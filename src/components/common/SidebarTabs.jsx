import React from 'react';
import '../../styles/nav.css'; // Reusing nav styles or we can create new ones

const SidebarTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="sidebar-tabs">
      <button 
        className={`tab-btn ${activeTab === 'game' ? 'active' : ''}`}
        onClick={() => onTabChange('game')}
      >
        Game
      </button>
      <button 
        className={`tab-btn ${activeTab === 'moves' ? 'active' : ''}`}
        onClick={() => onTabChange('moves')}
      >
        Moves
      </button>
      <button 
        className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
        onClick={() => onTabChange('review')}
      >
        Review
      </button>
      <button 
        className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
        onClick={() => onTabChange('chat')}
      >
        Chat
      </button>
      <button 
        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
      >
        Settings
      </button>
    </div>
  );
};

export default SidebarTabs;
