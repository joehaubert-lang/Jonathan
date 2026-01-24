
import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, MoreVertical, MessageCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Student } from '../types';
import AddStudentModal from '../components/AddStudentModal';
import StudentActionModal from '../components/StudentActionModal';
import { supabase } from '../services/supabaseClient';

interface StudentsViewProps {
  onNavigateToEvaluations: (studentId: string) => void;
}

const StudentsView: React.FC<StudentsViewProps> = ({ onNavigateToEvaluations }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Action Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null);

  // Filter State
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map DB snake_case to TS camelCase and format types
        const mappedStudents: Student[] = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          photo: s.photo,
          status: s.status,
          lastActivity: s.last_activity ? new Date(s.last_activity).toLocaleDateString() : 'Nunca',
          goal: s.goal,
          plan: s.plan,
          phone: s.phone,

          gender: s.gender,
          birth_date: s.birth_date
        }));
        setStudents(mappedStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Erro ao carregar alunos. Verifique o console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const handleEvaluations = (studentId: string) => {
    onNavigateToEvaluations(studentId);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudentForAction(student);
    setActionModalOpen(true);
    setActiveMenuId(null);
  };

  const confirmDelete = async () => {
    if (selectedStudentForAction) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', selectedStudentForAction.id);

        if (error) throw error;

        setStudents(prev => prev.filter(s => s.id !== selectedStudentForAction.id));
        setActionModalOpen(false);
        setSelectedStudentForAction(null);
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Erro ao excluir aluno.');
      }
    }
  };

  const confirmToggleStatus = async () => {
    if (selectedStudentForAction) {
      const newStatus = selectedStudentForAction.status === 'inactive' ? 'active' : 'inactive';
      try {
        const { error } = await supabase
          .from('students')
          .update({ status: newStatus })
          .eq('id', selectedStudentForAction.id);

        if (error) throw error;

        setStudents(prev => prev.map(s => s.id === selectedStudentForAction.id ? { ...s, status: newStatus } : s));
        setActionModalOpen(false);
        setSelectedStudentForAction(null);
      } catch (error) {
        console.error('Error toggling student status:', error);
        alert('Erro ao alterar status do aluno.');
      }
    }
  };

  const handleSaveStudent = async (studentData: any) => {
    try {
      // Map TS camelCase to DB snake_case for saving
      const dbData = {
        name: studentData.name,
        email: studentData.email,
        photo: studentData.photo || `https://picsum.photos/seed/${Date.now()}/100/100`, // Default random photo if null
        status: studentData.status || 'active',
        // last_activity: handled by DB default or specific update logic? 
        // For new, default is now(). For update, we might preserve or update it.
        // Let's not overwite last_activity on basic edit unless needed.
        goal: studentData.goal,
        plan: studentData.plan,
        phone: studentData.phone,
        gender: studentData.gender,
        birth_date: studentData.birth_date || null
      };

      let savedStudent = null;

      if (studentData.id) {
        // Update existing
        const { data, error } = await supabase
          .from('students')
          .update(dbData)
          .eq('id', studentData.id)
          .select() // Return updated record
          .single();

        if (error) throw error;
        savedStudent = data;

        // Update local state
        if (savedStudent) {
          setStudents(prev => prev.map(s => s.id === savedStudent.id ? {
            ...s,
            name: savedStudent.name,
            email: savedStudent.email,
            photo: savedStudent.photo,
            status: savedStudent.status,
            goal: savedStudent.goal,
            plan: savedStudent.plan,
            phone: savedStudent.phone,
            gender: savedStudent.gender,
            birth_date: savedStudent.birth_date
          } : s));
        }

      } else {
        // Create new
        const { data, error } = await supabase
          .from('students')
          .insert([dbData])
          .select()
          .single();

        if (error) throw error;
        savedStudent = data;

        if (savedStudent) {
          const newStudentMapped: Student = {
            id: savedStudent.id,
            name: savedStudent.name,
            email: savedStudent.email,
            photo: savedStudent.photo,
            status: savedStudent.status,
            lastActivity: 'Novo', // DB has timestamp, UI friendly text
            goal: savedStudent.goal,
            plan: savedStudent.plan,
            phone: savedStudent.phone,
            gender: savedStudent.gender,
            birth_date: savedStudent.birth_date
          };
          setStudents([newStudentMapped, ...students]);
        }
      }

      setEditingStudent(null);
      setIsModalOpen(false);

    } catch (error) {
      console.error('Error saving student:', error);
      alert('Erro ao salvar aluno. Verifique se o e-mail já não está cadastrado.');
    }
  };

  const toggleMenu = (studentId: string) => {
    setActiveMenuId(activeMenuId === studentId ? null : studentId);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && s.status !== 'inactive';
    if (filterStatus === 'inactive') return matchesSearch && s.status === 'inactive';
    return matchesSearch;
  });

  return (
    <div className="space-y-6" onClick={() => setActiveMenuId(null)}>
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingStudent(null); }}
        studentToEdit={editingStudent}
        onSave={handleSaveStudent}
      />

      <StudentActionModal
        isOpen={actionModalOpen}
        onClose={() => { setActionModalOpen(false); setSelectedStudentForAction(null); }}
        studentName={selectedStudentForAction?.name || ''}
        onDelete={confirmDelete}
        onToggleStatus={confirmToggleStatus}
        isInactive={selectedStudentForAction?.status === 'inactive'}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Seus Alunos</h2>
          <p className="text-slate-500">Gerencie sua base de {students.length} alunos no FitFlow.</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setEditingStudent(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <UserPlus size={18} /> Novo Aluno
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou e-mail..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Ativos
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === 'inactive' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Inativos
          </button>
        </div>
      </div>

      {/* Student List */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <span className="text-slate-400">Carregando alunos...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-slate-500 mb-2">Nenhum aluno encontrado.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-indigo-600 font-bold hover:underline"
          >
            Adicionar primeiro aluno
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {filteredStudents.map((student) => (
            <div key={student.id} className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:border-indigo-200 hover:shadow-md">

              {/* Left: User Info */}
              <div className="flex flex-1 items-start gap-4">
                <div className="relative shrink-0">
                  <img src={student.photo || 'https://via.placeholder.com/100'} alt={student.name} className="h-12 w-12 rounded-2xl object-cover border border-slate-100" />
                  <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${student.status === 'active' ? 'bg-emerald-500' :
                    student.status === 'pending' ? 'bg-orange-500' : 'bg-slate-300'
                    }`}></span>
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{student.goal}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Atividade: {student.lastActivity}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions & Plan */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleWhatsApp(student.phone); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    title="WhatsApp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="lucide lucide-message-circle">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEvaluations(student.id); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 transition-all"
                    title="Avaliações"
                  >
                    <FileText size={16} />
                  </button>

                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMenu(student.id); }}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${activeMenuId === student.id ? 'bg-slate-200 text-slate-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === student.id && (
                      <div className="absolute right-0 top-full mt-2 w-32 rounded-xl bg-white p-1 shadow-xl border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(student); }}
                          className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(student); }}
                          className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1 shadow-sm border border-slate-100">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide">{student.plan}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsView;
