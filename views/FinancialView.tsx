
import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Download, Filter, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Settings, Mail, MessageSquare, Bell, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { generateReminderMessage } from '../services/geminiService';

const FinancialView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(true);
  const [isGeneratingMsg, setIsGeneratingMsg] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const transactions = [
    { id: '1', status: 'Paga', student: 'Gabriel Silva', method: 'Cartão', date: '2024-03-22', amount: 'R$ 150,00', day: 22, reminderSent: true },
    { id: '2', status: 'Paga', student: 'Ana Souza', method: 'PIX', date: '2024-03-21', amount: 'R$ 150,00', day: 21, reminderSent: true },
    { id: '3', status: 'Pendente', student: 'Ricardo Meira', method: 'Boleto', date: '2024-03-26', amount: 'R$ 150,00', alert: true, day: 26, reminderSent: false },
    { id: '4', status: 'Paga', student: 'Mariana Costa', method: 'Cartão', date: '2024-03-19', amount: 'R$ 150,00', day: 19, reminderSent: true },
    { id: '5', status: 'Pendente', student: 'João Pedro', method: 'PIX', date: '2024-03-28', amount: 'R$ 150,00', day: 28, reminderSent: false },
    { id: '6', status: 'Paga', student: 'Carla Dias', method: 'Cartão', date: '2024-03-05', amount: 'R$ 200,00', day: 5, reminderSent: true },
  ];

  const handleGenerateAI = async (student: string, amount: string, date: string) => {
    setIsGeneratingMsg(student);
    const msg = await generateReminderMessage(student, amount, date);
    setAiMessage(msg || "");
    setIsGeneratingMsg(null);
  };

  const renderCalendar = () => {
    const daysInMonth = 31;
    const startDay = 5; 
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border-b border-r border-slate-50 bg-slate-50/20"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayTransactions = transactions.filter(t => t.day === d);
      const isToday = d === 22;
      days.push(
        <div key={d} className={`h-24 border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 group relative ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-bold ${isToday ? 'h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center' : 'text-slate-400'}`}>
              {d}
            </span>
          </div>
          <div className="mt-1 space-y-1">
            {dayTransactions.map((t, idx) => (
              <div 
                key={idx} 
                className={`truncate rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                  t.status === 'Paga' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse'
                }`}
              >
                {t.student.split(' ')[0]} - {t.amount}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>
          <p className="text-slate-500">Gestão de faturamento e recebíveis programados.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} /> Exportar
          </button>
          <button className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
            Nova Receita
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Automation Settings Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
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
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Lembrete E-mail</span>
              </div>
              <CheckCircle2 size={18} className={isAutomationEnabled ? "text-emerald-500" : "text-slate-300"} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Push App Aluno</span>
              </div>
              <CheckCircle2 size={18} className={isAutomationEnabled ? "text-emerald-500" : "text-slate-300"} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-2">
              Disparos automáticos 3 dias antes do vencimento.
            </p>
          </div>
        </div>

        {/* Financial Balance Card */}
        <div className="lg:col-span-2 rounded-3xl bg-indigo-700 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Saldo Total</p>
              <h3 className="text-4xl font-black tracking-tight">R$ 12.450,80</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
              <DollarSign size={28} className="text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 mb-2 text-[10px] font-bold uppercase tracking-widest"><ArrowUpRight size={14} /> Receitas</div>
              <h4 className="text-xl font-bold">R$ 15.200,00</h4>
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-300 mb-2 text-[10px] font-bold uppercase tracking-widest"><ArrowDownRight size={14} /> Despesas</div>
              <h4 className="text-xl font-bold">R$ 2.749,20</h4>
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
          <div className="flex items-center gap-3">
             {viewMode === 'calendar' && <span className="text-xs font-bold text-slate-600 uppercase tracking-widest mr-4">Março 2024</span>}
             <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"><Filter size={16} /> Filtros</button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4">Automação</th>
                  <th className="px-6 py-4">Vencimento</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${
                        tx.status === 'Paga' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{tx.student}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 text-slate-400">
                        <Mail size={16} className={tx.reminderSent ? "text-indigo-500" : ""} />
                        <Bell size={16} className={tx.reminderSent ? "text-indigo-500" : ""} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{tx.date.split('-').reverse().join('/')}</td>
                    <td className="px-6 py-4 text-right">
                      {tx.status === 'Pendente' && (
                        <button 
                          onClick={() => handleGenerateAI(tx.student, tx.amount, tx.date)}
                          disabled={isGeneratingMsg === tx.student}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative overflow-hidden group/btn"
                        >
                          {isGeneratingMsg === tx.student ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto"></div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Sparkles size={16} className="group-hover/btn:animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Gerar Lembrete</span>
                            </div>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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

      {/* AI Message Preview Modal/Area */}
      {aiMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-lg">Mensagem da PeakFit AI</h3>
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
                  onClick={() => setAiMessage(null)}
                  className="flex-1 py-3 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                >
                  <Send size={16} /> Copiar e Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialView;
