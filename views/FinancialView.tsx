import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Download, Filter, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Settings, Mail, MessageSquare, Bell, Sparkles, Send, CheckCircle2, Plus, X, Trash2 } from 'lucide-react';
import { generateReminderMessage } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { Student } from '../types';

interface FinancialRecord {
  id: string;
  created_at: string;
  student_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method: 'pix' | 'credit_card' | 'cash' | 'boleto' | null;
  description: string;
  student?: { name: string }; // Joined field
}

const FinancialView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(true);
  const [isGeneratingMsg, setIsGeneratingMsg] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'success';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { }, type: 'warning' });

  // Supabase State
  const [transactions, setTransactions] = useState<FinancialRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<{
    type: 'income' | 'expense';
    amount: string;
    description: string;
    student_id: string;
    due_date: string;
    payment_method: string;
  }>({
    type: 'income',
    amount: '',
    description: '',
    student_id: '',
    due_date: new Date().toISOString().split('T')[0],
    payment_method: 'pix'
  });

  const fetchRecords = async () => {
    setIsLoading(true);
    const { data: records, error } = await supabase
      .from('financial_records')
      .select('*, student:students(name)')
      .order('due_date', { ascending: false });

    if (error) console.error('Error fetching records:', error);
    else setTransactions(records as any || []);
    setIsLoading(false);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('id, name').order('name');
    if (data) setStudents(data as Student[]);
  };

  useEffect(() => {
    fetchRecords();
    fetchStudents();
  }, []);

  const handleCreateTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) return alert('Preencha os campos obrigatórios!');

    const { error } = await supabase.from('financial_records').insert([{
      ...newTransaction,
      student_id: newTransaction.type === 'expense' ? null : (newTransaction.student_id || null), // Force null for expenses
      status: 'pending' // Default status
    }]);

    if (error) {
      console.error('Error creating transaction:', error);
      alert('Erro ao criar transação.');
    } else {
      alert('Transação criada com sucesso!');
      setShowAddModal(false);
      fetchRecords();
      // Full reset is handled by the buttons now, but good practice to clear here too or leave as is since modal closes
    }
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const statusLabel = newStatus === 'paid' ? 'Paga' : 'Pendente';

    setConfirmModal({
      isOpen: true,
      title: 'Alterar Status',
      message: `Deseja realmente marcar esta transação como "${statusLabel}"?`,
      type: newStatus === 'paid' ? 'success' : 'warning',
      onConfirm: async () => {
        const { error } = await supabase.from('financial_records').update({ status: newStatus }).eq('id', id);
        if (error) {
          console.error('Error updating status:', error);
        } else {
          fetchRecords();
        }
      }
    });
  };

  const deleteTransaction = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Transação',
      message: 'Tem certeza que deseja excluir este lançamento? Essa ação não pode ser desfeita.',
      type: 'danger',
      onConfirm: async () => {
        const { error } = await supabase.from('financial_records').delete().eq('id', id);
        if (error) {
          console.error('Error deleting transaction:', error);
          alert('Erro ao excluir.');
        } else {
          fetchRecords();
        }
      }
    });
  };

  const handleGenerateAI = async (studentName: string, amount: number, date: string) => {
    setIsGeneratingMsg(studentName);
    const msg = await generateReminderMessage(studentName, `R$ ${amount}`, date);
    setAiMessage(msg || "");
    setIsGeneratingMsg(null);
  };

  const renderCalendar = () => {
    // Current Month View (Simplified for MVP)
    const daysInMonth = 31; // Static for demo, could be dynamic
    const startDay = 5; // Static
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border-b border-r border-slate-50 bg-slate-50/20"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayString = `2024-03-${d.toString().padStart(2, '0')}`; // Mock current month logic or sync with real date
      // Just checking day match for MVP
      const dayTransactions = transactions.filter(t => parseInt(t.due_date.split('-')[2]) === d);

      days.push(
        <div key={d} className={`h-24 border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 group relative bg-white`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-bold text-slate-400`}>{d}</span>
          </div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
            {dayTransactions.map((t, idx) => (
              <div key={idx} className={`truncate rounded px-1.5 py-0.5 text-[9px] font-bold border ${t.type === 'income' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {t.amount}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  // Dashboard Calculations
  const totalBalance = transactions.reduce((acc, t) => t.type === 'income' && t.status === 'paid' ? acc + t.amount : (t.type === 'expense' && t.status === 'paid' ? acc - t.amount : acc), 0);
  const totalIncome = transactions.reduce((acc, t) => t.type === 'income' && t.status === 'paid' ? acc + t.amount : acc, 0);
  const totalExpense = transactions.reduce((acc, t) => t.type === 'expense' && t.status === 'paid' ? acc + t.amount : acc, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>
          <p className="text-slate-500">Gestão de faturamento e recebíveis.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setNewTransaction({ type: 'expense', amount: '', description: '', student_id: '', due_date: new Date().toISOString().split('T')[0], payment_method: 'pix' }); setShowAddModal(true); }} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors shadow-sm">
            Nova Despesa
          </button>
          <button onClick={() => { setNewTransaction({ type: 'income', amount: '', description: '', student_id: '', due_date: new Date().toISOString().split('T')[0], payment_method: 'pix' }); setShowAddModal(true); }} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
            Nova Receita
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Automation Settings Card - Static for now */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="text-indigo-600" size={18} />
              <h3 className="font-bold text-slate-800">Automação</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isAutomationEnabled} onChange={() => setIsAutomationEnabled(!isAutomationEnabled)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Notificações automáticas ativadas para alunos com boletos/cobranças pendentes.</p>
          </div>
        </div>

        {/* Financial Balance Card */}
        <div className="lg:col-span-2 rounded-3xl bg-indigo-700 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Saldo Realizado (Pago)</p>
              <h3 className="text-4xl font-black tracking-tight">R$ {totalBalance.toFixed(2)}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
              <DollarSign size={28} className="text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 mb-2 text-[10px] font-bold uppercase tracking-widest"><ArrowUpRight size={14} /> Receitas Pagas</div>
              <h4 className="text-xl font-bold">R$ {totalIncome.toFixed(2)}</h4>
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-300 mb-2 text-[10px] font-bold uppercase tracking-widest"><ArrowDownRight size={14} /> Despesas Pagas</div>
              <h4 className="text-xl font-bold">R$ {totalExpense.toFixed(2)}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Table/Calendar */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-800">Fluxo de Caixa</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><List size={16} /></button>
              <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><CalendarIcon size={16} /></button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Descrição / Aluno</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Vencimento</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-6 py-4">
                      <button onClick={() => toggleStatus(tx.id, tx.status)} className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter cursor-pointer hover:opacity-80 ${tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : (tx.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}`}>
                        {tx.status === 'paid' ? 'Paga' : (tx.status === 'overdue' ? 'Atrasada' : 'Pendente')}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{tx.description}</p>
                      {tx.student && <p className="text-xs text-slate-500">{tx.student.name}</p>}
                    </td>
                    <td className={`px-6 py-4 font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'expense' ? '- ' : ''}R$ {tx.amount}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{tx.due_date.split('-').reverse().join('/')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tx.status === 'pending' && tx.student?.name && tx.type === 'income' && (
                          <button onClick={() => handleGenerateAI(tx.student!.name, tx.amount, tx.due_date)} disabled={isGeneratingMsg === tx.student?.name} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Gerar Cobrança IA">
                            <Sparkles size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400">Nenhum registro encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-xl overflow-hidden shadow-sm">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="bg-slate-50/80 p-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-r border-slate-100">{day}</div>
              ))}
              {renderCalendar()}
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                Nova {newTransaction.type === 'income' ? 'Receita' : 'Despesa'}
              </h3>
              <button onClick={() => setShowAddModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                <input type="text" className="w-full rounded-xl border border-slate-200 p-3" placeholder="Ex: Mensalidade Março" value={newTransaction.description} onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Valor</label>
                  <input type="number" className="w-full rounded-xl border border-slate-200 p-3" placeholder="0.00" value={newTransaction.amount} onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Vencimento</label>
                  <input type="date" className="w-full rounded-xl border border-slate-200 p-3" value={newTransaction.due_date} onChange={e => setNewTransaction({ ...newTransaction, due_date: e.target.value })} />
                </div>
              </div>

              {/* Only show student select for Income */}
              {newTransaction.type === 'income' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Aluno (Opcional)</label>
                  <select className="w-full rounded-xl border border-slate-200 p-3" value={newTransaction.student_id} onChange={e => setNewTransaction({ ...newTransaction, student_id: e.target.value })}>
                    <option value="">Selecione...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div className="pt-4">
                <button onClick={handleCreateTransaction} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                  Salvar Lançamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {aiMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-lg">Mensagem da FitFlow AI</h3>
              </div>
              <p className="text-indigo-100 text-sm">Pronto para enviar via WhatsApp para seu aluno!</p>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-700 text-sm italic leading-relaxed">
                "{aiMessage}"
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setAiMessage(null)}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(aiMessage); alert('Copiado!'); setAiMessage(null); }}
                  className="flex-1 py-3 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                >
                  <Send size={16} /> Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};

export default FinancialView;
