import React, { useMemo } from 'react';
import BotCard from './BotCard';
import { BOTS } from '../../game/Bots';
import './BotDashboard.css';

const BotDashboard = ({ onSelectBot }) => {
  // Group bots by category
  const categories = useMemo(() => {
     const groups = {};
     BOTS.forEach(bot => {
         const cat = bot.category || 'Other';
         if (!groups[cat]) groups[cat] = [];
         groups[cat].push(bot);
     });
     // Order keys manually for progress
     return ['Beginner', 'Intermediate', 'Advanced', 'Master'].map(k => ({
         title: k,
         bots: groups[k] || []
     }));
  }, []);

  return (
    <div className="bot-dashboard">
      <div className="dashboard-header">
        <h1>Choose Your Opponent</h1>
        <p>Challenge our AI personalities, from beginner to grandmaster.</p>
      </div>
      
      <div className="categories-container">
        {categories.map(category => (
            category.bots.length > 0 && (
              <div key={category.title} className="bot-category">
                <h2 className="category-title">{category.title}</h2>
                <div className="bot-grid">
                  {category.bots.map(bot => (
                    <BotCard 
                      key={bot.id} 
                      bot={bot} 
                      onSelect={onSelectBot} 
                    />
                  ))}
                </div>
              </div>
            )
        ))}
      </div>
    </div>
  );
};

export default BotDashboard;
