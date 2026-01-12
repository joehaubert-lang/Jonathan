
import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Trash2, Bookmark, Search, Clock, PlusCircle, Save, Dumbbell, RotateCcw, User, X, ChevronLeft, AlertCircle, List, Send, PlayCircle, Pencil, Link as LinkIcon, Video, Calendar, CheckCircle2, Copy } from 'lucide-react';
import { generateWorkoutSplit } from '../services/geminiService';

import { supabase } from '../services/supabaseClient';
import { Student, Workout, Exercise } from '../types';

// Biblioteca de Vídeos Padrão da Plataforma (IDs Reais do YouTube para demonstração)
const EXERCISE_VIDEO_LIBRARY: Record<string, string> = {
  'Supino Reto': 'https://www.youtube.com/watch?v=sqOw2Y6uDWQ',
  'Supino Inclinado': 'https://www.youtube.com/watch?v=Z169n7z6J6g',
  'Crucifixo': 'https://www.youtube.com/watch?v=3u_S9Y_q9s0',
  'Cross Over': 'https://www.youtube.com/watch?v=H75ImvW9D-A',
  'Flexão de Braços': 'https://www.youtube.com/watch?v=pDLPmX7_Yms',
  'Puxada Alta': 'https://www.youtube.com/watch?v=0pL40fA5o0Q',
  'Remada Curvada': 'https://www.youtube.com/watch?v=NqpWZuNInS0',
  'Remada Baixa': 'https://www.youtube.com/watch?v=vV_XOf-t9uA',
  'Pull Over': 'https://www.youtube.com/watch?v=FK_K9O7v3zU',
  'Levantamento Terra': 'https://www.youtube.com/watch?v=XzL9pL1W0m4',
  'Agachamento Livre': 'https://www.youtube.com/watch?v=U3HlEF_E9fo',
  'Leg Press 45': 'https://www.youtube.com/watch?v=q6fG3V3Xm-c',
  'Extensora': 'https://www.youtube.com/watch?v=L5o3hI0sS-I',
  'Flexora': 'https://www.youtube.com/watch?v=pWnK5v_5vE8',
  'Afundo': 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
  'Elevação Pélvica': 'https://www.youtube.com/watch?v=aG935FqY_Lg',
  'Desenvolvimento': 'https://www.youtube.com/watch?v=0W8o_T9wX6w',
  'Elevação Lateral': 'https://www.youtube.com/watch?v=WJm9zA2NY9w',
  'Elevação Frontal': 'https://www.youtube.com/watch?v=-t7fuZ0KhDA',
  'Crucifixo Invertido': 'https://www.youtube.com/watch?v=9_XWk8G6U_U',
  'Rosca Direta': 'https://www.youtube.com/watch?v=LY1V6HD_v6Q',
  'Rosca Martelo': 'https://www.youtube.com/watch?v=CFBzqfVuqO0',
  'Tríceps Pulley': 'https://www.youtube.com/watch?v=pD1Y_E-Fm2k',
  'Tríceps Testa': 'https://www.youtube.com/watch?v=9S_X6UeE6fE',
  'Tríceps Corda': 'https://www.youtube.com/watch?v=XzL9pL1W0m4',
};

const WEEK_DAYS = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
];

const PREDEFINED_EXERCISES = [
  { category: 'Peito', items: ['Supino Reto', 'Supino Inclinado', 'Crucifixo', 'Cross Over', 'Flexão de Braços'] },
  { category: 'Costas', items: ['Puxada Alta', 'Remada Curvada', 'Remada Baixa', 'Pull Over', 'Levantamento Terra'] },
  { category: 'Pernas', items: ['Agachamento Livre', 'Leg Press 45', 'Extensora', 'Flexora', 'Afundo', 'Elevação Pélvica'] },
  { category: 'Ombros', items: ['Desenvolvimento', 'Elevação Lateral', 'Elevação Frontal', 'Crucifixo Invertido'] },
  { category: 'Braços', items: ['Rosca Direta', 'Rosca Martelo', 'Tríceps Pulley', 'Tríceps Testa', 'Tríceps Corda'] },
];

const WorkoutView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ai_creator' | 'manual_builder' | 'library'>('ai_creator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<any[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editWorkout, setEditWorkout] = useState<any | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

  // Supabase State
  const [students, setStudents] = useState<Student[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
  const [workoutToApply, setWorkoutToApply] = useState<any | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Initial Fetch
  useEffect(() => {
    fetchStudents();
    fetchWorkouts();
    fetchExerciseLibrary();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('id, name').order('name');
    if (data) setStudents(data as Student[]);
  };

  const fetchWorkouts = async () => {
    setIsLoading(true);
    // Fetch workouts and their exercises
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workouts:', error);
    } else if (data) {
      // Map exercises array to proper structure for UI
      const formatted = data.map((w: any) => ({
        ...w,
        focus: w.goal, // DB uses 'goal', UI uses 'focus' (keeping UI prop for now)
        exerciseCount: w.exercises?.length || 0,
        exercises: w.exercises?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)).map((ex: any) => ({
          ...ex,
          weight: ex.load, // Map DB 'load' to UI 'weight'
          muscleGroup: ex.muscle_group, // Map DB 'muscle_group' to UI 'muscleGroup'
          videoUrl: ex.video_url // Map DB 'video_url' to UI 'videoUrl'
        })) || []
      }));
      setSavedWorkouts(formatted);
    }
    setIsLoading(false);
  };

  const fetchExerciseLibrary = async () => {
    const { data } = await supabase.from('exercise_library').select('*').order('name');
    if (data) setExerciseLibrary(data);
  };

  const handleApplyWorkout = async () => {
    if (!selectedStudentId || !workoutToApply) return;

    // Save to DB
    try {
      // 1. Create Workout
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert([{
          student_id: selectedStudentId,
          name: workoutToApply.name,
          goal: workoutToApply.focus || workoutToApply.goal,
          active: true
        }])
        .select()
        .single();

      if (workoutError) throw workoutError;

      // 2. Create Exercises
      if (newWorkout && workoutToApply.exercises && workoutToApply.exercises.length > 0) {
        const exercisesToInsert = workoutToApply.exercises.map((ex: any, index: number) => ({
          workout_id: newWorkout.id,
          name: ex.name,
          sets: ex.sets ? parseInt(ex.sets) : 3,
          reps: ex.reps?.toString(),
          load: ex.weight || ex.load,
          rest: ex.rest,
          video_url: ex.videoUrl || ex.video_url, // Carry over video URL when applying template
          order_index: index
        }));

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert);

        if (exercisesError) throw exercisesError;
      }

      alert('Treino aplicado com sucesso!');
      setIsApplyModalOpen(false);
      setWorkoutToApply(null);
      setSelectedStudentId('');
      fetchWorkouts(); // Refresh list

    } catch (error) {
      console.error('Error applying workout:', error);
      alert('Erro ao aplicar treino.');
    }
  };

  const ApplyModal = () => {
    if (!isApplyModalOpen || !workoutToApply) return null;

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative">
          <button
            onClick={() => setIsApplyModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Aplicar Modelo de Treino</h3>
            <p className="text-sm text-slate-500 mt-1 px-4">Selecione o aluno que receberá uma cópia deste treino.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Selecione o Aluno</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 font-medium text-slate-600"
              >
                <option value="">Selecione...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={handleApplyWorkout}
                disabled={!selectedStudentId}
                className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all"
              >
                Confirmar e Aplicar
              </button>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const [form, setForm] = useState({
    goal: 'Hipertrofia',
    level: 'Intermediário',
    selectedDays: ['seg', 'qua', 'sex'] as string[]
  });

  const [manualWorkout, setManualWorkout] = useState({
    name: '',
    focus: 'Geral',
    level: 'Intermediário',
    exercises: [{ name: '', sets: 3, reps: '12', weight: '', rest: '60s', videoUrl: '', muscleGroup: 'Geral' }]
  });

  const toggleDay = (dayId: string) => {
    setForm(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter(d => d !== dayId)
        : [...prev.selectedDays, dayId]
    }));
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    } catch (e) {
      return null;
    }
  };

  const handleAISuggestion = async () => {
    if (form.selectedDays.length === 0) return;
    setIsGenerating(true);
    try {
      const result = await generateWorkoutSplit(form.goal, form.level, form.selectedDays.length);

      const enrichedResult = result.map((dayPlan: any) => ({
        ...dayPlan,
        exercises: dayPlan.exercises.map((ex: any) => ({
          ...ex,
          weight: '', // IA geralmente não prescreve carga inicial, deixamos em branco
          videoUrl: ex.videoUrl || EXERCISE_VIDEO_LIBRARY[ex.name] || ''
        }))
      }));

      setGeneratedWorkouts(enrichedResult);
    } catch (error) {
      console.error("Erro ao gerar treino:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = (workoutToEdit: any = selectedWorkout) => {
    if (!workoutToEdit) return;
    setEditWorkout(JSON.parse(JSON.stringify(workoutToEdit)));
    setSelectedWorkout(workoutToEdit); // Ensure we switch to detail view
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editWorkout || !editWorkout.name) return;

    try {
      // 1. Update Workout Details
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          name: editWorkout.name,
          goal: editWorkout.focus // mapping back to DB column
        })
        .eq('id', editWorkout.id);

      if (workoutError) throw workoutError;

      // 2. Update Exercises (Strategy: Delete all and Re-insert for simplicity, or upsert. Re-insert is safer for order)
      // For this MVP, let's just update the local state to reflect changes or implement a full re-sync.
      // Better strategy: Delete all old exercises for this workout, then insert the new list.

      const { error: deleteError } = await supabase.from('exercises').delete().eq('workout_id', editWorkout.id);
      if (deleteError) throw deleteError;

      if (editWorkout.exercises.length > 0) {
        const exercisesToInsert = editWorkout.exercises.map((ex: any, index: number) => ({
          workout_id: editWorkout.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          load: ex.weight, // UI uses weight, DB uses load
          rest: ex.rest,
          order_index: index,
          observation: ex.observation // Persist observation if exists
        }));

        const { error: insertError } = await supabase.from('exercises').insert(exercisesToInsert);
        if (insertError) throw insertError;
      }

      alert('Treino atualizado!');
      fetchWorkouts(); // Reload fresh data
      setIsEditing(false);
      setEditWorkout(null);
      setSelectedWorkout(null);

    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Erro ao atualizar treino.');
    }
  };

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutToDelete);

      if (error) throw error;

      setSavedWorkouts(prev => prev.filter(w => w.id !== workoutToDelete));
      setWorkoutToDelete(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Erro ao excluir treino.');
    }
  };

  const filteredWorkouts = savedWorkouts.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.focus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const VideoModal = () => {
    if (!activeVideoUrl) return null;
    const embedUrl = getEmbedUrl(activeVideoUrl);

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <button
            onClick={() => setActiveVideoUrl(null)}
            className="absolute top-4 right-4 z-[110] h-10 w-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all border border-white/20"
          >
            <X size={20} />
          </button>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Exercise Demo"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-4">
              <AlertCircle size={48} className="text-orange-500" />
              <p className="font-bold">Vídeo Indisponível</p>
              <button onClick={() => setActiveVideoUrl(null)} className="px-6 py-2 bg-white/10 rounded-xl">Voltar</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DeleteModal = () => {
    if (!workoutToDelete) return null;
    const workout = savedWorkouts.find(w => w.id === workoutToDelete);

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Excluir Treino?</h3>
              <p className="text-sm text-slate-500 mt-1">Você está prestes a remover o treino <span className="font-bold text-slate-700">"{workout?.name}"</span>. Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3 w-full mt-4">
              <button
                onClick={() => setWorkoutToDelete(null)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteWorkout}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-100 transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedWorkout) {

    if (isEditing) {
      return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
          <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-start gap-4 mb-6">
              <button onClick={() => { setIsEditing(false); setEditWorkout(null); }} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                <ChevronLeft size={24} />
              </button>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={editWorkout.name}
                  onChange={(e) => setEditWorkout({ ...editWorkout, name: e.target.value })}
                  className="w-full text-2xl font-black text-slate-800 outline-none border-b-2 border-transparent focus:border-indigo-100 bg-transparent transition-all placeholder:text-slate-300"
                  placeholder="Nome do Treino"
                />
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${editWorkout.source === 'ai' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {editWorkout.source === 'ai' ? 'IA ✨' : 'Manual'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => { setIsEditing(false); setEditWorkout(null); }} className="font-bold text-slate-400 hover:text-slate-600 px-4">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Salvar
              </button>
            </div>
          </header>

          <div>
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest mb-4 px-2">
              <List size={20} className="text-indigo-600" /> Grade de Exercícios
            </h3>
            <div className="space-y-4">
              {editWorkout.exercises.map((ex: any, i: number) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm relative group">
                  <div className="grid gap-6 md:grid-cols-12">
                    <div className="md:col-span-12">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Exercício {i + 1}</label>
                      <div className="relative">
                        <input
                          list={`exercises-list-${i}`}
                          type="text"
                          value={ex.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...editWorkout.exercises];
                            updated[i].name = val;

                            // Auto-fill from library if match found
                            const match = exerciseLibrary.find(lib => lib.name === val);
                            if (match) {
                              if (!updated[i].muscleGroup || updated[i].muscleGroup === 'Geral') updated[i].muscleGroup = match.muscle_group;
                              if (!updated[i].videoUrl) updated[i].videoUrl = match.video_url;
                            }

                            setEditWorkout({ ...editWorkout, exercises: updated });
                          }}
                          placeholder="Digite ou selecione um exercício..."
                          className="w-full h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                        />
                        <datalist id={`exercises-list-${i}`}>
                          {exerciseLibrary.map((lib) => (
                            <option key={lib.id} value={lib.name} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Séries</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => {
                            const updated = [...editWorkout.exercises];
                            updated[i].sets = parseInt(e.target.value) || 0;
                            setEditWorkout({ ...editWorkout, exercises: updated });
                          }}
                          className="w-full h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Reps</label>
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={(e) => {
                            const updated = [...editWorkout.exercises];
                            updated[i].reps = e.target.value;
                            setEditWorkout({ ...editWorkout, exercises: updated });
                          }}
                          className="w-full h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Peso (kg)</label>
                        <input
                          type="text"
                          placeholder="Opcional"
                          value={ex.weight}
                          onChange={(e) => {
                            const updated = [...editWorkout.exercises];
                            updated[i].weight = e.target.value;
                            setEditWorkout({ ...editWorkout, exercises: updated });
                          }}
                          className="w-full h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Descanso</label>
                        <input
                          type="text"
                          value={ex.rest}
                          onChange={(e) => {
                            const updated = [...editWorkout.exercises];
                            updated[i].rest = e.target.value;
                            setEditWorkout({ ...editWorkout, exercises: updated });
                          }}
                          className="w-full h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Video URL Input - Full Width */}
                    <div className="md:col-span-12">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <LinkIcon size={14} />
                        </div>
                        <input
                          type="text"
                          placeholder="URL do Vídeo Youtube (Vazio usa o padrão se existir)"
                          value={ex.videoUrl || ''}
                          onChange={(e) => {
                            const updated = [...editWorkout.exercises];
                            updated[i].videoUrl = e.target.value;
                            setEditWorkout({ ...editWorkout, exercises: updated });
                          }}
                          className="w-full h-10 rounded-lg border-b border-slate-100 bg-slate-50 pl-9 pr-4 text-xs font-medium text-slate-600 outline-none focus:bg-white focus:border-indigo-200 transition-all placeholder:text-slate-400"
                        />
                        {ex.videoUrl && (
                          <button
                            onClick={() => {
                              const updated = [...editWorkout.exercises];
                              updated[i].videoUrl = '';
                              setEditWorkout({ ...editWorkout, exercises: updated });
                            }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={() => {
                      const updated = editWorkout.exercises.filter((_: any, idx: number) => idx !== i);
                      setEditWorkout({ ...editWorkout, exercises: updated });
                    }}
                    className="absolute top-6 right-6 text-slate-300 hover:text-red-500 p-2 rounded-xl transition-all"
                    title="Remover exercício"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setEditWorkout({ ...editWorkout, exercises: [...editWorkout.exercises, { name: '', sets: 3, reps: '12', weight: '', rest: '60s', muscleGroup: 'Geral', videoUrl: '' }] })}
                className="w-full py-5 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-400 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-xs"
              >
                <PlusCircle size={18} /> Adicionar Novo Exercício
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default Read-Only View
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
        <VideoModal />
        <ApplyModal />
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedWorkout(null); setIsEditing(false); }} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 border border-slate-100">
              <ChevronLeft size={24} />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-800 truncate">{selectedWorkout.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{selectedWorkout.source === 'ai' ? 'IA ✨' : 'MANUAL 👤'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => startEditing()} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100"><Pencil size={16} /> Editar</button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider px-2"><List size={18} className="text-indigo-600" /> Grade de Exercícios</h3>
            <div className="grid gap-3">
              {selectedWorkout.exercises.map((ex: any, i: number) => (
                <div key={i} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Left: Number & Icon */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-sm font-black text-indigo-600 border border-indigo-100 shadow-sm">
                        {i + 1}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Title & Video */}
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-base truncate">{ex.name}</h4>
                          {ex.videoUrl && (
                            <button onClick={() => setActiveVideoUrl(ex.videoUrl)} className="text-indigo-600 hover:scale-110 transition-transform bg-indigo-50 rounded-full p-1">
                              <PlayCircle size={16} />
                            </button>
                          )}
                        </div>

                        {/* Stats Badge Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          {ex.muscleGroup && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wide">{ex.muscleGroup}</span>}

                          {/* Rest */}
                          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-600">{ex.rest || '60s'}</span>
                          </div>

                          {/* Weight Display - Now more prominent */}
                          {ex.weight ? (
                            <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                              <Dumbbell size={12} className="text-indigo-500" />
                              <span className="text-[10px] font-black text-indigo-700">{ex.weight}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-dashed border-slate-200">
                              <Dumbbell size={12} className="text-slate-300" />
                              <span className="text-[10px] font-medium text-slate-400">Sem carga</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Sets x Reps (Big & Bold) */}
                    <div className="flex items-center justify-end pl-4 border-l border-slate-100 sm:border-l-0 sm:pl-0">
                      <div className="text-right min-w-[80px]">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sets x Reps</p>
                        <div className="text-2xl font-black text-slate-800 tabular-nums leading-none">
                          {ex.sets} <span className="text-indigo-400 text-lg">×</span> {ex.reps}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-2xl sticky top-24">
              <h4 className="font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest text-indigo-400"><Clock size={16} /> Resumo</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10"><span className="text-[10px] font-bold text-slate-400 uppercase">Objetivo</span><span className="text-xs font-black">{selectedWorkout.focus}</span></div>
                <div className="flex justify-between items-center py-2 border-b border-white/10"><span className="text-[10px] font-bold text-slate-400 uppercase">Frequência</span><span className="text-xs font-black">{selectedWorkout.source === 'ai' ? 'Variada' : 'Manual'}</span></div>
                <div className="flex justify-between items-center py-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Volume Total</span><span className="text-xs font-black">{selectedWorkout.exercises.length} Exercícios</span></div>
              </div>
              <button onClick={() => { setWorkoutToApply(selectedWorkout); setIsApplyModalOpen(true); }} className="w-full mt-8 py-4 bg-indigo-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20"><Send size={18} /> Prescrever ao Aluno</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VideoModal />
      <DeleteModal />
      <ApplyModal />
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h2 className="text-2xl font-bold text-slate-800">Treinos</h2><p className="text-slate-500">Inteligência Artificial na sua prescrição.</p></div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveSubTab('ai_creator')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'ai_creator' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Treino IA</button>
          <button onClick={() => setActiveSubTab('manual_builder')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'manual_builder' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Montar</button>
          <button onClick={() => setActiveSubTab('library')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'library' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Biblioteca</button>
        </div>
      </header>

      {activeSubTab === 'ai_creator' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {generatedWorkouts.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm border-b-4 border-b-indigo-500">
              <div className="flex flex-col gap-6">
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Sparkles size={18} /></div>
                    <h3 className="font-bold text-slate-800">Parâmetros Inteligentes</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Objetivo Principal</label>
                      <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}><option>Hipertrofia</option><option>Emagrecimento</option><option>Força Máxima</option><option>Condicionamento</option></select>
                    </div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nível do Aluno</label>
                      <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Calendar size={14} className="text-indigo-500" /> Dias de Treino na Semana
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {WEEK_DAYS.map(day => (
                        <button
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          className={`flex-1 min-w-[50px] py-2.5 rounded-xl font-bold transition-all border text-xs ${form.selectedDays.includes(day.id)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
                            }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAISuggestion}
                    disabled={isGenerating || form.selectedDays.length === 0}
                    className="w-full md:w-64 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-black text-white shadow-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                  >
                    {isGenerating ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <><Sparkles size={20} /> Gerar Treino IA</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="col-span-full flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center"><CheckCircle2 size={24} /></div>
                  <div>
                    <p className="text-xs font-black text-indigo-400 uppercase">Sugestão Gerada</p>
                    <p className="text-sm font-bold text-indigo-900">{form.goal} • {form.selectedDays.length} Dias selecionados</p>
                  </div>
                </div>
                <button onClick={() => setGeneratedWorkouts([])} className="text-indigo-600 hover:text-indigo-800 p-2 rounded-xl hover:bg-indigo-100 transition-all"><RotateCcw size={20} /></button>
              </div>

              {generatedWorkouts.map((dayPlan, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="bg-slate-900 p-4 text-white">
                    <span className="text-[10px] font-black uppercase text-indigo-400">{dayPlan.day}</span>
                    <h4 className="font-bold truncate">{dayPlan.focus}</h4>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {dayPlan.exercises.map((ex: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 group hover:bg-slate-50 transition-colors">
                        <div className="h-6 w-6 shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-[11px] font-bold text-slate-800 truncate">{ex.name}</h5>
                            {ex.videoUrl && (
                              <button onClick={() => setActiveVideoUrl(ex.videoUrl)} className="text-indigo-600 hover:scale-110 transition-transform bg-indigo-50 rounded-full p-0.5">
                                <PlayCircle size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="col-span-full flex justify-center pt-8 pb-12">
                <button onClick={async () => {
                  setIsLoading(true);
                  try {
                    // 1. Create Workout Template
                    const { data: newWorkout, error: workoutError } = await supabase
                      .from('workouts')
                      .insert([{
                        name: `IA: ${form.goal} (${form.selectedDays.length} dias)`,
                        goal: form.goal,
                        active: true,
                        student_id: null, // Template
                        source: 'ai'
                      }])
                      .select()
                      .single();

                    if (workoutError) throw workoutError;

                    // 2. Create Exercises
                    if (newWorkout && generatedWorkouts.length > 0) {
                      // Flatten the day plans into a single exercise list, adding day markers
                      const exercisesToInsert = generatedWorkouts.flatMap((dayPlan, dayIdx) =>
                        dayPlan.exercises.map((ex: any, exIdx: number) => ({
                          workout_id: newWorkout.id,
                          name: ex.name,
                          sets: 3, // AI default
                          reps: '10-12', // AI default
                          order_index: (dayIdx * 100) + exIdx, // Simple ordering to keep days separate visually
                          observation: `Dia: ${dayPlan.day} - Foco: ${dayPlan.focus}`,
                          muscle_group: 'Geral', // Default for AI exercises since we don't strictly categorize them yet
                          video_url: ex.videoUrl // Save AI generated video URL
                        }))
                      );

                      const { error: exercisesError } = await supabase
                        .from('exercises')
                        .insert(exercisesToInsert);

                      if (exercisesError) throw exercisesError;
                    }

                    alert('Treino gerado salvo na Biblioteca!');
                    setGeneratedWorkouts([]);
                    setActiveSubTab('library');
                    fetchWorkouts();

                  } catch (error: any) {
                    console.error('Error saving AI workout:', error);
                    alert(`Erro ao salvar treino gerado: ${error.message || JSON.stringify(error)}`);
                  } finally {
                    setIsLoading(false);
                  }
                }} className="flex items-center gap-3 bg-indigo-600 px-10 py-5 rounded-2xl text-white font-black shadow-2xl hover:bg-indigo-700 transition-all active:scale-95">
                  {isLoading ? 'Salvando...' : <><Save size={24} /> Salvar na Biblioteca</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'manual_builder' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest"><PlusCircle size={20} className="text-indigo-600" /> Prescrição Manual</h3>
              <button onClick={() => setManualWorkout({ ...manualWorkout, exercises: [{ name: '', sets: 3, reps: '12', weight: '', rest: '60s', videoUrl: '', muscleGroup: 'Geral' }] })} className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-all"><RotateCcw size={12} /> Limpar Tudo</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título do Treino</label>
                <input type="text" placeholder="Ex: Hipertrofia A - Peito/Tríceps" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={manualWorkout.name} onChange={(e) => setManualWorkout({ ...manualWorkout, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Foco / Objetivo</label>
                <input type="text" placeholder="Ex: Força Máxima" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={manualWorkout.focus} onChange={(e) => setManualWorkout({ ...manualWorkout, focus: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              {manualWorkout.exercises.map((ex, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 relative group">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exercício {i + 1}</label>
                      <div className="relative">
                        <input
                          list={`exercises-list-manual-${i}`}
                          type="text"
                          value={ex.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...manualWorkout.exercises];
                            updated[i].name = val;

                            // Auto-fill from library if match found
                            const match = exerciseLibrary.find(lib => lib.name === val);
                            if (match) {
                              if (!updated[i].muscleGroup || updated[i].muscleGroup === 'Geral') updated[i].muscleGroup = match.muscle_group;
                              if (!updated[i].videoUrl) updated[i].videoUrl = match.video_url;
                            }

                            setManualWorkout({ ...manualWorkout, exercises: updated });
                          }}
                          placeholder="Digite ou selecione..."
                          className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 placeholder:font-normal placeholder:text-slate-400"
                        />
                        <datalist id={`exercises-list-manual-${i}`}>
                          {exerciseLibrary.map((lib) => (
                            <option key={lib.id} value={lib.name} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:w-[400px]">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Séries</label>
                        <input type="number" className="w-full bg-white rounded-xl border border-slate-200 px-3 py-3 font-bold text-sm" value={ex.sets} onChange={(e) => {
                          const updated = [...manualWorkout.exercises]; updated[i].sets = parseInt(e.target.value) || 0; setManualWorkout({ ...manualWorkout, exercises: updated });
                        }} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Reps</label>
                        <input type="text" className="w-full bg-white rounded-xl border border-slate-200 px-3 py-3 font-bold text-sm" value={ex.reps} onChange={(e) => {
                          const updated = [...manualWorkout.exercises]; updated[i].reps = e.target.value; setManualWorkout({ ...manualWorkout, exercises: updated });
                        }} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Peso (kg)</label>
                        <input type="text" className="w-full bg-white rounded-xl border border-slate-200 px-3 py-3 font-bold text-sm" placeholder="Opcional" value={ex.weight} onChange={(e) => {
                          const updated = [...manualWorkout.exercises]; updated[i].weight = e.target.value; setManualWorkout({ ...manualWorkout, exercises: updated });
                        }} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Descanso</label>
                        <input type="text" className="w-full bg-white rounded-xl border border-slate-200 px-3 py-3 font-bold text-sm" value={ex.rest} onChange={(e) => {
                          const updated = [...manualWorkout.exercises]; updated[i].rest = e.target.value; setManualWorkout({ ...manualWorkout, exercises: updated });
                        }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 flex-1">
                      <LinkIcon size={14} className="text-indigo-400 shrink-0" />
                      <input type="text" placeholder="URL do Vídeo Youtube (Vazio usa o padrão se existir)" className="flex-1 bg-transparent text-xs font-medium border-b border-slate-200 outline-none focus:border-indigo-400 transition-all" value={ex.videoUrl || ''} onChange={(e) => {
                        const updated = [...manualWorkout.exercises]; updated[i].videoUrl = e.target.value; setManualWorkout({ ...manualWorkout, exercises: updated });
                      }} />
                    </div>
                    <button onClick={() => {
                      const updated = manualWorkout.exercises.filter((_, idx) => idx !== i); setManualWorkout({ ...manualWorkout, exercises: updated });
                    }} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}

              <button onClick={() => setManualWorkout({ ...manualWorkout, exercises: [...manualWorkout.exercises, { name: '', sets: 3, reps: '12', weight: '', rest: '60s', muscleGroup: 'Geral', videoUrl: '' }] })} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <PlusCircle size={16} /> Adicionar Novo Exercício
              </button>
            </div>

            <button onClick={async () => {
              if (!manualWorkout.name) return alert('Dê um nome ao treino!');

              setIsLoading(true);
              try {
                // 1. Create Workout Template (student_id is null)
                const { data: newWorkout, error: workoutError } = await supabase
                  .from('workouts')
                  .insert([{
                    name: manualWorkout.name,
                    goal: manualWorkout.focus,
                    active: true,
                    student_id: null // Explicitly null for Templates
                  }])
                  .select()
                  .single();

                if (workoutError) throw workoutError;

                // 2. Create Exercises
                if (newWorkout && manualWorkout.exercises.length > 0) {
                  const exercisesToInsert = manualWorkout.exercises.map((ex, index) => ({
                    workout_id: newWorkout.id,
                    name: ex.name,
                    sets: ex.sets ? parseInt(ex.sets as any) : 3,
                    reps: ex.reps,
                    load: ex.weight,
                    rest: ex.rest,
                    muscle_group: ex.muscleGroup || 'Geral', // Added muscle_group
                    video_url: ex.videoUrl, // Added video_url persistence
                    order_index: index
                  }));

                  const { error: exercisesError } = await supabase
                    .from('exercises')
                    .insert(exercisesToInsert as any); // Type assertion if needed until types.ts is updated

                  if (exercisesError) throw exercisesError;
                }

                alert('Modelo de treino salvo na Biblioteca!');
                setManualWorkout({ name: '', focus: 'Geral', level: 'Intermediário', exercises: [{ name: '', sets: 3, reps: '12', weight: '', rest: '60s', videoUrl: '', muscleGroup: 'Geral' }] });
                setActiveSubTab('library');
                fetchWorkouts();

              } catch (error: any) {
                console.error('Error saving workout template:', error);
                alert(`Erro ao salvar modelo: ${error.message || JSON.stringify(error)}`);
              } finally {
                setIsLoading(false);
              }
            }} className="w-full mt-8 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black shadow-2xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
              {isLoading ? 'Salvando...' : <><Save size={20} /> Salvar como Modelo na Biblioteca</>}
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'library' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar na biblioteca..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="group relative rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-indigo-300 transition-all min-h-[160px] flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10 md:opacity-0 md:group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => { e.stopPropagation(); setWorkoutToApply(workout); setIsApplyModalOpen(true); }}
                    className="p-2 text-slate-300 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Aplicar Treino"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEditing(workout); }}
                    className="p-2 text-slate-300 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setWorkoutToDelete(workout.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div
                  onClick={() => setSelectedWorkout(workout)}
                  className="p-5 flex-1 flex flex-col cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${workout.source === 'ai' ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {workout.source === 'ai' ? 'Gerado por IA' : 'Manual'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors pr-8">
                    {workout.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mb-4">
                    {workout.focus}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-sm font-black text-indigo-600">{workout.exerciseCount} exercícios</span>
                    <PlayCircle size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredWorkouts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <Dumbbell size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">Nenhum treino encontrado na biblioteca.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutView;
