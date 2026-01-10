import React from 'react';
import LearningModule from '../components/LearningModule';
import '../styles/board.css'; // Ensure styles are present

const LearnPage = ({ onBack }) => {
  return (
    <LearningModule onBack={onBack} />
  );
};

export default LearnPage;
