
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import DashboardView from '../DashboardView';
import StudentsView from '../StudentsView';
import WorkoutView from '../WorkoutView';
import EvaluationsView from '../EvaluationsView';
import FinancialView from '../FinancialView';

const TrainerArea: React.FC = () => {
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

export default TrainerArea;
