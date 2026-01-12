
import React, { useEffect, useState } from 'react';
import { Users, Activity, CreditCard, TrendingUp, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '../services/supabaseClient';
import { Notification } from '../types';

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    activeStudents: 0,
    createdWorkouts: 0,
    revenue: 0,
    retention: '0%'
  });
  const [chartData, setChartData] = useState<{ name: string; valor: number }[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Stats
      const { count: activeStudentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalStudentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: workoutsCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true });

      // Estimated Revenue: Active Students * R$ 100 (Avg Ticket)
      const estimatedRevenue = (activeStudentsCount || 0) * 100;

      // Calculate Retention: Rule of thumb (Active / Total) * 100
      let retentionRate = 0;
      if (totalStudentsCount && totalStudentsCount > 0) {
        retentionRate = Math.round(((activeStudentsCount || 0) / totalStudentsCount) * 100);
      }

      setStats({
        activeStudents: activeStudentsCount || 0,
        createdWorkouts: workoutsCount || 0,
        revenue: estimatedRevenue,
        retention: `${retentionRate}%`
      });

      // 2. Fetch Chart Data (Last 7 days workouts)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today

      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Process chart data
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const last7DaysMap = new Map<string, number>();

      // Initialize last 7 days with 0
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayName = days[d.getDay()];
        last7DaysMap.set(dayName, 0);
      }

      // Count workouts per day
      workoutsData?.forEach(w => {
        const d = new Date(w.created_at);
        const dayName = days[d.getDay()];
        if (last7DaysMap.has(dayName)) {
          last7DaysMap.set(dayName, (last7DaysMap.get(dayName) || 0) + 1);
        }
      });

      const processedChartData = Array.from(last7DaysMap.entries()).map(([name, valor]) => ({ name, valor }));
      setChartData(processedChartData);

      // 3. Fetch Notifications
      // Mock notifications if DB is empty for better UI experience initially, or fetch real
      const { data: notifsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (notifsData && notifsData.length > 0) {
        // Map to match UI expected format if needed, but we can adapt UI to type
        setNotifications(notifsData as any);
      } else {
        // Fallback mock if empty so dashboard isn't ugly blank
        setNotifications([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Olá, Treinador! 👋</h2>
        <p className="text-slate-500">Bem-vindo ao painel do FitFlow.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Alunos Ativos', value: stats.activeStudents.toString(), icon: Users, color: 'bg-indigo-600', trend: 'Base atual' },
          { label: 'Treinos Criados', value: stats.createdWorkouts.toString(), icon: Activity, color: 'bg-emerald-500', trend: 'Total acumulado' },
          { label: 'Faturamento Est.', value: `R$ ${stats.revenue.toLocaleString('pt-BR')}`, icon: CreditCard, color: 'bg-violet-500', trend: 'Baseado em ativos' },
          { label: 'Retenção', value: stats.retention, icon: TrendingUp, color: 'bg-orange-500', trend: 'Excelente' },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} text-white shadow-sm`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-800">{loading ? '-' : stat.value}</h3>
            <p className="mt-1 text-[10px] font-medium text-slate-400">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Treinos Criados (Últimos 7 dias)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="valor" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-slate-800">Alertas Recentes</h3>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma notificação recente.</p>
            ) : notifications.map((alert: any, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 p-2 transition-all cursor-pointer">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${alert.type === 'error' ? 'bg-red-500' :
                  alert.type === 'success' ? 'bg-emerald-500' :
                    alert.type === 'warning' ? 'bg-orange-500' : 'bg-indigo-500'
                  }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{alert.description || alert.user}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(alert.timestamp || alert.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          {/* 
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            Ver todas notificações <ChevronRight size={16} />
          </button>
           */}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
