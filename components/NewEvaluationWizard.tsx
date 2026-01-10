import React, { useState, useEffect } from 'react';
import { Ruler, Activity, Scale, Settings, CheckCircle2, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { Student } from '../types';

interface NewEvaluationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student; // Need student for gender logic
    onSave: (data: any) => void;
}

type Protocol = 'pollock3' | 'pollock7' | 'bioimpedance' | 'custom';
type SetupStep = 1 | 2 | 3 | 4;

const NewEvaluationWizard: React.FC<NewEvaluationWizardProps> = ({ isOpen, onClose, student, onSave }) => {
    const [step, setStep] = useState<SetupStep>(1);
    const [protocol, setProtocol] = useState<Protocol | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setProtocol(null);
        }
    }, [isOpen]);

    // Form Data
    const [formData, setFormData] = useState({
        // Standard
        weight: '',
        height: '',
        // Skinfolds (mm)
        chest: '',
        abdomen: '',
        thigh: '',
        triceps: '',
        suprailiac: '',
        subscapular: '',
        axillary: '',
        // Bioimpedance
        bf: '',
        muscleMass: '',
        visceralFat: '',
        // Perimeters (cm)
        neck: '',
        shoulder: '',
        chestCirc: '',
        waist: '',
        abdomenCirc: '',
        hip: '',
        rightArm: '',
        leftArm: '',
        rightThigh: '',
        leftThigh: '',
        rightCalf: '',
        leftCalf: '',
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < 4) setStep((prev) => (prev + 1) as SetupStep);
    };

    const handleBack = () => {
        if (step > 1) setStep((prev) => (prev - 1) as SetupStep);
    };

    const handleFinish = () => {
        // Calculate BF% if Pollock
        // For now just pass data
        onSave({ protocol, ...formData, date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) });
        onClose();
    };

    const steps = [
        { num: 1, label: 'Método' },
        { num: 2, label: 'Medidas' },
        { num: 3, label: 'Perímetros' },
        { num: 4, label: 'Resultados' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">Nova Avaliação Física</h3>
                    <div className="flex items-center gap-4">
                        {steps.map((s) => (
                            <div key={s.num} className="flex flex-col items-center">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s.num ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                                    step > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                                </div>
                                <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${step === s.num ? 'text-indigo-600' : 'text-slate-400'}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <h4 className="text-lg font-bold text-slate-800 mb-4">Escolha o Protocolo</h4>
                            <div className="grid gap-4">
                                <button
                                    onClick={() => setProtocol('pollock3')}
                                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:bg-slate-50 ${protocol === 'pollock3' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' : 'border-slate-100 bg-white'}`}
                                >
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Ruler size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-800">Pollock 3 Dobras</h5>
                                        <p className="text-sm text-slate-500 mt-1">Ideal para avaliação rápida. Usa Peitoral/Abd/Coxa (H) ou Tríceps/Supra/Coxa (M).</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setProtocol('pollock7')}
                                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:bg-slate-50 ${protocol === 'pollock7' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' : 'border-slate-100 bg-white'}`}
                                >
                                    <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-800">Pollock 7 Dobras</h5>
                                        <p className="text-sm text-slate-500 mt-1">Maior precisão. Inclui dobras axilar, subescapular, peitoral, abdominal, coxa, suprailíaca e tríceps.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setProtocol('bioimpedance')}
                                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:bg-slate-50 ${protocol === 'bioimpedance' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' : 'border-slate-100 bg-white'}`}
                                >
                                    <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Scale size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-800">Bioimpedância</h5>
                                        <p className="text-sm text-slate-500 mt-1">Entrada manual de BF% e composição obtido via balança ou equipamento.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setProtocol('custom')}
                                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:bg-slate-50 ${protocol === 'custom' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' : 'border-slate-100 bg-white'}`}
                                >
                                    <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                        <Settings size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-800">Personalizado</h5>
                                        <p className="text-sm text-slate-500 mt-1">Entrada livre de dados antropométricos e composição corporal.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <h4 className="text-lg font-bold text-slate-800 mb-4">Dados de Composição</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Peso (kg)</label>
                                    <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-bold text-slate-800" placeholder="00.0" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Altura (cm)</label>
                                    <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-bold text-slate-800" placeholder="170" />
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-100 my-4"></div>

                            {/* Protocol Specific Inputs */}
                            {protocol === 'pollock3' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Gender logic: If male, show Chest/Abd/Thigh. If female or unknown, show Triceps/Supra/Thigh (or both options?) 
                                 Let's assume we use student gender. If not set, maybe show all or select gender? 
                                 For now, I'll show fields based on 'gender' prop or default to Male for simplicity if missing, but label well.
                             */}
                                    <div className="col-span-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                        Protocolo para: <strong>{student.gender === 'feminino' ? 'Mulher (Tríceps, Supra, Coxa)' : 'Homem (Peitoral, Abd, Coxa)'}</strong>
                                    </div>

                                    {student.gender !== 'feminino' && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Peitoral (mm)</label>
                                                <input type="number" value={formData.chest} onChange={e => setFormData({ ...formData, chest: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Abdominal (mm)</label>
                                                <input type="number" value={formData.abdomen} onChange={e => setFormData({ ...formData, abdomen: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                            </div>
                                        </>
                                    )}

                                    {student.gender === 'feminino' && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Tríceps (mm)</label>
                                                <input type="number" value={formData.triceps} onChange={e => setFormData({ ...formData, triceps: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Supra-ilíaca (mm)</label>
                                                <input type="number" value={formData.suprailiac} onChange={e => setFormData({ ...formData, suprailiac: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                            </div>
                                        </>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Coxa (mm)</label>
                                        <input type="number" value={formData.thigh} onChange={e => setFormData({ ...formData, thigh: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                            )}

                            {protocol === 'pollock7' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {['chest|Peitoral', 'axillary|Axilar Média', 'triceps|Tríceps', 'subscapular|Subescapular', 'abdomen|Abdominal', 'suprailiac|Supra-ilíaca', 'thigh|Coxa'].map(field => {
                                        const [key, label] = field.split('|');
                                        return (
                                            <div key={key} className="space-y-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase">{label} (mm)</label>
                                                <input type="number" value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {(protocol === 'bioimpedance' || protocol === 'custom') && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Gordura Corporal (%)</label>
                                        <input type="number" value={formData.bf} onChange={e => setFormData({ ...formData, bf: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Ex: 15.5" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Massa Muscular (kg)</label>
                                        <input type="number" value={formData.muscleMass} onChange={e => setFormData({ ...formData, muscleMass: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Gordura Visceral</label>
                                        <input type="number" value={formData.visceralFat} onChange={e => setFormData({ ...formData, visceralFat: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <h4 className="text-lg font-bold text-slate-800 mb-4">Perímetros Corporais (cm)</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { k: 'neck', l: 'Pescoço' }, { k: 'shoulder', l: 'Ombros' }, { k: 'chestCirc', l: 'Tórax' },
                                    { k: 'waist', l: 'Cintura' }, { k: 'abdomenCirc', l: 'Abdômen' }, { k: 'hip', l: 'Quadril' },
                                    { k: 'rightArm', l: 'Braço Dir.' }, { k: 'leftArm', l: 'Braço Esq.' },
                                    { k: 'rightThigh', l: 'Coxa Dir.' }, { k: 'leftThigh', l: 'Coxa Esq.' },
                                    { k: 'rightCalf', l: 'Panturrilha Dir.' }, { k: 'leftCalf', l: 'Panturrilha Esq.' },
                                ].map(({ k, l }) => (
                                    <div key={k} className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">{l}</label>
                                        <input type="number" value={(formData as any)[k]} onChange={e => setFormData({ ...formData, [k]: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 text-center py-8">
                            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h4 className="text-2xl font-bold text-slate-800">Tudo Pronto!</h4>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                Os dados foram preenchidos. O sistema irá calcular automaticamente a composição corporal e gerar os gráficos de evolução.
                            </p>

                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                                <div>
                                    <span className="text-xs text-slate-400 font-bold uppercase">Protocolo</span>
                                    <p className="font-bold text-slate-800 capitalize">{protocol?.replace(/(\d)/, ' $1')}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-bold uppercase">Peso Atual</span>
                                    <p className="font-bold text-slate-800">{formData.weight || '-'} kg</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between">
                    {step > 1 ? (
                        <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">
                            <ChevronLeft size={18} /> Voltar
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">
                            Cancelar
                        </button>
                    )}

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 && !protocol}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                        >
                            <Save size={18} /> Salvar Avaliação
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewEvaluationWizard;
