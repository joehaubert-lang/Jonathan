
import React from 'react';
import { X } from 'lucide-react';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Adicionar Novo Aluno</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Preencha os dados básicos de identificação. Medidas físicas serão adicionadas apenas na avaliação.
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
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Email</label>
                            <input
                                type="email"
                                placeholder="ana@exemplo.com"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                            />
                        </div>

                        {/* WhatsApp */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">WhatsApp</label>
                            <input
                                type="tel"
                                placeholder="(11) 99999-9999"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Idade */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Idade</label>
                            <input
                                type="number"
                                placeholder="Ex: 25"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Gênero */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Gênero</label>
                            <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 appearance-none cursor-pointer">
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                            Cadastrar Aluno
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
