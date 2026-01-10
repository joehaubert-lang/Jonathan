
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardView from './views/DashboardView';
import StudentsView from './views/StudentsView';
import WorkoutView from './views/WorkoutView';
import EvaluationsView from './views/EvaluationsView';
import FinancialView from './views/FinancialView';

const App: React.FC = () => {
  console.log('App component rendering');
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'students': return <StudentsView />;
      case 'workouts': return <WorkoutView />;
      case 'evaluations': return <EvaluationsView />;
      case 'financial': return <FinancialView />;
      default: return <DashboardView />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderView()}
    </Layout>
  );
};

export default App;
