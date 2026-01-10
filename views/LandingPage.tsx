import React from 'react';
import { Dumbbell, User } from 'lucide-react';

interface LandingPageProps {
    onSelectRole: (role: 'trainer' | 'student') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[0%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Logo Section */}
                <div className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="bg-indigo-600 text-white flex items-center justify-center rounded-2xl shadow-2xl shadow-indigo-500/20 ring-4 ring-indigo-50" style={{ width: '72px', height: '72px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dumbbell" style={{ width: '40px', height: '40px' }} aria-hidden="true">
                                <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"></path>
                                <path d="m2.5 21.5 1.4-1.4"></path>
                                <path d="m20.1 3.9 1.4-1.4"></path>
                                <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"></path>
                                <path d="m9.6 14.4 4.8-4.8"></path>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">FitFlow</h1>
                    </div>
                    <h2 className="text-slate-500 text-sm font-medium tracking-wide">Plataforma Integrada de Saúde e Performance</h2>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={() => onSelectRole('trainer')}
                        className="w-full bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 flex items-center gap-5 group text-left"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            <Dumbbell size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">Entrar como Treinador</h3>
                            <p className="text-slate-500 text-sm">Gerenciar alunos e treinos</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectRole('student')}
                        className="w-full bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 flex items-center gap-5 group text-left"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <User size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">Entrar como Aluno</h3>
                            <p className="text-slate-500 text-sm">Acessar treinos e saúde</p>
                        </div>
                    </button>
                </div>

                {/* Footer Links */}
                <div className="pt-8 text-center space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acesso Restrito</p>
                    <div className="flex justify-center gap-6 text-xs font-bold">
                        <button className="text-slate-400 hover:text-indigo-600 hover:underline flex items-center gap-1 transition-colors">
                            Acesso Profissional – Psicólogo
                        </button>
                        <button className="text-slate-400 hover:text-indigo-600 hover:underline flex items-center gap-1 transition-colors">
                            Acesso Profissional – Médico
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
