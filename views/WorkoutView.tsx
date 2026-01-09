
import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Trash2, Bookmark, Search, Clock, PlusCircle, Save, Dumbbell, RotateCcw, User, X, ChevronLeft, AlertCircle, List, Send, PlayCircle, Pencil, Link as LinkIcon, Video, Calendar, CheckCircle2 } from 'lucide-react';
import { generateWorkoutSplit } from '../services/geminiService';

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
  
  const [savedWorkouts, setSavedWorkouts] = useState<any[]>([
    {
      id: 's1',
      name: 'Full Body Avançado',
      focus: 'Força e Potência',
      exerciseCount: 2,
      date: '12 Mar, 2024',
      level: 'Avançado',
      source: 'ai',
      exercises: [
        { name: 'Agachamento Livre', sets: 4, reps: '8', weight: '80kg', rest: '90s', muscleGroup: 'Pernas', videoUrl: 'https://www.youtube.com/watch?v=U3HlEF_E9fo' },
        { name: 'Supino Reto', sets: 4, reps: '8', weight: '60kg', rest: '90s', muscleGroup: 'Peito', videoUrl: 'https://www.youtube.com/watch?v=sqOw2Y6uDWQ' },
      ]
    }
  ]);

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
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editWorkout || !editWorkout.name) return;
    const updatedWorkout = { ...editWorkout, exerciseCount: editWorkout.exercises.length };
    setSavedWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
    setSelectedWorkout(updatedWorkout);
    setIsEditing(false);
    setEditWorkout(null);
  };

  const handleDeleteWorkout = () => {
    if (!workoutToDelete) return;
    setSavedWorkouts(prev => prev.filter(w => w.id !== workoutToDelete));
    setWorkoutToDelete(null);
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
    const currentData = isEditing && editWorkout ? editWorkout : selectedWorkout;
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
        <VideoModal />
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedWorkout(null); setIsEditing(false); }} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 border border-slate-100">
              <ChevronLeft size={24} />
            </button>
            <div className="min-w-0">
              {isEditing ? (
                <input className="text-xl font-black text-slate-800 border-b border-indigo-200 outline-none w-full bg-indigo-50/30 px-2 rounded" value={editWorkout.name} onChange={(e) => setEditWorkout({...editWorkout, name: e.target.value})} />
              ) : (
                <h2 className="text-xl font-black text-slate-800 truncate">{selectedWorkout.name}</h2>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{selectedWorkout.source === 'ai' ? 'IA ✨' : 'MANUAL 👤'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={() => startEditing()} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100"><Pencil size={16} /> Editar</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancelar</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-lg">Salvar</button>
              </div>
            )}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider px-2"><List size={18} className="text-indigo-600" /> Grade de Exercícios</h3>
            <div className="grid gap-3">
              {currentData.exercises.map((ex: any, i: number) => (
                <div key={i} className={`flex flex-col gap-4 rounded-2xl border ${isEditing ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100 bg-white'} p-4 shadow-sm`}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-black text-indigo-600 border border-slate-100">{i + 1}</div>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="space-y-3">
                            <input className="font-bold text-slate-800 text-sm outline-none w-full bg-white border-b border-indigo-200" value={ex.name} onChange={(e) => {
                              const updated = [...editWorkout.exercises];
                              updated[i].name = e.target.value;
                              if (EXERCISE_VIDEO_LIBRARY[e.target.value]) {
                                updated[i].videoUrl = EXERCISE_VIDEO_LIBRARY[e.target.value];
                              }
                              setEditWorkout({...editWorkout, exercises: updated});
                            }} />
                            
                            <div className="grid grid-cols-4 gap-2">
                               <div>
                                 <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">Séries</label>
                                 <input type="number" className="w-full text-xs font-bold p-1 border rounded bg-white" value={ex.sets} onChange={(e) => {
                                   const updated = [...editWorkout.exercises];
                                   updated[i].sets = parseInt(e.target.value);
                                   setEditWorkout({...editWorkout, exercises: updated});
                                 }} />
                               </div>
                               <div>
                                 <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">Reps</label>
                                 <input type="text" className="w-full text-xs font-bold p-1 border rounded bg-white" value={ex.reps} onChange={(e) => {
                                   const updated = [...editWorkout.exercises];
                                   updated[i].reps = e.target.value;
                                   setEditWorkout({...editWorkout, exercises: updated});
                                 }} />
                               </div>
                               <div>
                                 <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">Peso</label>
                                 <input type="text" className="w-full text-xs font-bold p-1 border rounded bg-white" value={ex.weight} onChange={(e) => {
                                   const updated = [...editWorkout.exercises];
                                   updated[i].weight = e.target.value;
                                   setEditWorkout({...editWorkout, exercises: updated});
                                 }} />
                               </div>
                               <div>
                                 <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">Rest</label>
                                 <input type="text" className="w-full text-xs font-bold p-1 border rounded bg-white" value={ex.rest} onChange={(e) => {
                                   const updated = [...editWorkout.exercises];
                                   updated[i].rest = e.target.value;
                                   setEditWorkout({...editWorkout, exercises: updated});
                                 }} />
                               </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-sm truncate">{ex.name}</h4>
                              {ex.videoUrl && (
                                <button onClick={() => setActiveVideoUrl(ex.videoUrl)} className="text-indigo-600 hover:scale-110 transition-transform">
                                  <PlayCircle size={16} />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">{ex.muscleGroup}</span>
                               {ex.weight && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Dumbbell size={10} /> {ex.weight}</span>}
                               {ex.rest && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10} /> {ex.rest}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 justify-between sm:justify-end border-t sm:border-t-0 pt-3 border-slate-50">
                      {!isEditing && (
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sets x Reps</p>
                          <p className="text-sm font-black text-slate-800">{ex.sets} x {ex.reps}</p>
                        </div>
                      )}
                      {isEditing && (
                        <button onClick={() => {
                          const updated = editWorkout.exercises.filter((_: any, idx: number) => idx !== i);
                          setEditWorkout({...editWorkout, exercises: updated});
                        }} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
             <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-2xl sticky top-24">
               <h4 className="font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest text-indigo-400"><Clock size={16}/> Resumo</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10"><span className="text-[10px] font-bold text-slate-400 uppercase">Objetivo</span><span className="text-xs font-black">{currentData.focus}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10"><span className="text-[10px] font-bold text-slate-400 uppercase">Frequência</span><span className="text-xs font-black">{currentData.source === 'ai' ? 'Variada' : 'Manual'}</span></div>
                  <div className="flex justify-between items-center py-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Volume Total</span><span className="text-xs font-black">{currentData.exercises.length} Exercícios</span></div>
               </div>
               {!isEditing && <button className="w-full mt-8 py-4 bg-indigo-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20"><Send size={18} /> Prescrever ao Aluno</button>}
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
                    <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Sparkles size={18} /></div><h3 className="font-bold text-slate-800">Parâmetros Inteligentes</h3></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Objetivo Principal</label>
                        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={form.goal} onChange={(e) => setForm({...form, goal: e.target.value})}><option>Hipertrofia</option><option>Emagrecimento</option><option>Força Máxima</option><option>Condicionamento</option></select>
                      </div>
                      <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nível do Aluno</label>
                        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={form.level} onChange={(e) => setForm({...form, level: e.target.value})}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select>
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
                            className={`flex-1 min-w-[50px] py-2.5 rounded-xl font-bold transition-all border text-xs ${
                              form.selectedDays.includes(day.id) 
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
                      {isGenerating ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <><Sparkles size={20}/> Gerar Treino IA</>}
                    </button>
                  </div>
                </div>
             </div>
           ) : (
             <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
               <div className="col-span-full flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center"><CheckCircle2 size={24}/></div>
                    <div>
                      <p className="text-xs font-black text-indigo-400 uppercase">Sugestão Gerada</p>
                      <p className="text-sm font-bold text-indigo-900">{form.goal} • {form.selectedDays.length} Dias selecionados</p>
                    </div>
                  </div>
                  <button onClick={() => setGeneratedWorkouts([])} className="text-indigo-600 hover:text-indigo-800 p-2 rounded-xl hover:bg-indigo-100 transition-all"><RotateCcw size={20}/></button>
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
                         <div className="h-6 w-6 shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{i+1}</div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                             <h5 className="text-[11px] font-bold text-slate-800 truncate">{ex.name}</h5>
                             {ex.videoUrl && <button onClick={() => setActiveVideoUrl(ex.videoUrl)} className="text-indigo-600 hover:scale-110 transition-transform"><PlayCircle size={14} /></button>}
                           </div>
                         </div>
                         <span className="text-[10px] font-black text-slate-800">{ex.sets}x{ex.reps}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
               <div className="col-span-full flex justify-center pt-8 pb-12">
                 <button onClick={() => {
                   const newSaved = { id: Date.now().toString(), name: `IA: ${form.goal} (${form.selectedDays.length} dias)`, focus: form.goal, exerciseCount: generatedWorkouts.reduce((acc, curr) => acc + curr.exercises.length, 0), date: new Date().toLocaleDateString('pt-BR'), source: 'ai', exercises: generatedWorkouts.flatMap(w => w.exercises) };
                   setSavedWorkouts([newSaved, ...savedWorkouts]);
                   setActiveSubTab('library');
                 }} className="flex items-center gap-3 bg-indigo-600 px-10 py-5 rounded-2xl text-white font-black shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"><Save size={24}/> Salvar na Biblioteca</button>
               </div>
             </div>
           )}
        </div>
      )}

      {activeSubTab === 'manual_builder' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
           <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest"><PlusCircle size={20} className="text-indigo-600"/> Prescrição Manual</h3>
               <button onClick={() => setManualWorkout({...manualWorkout, exercises: [{ name: '', sets: 3, reps: '12', weight: '', rest: '60s', videoUrl: '', muscleGroup: 'Geral' }]})} className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-all"><RotateCcw size={12}/> Limpar Tudo</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título do Treino</label>
                  <input type="text" placeholder="Ex: Hipertrofia A - Peito/Tríceps" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={manualWorkout.name} onChange={(e) => setManualWorkout({...manualWorkout, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Foco / Objetivo</label>
                  <input type="text" placeholder="Ex: Força Máxima" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={manualWorkout.focus} onChange={(e) => setManualWorkout({...manualWorkout, focus: e.target.value})} />
                </div>
             </div>

             <div className="space-y-4">
               {manualWorkout.exercises.map((ex, i) => (
                 <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 relative group">
                   <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exercício</label>
                       <select className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100" value={ex.name} onChange={(e) => {
                          const updated = [...manualWorkout.exercises]; 
                          const selectedName = e.target.value;
                          updated[i].name = selectedName;
                          if (EXERCISE_VIDEO_LIBRARY[selectedName]) {
                            updated[i].videoUrl = EXERCISE_VIDEO_LIBRARY[selectedName];
                          }
                          setManualWorkout({...manualWorkout, exercises: updated});
                        }}>
                          <option value="">Selecione um exercício...</option>
                          {PREDEFINED_EXERCISES.map(cat => (
                            <optgroup key={cat.category} label={cat.category}>
                              {cat.items.map(item => <option key={item} value={item}>{item}</option>)}
                            </optgroup>
                          ))}
                        </select>
                     </div>
                     
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:w-[400px]">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Séries</label>
                          <input type="number" className="w-full bg-white rounded-xl border border-slate-200 px-3 py-3 font-bold text-sm" value={ex.sets} onChange={(e) => {
                             const updated = [...manualWorkout.exercises]; updated[i].sets = parseInt(e.target.value) || 0; setManualWorkout({...manualWorkout, exercises: updated});
                          }} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Reps</label>
                          <input type="text" className="w-full bg-white rounded-xl border border-slate-200 px-3 py-3 font-bold text-sm" value={ex.reps} onChange={(e) => {
                             const updated = [...manualWorkout.exercises]; updated[i].reps = e.target.value; setManualWorkout({...manualWorkout, exercises: updated});
                          }} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Peso (kg)</label>
                          <input type="text" className="w-full bg-white rounded-xl border border-slate-200 px-3 py-3 font-bold text-sm" placeholder="Opcional" value={ex.weight} onChange={(e) => {
                             const updated = [...manualWorkout.exercises]; updated[i].weight = e.target.value; setManualWorkout({...manualWorkout, exercises: updated});
                          }} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Descanso</label>
                          <input type="text" className="w-full bg-white rounded-xl border border-slate-200 px-3 py-3 font-bold text-sm" value={ex.rest} onChange={(e) => {
                             const updated = [...manualWorkout.exercises]; updated[i].rest = e.target.value; setManualWorkout({...manualWorkout, exercises: updated});
                          }} />
                        </div>
                     </div>
                   </div>

                   <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-3 flex-1">
                        <LinkIcon size={14} className="text-indigo-400 shrink-0" />
                        <input type="text" placeholder="URL do Vídeo Youtube (Vazio usa o padrão se existir)" className="flex-1 bg-transparent text-xs font-medium border-b border-slate-200 outline-none focus:border-indigo-400 transition-all" value={ex.videoUrl || ''} onChange={(e) => {
                            const updated = [...manualWorkout.exercises]; updated[i].videoUrl = e.target.value; setManualWorkout({...manualWorkout, exercises: updated});
                        }} />
                      </div>
                      <button onClick={() => {
                          const updated = manualWorkout.exercises.filter((_, idx) => idx !== i); setManualWorkout({...manualWorkout, exercises: updated});
                       }} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                   </div>
                 </div>
               ))}
               
               <button onClick={() => setManualWorkout({...manualWorkout, exercises: [...manualWorkout.exercises, { name: '', sets: 3, reps: '12', weight: '', rest: '60s', muscleGroup: 'Geral', videoUrl: '' }]})} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                 <PlusCircle size={16} /> Adicionar Novo Exercício
               </button>
             </div>
             
             <button onClick={() => {
                const newSaved = { id: Date.now().toString(), name: manualWorkout.name || 'Treino Manual', focus: manualWorkout.focus, exerciseCount: manualWorkout.exercises.length, date: new Date().toLocaleDateString('pt-BR'), source: 'manual', exercises: manualWorkout.exercises };
                setSavedWorkouts([newSaved, ...savedWorkouts]);
                setActiveSubTab('library');
                setManualWorkout({ name: '', focus: 'Geral', level: 'Intermediário', exercises: [{ name: '', sets: 3, reps: '12', weight: '', rest: '60s', videoUrl: '', muscleGroup: 'Geral' }] });
             }} className="w-full mt-8 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black shadow-2xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
               <Save size={20} /> Salvar e Finalizar Prescrição
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
                {/* Delete Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setWorkoutToDelete(workout.id); }}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-all z-10 md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>

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
