import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';
import LearnPage from './pages/LearnPage';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  const [view, setView] = useState('home');

  return (
    <ErrorBoundary>
      <GameProvider>
        <MainLayout currentView={view} setView={setView}>
          {view === 'home' && (
            <HomePage 
              onStartPlay={() => setView('play')} 
              onStartLearn={() => setView('learn')} 
            />
          )}
          {view === 'play' && <PlayPage />}
          {view === 'learn' && <LearnPage onBack={() => setView('play')} />}
        </MainLayout>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
