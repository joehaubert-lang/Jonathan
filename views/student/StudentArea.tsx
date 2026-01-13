
import React, { useState, useEffect } from 'react';
import StudentHome from './StudentHome';
import StudentWorkouts from './StudentWorkouts';
import StudentEvaluations from './StudentEvaluations';
import StudentFinancial from './StudentFinancial';
import StudentExtraWorkouts from './StudentExtraWorkouts';
import StudentProgress from './StudentProgress';
import StudentProfileModal from '../../components/StudentProfileModal';
import { supabase } from '../../services/supabaseClient';
import { ArrowLeft } from 'lucide-react';

const StudentArea: React.FC = () => {
    const [currentView, setCurrentView] = useState('home');
    const [student, setStudent] = useState<any>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [hasFinancialAlert, setHasFinancialAlert] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            setLoading(true);
            // Hardcoded fetch for testing as requested
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .ilike('name', 'Jonathan ha%')
                .single();

            if (error) {
                console.error('Error fetching student:', error);
            } else if (data) {
                setStudent(data);
                // Check for truly overdue records (status not paid AND due_date < today)
                const today = new Date().toISOString().split('T')[0];
                const { data: records } = await supabase
                    .from('financial_records')
                    .select('status, due_date')
                    .eq('student_id', data.id)
                    .neq('status', 'paid');

                const isOverdue = records?.some(r => r.status === 'overdue' || r.due_date < today);
                setHasFinancialAlert(!!isOverdue);
            }
            setLoading(false);
        };
        fetchStudent();
    }, []);

    const renderView = () => {
        if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Carregando perfil...</div>;
        if (!student) return <div className="flex h-screen items-center justify-center text-slate-500">Aluno não encontrado.</div>;

        switch (currentView) {
            case 'home':
                return (
                    <StudentHome
                        student={student}
                        onNavigate={setCurrentView}
                        onOpenProfile={() => setIsProfileModalOpen(true)}
                        hasFinancialAlert={hasFinancialAlert}
                    />
                );
            case 'workouts':
                return <StudentWorkouts student={student} onBack={() => setCurrentView('home')} />;
            // Placeholder for other views
            case 'evaluations':
                return <StudentEvaluations student={student} onBack={() => setCurrentView('home')} />;
            case 'financial':
                return <StudentFinancial student={student} onBack={() => setCurrentView('home')} />;
            case 'extra':
                return <StudentExtraWorkouts student={student} onBack={() => setCurrentView('home')} />;
            case 'progress':
                return <StudentProgress student={student} onBack={() => setCurrentView('home')} />;
            case 'files':
                return (
                    <div className="p-4 space-y-6">
                        <header className="flex items-center gap-4">
                            <button onClick={() => setCurrentView('home')} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-2xl font-bold text-slate-800">Seus Arquivos</h1>
                        </header>
                        <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center text-slate-500">
                            Nenhum arquivo compartilhado ainda.
                        </div>
                    </div>
                );
            default: return <div className="p-4">Página: {currentView} <button onClick={() => setCurrentView('home')} className="mt-4 text-indigo-600 block">Voltar</button></div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Standard Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4">
                <div className="flex items-center gap-3">
                    {currentView !== 'home' && (
                        <button
                            onClick={() => setCurrentView('home')}
                            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold italic">F</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fit<span className="text-indigo-600">Flow</span></h1>
                    </div>
                </div>

                <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="h-9 w-9 rounded-full border border-slate-200 overflow-hidden hover:ring-2 hover:ring-indigo-100 transition-all focus:outline-none"
                >
                    <img
                        src={student?.photo || "https://ui-avatars.com/api/?name=" + student?.name}
                        alt="Profile"
                        className="h-full w-full object-cover"
                    />
                </button>
            </header>

            <main className="flex-1 pb-20">
                {renderView()}
            </main>

            <StudentProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                student={student}
                onSaveSuccess={(updated) => setStudent({ ...updated })}
            />
        </div>
    );
};

export default StudentArea;
