
import React, { useState, useEffect } from 'react';
import { Ruler, Weight, Scissors, ChevronRight, BarChart2, Camera, Info, Plus, Calendar, TrendingUp, TrendingDown, Search, ArrowLeft, Maximize2, Sparkles, User, Clock, Filter, Grid, ShieldAlert, CheckCircle, MoreVertical, Trash2, Pencil, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzePosture } from '../services/geminiService';



import NewEvaluationWizard from '../components/NewEvaluationWizard';

const evolutionData = [
  { date: 'Jan', peso: 88.5, gordura: 22 },
  { date: 'Fev', peso: 87.2, gordura: 20.5 },
  { date: 'Mar', peso: 85.8, gordura: 19.8 },
  { date: 'Abr', peso: 84.5, gordura: 18.5 },
];

const initialStudents = [
  { id: '1', name: 'Gabriel Silva', photo: 'https://picsum.photos/id/1/100/100', lastEval: '12 Abr, 2024', weight: '84.5kg', bf: '18.5%', trend: 'down', gender: 'masculino' },
  { id: '2', name: 'Ana Souza', photo: 'https://picsum.photos/id/2/100/100', lastEval: '10 Mar, 2024', weight: '62.0kg', bf: '22.1%', trend: 'up', gender: 'feminino' },
  { id: '4', name: 'Mariana Costa', photo: 'https://picsum.photos/id/4/100/100', lastEval: '15 Abr, 2024', weight: '58.2kg', bf: '19.0%', trend: 'down', gender: 'feminino' },
  { id: '6', name: 'Carlos Weber', photo: 'https://picsum.photos/id/6/100/100', lastEval: '01 Abr, 2024', weight: '92.5kg', bf: '24.5%', trend: 'stable', gender: 'masculino' },
];

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
        weight: evaluation.weight.replace('kg', ''),
        bf: evaluation.bf.replace('%', ''),
        date: evaluation.lastEval
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 transition-all"
              placeholder="Ex: 12 Abr, 2024"
            />
          </div>
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
  const [studentsWithEvals, setStudentsWithEvals] = useState(initialStudents);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'anthropometry' | 'photos'>('overview');
  const [showForm, setShowForm] = useState(false); // Can be reused or replaced
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveNewEvaluation = (data: any) => {
    console.log('Saved new evaluation:', data);
    // Here we would typically API call to save
    setWizardOpen(false);
  };
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [postureReport, setPostureReport] = useState<any | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Initialize selected student if ID provided
  React.useEffect(() => {
    if (initialStudentId) {
      const student = studentsWithEvals.find(s => s.id === initialStudentId);
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [initialStudentId, studentsWithEvals]);

  const handleDeleteEvaluation = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a avaliação de ${name}?`)) {
      setStudentsWithEvals(prev => prev.filter(s => s.id !== id));
    }
    setActiveMenuId(null);
  };

  const handleEditEvaluation = (student: any) => {
    setEditingEval(student);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveEvaluation = (data: any) => {
    if (editingEval) {
      setStudentsWithEvals(prev => prev.map(s => s.id === editingEval.id ? {
        ...s,
        weight: `${data.weight}kg`,
        bf: `${data.bf}%`,
        lastEval: data.date
      } : s));
    } else {
      // Add new logic if needed, but for now it's edit only based on task
    }
    setIsModalOpen(false);
    setEditingEval(null);
  };

  const filteredStudents = studentsWithEvals.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePostureAnalysis = async (imgUrl: string) => {
    setIsAnalyzing(true);
    // Em um ambiente real, converteríamos a URL ou Blob para Base64 aqui
    // Simulando chamada para o Gemini com imagem dummy
    setTimeout(async () => {
      // Usando dados mockados para demonstração rápida no frontend
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

  if (!selectedStudent) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500" onClick={() => setActiveMenuId(null)}>
        <EvaluationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          evaluation={editingEval}
          onSave={handleSaveEvaluation}
        />

        <NewEvaluationWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          student={studentsWithEvals[0]}
          onSave={handleSaveNewEvaluation}
        />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Avaliações Físicas</h2>
            <p className="text-slate-500">Gerencie a evolução biomecânica e resultados.</p>
          </div>
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={18} /> Nova Avaliação
          </button>
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
              onClick={() => setSelectedStudent(student)}
              className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            >
              <img src={student.photo} alt={student.name} className="h-16 w-16 rounded-2xl object-cover border border-slate-100" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {student.lastEval}</span>
                  <span className="flex items-center gap-1 font-bold text-indigo-500"><Weight size={12} /> {student.weight}</span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => toggleMenu(student.id, e)}
                  className={`p-2 rounded-lg transition-all ${activeMenuId === student.id ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                >
                  <MoreVertical size={20} />
                </button>

                {activeMenuId === student.id && (
                  <div className="absolute right-0 top-full mt-2 w-32 rounded-xl bg-white p-1 shadow-xl border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditEvaluation(student); }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteEvaluation(student.id, student.name); }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <NewEvaluationWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        student={selectedStudent || studentsWithEvals[0]}
        onSave={handleSaveNewEvaluation}
      />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedStudent(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.name}</h2>
            <p className="text-slate-500 flex items-center gap-1 text-sm"><User size={14} /> Biometria e Fotos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setWizardOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={18} /> Nova Avaliação
          </button>
        </div>
      </header>

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
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Métricas Rápidas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Gordura Corporal</span><span className="text-sm font-bold text-indigo-600">{selectedStudent.bf}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Peso Atual</span><span className="text-sm font-bold text-slate-800">{selectedStudent.weight}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'anthropometry' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Medidas de Circunferência</h3>
            <div className="space-y-3">
              {['Tórax', 'Cintura', 'Quadril', 'Braço', 'Coxa'].map(label => (
                <div key={label} className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm font-medium">{label}</span><span className="font-bold">0.0 cm</span></div>
              ))}
            </div>
          </div>
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
                { label: 'Anterior (Frente)', url: 'https://picsum.photos/seed/frente/400/600' },
                { label: 'Lateral (Perfil)', url: 'https://picsum.photos/seed/perfil/400/600' },
              ].map((pose, idx) => (
                <div key={idx} className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{pose.label}</span>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] bg-slate-200">
                    <img src={pose.url} className="w-full h-full object-cover" alt={pose.label} />
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
