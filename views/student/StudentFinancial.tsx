
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ArrowLeft, Wallet, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface StudentFinancialProps {
    student: any;
    onBack: () => void;
}

const StudentFinancial: React.FC<StudentFinancialProps> = ({ student, onBack }) => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinancialRecords();
    }, [student]);

    const fetchFinancialRecords = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('financial_records')
            .select('*')
            .eq('student_id', student.id)
            .order('due_date', { ascending: false });

        if (error) {
            console.error('Error fetching financial records:', error);
        } else if (data) {
            setRecords(data);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Carregando faturas...</div>;
    }

    const getStatusStyle = (record: any) => {
        const today = new Date().toISOString().split('T')[0];
        const isLate = record.status !== 'paid' && record.due_date < today;

        if (record.status === 'paid') return { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2, label: 'Pago' };
        if (record.status === 'overdue' || isLate) return { color: 'text-red-600 bg-red-50', icon: AlertCircle, label: 'Atrasado' };
        return { color: 'text-amber-600 bg-amber-50', icon: Clock, label: 'Pendente' };
    };

    return (
        <div className="p-4 space-y-6 animate-in slide-in-from-right-4">
            <h1 className="text-2xl font-bold text-slate-800">Suas Faturas</h1>

            <div className="space-y-4">
                {records.length > 0 ? (
                    records.map((record) => {
                        const status = getStatusStyle(record);
                        return (
                            <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl ${status.color} flex items-center justify-center`}>
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">R$ {record.amount.toFixed(2).replace('.', ',')}</h3>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Calendar size={12} /> Vencimento: {new Date(record.due_date).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${status.color}`}>
                                    <status.icon size={12} />
                                    {status.label}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Wallet size={32} />
                        </div>
                        <h3 className="font-bold text-slate-700">Nenhuma fatura encontrada</h3>
                        <p className="text-slate-500 text-sm mt-1">Você não possui registros financeiros no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentFinancial;
