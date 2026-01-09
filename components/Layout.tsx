
import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, Dumbbell, ClipboardCheck, Wallet, Menu, Bell, X, Check, Trash2, CreditCard, Activity, ClipboardList, Zap } from 'lucide-react';
import { Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: '0', 
      type: 'system', 
      title: 'Automação Ativa', 
      description: '3 lembretes de pagamento foram enviados automaticamente hoje.', 
      timestamp: 'Agora', 
      read: false 
    },
    { 
      id: '1', 
      type: 'payment', 
      title: 'Pagamento Vencido', 
      description: 'Gabriel Silva está com a mensalidade atrasada há 2 dias.', 
      timestamp: '2h atrás', 
      read: false,
      studentId: '1'
    },
    { 
      id: '2', 
      type: 'workout', 
      title: 'Treino Finalizado', 
      description: 'Ana Souza concluiu o treino de "Membros Superiores".', 
      timestamp: '4h atrás', 
      read: false,
      studentId: '2'
    }
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'workouts', label: 'Treinos', icon: Dumbbell },
    { id: 'evaluations', label: 'Avaliações', icon: ClipboardCheck },
    { id: 'financial', label: 'Financeiro', icon: Wallet },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard size={16} className="text-orange-600" />;
      case 'workout': return <Activity size={16} className="text-emerald-600" />;
      case 'evaluation': return <ClipboardList size={16} className="text-indigo-600" />;
      case 'system': return <Zap size={16} className="text-violet-600" />;
      default: return <Bell size={16} className="text-slate-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-orange-50';
      case 'workout': return 'bg-emerald-50';
      case 'evaluation': return 'bg-indigo-50';
      case 'system': return 'bg-violet-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-64">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold italic">P</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Peak<span className="text-indigo-600">Fit</span></h1>
        </div>
        
        <div className="flex items-center gap-4 relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-all ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-indigo-600 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Notificações</h3>
                <div className="flex gap-2">
                  <button onClick={clearAll} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Limpar tudo">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setShowNotifications(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-3">
                      <Bell size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-400">Nenhuma notificação por aqui.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!n.read ? 'bg-indigo-50/20' : ''}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${getNotificationColor(n.type)} shadow-sm`}>
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className={`text-sm font-bold ${!n.read ? 'text-indigo-600' : 'text-slate-800'}`}>{n.title}</h4>
                              <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">{n.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.description}</p>
                            {!n.read && (
                              <button className="mt-2 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 uppercase tracking-wider">
                                <Check size={10} /> Marcar como lida
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-slate-50/30 text-center">
                  <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                    Ver histórico completo
                  </button>
                </div>
              )}
            </div>
          )}

          <img 
            src="https://picsum.photos/id/64/100/100" 
            alt="Profile" 
            className="h-9 w-9 rounded-full border border-slate-200"
          />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-white md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold italic">P</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Peak<span className="text-indigo-600">Fit</span></h1>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-500'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t bg-white py-2 md:hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${
              activeTab === item.id ? 'text-indigo-600 scale-105' : 'text-slate-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
