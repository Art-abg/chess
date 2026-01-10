import React from 'react';
import Landing from '../components/Landing';

const HomePage = ({ onStartPlay, onStartLearn }) => {
  return (
    <Landing 
      onStartPlay={onStartPlay} 
      onStartLearn={onStartLearn} 
    />
  );
};

export default HomePage;
