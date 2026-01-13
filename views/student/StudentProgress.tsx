
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { TrendingUp, ArrowLeft, Search, Calendar, ChevronRight, History } from 'lucide-react';

interface StudentProgressProps {
    student: any;
    onBack: () => void;
}

const StudentProgress: React.FC<StudentProgressProps> = ({ student, onBack }) => {
    const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProgressData();
    }, [student]);

    const fetchProgressData = async () => {
        setLoading(true);
        // Fetch all workouts and their exercises for this student
        const { data, error } = await supabase
            .from('workouts')
            .select(`
                id,
                name,
                created_at,
                exercises (
                    id,
                    name,
                    load,
                    sets,
                    reps
                )
            `)
            .eq('student_id', student.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching progress data:', error);
        } else if (data) {
            // Group by exercise name
            const historyMap: any = {};
            data.forEach((workout: any) => {
                workout.exercises?.forEach((ex: any) => {
                    const name = ex.name.trim();
                    if (!historyMap[name]) {
                        historyMap[name] = [];
                    }
                    historyMap[name].push({
                        date: workout.created_at,
                        workoutName: workout.name,
                        load: ex.load,
                        sets: ex.sets,
                        reps: ex.reps
                    });
                });
            });

            // Convert to array and sort by exercise name
            const formatted = Object.keys(historyMap).map(name => ({
                name,
                history: historyMap[name]
            })).sort((a, b) => a.name.localeCompare(b.name));

            setExerciseHistory(formatted);
        }
        setLoading(false);
    };

    const filteredExercises = exerciseHistory.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Carregando seu progresso...</div>;
    }

    if (selectedExercise) {
        const exercise = exerciseHistory.find(ex => ex.name === selectedExercise);
        return (
            <div className="p-4 space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedExercise(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-purple-600 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{selectedExercise}</h2>
                        <p className="text-sm text-slate-500">Histórico de Cargas</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {exercise?.history.map((entry: any, index: number) => (
                        <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                    <Calendar size={12} /> {new Date(entry.date).toLocaleDateString('pt-BR')}
                                </p>
                                <h4 className="font-bold text-slate-700">{entry.load ? `${entry.load}kg` : 'Sem carga'}</h4>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{entry.workoutName}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                    {entry.sets}x{entry.reps}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-800">Meu Progresso</h1>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar exercício..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all outline-none text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                {filteredExercises.length > 0 ? (
                    filteredExercises.map((ex) => (
                        <button
                            key={ex.name}
                            onClick={() => setSelectedExercise(ex.name)}
                            className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-all flex items-center justify-between group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 group-hover:text-purple-600 transition-colors">{ex.name}</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                        Última: {ex.history[0]?.load || '--'}kg
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="text-slate-300 group-hover:text-purple-600 transition-colors" />
                        </button>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        Nenhum exercício encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProgress;
