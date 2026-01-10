
import React, { useState } from 'react';
import StudentHome from './StudentHome';

const StudentArea: React.FC = () => {
    const [currentView, setCurrentView] = useState('home');

    const renderView = () => {
        switch (currentView) {
            case 'home':
                return <StudentHome onNavigate={setCurrentView} />;
            // Placeholder for other views
            case 'workouts': return <div className="p-4">Tela de Treinos (Em construção) <button onClick={() => setCurrentView('home')} className="mt-4 text-indigo-600 block">Voltar</button></div>;
            case 'evaluations': return <div className="p-4">Tela de Avaliações (Em construção) <button onClick={() => setCurrentView('home')} className="mt-4 text-indigo-600 block">Voltar</button></div>;
            default: return <div className="p-4">Página: {currentView} <button onClick={() => setCurrentView('home')} className="mt-4 text-indigo-600 block">Voltar</button></div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Simple Header for nested pages */}
            {currentView !== 'home' && (
                <header className="bg-white border-b p-4 sticky top-0 z-10 flex items-center">
                    <h1 className="font-bold text-slate-800 capitalize">{currentView}</h1>
                </header>
            )}
            {renderView()}
        </div>
    );
};

export default StudentArea;
