
import React, { useState } from 'react';
import LandingPage from './views/LandingPage';
import TrainerArea from './views/trainer/TrainerArea';
import StudentArea from './views/student/StudentArea';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'trainer' | 'student'>('landing');

  // Simple "Router"
  switch (currentView) {
    case 'trainer':
      return <TrainerArea />;
    case 'student':
      return <StudentArea />;
    default:
      return <LandingPage onSelectRole={setCurrentView} />;
  }
};

export default App;
