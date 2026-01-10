
import React from 'react';
import { Dumbbell, User } from 'lucide-react';

interface LandingPageProps {
    onSelectRole: (role: 'trainer' | 'student') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                {/* Logo Section */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-4">
                        <div className="bg-indigo-600 text-white flex items-center justify-center rounded-lg shadow-lg shadow-indigo-200" style={{ width: '72px', height: '72px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dumbbell" style={{ width: '64px', height: '64px' }} aria-hidden="true">
                                <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path>
                                <path d="m2.5 21.5 1.4-1.4"></path>
                                <path d="m20.1 3.9 1.4-1.4"></path>
                                <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path>
                                <path d="m9.6 14.4 4.8-4.8"></path>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">FitFlow</h1>
                    </div>
                    <h2 className="text-slate-500 text-sm font-medium">Plataforma Integrada de Saúde e Performance</h2>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={() => onSelectRole('trainer')}
                        className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex items-center gap-4 group text-left"
                    >
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Dumbbell size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Entrar como Treinador</h3>
                            <p className="text-slate-400 text-sm">Gerenciar alunos e treinos</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectRole('student')}
                        className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-4 group text-left"
                    >
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Entrar como Aluno</h3>
                            <p className="text-slate-400 text-sm">Acessar treinos e saúde</p>
                        </div>
                    </button>
                </div>

                {/* Footer Links */}
                <div className="pt-8 text-center space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acesso Restrito</p>
                    <div className="flex justify-center gap-6 text-xs font-medium">
                        <button className="text-blue-600 hover:underline flex items-center gap-1">
                            Acesso Profissional – Psicólogo
                        </button>
                        <button className="text-blue-600 hover:underline flex items-center gap-1">
                            Acesso Profissional – Médico
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
