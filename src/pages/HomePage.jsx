import React from 'react';
import BotDashboard from '../components/home/BotDashboard';
import { useGame } from '../context/GameContext';

const HomePage = ({ onStartPlay }) => {
  const { setCurrentBotId } = useGame();

  const handleBotSelect = (botId) => {
    setCurrentBotId(botId);
    onStartPlay();
  };

  return (
    <BotDashboard onSelectBot={handleBotSelect} />
  );
};

export default HomePage;
