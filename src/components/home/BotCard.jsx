import React from 'react';
import './BotCard.css';

const BotCard = ({ bot, onSelect }) => {
  return (
    <div className="bot-card" onClick={() => onSelect(bot.id)}>
      <div className="bot-card-inner">
        <div className="avatar-wrapper">
          <img src={bot.avatar} alt={bot.name} className="bot-avatar" />
          <div className="flag">{bot.flag}</div>
        </div>
        <div className="bot-info">
          <div className="bot-header">
            <h3>{bot.name}</h3>
            <span className="elo-badge">{bot.elo}</span>
          </div>
          <p className="bot-desc">{bot.description}</p>
          <button className="play-btn">Play</button>
        </div>
      </div>
    </div>
  );
};

export default BotCard;
