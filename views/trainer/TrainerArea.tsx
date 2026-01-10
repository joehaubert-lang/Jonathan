
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import DashboardView from '../DashboardView';
import StudentsView from '../StudentsView';
import WorkoutView from '../WorkoutView';
import EvaluationsView from '../EvaluationsView';
import FinancialView from '../FinancialView';

const TrainerArea: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedStudentForEval, setSelectedStudentForEval] = useState<string | null>(null);

    const handleNavigateToEvaluations = (studentId: string) => {
        setSelectedStudentForEval(studentId);
        setActiveTab('evaluations');
    };

    const renderView = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView />;
            case 'students': return <StudentsView onNavigateToEvaluations={handleNavigateToEvaluations} />;
            case 'workouts': return <WorkoutView />;
            case 'evaluations': return <EvaluationsView initialStudentId={selectedStudentForEval} />;
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
