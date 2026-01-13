
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Camera, User, Mail, Phone, Loader2, Crop, Target } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { supabase } from '../services/supabaseClient';
import { getCroppedImg } from '../utils/imageUtils';

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    onSaveSuccess?: (updatedStudent: any) => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose, student: initialStudent, onSaveSuccess }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [student, setStudent] = useState<any>(initialStudent);

    useEffect(() => {
        setStudent(initialStudent);
    }, [initialStudent, isOpen]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => setImageToCrop(reader.result as string));
        reader.readAsDataURL(file);
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleConfirmCrop = async () => {
        if (!imageToCrop || !croppedAreaPixels) return;

        setUploading(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            if (!croppedImageBlob) throw new Error('Failed to crop image');

            const fileName = `student-${student.id}-${Math.random()}.jpg`;
            const filePath = `profiles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('trainer-profiles') // Reusing the same bucket for simplicity or create student-profiles
                .upload(filePath, croppedImageBlob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('trainer-profiles')
                .getPublicUrl(filePath);

            setStudent({ ...student, photo: publicUrl });
            setImageToCrop(null);
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Erro ao carregar e cortar foto.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('students')
                .update({
                    name: student.name,
                    email: student.email,
                    phone: student.phone,
                    goal: student.goal,
                    photo: student.photo
                })
                .eq('id', student.id);

            if (error) throw error;

            if (onSaveSuccess) onSaveSuccess(student);
            onClose();
        } catch (error) {
            console.error('Error saving student profile:', error);
            alert('Erro ao salvar perfil.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    if (imageToCrop) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">Ajustar Foto</h3>
                        <button onClick={() => setImageToCrop(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="relative h-[400px] w-full bg-slate-100">
                        <Cropper
                            image={imageToCrop}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-slate-500 min-w-16">Zoom</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setImageToCrop(null)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all">
                                Cancelar
                            </button>
                            <button onClick={handleConfirmCrop} disabled={uploading} className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Crop size={20} />}
                                Confirmar Enquadramento
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

                <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-violet-600 p-6">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full shadow-lg">
                        <div className="relative group">
                            <img src={student.photo || "https://ui-avatars.com/api/?name=" + student.name} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-white bg-slate-100" />
                            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                {uploading ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-16 p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Seu Perfil</h2>
                        <p className="text-sm text-slate-500">Mantenha seus dados e objetivos em dia.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <User size={14} /> Nome Completo
                            </label>
                            <input type="text" value={student.name} onChange={(e) => setStudent({ ...student, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-slate-700 font-medium" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Target size={14} /> Seu Objetivo
                            </label>
                            <input type="text" value={student.goal || ''} onChange={(e) => setStudent({ ...student, goal: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-slate-700 font-medium" placeholder="Ex: Perda de gordura e ganho de massa" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Phone size={14} /> Telefone
                                </label>
                                <input type="text" value={student.phone || ''} onChange={(e) => setStudent({ ...student, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-slate-700 font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Mail size={14} /> E-mail
                                </label>
                                <input type="email" value={student.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-medium outline-none cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                        <button onClick={handleSave} disabled={loading} className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Salvar Perfil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileModal;
