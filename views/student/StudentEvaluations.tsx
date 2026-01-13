
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ArrowLeft, TrendingUp, Calendar, Ruler, Activity, ChevronRight, Scissors, TrendingDown, Check, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentEvaluationsProps {
    student: any;
    onBack: () => void;
}

const StudentEvaluations: React.FC<StudentEvaluationsProps> = ({ student, onBack }) => {
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonIds, setComparisonIds] = useState<string[]>([]);
    const [showComparisonResult, setShowComparisonResult] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvaluations();
    }, [student]);

    const fetchEvaluations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('evaluations')
            .select('*')
            .eq('student_id', student.id)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching evaluations:', error);
        } else if (data) {
            setEvaluations(data);
        }
        setLoading(false);
    };

    const toggleComparisonId = (id: string) => {
        if (comparisonIds.includes(id)) {
            setComparisonIds(prev => prev.filter(i => i !== id));
        } else if (comparisonIds.length < 2) {
            setComparisonIds(prev => [...prev, id]);
        }
    };

    // Prepare chart data (Oldest to Newest)
    const evolutionData = evaluations.map(e => ({
        date: new Date(e.date || e.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        peso: e.weight,
        gordura: e.body_fat
    })).reverse();

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Carregando avaliações...</div>;
    }

    if (showComparisonResult && comparisonIds.length === 2) {
        const sorted = evaluations
            .filter(e => comparisonIds.includes(e.id))
            .sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime());

        const oldEval = sorted[0];
        const newEval = sorted[1];

        const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

        const renderDelta = (oldVal: number, newVal: number, inverse = false) => {
            const delta = newVal - oldVal;
            const isZero = delta === 0;
            let colorClass = 'text-slate-400';
            if (!isZero) {
                const isGood = inverse ? delta < 0 : delta > 0;
                colorClass = isGood ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50';
            }

            return (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 w-fit ${colorClass}`}>
                    {!isZero && (delta > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />)}
                    {delta > 0 ? '+' : ''}{delta.toFixed(1).replace('.', ',')}
                </span>
            );
        };

        const labelMap: any = {
            chestCirc: 'Peitoral', waist: 'Cintura', abdomenCirc: 'Abdômen',
            hip: 'Quadril', rightArm: 'Braço D.', leftArm: 'Braço E.',
            rightThigh: 'Coxa D.', leftThigh: 'Coxa E.'
        };

        return (
            <div className="p-4 space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowComparisonResult(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">Comparativo</h2>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center items-end">
                    <div className="col-start-2 bg-white p-2 rounded-xl border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Anterior</p>
                        <p className="font-bold text-[10px] text-slate-700">{formatDate(oldEval.date || oldEval.created_at)}</p>
                    </div>
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
                        <p className="text-[8px] font-bold text-indigo-200 uppercase">Atual</p>
                        <p className="font-bold text-[10px]">{formatDate(newEval.date || newEval.created_at)}</p>
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase italic">Evolução</div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 text-sm">Composição</div>
                    <div className="divide-y divide-slate-50">
                        <div className="grid grid-cols-4 gap-2 p-3 items-center">
                            <span className="text-xs text-slate-600 font-medium">Peso (kg)</span>
                            <span className="text-center text-xs opacity-60">{oldEval.weight}</span>
                            <span className="text-center text-xs font-bold text-slate-800">{newEval.weight}</span>
                            <div className="flex justify-center">{renderDelta(oldEval.weight, newEval.weight, true)}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 p-3 items-center">
                            <span className="text-xs text-slate-600 font-medium">Gordura (%)</span>
                            <span className="text-center text-xs opacity-60">{oldEval.body_fat || '-'}</span>
                            <span className="text-center text-xs font-bold text-slate-800">{newEval.body_fat || '-'}</span>
                            <div className="flex justify-center">{renderDelta(oldEval.body_fat || 0, newEval.body_fat || 0, true)}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 text-sm">Medidas (cm)</div>
                    <div className="divide-y divide-slate-50">
                        {Object.entries(labelMap).map(([key, label]: any) => {
                            const v1 = parseFloat(oldEval.measurements?.[key] || 0);
                            const v2 = parseFloat(newEval.measurements?.[key] || 0);
                            if (!v1 && !v2) return null;
                            const isInverse = ['waist', 'abdomenCirc'].includes(key);

                            return (
                                <div key={key} className="grid grid-cols-4 gap-2 p-3 items-center">
                                    <span className="text-xs text-slate-600 font-medium">{label}</span>
                                    <span className="text-center text-xs opacity-60">{v1 || '-'}</span>
                                    <span className="text-center text-xs font-bold text-slate-800">{v2 || '-'}</span>
                                    <div className="flex justify-center">{renderDelta(v1, v2, isInverse)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (selectedEvaluation) {
        const measurements = selectedEvaluation.measurements || {};
        const labelMap: any = {
            chestCirc: 'Peitoral', waist: 'Cintura', abdomenCirc: 'Abdômen',
            hip: 'Quadril', rightArm: 'Braço Direito', leftArm: 'Braço Esquerdo',
            rightThigh: 'Coxa Direita', leftThigh: 'Coxa Esquerda',
            muscle_mass: 'Massa Muscular'
        };

        return (
            <div className="p-4 space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedEvaluation(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Detalhes da Avaliação</h2>
                        <p className="text-sm text-slate-500">{new Date(selectedEvaluation.date || selectedEvaluation.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>

                {/* Body Composition Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Peso Atual</span>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-black text-slate-800">{selectedEvaluation.weight}</span>
                            <span className="text-slate-500 font-bold mb-1">kg</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gordura Corporal</span>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-black text-indigo-600">{selectedEvaluation.body_fat || '--'}</span>
                            <span className="text-indigo-400 font-bold mb-1">%</span>
                        </div>
                    </div>
                </div>

                {/* Measurements Grid */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                        <Ruler size={16} className="text-indigo-600" /> Medidas e Perímetros
                    </div>
                    <div className="divide-y divide-slate-50">
                        {Object.entries(labelMap).map(([key, label]: any) => {
                            const val = measurements[key];
                            if (!val) return null;
                            return (
                                <div key={key} className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors">
                                    <span className="text-slate-600 font-medium">{label}</span>
                                    <span className="font-bold text-slate-800">{val}{key === 'muscle_mass' ? 'kg' : 'cm'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Photos if any */}
                {selectedEvaluation.photos && Object.keys(selectedEvaluation.photos).length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-bold text-slate-700 ml-1 flex items-center gap-2">
                            Fotos da Avaliação
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(selectedEvaluation.photos).map(([side, url]: any) => (
                                <div key={side} className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                                    <img src={url} alt={side} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Suas Avaliações</h1>
                <button
                    onClick={() => {
                        setIsComparing(!isComparing);
                        setComparisonIds([]);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isComparing ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200'}`}
                >
                    <Scissors size={16} className={isComparing ? 'rotate-90 transition-transform' : ''} />
                    {isComparing ? 'Cancelar' : 'Comparar'}
                </button>
            </div>

            {/* Evolution Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-600" /> Evolução de Peso
                </h3>
                <div className="h-64 w-full">
                    {evolutionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPesoStudent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={12} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="peso" stroke="#4f46e5" strokeWidth={3} fill="url(#colorPesoStudent)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            Sem dados suficientes.
                        </div>
                    )}
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <h3 className="font-bold text-slate-700">Histórico</h3>
                    {isComparing && (
                        <button
                            disabled={comparisonIds.length !== 2}
                            onClick={() => setShowComparisonResult(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all animate-in zoom-in-95"
                        >
                            Ver Comparativo ({comparisonIds.length}/2)
                        </button>
                    )}
                </div>
                {evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="relative">
                        <button
                            onClick={() => isComparing ? toggleComparisonId(evaluation.id) : setSelectedEvaluation(evaluation)}
                            className={`w-full bg-white p-5 rounded-2xl border transition-all group text-left flex items-center justify-between ${isComparing
                                ? (comparisonIds.includes(evaluation.id) ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-md' : 'border-slate-100 opacity-80')
                                : 'border-slate-100 shadow-sm hover:border-indigo-200'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {isComparing && (
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${comparisonIds.includes(evaluation.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'
                                        }`}>
                                        {comparisonIds.includes(evaluation.id) && <Check size={14} />}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                        <Calendar size={12} /> {new Date(evaluation.date || evaluation.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                    <div className="flex gap-4">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Peso</span>
                                            <span className="font-bold text-slate-800">{evaluation.weight}kg</span>
                                        </div>
                                        {evaluation.body_fat && (
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Gordura</span>
                                                <span className="font-bold text-slate-800">{evaluation.body_fat}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!isComparing && <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentEvaluations;
