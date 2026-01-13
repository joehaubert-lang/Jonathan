
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import DashboardView from '../DashboardView';
import StudentsView from '../StudentsView';
import WorkoutView from '../WorkoutView';
import EvaluationsView from '../EvaluationsView';
import FinancialView from '../FinancialView';
import { supabase } from '../../services/supabaseClient';
import { useEffect } from 'react';

const TrainerArea: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedStudentForEval, setSelectedStudentForEval] = useState<string | null>(null);
    const [trainer, setTrainer] = useState<any>(null);

    useEffect(() => {
        fetchTrainer();
    }, []);

    const fetchTrainer = async () => {
        try {
            console.log('TrainerArea: Fetching trainers...');
            // Order by created_at to be consistent
            const { data, error } = await supabase.from('trainers').select('*').order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching trainer in TrainerArea:', error);
                return;
            }

            if (data && data.length > 0) {
                console.log(`TrainerArea: Found ${data.length} trainers. Using:`, data[0]);
                setTrainer(data[0]);
            } else {
                console.warn('TrainerArea: No trainers found in database');
            }
        } catch (err) {
            console.error('Unexpected error fetching trainer:', err);
        }
    };

    const handleNavigateToEvaluations = (studentId: string) => {
        setSelectedStudentForEval(studentId);
        setActiveTab('evaluations');
    };

    const renderView = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView trainer={trainer} />;
            case 'students': return <StudentsView onNavigateToEvaluations={handleNavigateToEvaluations} />;
            case 'workouts': return <WorkoutView />;
            case 'evaluations': return <EvaluationsView initialStudentId={selectedStudentForEval} />;
            case 'financial': return <FinancialView />;
            default: return <DashboardView trainer={trainer} />;
        }
    };

    return (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} trainer={trainer} onTrainerUpdate={fetchTrainer}>
            {renderView()}
        </Layout>
    );
};

export default TrainerArea;
