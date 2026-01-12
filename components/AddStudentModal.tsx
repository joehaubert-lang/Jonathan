
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Student } from '../types';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentToEdit?: Student | null;
    onSave?: (student: Partial<Student>) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, studentToEdit, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        gender: 'masculino',
        goal: '',
        plan: 'Mensal'
    });

    useEffect(() => {
        if (studentToEdit) {
            setFormData({
                name: studentToEdit.name,
                email: studentToEdit.email,
                phone: studentToEdit.phone || '',
                birth_date: studentToEdit.birth_date || '',
                gender: studentToEdit.gender || 'masculino',
                goal: studentToEdit.goal || '',
                plan: studentToEdit.plan || 'Mensal'
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                birth_date: '',
                gender: 'masculino',
                goal: '',
                plan: 'Mensal'
            });
        }
    }, [studentToEdit, isOpen]);

    const handleSubmit = () => {
        if (onSave) {
            onSave({
                ...studentToEdit,
                ...formData,
                id: studentToEdit?.id // Keep ID if editing
            } as Partial<Student>); // Cast to maintain type compatibility if needed
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{studentToEdit ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {studentToEdit ? 'Atualize os dados do aluno.' : 'Preencha os dados do novo aluno.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Nome Completo */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                        <input
                            type="text"
                            placeholder="Ex: Ana Silva"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Email</label>
                        <input
                            type="email"
                            placeholder="ana@exemplo.com"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* WhatsApp */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">WhatsApp</label>
                            <input
                                type="tel"
                                placeholder="(11) 99999-9999"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {/* Data de Nascimento */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Data de Nascimento</label>
                            <input
                                type="date"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                                value={formData.birth_date}
                                onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Plano */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Plano</label>
                            <select
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 appearance-none cursor-pointer"
                                value={formData.plan}
                                onChange={e => setFormData({ ...formData, plan: e.target.value })}
                            >
                                <option value="Mensal">Mensal</option>
                                <option value="Trimestral">Trimestral</option>
                                <option value="Anual">Anual</option>
                            </select>
                        </div>

                        {/* Gênero */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Gênero</label>
                            <select
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 appearance-none cursor-pointer"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    {/* Objetivo */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Objetivo Principal</label>
                        <input
                            type="text"
                            placeholder="Ex: Hipertrofia, Emagrecimento..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                            value={formData.goal}
                            onChange={e => setFormData({ ...formData, goal: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                        >
                            {studentToEdit ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
