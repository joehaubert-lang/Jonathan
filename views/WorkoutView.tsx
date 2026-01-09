
import React, { useState } from 'react';
/* Added CheckCircle2 to the imports */
import { Sparkles, Play, Trash2, Bookmark, Search, Clock, PlusCircle, Save, Dumbbell, RotateCcw, User, X, ChevronLeft, AlertCircle, List, Send, PlayCircle, Pencil, Link as LinkIcon, Video, Calendar, CheckCircle2 } from 'lucide-react';
import { generateWorkoutSplit } from '../services/geminiService';

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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editWorkout, setEditWorkout] = useState<any | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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
        { name: 'Supino Reto', sets: 4, reps: '8', weight: '60kg', rest: '90s', muscleGroup: 'Peito', videoUrl: 'https://www.youtube.com/watch?v=rT7Dgcr0yJK8' },
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
    focus: '',
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
      setGeneratedWorkouts(result);
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-black text-indigo-600 border border-slate-100">{i + 1}</div>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input className="font-bold text-slate-800 text-sm outline-none w-full bg-white border-b border-indigo-200" value={ex.name} onChange={(e) => {
                              const updated = [...editWorkout.exercises];
                              updated[i].name = e.target.value;
                              setEditWorkout({...editWorkout, exercises: updated});
                            }} />
                            <div className="flex items-center gap-2">
                              <LinkIcon size={12} className="text-indigo-400" />
                              <input className="text-[10px] text-indigo-500 font-bold outline-none w-full bg-white border-b border-indigo-100" placeholder="Link YouTube" value={ex.videoUrl || ''} onChange={(e) => {
                                const updated = [...editWorkout.exercises];
                                updated[i].videoUrl = e.target.value;
                                setEditWorkout({...editWorkout, exercises: updated});
                              }} />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{ex.name}</h4>
                            {ex.videoUrl && (
                              <button onClick={() => setActiveVideoUrl(ex.videoUrl)} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                                <PlayCircle size={14} /> <span className="text-[10px] font-black uppercase">Vídeo</span>
                              </button>
                            )}
                          </div>
                        )}
                        {!isEditing && <p className="text-[10px] text-slate-400 font-black uppercase">{ex.muscleGroup}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 justify-between sm:justify-end border-t sm:border-t-0 pt-3 border-slate-50">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Séries x Rep</p>
                        <p className="text-sm font-black text-slate-800">{ex.sets} x {ex.reps}</p>
                      </div>
                      {isEditing && (
                        <button onClick={() => {
                          const updated = editWorkout.exercises.filter((_: any, idx: number) => idx !== i);
                          setEditWorkout({...editWorkout, exercises: updated});
                        }} className="text-red-400 p-1"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
             <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-2xl">
               <h4 className="font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest text-indigo-400"><Clock size={16}/> Resumo</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10"><span className="text-[10px] font-bold text-slate-400 uppercase">Foco</span><span className="text-xs font-black">{currentData.focus}</span></div>
                  <div className="flex justify-between items-center py-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Itens</span><span className="text-xs font-black">{currentData.exercises.length}</span></div>
               </div>
               {!isEditing && <button className="w-full mt-8 py-4 bg-indigo-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2"><Send size={18} /> Compartilhar</button>}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VideoModal />
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
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
           <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest"><PlusCircle size={20} className="text-indigo-600"/> Prescrição Manual</h3>
             <input type="text" placeholder="Nome do Treino" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 mb-6 font-bold" value={manualWorkout.name} onChange={(e) => setManualWorkout({...manualWorkout, name: e.target.value})} />
             <div className="space-y-4">
               {manualWorkout.exercises.map((ex, i) => (
                 <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                   <div className="flex gap-4">
                     <select className="flex-1 bg-transparent font-bold text-sm outline-none border-b border-slate-200" value={ex.name} onChange={(e) => {
                        const updated = [...manualWorkout.exercises]; updated[i].name = e.target.value; setManualWorkout({...manualWorkout, exercises: updated});
                      }}>
                        <option value="">Selecione...</option>
                        {PREDEFINED_EXERCISES.flatMap(c => c.items).map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                     <button onClick={() => {
                        const updated = manualWorkout.exercises.filter((_, idx) => idx !== i); setManualWorkout({...manualWorkout, exercises: updated});
                     }} className="text-red-400"><Trash2 size={16}/></button>
                   </div>
                   <div className="flex items-center gap-3">
                      <LinkIcon size={14} className="text-indigo-400 shrink-0" />
                      <input type="text" placeholder="URL YouTube para Popup" className="flex-1 bg-transparent text-xs font-medium border-b border-slate-200 outline-none" value={ex.videoUrl || ''} onChange={(e) => {
                          const updated = [...manualWorkout.exercises]; updated[i].videoUrl = e.target.value; setManualWorkout({...manualWorkout, exercises: updated});
                      }} />
                   </div>
                 </div>
               ))}
               <button onClick={() => setManualWorkout({...manualWorkout, exercises: [...manualWorkout.exercises, { name: '', sets: 3, reps: '12', weight: '', rest: '60s', muscleGroup: 'Geral', videoUrl: '' }]})} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold">+ Novo Exercício</button>
             </div>
             <button onClick={() => {
                const newSaved = { id: Date.now().toString(), name: manualWorkout.name, focus: 'Manual', exerciseCount: manualWorkout.exercises.length, date: 'Hoje', source: 'manual', exercises: manualWorkout.exercises };
                setSavedWorkouts([newSaved, ...savedWorkouts]);
                setActiveSubTab('library');
             }} className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg">Salvar Treino</button>
           </div>
        </div>
      )}

      {activeSubTab === 'library' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar na biblioteca..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <div key={workout.id} onClick={() => setSelectedWorkout(workout)} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-300 transition-all cursor-pointer min-h-[160px] flex flex-col">
                <div className="flex items-center gap-2 mb-2"><span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{workout.source === 'ai' ? 'IA' : 'Manual'}</span></div>
                <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600">{workout.name}</h4>
                <p className="text-xs text-slate-400 font-medium mb-4">{workout.focus}</p>
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between"><span className="text-sm font-black text-indigo-600">{workout.exerciseCount} exercícios</span><PlayCircle size={18} className="text-slate-300 group-hover:text-indigo-600" /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutView;
