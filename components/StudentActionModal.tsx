
import React from 'react';
import { X, Trash2, Ban, CheckCircle2 } from 'lucide-react';

interface StudentActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    onDelete: () => void;
    onToggleStatus: () => void;
    isInactive: boolean;
}

const StudentActionModal: React.FC<StudentActionModalProps> = ({
    isOpen,
    onClose,
    studentName,
    onDelete,
    onToggleStatus,
    isInactive
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Gerenciar Aluno</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 mb-6 text-sm">
                        O que você deseja fazer com o cadastro de <strong className="text-slate-800">{studentName}</strong>?
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => { onToggleStatus(); onClose(); }}
                            className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl border transition-colors ${isInactive
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                    : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'
                                }`}
                        >
                            {isInactive ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                            {isInactive ? 'Ativar Aluno' : 'Inativar Aluno'}
                        </button>

                        <button
                            onClick={() => { onDelete(); onClose(); }}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                        >
                            <Trash2 size={18} /> Excluir Permanentemente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentActionModal;
