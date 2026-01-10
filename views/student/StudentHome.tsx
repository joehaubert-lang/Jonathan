
import React from 'react';
import { Dumbbell, ClipboardCheck, Wallet, Flame, TrendingUp, FileText, ChevronRight } from 'lucide-react';

interface StudentHomeProps {
    onNavigate: (view: string) => void;
}

const StudentHome: React.FC<StudentHomeProps> = ({ onNavigate }) => {
    const menuItems = [
        { id: 'workouts', label: 'Treinos', icon: Dumbbell, color: 'bg-indigo-50 text-indigo-600', border: 'hover:border-indigo-200' },
        { id: 'evaluations', label: 'Avaliações', icon: ClipboardCheck, color: 'bg-blue-50 text-blue-600', border: 'hover:border-blue-200' },
        { id: 'financial', label: 'Faturas', icon: Wallet, color: 'bg-emerald-50 text-emerald-600', border: 'hover:border-emerald-200' },
        { id: 'extra', label: 'Treinos Extras', icon: Flame, color: 'bg-orange-50 text-orange-600', border: 'hover:border-orange-200' },
        { id: 'progress', label: 'Meu Progresso', icon: TrendingUp, color: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-200' },
        { id: 'files', label: 'Arquivos', icon: FileText, color: 'bg-slate-50 text-slate-600', border: 'hover:border-slate-200' },
    ];

    return (
        <div className="p-4 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Olá, Aluno! 👋</h1>
                <p className="text-slate-500">Vamos treinar hoje?</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all ${item.border} hover:shadow-md hover:-translate-y-1`}
                    >
                        <div className={`h-12 w-12 rounded-full mb-3 flex items-center justify-center ${item.color}`}>
                            <item.icon size={24} />
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Quick Stats or Promo Area could go here */}
            <div className="mt-6 p-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl text-white shadow-lg shadow-indigo-200">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">Próximo Treino</p>
                        <h3 className="text-xl font-bold mt-1">Superiores A</h3>
                    </div>
                    <button className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
