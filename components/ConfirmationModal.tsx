import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'success' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 mx-auto"><AlertCircle size={24} /></div>;
            case 'success': return <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 mx-auto"><CheckCircle2 size={24} /></div>;
            default: return <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-4 mx-auto"><AlertCircle size={24} /></div>;
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-200';
            case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
            default: return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
                    <X size={20} />
                </button>

                {getIcon()}

                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{message}</p>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-4 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 ${getConfirmButtonClass()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
