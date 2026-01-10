
import React from 'react';
import { Users, Activity, CreditCard, TrendingUp, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Seg', valor: 4 },
  { name: 'Ter', valor: 7 },
  { name: 'Qua', valor: 5 },
  { name: 'Qui', valor: 8 },
  { name: 'Sex', valor: 10 },
  { name: 'Sáb', valor: 6 },
  { name: 'Dom', valor: 2 },
];

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Olá, Coach Lucas! 👋</h2>
        <p className="text-slate-500">Bem-vindo ao painel do treinador FitFlow.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Alunos Ativos', value: '24', icon: Users, color: 'bg-indigo-600', trend: '+2 este mês' },
          { label: 'Treinos Criados', value: '142', icon: Activity, color: 'bg-emerald-500', trend: '8 pendentes' },
          { label: 'Faturamento', value: 'R$ 4.200', icon: CreditCard, color: 'bg-violet-500', trend: 'Meta: 90%' },
          { label: 'Retenção', value: '92%', icon: TrendingUp, color: 'bg-orange-500', trend: 'Excelente' },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} text-white shadow-sm`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-800">{stat.value}</h3>
            <p className="mt-1 text-[10px] font-medium text-slate-400">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Engajamento de Alunos</h3>
            <select className="rounded-lg border bg-slate-50 px-3 py-1 text-sm outline-none font-medium text-slate-600">
              <option>Esta semana</option>
              <option>Último mês</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="valor" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-slate-800">Alertas Importantes</h3>
          <div className="space-y-4">
            {[
              { title: 'Pagamento Vencido', user: 'Gabriel Silva', time: '2h atrás', type: 'error' },
              { title: 'Treino Finalizado', user: 'Ana Souza', time: '4h atrás', type: 'success' },
              { title: 'Avaliação Pendente', user: 'Ricardo Meira', time: '1 dia atrás', type: 'warning' },
              { title: 'Novo Aluno', user: 'Mariana Costa', time: '2 dias atrás', type: 'info' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 p-2 transition-all cursor-pointer">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${alert.type === 'error' ? 'bg-red-500' :
                    alert.type === 'success' ? 'bg-emerald-500' :
                      alert.type === 'warning' ? 'bg-orange-500' : 'bg-indigo-500'
                  }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{alert.user}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{alert.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            Ver todas notificações <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
