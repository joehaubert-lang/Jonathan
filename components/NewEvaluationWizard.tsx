import React, { useState, useEffect } from 'react';
import { Ruler, Activity, Scale, Settings, CheckCircle2, ChevronRight, ChevronLeft, Save, Camera, Upload } from 'lucide-react';
import { Student } from '../types';

interface NewEvaluationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student; // Need student for gender logic
    onSave: (data: any) => void;
}

type Protocol = 'pollock3' | 'pollock7' | 'bioimpedance' | 'custom';
type SetupStep = 1 | 2 | 3 | 4 | 5;

const NewEvaluationWizard: React.FC<NewEvaluationWizardProps> = ({ isOpen, onClose, student, onSave }) => {
    const [step, setStep] = useState<SetupStep>(1);
    const [protocol, setProtocol] = useState<Protocol | null>(null);
    const [gender, setGender] = useState<'masculino' | 'feminino'>(student.gender || 'masculino');

    // Photo State
    const [photos, setPhotos] = useState<{ front: File | null; back: File | null; right: File | null; left: File | null }>({
        front: null, back: null, right: null, left: null
    });

    const handlePhotoUpload = (position: 'front' | 'back' | 'right' | 'left', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotos(prev => ({ ...prev, [position]: e.target.files![0] }));
        }
    };

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setProtocol(null);
            setGender(student.gender || 'masculino');
            setPhotos({ front: null, back: null, right: null, left: null });
        }
    }, [isOpen, student.gender]);


    // Form Data
    const [formData, setFormData] = useState({
        // Standard
        age: '',
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
        if (step < 5) setStep((prev) => (prev + 1) as SetupStep);
    };

    const handleBack = () => {
        if (step > 1) setStep((prev) => (prev - 1) as SetupStep);
    };

    const handleFinish = () => {
        // Calculate BF% if Pollock
        // For now just pass data
        onSave({
            protocol,
            ...formData,
            gender,
            photos, // Include photos in save
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        });
        onClose();
    };

    const steps = [
        { num: 1, label: 'Método' },
        { num: 2, label: 'Medidas' },
        { num: 3, label: 'Perímetros' },
        { num: 4, label: 'Fotos' },
        { num: 5, label: 'Resultados' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-white flex flex-col items-center gap-6">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Nova Avaliação Física</h3>
                        <p className="text-slate-500 text-sm mt-1">Selecione o método e preencha os dados do aluno</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-6 w-full">
                        {steps.map((s) => (
                            <div key={s.num} className="flex items-center">
                                <button
                                    onClick={() => step > s.num && setStep(s.num as SetupStep)}
                                    disabled={step <= s.num}
                                    className={`
                                    flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300
                                    ${step === s.num
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                            : step > s.num
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
                                                : 'text-slate-400 opacity-50 cursor-not-allowed'}
                                `}>
                                    <div className={`
                                        h-5 w-5 rounded-full flex items-center justify-center text-[10px]
                                        ${step === s.num ? 'bg-white/20' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'}
                                    `}>
                                        {step > s.num ? <CheckCircle2 size={12} /> : s.num}
                                    </div>
                                    <span className="">{s.label}</span>
                                </button>
                                {s.num < steps.length && (
                                    <div className={`hidden sm:block w-8 h-[2px] mx-1 rounded-full ${step > s.num ? 'bg-emerald-200' : 'bg-slate-100'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 bg-slate-50/30">
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setProtocol('pollock3')}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${protocol === 'pollock3' ? 'border-indigo-500 bg-white ring-2 ring-indigo-50 shadow-indigo-100' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${protocol === 'pollock3' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                        <Ruler size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Pollock 3 Dobras</h5>
                                        <p className="text-xs text-slate-500 mt-1 leading-snug">Ideal para avaliação rápida. Usa 3 dobras cutâneas.</p>
                                    </div>
                                    <ChevronRight size={20} className={`text-slate-300 group-hover:text-indigo-500 transition-colors ${protocol === 'pollock3' ? 'text-indigo-500' : ''}`} />
                                </button>

                                <button
                                    onClick={() => setProtocol('pollock7')}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${protocol === 'pollock7' ? 'border-indigo-500 bg-white ring-2 ring-indigo-50 shadow-indigo-100' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${protocol === 'pollock7' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600'}`}>
                                        <Activity size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">Pollock 7 Dobras</h5>
                                        <p className="text-xs text-slate-500 mt-1 leading-snug">Alta precisão científica. Aferição com 7 dobras.</p>
                                    </div>
                                    <ChevronRight size={20} className={`text-slate-300 group-hover:text-purple-500 transition-colors ${protocol === 'pollock7' ? 'text-purple-500' : ''}`} />
                                </button>

                                <button
                                    onClick={() => setProtocol('bioimpedance')}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${protocol === 'bioimpedance' ? 'border-indigo-500 bg-white ring-2 ring-indigo-50 shadow-indigo-100' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${protocol === 'bioimpedance' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                                        <Scale size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Bioimpedância</h5>
                                        <p className="text-xs text-slate-500 mt-1 leading-snug">Registro de dados de balanças de bioimpedância.</p>
                                    </div>
                                    <ChevronRight size={20} className={`text-slate-300 group-hover:text-emerald-500 transition-colors ${protocol === 'bioimpedance' ? 'text-emerald-500' : ''}`} />
                                </button>

                                <button
                                    onClick={() => setProtocol('custom')}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${protocol === 'custom' ? 'border-indigo-500 bg-white ring-2 ring-indigo-50 shadow-indigo-100' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${protocol === 'custom' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-800 group-hover:text-white'}`}>
                                        <Settings size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors">Personalizado</h5>
                                        <p className="text-xs text-slate-500 mt-1 leading-snug">Entrada livre de dados antropométricos.</p>
                                    </div>
                                    <ChevronRight size={20} className={`text-slate-300 group-hover:text-slate-800 transition-colors ${protocol === 'custom' ? 'text-slate-800' : ''}`} />
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
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-700">Protocolo para:</label>
                                        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                                            <button
                                                onClick={() => setGender('masculino')}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'masculino' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Homem (Peitoral, Abd, Coxa)
                                            </button>
                                            <button
                                                onClick={() => setGender('feminino')}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'feminino' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Mulher (Tríceps, Supra, Coxa)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Idade (anos)</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-slate-800"
                                            placeholder="Necessário para cálculo"
                                        />
                                    </div>

                                    {gender === 'masculino' && (
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

                                    {gender === 'feminino' && (
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

                                    <div className="col-span-2 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-indigo-500 uppercase">Gordura Corporal (Estimada)</p>
                                            <p className="text-xs text-indigo-400">Pollock 3 Dobras</p>
                                        </div>
                                        <p className="text-2xl font-bold text-indigo-700">{formData.bf || '--'}%</p>
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
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <div className="text-center mb-6">
                                <h4 className="text-xl font-bold text-slate-800">Fotos da Avaliação</h4>
                                <p className="text-slate-500 text-sm">Registre as fotos do aluno para acompanhamento visual.</p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'front', label: 'Frente' },
                                    { id: 'back', label: 'Costas' },
                                    { id: 'left', label: 'Lado Esquerdo' },
                                    { id: 'right', label: 'Lado Direito' }
                                ].map((side) => (
                                    <div key={side.id} className="group relative">
                                        <input
                                            type="file"
                                            id={`photo-${side.id}`}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handlePhotoUpload(side.id as any, e)}
                                        />
                                        <label
                                            htmlFor={`photo-${side.id}`}
                                            className={`
                                                flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed
                                                cursor-pointer transition-all duration-300 aspect-square
                                                ${photos[side.id as keyof typeof photos]
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
                                            `}
                                        >
                                            {photos[side.id as keyof typeof photos] ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={URL.createObjectURL(photos[side.id as keyof typeof photos]!)}
                                                        alt={side.label}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                        <Upload className="text-white" size={24} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                        <Camera size={20} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">{side.label}</span>
                                                    <span className="text-[10px] text-slate-400 mt-1">Clique para enviar</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="text-center space-y-8 animate-in slide-in-from-right-8 duration-300">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 max-w-lg mx-auto">
                                <label className="block text-left text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aluno Selecionado</label>
                                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors cursor-default">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                        {student.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{student.name}</p>
                                        <p className="text-xs text-slate-500 truncate">Objetivo: {student.objective || 'Não informado'}</p>
                                    </div>
                                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">Avaliação Concluída!</h4>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Os dados foram preenchidos e as fotos anexadas. Confirme os dados acima antes de salvar.
                                </p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 max-w-md mx-auto grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Protocolo</p>
                                    <p className="text-lg font-bold text-slate-800 capitalize">
                                        {protocol === 'pollock3' ? 'Pollock 3' : protocol === 'pollock7' ? 'Pollock 7' : 'Personalizado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Peso Atual</p>
                                    <p className="text-lg font-bold text-slate-800">{formData.weight || '-'} kg</p>
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

                    {step < 5 ? (
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
