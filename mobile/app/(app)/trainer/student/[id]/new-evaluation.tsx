import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../../context/AuthContext';
import { calculateBodyFat } from '../../../../../utils/calculations';
import { ArrowLeft, Check, ChevronRight, Save, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

// Reliable base64 to ArrayBuffer decoder for React Native
const decodeBase64 = (base64: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    let len = base64.length;
    let bufferLength = base64.length * 0.75;
    let p = 0;
    let encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }

    const arraybuffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(arraybuffer);

    for (let i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
};

export default function NewEvaluationScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { id, editId } = useLocalSearchParams(); // Student ID, Edit ID
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        age: '', // Needed for Pollock
        gender: 'male' as 'male' | 'female',
        protocol: 'pollock3' as 'pollock3' | 'pollock7' | 'bioimpedance',
        // Measurements
        chest: '',
        waist: '',
        abdomen: '',
        hip: '',
        rightArm: '',
        leftArm: '',
        rightThigh: '',
        leftThigh: '',
        rightCalf: '', // Calf
        leftCalf: '',
        // Skinfolds (Dobras) - Strings to allow empty state
        fold_chest: '',
        fold_abdomen: '',
        fold_thigh: '',
        fold_triceps: '',
        fold_suprailiac: '',
        fold_subscapular: '',
        fold_axillary: '',
        // Result
        body_fat: '',
        bodyDensity: 0,
        sumFolds: 0,
        // Photos
        photos: {
            front: null as string | null,
            back: null as string | null,
            right: null as string | null,
            left: null as string | null,
        }
    });

    useEffect(() => {
        if (editId) {
            fetchEvaluationForEdit();
        } else if (id) {
            fetchStudentGenderAndAge();
        }
    }, [id, editId]);

    const fetchEvaluationForEdit = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('evaluations')
            .select('*')
            .eq('id', editId)
            .single();

        if (data) {
            // Fetch student gender/age just to be safe or rely on what was saved?
            // Best to fetch student data for age/gender calc context
            const { data: sData } = await supabase.from('students').select('gender, birth_date').eq('id', data.student_id).single();

            let computedAge = 25;
            if (sData?.birth_date) {
                const birth = new Date(sData.birth_date);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                computedAge = age;
            }

            const m = data.measurements || {};
            const f = m.folds || {};

            setFormData({
                weight: String(data.weight),
                height: String(data.height),
                age: String(computedAge),
                gender: (sData?.gender === 'Feminino' || sData?.gender === 'female' || sData?.gender === 'F') ? 'female' : 'male',
                protocol: data.protocol,
                body_fat: String(data.body_fat),
                bodyDensity: 0, // Will recalc
                sumFolds: 0,
                // Circums
                chest: m.chest || '',
                waist: m.waist || '',
                abdomen: m.abdomen || '',
                hip: m.hip || '',
                rightArm: m.rightArm || '',
                leftArm: m.leftArm || '',
                rightThigh: m.rightThigh || '',
                leftThigh: m.leftThigh || '',
                rightCalf: m.rightCalf || '',
                leftCalf: m.leftCalf || '',
                // Folds
                fold_chest: f.chest || '',
                fold_abdomen: f.abdomen || '',
                fold_thigh: f.thigh || '',
                fold_triceps: f.triceps || '',
                fold_suprailiac: f.suprailiac || '',
                fold_subscapular: f.subscapular || '',
                fold_axillary: f.axillary || '',
                photos: m.photos || {
                    front: null,
                    back: null,
                    right: null,
                    left: null,
                }
            });
        }
        setLoading(false);
    };

    const fetchStudentGenderAndAge = async () => {
        const { data, error } = await supabase
            .from('students')
            .select('gender, birth_date')
            .eq('id', id)
            .single();

        if (data) {
            let computedAge = 25; // fallback
            if (data.birth_date) {
                const birth = new Date(data.birth_date);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                computedAge = age;
            }

            setFormData(prev => ({
                ...prev,
                // Only set if not already manually changed (though tough to track, usually safe to overwrite on load)
                gender: (data.gender === 'Feminino' || data.gender === 'female' || data.gender === 'F') ? 'female' : 'male',
                age: String(computedAge)
            }));
        }
    };

    const updateForm = (key: string, value: string) => {
        setFormData(prev => {
            const temp = { ...prev, [key]: value };

            // Auto Calculate BF if in Skinfold step OR just update whenever data changes if possible
            // Note: The Effect hook already handles calculation when dependencies change.
            // So we actually DON'T need to calculate here, just update state.
            // The Effect will trigger and update body_fat.

            return temp;
        });
    };

    // Calculate BF explicitly on button press or effect? 
    // Let's do it on effect when folds change
    useEffect(() => {
        if (formData.protocol === 'bioimpedance') return;

        const result = calculateBodyFat(
            formData.gender,
            parseFloat(formData.age || '25'),
            formData.protocol as 'pollock3' | 'pollock7',
            {
                chest: parseFloat(formData.fold_chest || '0'),
                abdomen: parseFloat(formData.fold_abdomen || '0'),
                thigh: parseFloat(formData.fold_thigh || '0'),
                triceps: parseFloat(formData.fold_triceps || '0'),
                suprailiac: parseFloat(formData.fold_suprailiac || '0'),
                subscapular: parseFloat(formData.fold_subscapular || '0'),
                axillary: parseFloat(formData.fold_axillary || '0'),
            }
        );

        if (result && !isNaN(result.bodyFat) && result.bodyFat > 0) {
            setFormData(prev => ({
                ...prev,
                body_fat: result.bodyFat.toFixed(1),
                bodyDensity: result.bodyDensity,
                sumFolds: result.sumFolds
            }));
        }
    }, [
        formData.fold_chest, formData.fold_abdomen, formData.fold_thigh,
        formData.fold_triceps, formData.fold_suprailiac, formData.fold_subscapular,
        formData.fold_axillary, formData.protocol, formData.gender, formData.age
    ]);

    const pickImage = async (position: 'front' | 'back' | 'right' | 'left') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão', 'Precisamos de acesso às suas fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // Disable forced square crop on iOS
            quality: 0.8,
        });

        if (!result.canceled) {
            setFormData(prev => ({
                ...prev,
                photos: {
                    ...prev.photos,
                    [position]: result.assets[0].uri
                }
            }));
        }
    };

    const removeImage = (position: 'front' | 'back' | 'right' | 'left') => {
        setFormData(prev => ({
            ...prev,
            photos: {
                ...prev.photos,
                [position]: null
            }
        }));
    };

    const uploadImage = async (uri: string, studentId: string, evaluationId: string, position: string) => {
        try {
            const filename = `${position}.jpg`;
            const path = `${studentId}/${evaluationId}/${filename}`;

            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            // Convert base64 to ArrayBuffer (Supabase Storage likes ArrayBuffer/Blob)
            const arrayBuffer = decodeBase64(base64);

            const { data, error } = await supabase.storage
                .from('evaluations')
                .upload(path, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('evaluations')
                .getPublicUrl(path);

            return publicUrl;
        } catch (error) {
            console.error(`Error uploading ${position} image:`, error);
            return null;
        }
    };

    const handleSave = async () => {
        if (!formData.weight || !formData.height) {
            Alert.alert('Erro', 'Peso e Altura são obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            const hStr = String(formData.height || '0').replace(',', '.');
            const wStr = String(formData.weight || '0').replace(',', '.');
            const bfStr = String(formData.body_fat || '0').replace(',', '.');

            const payload: any = {
                student_id: id,
                protocol: formData.protocol,
                weight: parseFloat(wStr),
                height: parseFloat(hStr),
                body_fat: parseFloat(bfStr),
                measurements: {
                    chest: formData.chest,
                    waist: formData.waist,
                    abdomen: formData.abdomen,
                    hip: formData.hip,
                    rightArm: formData.rightArm,
                    leftArm: formData.leftArm,
                    rightThigh: formData.rightThigh,
                    leftThigh: formData.leftThigh,
                    rightCalf: formData.rightCalf,
                    leftCalf: formData.leftCalf,
                    folds: {
                        chest: formData.fold_chest,
                        abdomen: formData.fold_abdomen,
                        thigh: formData.fold_thigh,
                        triceps: formData.fold_triceps,
                        suprailiac: formData.fold_suprailiac,
                        subscapular: formData.fold_subscapular,
                        axillary: formData.fold_axillary
                    }
                }
            };

            let evaluationId = editId;

            // 1. Insert/Update basic data first (to get ID if new)
            if (editId) {
                const { error } = await supabase
                    .from('evaluations')
                    .update(payload)
                    .eq('id', editId);
                if (error) throw error;
            } else {
                (payload as any).date = new Date().toISOString();
                const { data, error } = await supabase.from('evaluations').insert(payload).select().single();
                if (error) throw error;
                evaluationId = data.id;
            }

            // 2. Upload Photos if any
            const photoUrls: any = {};
            const photoEntries = Object.entries(formData.photos);

            for (const [pos, uri] of photoEntries) {
                if (uri && uri.startsWith('file://')) {
                    const url = await uploadImage(uri, id as string, evaluationId as string, pos);
                    if (url) photoUrls[pos] = url;
                } else if (uri) {
                    // Keep existing URL
                    photoUrls[pos] = uri;
                }
            }

            // 3. Final Update with Photo URLs
            if (Object.keys(photoUrls).length > 0) {
                const finalMeasurements = {
                    ...payload.measurements,
                    photos: photoUrls
                };

                await supabase
                    .from('evaluations')
                    .update({ measurements: finalMeasurements })
                    .eq('id', evaluationId);
            }

            Alert.alert('Sucesso', `Avaliação ${editId ? 'atualizada' : 'registrada'}!`, [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            console.error('Save Error:', error);
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Steps rendering ---

    const renderStep1 = () => (
        <View>
            <Text className="text-xl font-bold text-slate-800 mb-6">Dados Básicos</Text>

            <View className="mb-4">
                <Text className="mb-1 font-bold text-slate-600">Sexo</Text>
                <View className="flex-row bg-slate-100 p-1 rounded-xl">
                    <TouchableOpacity
                        onPress={() => updateForm('gender', 'male')}
                        className={`flex-1 py-3 items-center rounded-lg ${formData.gender === 'male' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${formData.gender === 'male' ? 'text-indigo-600' : 'text-slate-500'}`}>Masculino</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => updateForm('gender', 'female')}
                        className={`flex-1 py-3 items-center rounded-lg ${formData.gender === 'female' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${formData.gender === 'female' ? 'text-indigo-600' : 'text-slate-500'}`}>Feminino</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                    <Text className="mb-1 font-bold text-slate-600">Peso (kg)</Text>
                    <TextInput
                        className="bg-white border border-slate-200 p-4 rounded-xl text-lg font-bold text-slate-900"
                        placeholder="0.0"
                        keyboardType="numeric"
                        value={formData.weight}
                        onChangeText={t => updateForm('weight', t)}
                    />
                </View>
                <View className="flex-1">
                    <Text className="mb-1 font-bold text-slate-600">Altura (m)</Text>
                    <TextInput
                        className="bg-white border border-slate-200 p-4 rounded-xl text-lg font-bold text-slate-900"
                        placeholder="1.75"
                        keyboardType="numeric"
                        value={formData.height}
                        onChangeText={t => updateForm('height', t)}
                    />
                </View>
                <View className="w-20">
                    <Text className="mb-1 font-bold text-slate-600">Idade</Text>
                    <TextInput
                        className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center font-bold text-slate-900"
                        keyboardType="numeric"
                        value={formData.age}
                        onChangeText={t => updateForm('age', t)}
                        placeholder="00"
                    />
                </View>
            </View>

            <View className="mb-4">
                <Text className="mb-1 font-bold text-slate-600">Protocolo de Gordura</Text>
                <View className="bg-slate-100 p-1 rounded-xl flex-row">
                    {['pollock3', 'pollock7', 'bioimpedance'].map(p => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => updateForm('protocol', p)}
                            className={`flex-1 py-3 items-center rounded-lg ${formData.protocol === p ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-xs font-bold uppercase ${formData.protocol === p ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {p === 'bioimpedance' ? 'Bioimp.' : p === 'pollock3' ? 'Pollock 3' : 'Pollock 7'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <Text className="text-indigo-800 font-bold mb-1">Cálculo Automático (Estimativa)</Text>
                <Text className="text-3xl font-bold text-indigo-600">{formData.body_fat || '--'}%</Text>
                <Text className="text-xs text-indigo-400 mt-1">Preencha as dobras no Passo 3 para calcular.</Text>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View>
            <Text className="text-xl font-bold text-slate-800 mb-6">Perímetros (cm)</Text>
            <View className="space-y-4">
                {/* Upper Body */}
                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Ombros</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={(formData as any).shoulder} onChangeText={t => updateForm('shoulder', t)} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Peitoral</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={formData.chest} onChangeText={t => updateForm('chest', t)} />
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Braço Dir.</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={formData.rightArm} onChangeText={t => updateForm('rightArm', t)} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Braço Esq.</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={formData.leftArm} onChangeText={t => updateForm('leftArm', t)} />
                    </View>
                </View>

                {/* Core */}
                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Cintura</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={formData.waist} onChangeText={t => updateForm('waist', t)} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Abdômen</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={formData.abdomen} onChangeText={t => updateForm('abdomen', t)} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Quadril</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={formData.hip} onChangeText={t => updateForm('hip', t)} />
                    </View>
                </View>

                {/* Legs */}
                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Coxa Dir.</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={formData.rightThigh} onChangeText={t => updateForm('rightThigh', t)} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-500 mb-1">Coxa Esq.</Text>
                        <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric"
                            placeholder="0" value={formData.leftThigh} onChangeText={t => updateForm('leftThigh', t)} />
                    </View>
                </View>
            </View>
        </View>
    );

    const isFieldVisible = (field: string) => {
        if (formData.protocol === 'pollock7') return true;

        // Pollock 3 Logic
        if (formData.gender === 'male') {
            // Male 3: Chest, Abdomen, Thigh
            return ['chest', 'abdomen', 'thigh'].includes(field);
        } else {
            // Female 3: Triceps, Suprailiac, Thigh
            return ['triceps', 'suprailiac', 'thigh'].includes(field);
        }
    };

    const renderStep3 = () => (
        <View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Composição Corporal</Text>
            <Text className="text-sm text-slate-500 mb-6">Protocolo: {formData.protocol === 'bioimpedance' ? 'Bioimpedância' : (formData.protocol === 'pollock3' ? 'Pollock 3 Dobras' : 'Pollock 7 Dobras')}</Text>

            {formData.protocol === 'bioimpedance' ? (
                <View>
                    <Text className="mb-1 font-bold text-slate-600">Gordura Corporal (%)</Text>
                    <TextInput
                        className="bg-white border border-slate-200 p-4 rounded-xl text-xl font-bold text-slate-900"
                        placeholder="Ex: 18.5"
                        keyboardType="numeric"
                        value={formData.body_fat}
                        onChangeText={t => updateForm('body_fat', t)}
                    />
                </View>
            ) : (
                <View className="space-y-4">
                    <View className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
                        <Text className="text-orange-800 font-bold mb-1">Resultado Calculado</Text>
                        <Text className="text-4xl font-bold text-orange-600">{formData.body_fat || '--'}%</Text>
                        {/* Detailed Stats */}
                        <View className="mt-2 pt-2 border-t border-orange-200">
                            {formData.bodyDensity && (
                                <>
                                    <Text className="text-xs text-orange-700">Densidade: {Number(formData.bodyDensity).toFixed(4)}</Text>
                                    <Text className="text-xs text-orange-700">Soma Dobras: {Number(formData.sumFolds).toFixed(1)} mm</Text>
                                </>
                            )}
                            <Text className="text-xs text-orange-400 mt-1">Debug Sexo: {formData.gender === 'male' ? 'Masculino' : 'Feminino'} ({formData.protocol})</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                        {/* Male Fields */}
                        {isFieldVisible('chest') && (
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-slate-500 mb-1">Peitoral (mm)</Text>
                                <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric" placeholder="0"
                                    value={formData.fold_chest} onChangeText={t => updateForm('fold_chest', t)} />
                            </View>
                        )}
                        {isFieldVisible('abdomen') && (
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-slate-500 mb-1">Abdominal (mm)</Text>
                                <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric" placeholder="0"
                                    value={formData.fold_abdomen} onChangeText={t => updateForm('fold_abdomen', t)} />
                            </View>
                        )}

                        {/* Female Fields (Order adjusted for UI) */}
                        {isFieldVisible('triceps') && (
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-slate-500 mb-1">Tríceps (mm)</Text>
                                <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric" placeholder="0"
                                    value={formData.fold_triceps} onChangeText={t => updateForm('fold_triceps', t)} />
                            </View>
                        )}
                        {isFieldVisible('suprailiac') && (
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-slate-500 mb-1">Supra-ilíaca (mm)</Text>
                                <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric" placeholder="0"
                                    value={formData.fold_suprailiac} onChangeText={t => updateForm('fold_suprailiac', t)} />
                            </View>
                        )}

                        {/* Thigh (Common) */}
                        {isFieldVisible('thigh') && (
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-slate-500 mb-1">Coxa (mm)</Text>
                                <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric" placeholder="0"
                                    value={formData.fold_thigh} onChangeText={t => updateForm('fold_thigh', t)} />
                            </View>
                        )}

                        {/* Pollock 7 Extras */}
                        {formData.protocol === 'pollock7' && (
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-slate-500 mb-1">Subescapular</Text>
                                <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric" placeholder="0"
                                    value={formData.fold_subscapular} onChangeText={t => updateForm('fold_subscapular', t)} />
                            </View>
                        )}
                        {formData.protocol === 'pollock7' && (
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-slate-500 mb-1">Axilar Média</Text>
                                <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" keyboardType="numeric" placeholder="0"
                                    value={formData.fold_axillary} onChangeText={t => updateForm('fold_axillary', t)} />
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );

    const renderStep4 = () => (
        <View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Fotos do Aluno</Text>
            <Text className="text-sm text-slate-500 mb-6">Registre o progresso visual (Opcional)</Text>

            <View className="flex-row flex-wrap justify-between">
                {[
                    { key: 'front', label: 'Frente' },
                    { key: 'back', label: 'Costas' },
                    { key: 'right', label: 'Lado Direita' },
                    { key: 'left', label: 'Lado Esquerda' }
                ].map((item) => (
                    <View key={item.key} className="w-[48%] mb-4">
                        <Text className="text-xs font-bold text-slate-500 mb-2 text-center uppercase">{item.label}</Text>
                        <TouchableOpacity
                            onPress={() => pickImage(item.key as any)}
                            className="aspect-[3/4] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden items-center justify-center"
                        >
                            {(formData.photos as any)[item.key] ? (
                                <View className="w-full h-full">
                                    <Image
                                        source={{ uri: (formData.photos as any)[item.key] }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        onPress={() => removeImage(item.key as any)}
                                        className="absolute top-2 right-2 bg-red-500 p-1 rounded-full shadow-lg"
                                    >
                                        <X size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="items-center">
                                    <View className="bg-indigo-50 p-4 rounded-full mb-2">
                                        <Camera size={24} color="#4f46e5" />
                                    </View>
                                    <Text className="text-[10px] font-bold text-slate-400">Tocar para adicionar</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
                    <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} className="h-10 w-10 items-center justify-center bg-white rounded-xl border border-slate-100">
                        <ArrowLeft size={24} color="#64748b" />
                    </TouchableOpacity>
                    <View className="flex-row gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <View key={i} className={`h-2 w-8 rounded-full ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                        ))}
                    </View>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-6">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </ScrollView>

                <View className="p-6 bg-white border-t border-slate-100">
                    <TouchableOpacity
                        onPress={() => {
                            if (step < 4) setStep(step + 1);
                            else handleSave();
                        }}
                        disabled={loading}
                        className={`py-4 rounded-xl flex-row items-center justify-center shadow-lg ${loading ? 'bg-indigo-400' : 'bg-indigo-600 shadow-indigo-200'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : step < 4 ? (
                            <>
                                <Text className="text-white font-bold text-lg mr-2">Próximo</Text>
                                <ChevronRight size={24} color="white" />
                            </>
                        ) : (
                            <>
                                <Check size={24} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-lg">Salvar Avaliação</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
