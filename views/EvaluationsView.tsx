
import React, { useState, useEffect } from 'react';
import { Ruler, Weight, Scissors, ChevronRight, BarChart2, Camera, Info, Plus, Calendar, TrendingUp, TrendingDown, Search, ArrowLeft, Maximize2, Sparkles, User, Clock, Filter, Grid, ShieldAlert, CheckCircle, MoreVertical, Trash2, Pencil, X, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { analyzePosture } from '../services/geminiService'; // Commented out generated service
import NewEvaluationWizard from '../components/NewEvaluationWizard';
import { supabase } from '../services/supabaseClient';
import { Student } from '../types';

// Helper for Posture Grid
const PostureGrid = () => (
  <div className="absolute inset-0 pointer-events-none grid grid-cols-10 grid-rows-10 border border-indigo-400/30">
    {Array.from({ length: 100 }).map((_, i) => (
      <div key={i} className="border-[0.5px] border-indigo-400/10 flex items-center justify-center">
        {i === 45 && <div className="w-full h-[1px] bg-red-400/40"></div>}
        {i % 10 === 5 && <div className="h-full w-[1px] bg-red-400/40"></div>}
      </div>
    ))}
  </div>
);

// Simple Edit Modal (Reused)
interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: any;
  onSave: (data: any) => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ isOpen, onClose, evaluation, onSave }) => {
  const [formData, setFormData] = useState({
    weight: '',
    bf: '',
    date: ''
  });

  useEffect(() => {
    if (evaluation) {
      setFormData({
        weight: evaluation.weight ? String(evaluation.weight) : '',
        bf: evaluation.body_fat ? String(evaluation.body_fat) : '',
        date: evaluation.created_at ? new Date(evaluation.created_at).toLocaleDateString('pt-BR') : ''
      });
    } else {
      setFormData({ weight: '', bf: '', date: '' });
    }
  }, [evaluation, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{evaluation ? 'Editar Avaliação' : 'Nova Avaliação'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Peso (kg)</label>
            <input
              type="text"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 transition-all"
              placeholder="Ex: 85.5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Gordura Corporal (%)</label>
            <input
              type="text"
              value={formData.bf}
              onChange={(e) => setFormData({ ...formData, bf: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 transition-all"
              placeholder="Ex: 15.0"
            />
          </div>
          {/* Date is usually set by system or separate picker, simplifying for edit */}
          <button
            onClick={() => onSave(formData)}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

interface EvaluationsViewProps {
  initialStudentId?: string | null;
}

const EvaluationsView: React.FC<EvaluationsViewProps> = ({ initialStudentId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]); // Current student's evaluations

  const [activeTab, setActiveTab] = useState<'overview' | 'anthropometry' | 'photos'>('overview');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<any | null>(null);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [postureReport, setPostureReport] = useState<any | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Comparison State
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleComparisonSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparisonIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 2) {
        // If 2 are already selected, replace the first one (FIFO) or just block? 
        // User flow: Unselect one to select another usually.
        // Let's replace the oldest selection (first index) to make it fluid
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  // Initial Fetch of Students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching students:', error);
    } else if (data) {
      const mappedStudents: Student[] = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        photo: s.photo,
        status: s.status,
        lastActivity: s.last_activity,
        goal: s.goal,
        plan: s.plan,
        phone: s.phone,
        gender: s.gender
      }));
      setStudents(mappedStudents);

      if (initialStudentId) {
        const preSelected = mappedStudents.find(s => s.id === initialStudentId);
        if (preSelected) handleStudentSelect(preSelected);
      }
    }
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('overview');
    await fetchEvaluations(student.id);
  };

  const fetchEvaluations = async (studentId: string) => {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluations:', error);
    } else {
      setEvaluations(data || []);
    }
  };

  // --- Actions ---

  const uploadPhoto = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('evaluation-photos')
      .upload(path, file);

    if (error) {
      console.error('Error uploading photo:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('evaluation-photos')
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleSaveNewEvaluation = async (data: any) => {
    if (!selectedStudent) return;

    try {
      // 1. Upload Photos first
      const photoUrls: any = {};
      const timestamp = Date.now();

      if (data.photos) {
        for (const [key, file] of Object.entries(data.photos)) {
          if (file instanceof File) {
            // New upload
            const path = `${selectedStudent.id}/${timestamp}_${key}.${file.name.split('.').pop()}`;
            const url = await uploadPhoto(file, path);
            if (url) photoUrls[key] = url;
          } else if (typeof file === 'string') {
            // Keep existing URL
            photoUrls[key] = file;
          }
        }
      }

      // 2. Prepare Record Payload
      const payload = {
        student_id: selectedStudent.id,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(), // Use existing date if editing
        protocol: data.protocol, // Save Method
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        body_fat: parseFloat(data.bf || '0'),
        measurements: {
          muscle_mass: parseFloat(data.muscleMass || '0'),
          visceral_fat: parseFloat(data.visceralFat || '0'),
          chest: data.chest,
          abdomen: data.abdomen,
          thigh: data.thigh,
          triceps: data.triceps,
          suprailiac: data.suprailiac,
          subscapular: data.subscapular,
          axillary: data.axillary,
          neck: data.neck,
          shoulder: data.shoulder,
          chestCirc: data.chestCirc,
          waist: data.waist,
          abdomenCirc: data.abdomenCirc,
          hip: data.hip,
          rightArm: data.rightArm,
          leftArm: data.leftArm,
          rightThigh: data.rightThigh,
          leftThigh: data.leftThigh,
          rightCalf: data.rightCalf,
          leftCalf: data.leftCalf
        },
        photos: photoUrls
      };

      let error;
      if (data.id) {
        // UPDATE
        const { error: updateError } = await supabase
          .from('evaluations')
          .update(payload)
          .eq('id', data.id);
        error = updateError;
      } else {
        // INSERT
        const { error: insertError } = await supabase
          .from('evaluations')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      await fetchEvaluations(selectedStudent.id);
      setWizardOpen(false);
      setEditingEval(null); // Clear edit state

    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Erro ao salvar avaliação. Verifique se todos os campos obrigatórios estão preenchidos.');
    }
  };

  const handleEditEvaluation = (evalItem: any) => {
    // Open Wizard in Edit Mode
    setEditingEval(evalItem); // Pass full object to wizard
    setWizardOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveEdit = async (formData: any) => {
    if (!editingEval) return;

    try {
      const { error } = await supabase
        .from('evaluations')
        .update({
          weight: parseFloat(formData.weight),
          body_fat: parseFloat(formData.bf) // Changed from fat_percentage
        })
        .eq('id', editingEval.id);

      if (error) throw error;

      // Refresh
      if (selectedStudent) fetchEvaluations(selectedStudent.id);
      setIsModalOpen(false);
      setEditingEval(null);

    } catch (error) {
      console.error('Error updating evaluation:', error);
      alert('Erro ao atualizar avaliação.');
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (window.confirm(`Tem certeza que deseja excluir esta avaliação?`)) {
      try {
        const { error } = await supabase
          .from('evaluations')
          .delete()
          .eq('id', id);

        if (error) throw error;
        if (selectedStudent) fetchEvaluations(selectedStudent.id);
      } catch (error) {
        console.error('Error deleting evaluation:', error);
        alert('Erro ao excluir avaliação.');
      }
    }
    setActiveMenuId(null);
  };

  const handlePostureAnalysis = async (imgUrl: string) => {
    setIsAnalyzing(true);
    // Mock analysis
    setTimeout(async () => {
      const mockResult = {
        deviations: ["Ombro direito elevado", "Inclinação pélvica anterior", "Leve valgo em joelho esquerdo"],
        alignmentScore: 78,
        recommendation: "Focar em exercícios de mobilidade torácica e fortalecimento de core e glúteo médio."
      };
      setPostureReport(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Helper to get latest metrics for student card
  // Since we fetch evaluations ONLY when selecting a student, the main list view 
  // needs to handle "latest" data diffrently or we just show static/no data
  // for performance in this demo. Or we could fetch latest eval for all students.
  // For simplicity, I'll show generic info or fetch it if needed. 
  // Actually, let's keep it simple: List of students. 
  // If we really want the "last eval date" on the card, we'd need a join or separate fetch.
  // Given time constraints, I will omit dynamic "last eval" on the main card list unless requested.

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render ---

  if (!selectedStudent) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500" onClick={() => setActiveMenuId(null)}>
        {/* Creating a new evaluation without selected student implicitly means selecting one first in the wizard or here.. 
            The wizard accepts a student prop. If we open wizard from here, we default to first student or force select?
            Let's keep the wizard button but it might need to select a student first.
            For now, I'll disable it or simple pick first.
        */}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Avaliações Físicas</h2>
            <p className="text-slate-500">Selecione um aluno para visualizar ou registrar avaliações.</p>
          </div>
          {/* <button
            onClick={() => { if(students.length > 0) { setSelectedStudent(students[0]); setWizardOpen(true); } }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={18} /> Nova Avaliação
          </button> */}
        </header>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar aluno..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white border border-slate-200 px-4 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => handleStudentSelect(student)}
              className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            >
              <img src={student.photo || 'https://via.placeholder.com/100'} alt={student.name} className="h-16 w-16 rounded-2xl object-cover border border-slate-100" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1"><User size={12} /> {student.gender || 'Não informado'}</span>
                  {/* Dynamic last eval date would require more fetching complexity. Omitted for MVP performance. */}
                </div>
              </div>
              <div className="text-indigo-600">
                <ChevronRight />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Student Detail View ---

  // Prepare chart data
  const evolutionData = evaluations.map(e => ({
    date: new Date(e.created_at || e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    peso: e.weight,
    gordura: e.body_fat // Changed from fat_percentage
  })).reverse(); // Oldest to newest for chart

  const latestEval = evaluations[0];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500" onClick={() => setActiveMenuId(null)}>

      {/* Reusing Wizard for Add AND Edit */}
      <NewEvaluationWizard
        isOpen={wizardOpen}
        onClose={() => { setWizardOpen(false); setEditingEval(null); }}
        student={selectedStudent}
        onSave={handleSaveNewEvaluation}
        initialData={editingEval} // Pass data if editing
      />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedStudent(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.name}</h2>
            <p className="text-slate-500 flex items-center gap-1 text-sm"><User size={14} /> Histórico de Avaliações</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingEval(null); setWizardOpen(true); }} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={18} /> Nova Avaliação
          </button>
        </div>
      </header>


      {showComparison && comparisonIds.length === 2 && (
        <>
          <style>
            {`
                    @media print {
                        @page {
                            size: auto;
                            margin: 10mm;
                        }
                        
                        /* Hide everything by default */
                        body {
                            visibility: hidden;
                            overflow: visible !important;
                            height: auto !important;
                        }
                        
                        /* Target the overlay wrapper */
                        #comparison-overlay {
                            visibility: visible !important;
                            position: absolute !important;
                            inset: 0 !important;
                            top: 0 !important;
                            left: 0 !important;
                            width: 100% !important;
                            height: auto !important;
                            z-index: 9999;
                            background: white !important;
                            display: block !important; /* Disable flex centering */
                            overflow: visible !important;
                            padding: 0 !important;
                        }

                        /* Target the modal itself */
                        #comparison-modal {
                            visibility: visible !important;
                            position: relative !important;
                            width: 100% !important;
                            height: auto !important;
                            max-height: none !important;
                            overflow: visible !important;
                            box-shadow: none !important;
                            border: none !important;
                            margin: 0 !important;
                            display: block !important; /* Disable flex col */
                        }

                        /* Target ALL children to ensure they expand */
                        #comparison-modal * {
                            visibility: visible !important;
                            overflow: visible !important;
                            height: auto !important;
                            max-height: none !important;
                        }
                        
                        /* Specifically hide the scrollbar track/thumb if visible */
                        ::-webkit-scrollbar {
                            display: none;
                        }

                        .no-print {
                            display: none !important;
                        }

                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `}
          </style>
          <div id="comparison-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div id="comparison-modal" className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Scissors className="rotate-90 text-indigo-600" /> Comparativo de Avaliações
                  </h3>
                  <p className="text-slate-500 text-sm">Análise lado a lado da evolução do aluno</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="no-print flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all shadow-lg"
                  >
                    <Printer size={16} /> Exportar PDF
                  </button>
                  <button onClick={() => setShowComparison(false)} className="no-print h-10 w-10 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-6 bg-slate-50/50">
                {/* ... content ... */}
                {(() => {
                  // ... existing render logic ...
                  // Get selected evaluations sorted by date (oldest -> newest for left -> right comparison)
                  const [id1, id2] = comparisonIds;
                  const allEvals = evaluations.filter(e => e.id === id1 || e.id === id2);
                  const sorted = allEvals.sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime());
                  const oldEval = sorted[0];
                  const newEval = sorted[1];

                  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');
                  const renderDelta = (oldVal: number, newVal: number, inverse = false) => {
                    const delta = newVal - oldVal;
                    const isPositive = delta > 0;
                    const isZero = delta === 0;
                    // If inverse is true (e.g. Body Fat), negative delta is GOOD (green)
                    // Standard (e.g. Muscle), positive delta is GOOD (green)
                    let colorClass = 'text-slate-400';
                    if (!isZero) {
                      const isGood = inverse ? delta < 0 : delta > 0;
                      colorClass = isGood ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50';
                    }

                    return (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-0.5 w-fit ${colorClass}`}>
                        {!isZero && (delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
                        {delta > 0 ? '+' : ''}{delta.toFixed(1).replace('.', ',')}
                      </span>
                    );
                  };

                  return (
                    <div className="space-y-8">
                      {/* Header Grid */}
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="col-start-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-slate-400 uppercase">Anterior</p>
                          <p className="font-bold text-lg text-slate-700">{formatDate(oldEval.date || oldEval.created_at)}</p>
                        </div>
                        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 text-white transform scale-105">
                          <p className="text-xs font-bold text-indigo-200 uppercase">Atual</p>
                          <p className="font-bold text-lg">{formatDate(newEval.date || newEval.created_at)}</p>
                        </div>
                        <div className="flex items-center justify-center font-bold text-slate-400 text-sm italic">
                          Diferença
                        </div>
                      </div>

                      {/* Main Metrics */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Composição Corporal</div>
                        <div className="divide-y divide-slate-100">
                          <div className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-slate-50/50">
                            <span className="font-medium text-slate-600">Peso (kg)</span>
                            <span className="text-center font-medium opacity-60">{oldEval.weight}</span>
                            <span className="text-center font-bold text-slate-800">{newEval.weight}</span>
                            <div className="flex justify-center">{renderDelta(oldEval.weight, newEval.weight, true)}</div> {/* Usually logic: weight neutral? Let's assume inverse for now or neutral. Actually weight loss is standard goal */}
                          </div>
                          <div className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-slate-50/50">
                            <span className="font-medium text-slate-600">Gordura Corporal (%)</span>
                            <span className="text-center font-medium opacity-60">{oldEval.body_fat || '-'}</span>
                            <span className="text-center font-bold text-slate-800">{newEval.body_fat || '-'}</span>
                            <div className="flex justify-center">{renderDelta(oldEval.body_fat || 0, newEval.body_fat || 0, true)}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-slate-50/50">
                            <span className="font-medium text-slate-600">Massa Muscular (kg)</span>
                            <span className="text-center font-medium opacity-60">{oldEval.measurements?.muscle_mass || '-'}</span>
                            <span className="text-center font-bold text-slate-800">{newEval.measurements?.muscle_mass || '-'}</span>
                            <div className="flex justify-center">{renderDelta(oldEval.measurements?.muscle_mass || 0, newEval.measurements?.muscle_mass || 0, false)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Measurements */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Perímetros (cm)</div>
                        <div className="divide-y divide-slate-100">
                          {['chestCirc', 'waist', 'abdomenCirc', 'hip', 'rightArm', 'leftArm', 'rightThigh', 'leftThigh'].map(key => {
                            const labelMap: any = { chestCirc: 'Peitoral', waist: 'Cintura', abdomenCirc: 'Abdômen', hip: 'Quadril', rightArm: 'Braço Dir.', leftArm: 'Braço Esq.', rightThigh: 'Coxa Dir.', leftThigh: 'Coxa Esq.' };
                            const v1 = parseFloat(oldEval.measurements?.[key] || 0);
                            const v2 = parseFloat(newEval.measurements?.[key] || 0);
                            if (!v1 && !v2) return null;

                            // For Waist/Abdomen, decrease is good. For Arms/Thighs, increase usually muscle. 
                            // Simplify: just show delta. Let user interpret context. 
                            // Or: Waist/Abd = inverse. Others = standard.
                            const isInverse = ['waist', 'abdomenCirc'].includes(key);

                            return (
                              <div key={key} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-slate-50/50">
                                <span className="font-medium text-slate-600">{labelMap[key] || key}</span>
                                <span className="text-center font-medium opacity-60">{v1 || '-'}</span>
                                <span className="text-center font-bold text-slate-800">{v2 || '-'}</span>
                                <div className="flex justify-center">{renderDelta(v1, v2, isInverse)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><BarChart2 size={16} /> Evolução</button>
        <button onClick={() => setActiveTab('anthropometry')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'anthropometry' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Ruler size={16} /> Medidas</button>
        <button onClick={() => setActiveTab('photos')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'photos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Camera size={16} /> Fotos IA</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Tendência de Massa Corporal</h3>
            <div className="h-64 w-full">
              {evolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData}>
                    <defs>
                      <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="peso" stroke="#4f46e5" strokeWidth={3} fill="url(#colorPeso)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  Sem dados suficientes.
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Métricas Atuais</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Gordura Corporal</span><span className="text-sm font-bold text-indigo-600">{latestEval?.body_fat || '-'}%</span></div>
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Peso Atual</span><span className="text-sm font-bold text-slate-800">{latestEval?.weight || '-'} kg</span></div>
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Massa Muscular</span><span className="text-sm font-bold text-emerald-600">{latestEval?.measurements?.muscle_mass || '-'} kg</span></div>
              </div>
            </div>

            {/* List of Recent Evaluations for Quick Edit */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Histórico Recente</h3>
                {comparisonIds.length === 2 && (
                  <button
                    onClick={() => setShowComparison(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold animate-in zoom-in"
                  >
                    <Scissors size={14} className="rotate-90" /> Comparar
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {evaluations.map((ev) => {
                  const isSelected = comparisonIds.includes(ev.id);
                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => toggleComparisonSelection(ev.id, e)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs cursor-pointer border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <CheckCircle size={10} className="text-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{new Date(ev.created_at || ev.date).toLocaleDateString('pt-BR')}</span>
                          <span className="text-slate-400">{ev.weight}kg • {ev.body_fat || '-'}% BF</span>
                        </div>
                      </div>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleEditEvaluation(ev)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-200 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteEvaluation(ev.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )
                })}
                {evaluations.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Nenhuma avaliação registrada.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'anthropometry' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {latestEval?.measurements ? (
            <>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Perímetros (cm)</h3>
                <div className="space-y-3">
                  {Object.entries(latestEval.measurements).filter(([k]) => ['chestCirc', 'waist', 'abdomenCirc', 'hip', 'neck', 'shoulder'].includes(k)).map(([key, value]) => {
                    const translations: { [key: string]: string } = {
                      chestCirc: 'Peitoral',
                      waist: 'Cintura',
                      abdomenCirc: 'Abdômen',
                      hip: 'Quadril',
                      neck: 'Pescoço',
                      shoulder: 'Ombros'
                    };
                    return (
                      <div key={key} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium capitalize">{translations[key] || key}</span>
                        <span className="font-bold">{value} cm</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Membros (cm)</h3>
                <div className="space-y-3">
                  {Object.entries(latestEval.measurements).filter(([k]) => ['rightArm', 'leftArm', 'rightThigh', 'leftThigh', 'rightCalf', 'leftCalf'].includes(k)).map(([key, value]) => {
                    const translations: { [key: string]: string } = {
                      rightArm: 'Braço Direito',
                      leftArm: 'Braço Esquerdo',
                      rightThigh: 'Coxa Direita',
                      leftThigh: 'Coxa Esquerda',
                      rightCalf: 'Panturrilha Dir.',
                      leftCalf: 'Panturrilha Esq.'
                    };
                    return (
                      <div key={key} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium capitalize">{translations[key] || key}</span>
                        <span className="font-bold">{value} cm</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400">
              Sem dados de medidas nesta avaliação recente.
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800">Biometria Postural com Simetrógrafo</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${showGrid ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                <Grid size={14} /> {showGrid ? 'Grade On' : 'Grade Off'}
              </button>
              <button
                onClick={() => handlePostureAnalysis('https://picsum.photos/seed/posture/400/600')}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg hover:opacity-90 disabled:opacity-50"
              >
                {isAnalyzing ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <Sparkles size={14} />}
                Analisar com IA
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
              {[
                { label: 'Anterior (Frente)', key: 'front' },
                { label: 'Posterior (Costas)', key: 'back' },
                { label: 'Perfil Direito', key: 'right' },
                { label: 'Perfil Esquerdo', key: 'left' }
              ].map((pose) => (
                <div key={pose.key} className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{pose.label}</span>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] bg-slate-200">
                    {latestEval?.photos?.[pose.key] ? (
                      <img src={latestEval.photos[pose.key]} className="w-full h-full object-cover" alt={pose.label} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">Sem foto</div>
                    )}
                    {showGrid && <PostureGrid />}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {postureReport ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert size={20} className="text-indigo-600" />
                    <h4 className="font-bold text-slate-800">Diagnóstico IA</h4>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500">Score de Alinhamento</span>
                      <span className="text-sm font-black text-indigo-600">{postureReport.alignmentScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${postureReport.alignmentScore}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Desvios Detectados</p>
                    {postureReport.deviations.map((dev: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                        <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                        {dev}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Recomendação Técnica</p>
                    <p className="text-xs text-indigo-700 leading-relaxed italic">"{postureReport.recommendation}"</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <Camera size={24} />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">Sem Análise Ativa</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-[200px]">Clique no botão "Analisar com IA" para gerar o laudo postural automático.</p>
                </div>
              )}

              <div className="rounded-2xl bg-slate-800 p-6 text-white shadow-xl">
                <h4 className="text-sm font-bold mb-4">Dicas para Fotos</h4>
                <ul className="space-y-3 text-[11px] text-slate-400">
                  <li className="flex gap-2"><span>•</span> Use roupas leves (top/short curto)</li>
                  <li className="flex gap-2"><span>•</span> Fundo neutro e bem iluminado</li>
                  <li className="flex gap-2"><span>•</span> Mantenha a câmera na altura do umbigo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsView;
