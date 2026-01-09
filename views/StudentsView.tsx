
import React, { useState } from 'react';
import { Search, UserPlus, Filter, MoreVertical, MessageCircle, FileText } from 'lucide-react';
import { Student } from '../types';

const mockStudents: Student[] = [
  { id: '1', name: 'Gabriel Silva', email: 'gabriel@email.com', photo: 'https://picsum.photos/id/1/100/100', status: 'active', lastActivity: 'Hoje, 10:30', goal: 'Hipertrofia', plan: 'Trimestral' },
  { id: '2', name: 'Ana Souza', email: 'ana.souza@email.com', photo: 'https://picsum.photos/id/2/100/100', status: 'active', lastActivity: 'Ontem', goal: 'Emagrecimento', plan: 'Mensal' },
  { id: '3', name: 'Ricardo Meira', email: 'ricardo@email.com', photo: 'https://picsum.photos/id/3/100/100', status: 'pending', lastActivity: '3 dias atrás', goal: 'Condicionamento', plan: 'Anual' },
  { id: '4', name: 'Mariana Costa', email: 'marianac@email.com', photo: 'https://picsum.photos/id/4/100/100', status: 'active', lastActivity: 'Hoje, 08:15', goal: 'Flexibilidade', plan: 'Trimestral' },
  { id: '5', name: 'João Pedro', email: 'jp@email.com', photo: 'https://picsum.photos/id/5/100/100', status: 'inactive', lastActivity: '2 semanas atrás', goal: 'Reabilitação', plan: 'Mensal' },
];

const StudentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = mockStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Seus Alunos</h2>
          <p className="text-slate-500">Gerencie sua base de {mockStudents.length} alunos no PeakFit.</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
          <UserPlus size={18} /> Novo Aluno
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
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
        <button className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* Student List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {filteredStudents.map((student) => (
          <div key={student.id} className="group flex flex-col items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-md lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative">
                <img src={student.photo} alt={student.name} className="h-14 w-14 rounded-2xl object-cover border border-slate-100" />
                <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  student.status === 'active' ? 'bg-emerald-500' : 
                  student.status === 'pending' ? 'bg-orange-500' : 'bg-slate-300'
                }`}></span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-600 uppercase tracking-wider">{student.goal}</span>
                  <span>•</span>
                  <span>Atividade: {student.lastActivity}</span>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-4 lg:w-auto">
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 shadow-sm">
                <span className="text-xs font-bold text-indigo-700">{student.plan}</span>
              </div>
              <div className="flex gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                  <MessageCircle size={20} />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-200 transition-all">
                  <FileText size={20} />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-200 transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsView;
