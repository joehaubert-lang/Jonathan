
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Dumbbell, ChevronRight, Clock, Video, PlayCircle, ArrowLeft, Calendar } from 'lucide-react';

interface StudentWorkoutsProps {
    student: any;
    onBack: () => void;
}

const StudentWorkouts: React.FC<StudentWorkoutsProps> = ({ student, onBack }) => {
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkouts();
    }, [student]);

    const fetchWorkouts = async () => {
        setLoading(true);
        // Fetch workouts assigned to this student
        const { data, error } = await supabase
            .from('workouts')
            .select('*, exercises(*)')
            .eq('student_id', student.id)
            .eq('active', true) // Re-adding active check as WorkoutView uses it
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching workouts:', error);
        } else if (data) {
            console.log('Fetched Workouts Raw:', data);
            // Sort exercises by order_index
            const formatted = data.map((w: any) => ({
                ...w,
                exercises: w.exercises?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)) || []
            }));
            console.log('Formatted Workouts:', formatted);
            setWorkouts(formatted);
        }
        setLoading(false);
    };

    const handleWorkoutClick = (workout: any) => {
        setSelectedWorkout(workout);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Carregando seus treinos...</div>;
    }

    if (selectedWorkout) {
        // Detailed Workout View
        return (
            <div className="p-4 space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedWorkout(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{selectedWorkout.name}</h2>
                        <p className="text-sm text-slate-500">{selectedWorkout.exercises.length} exercícios</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {selectedWorkout.exercises.map((ex: any, index: number) => (
                        <div key={ex.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                                        {index + 1}
                                    </span>
                                    <h3 className="font-bold text-slate-800">{ex.name}</h3>
                                </div>
                                {ex.video_url && (
                                    <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                                        <PlayCircle size={20} />
                                    </a>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-3">
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Séries</span>
                                    <span className="font-bold text-slate-700">{ex.sets}</span>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Reps</span>
                                    <span className="font-bold text-slate-700">{ex.reps}</span>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Carga</span>
                                    <span className="font-bold text-slate-700">{ex.load ? `${ex.load}kg` : '-'}</span>
                                </div>
                            </div>
                            {ex.rest && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 justify-center">
                                    <Clock size={12} /> Descanso: {ex.rest}s
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Workout List View
    return (
        <div className="p-4 space-y-6 animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-800">Seus Treinos</h1>

            <div className="space-y-4">
                {workouts.length > 0 ? (
                    workouts.map((workout) => (
                        <button
                            key={workout.id}
                            onClick={() => handleWorkoutClick(workout)}
                            className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Dumbbell size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{workout.name}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <Calendar size={12} /> {new Date(workout.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </button>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Dumbbell size={32} />
                        </div>
                        <h3 className="font-bold text-slate-700">Nenhum treino encontrado</h3>
                        <p className="text-slate-500 text-sm mt-1">Seu treinador ainda não cadastrou sua ficha.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentWorkouts;
