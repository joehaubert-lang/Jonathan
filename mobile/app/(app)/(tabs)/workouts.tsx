import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Sparkles, PenTool, Library, Plus, Search, User, ChevronRight, Save, RotateCcw, Dumbbell, Clock, Trash2, Info, Edit2, X } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { generateAIWorkout, WorkoutParams } from '../../../lib/gemini';

export default function WorkoutsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'ia' | 'build' | 'library'>('ia');
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [libraryWorkouts, setLibraryWorkouts] = useState<any[]>([]);
    const [searchLibrary, setSearchLibrary] = useState('');
    const [recentDrafts, setRecentDrafts] = useState<any[]>([]);

    // Student Selection Modal Logic
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [modalMode, setModalMode] = useState<'apply' | 'create'>('apply');
    const [searchStudent, setSearchStudent] = useState('');
    const [templateToApply, setTemplateToApply] = useState<any>(null);

    // AI Form State
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('Intermediário');
    const [frequency, setFrequency] = useState('3');
    const [location, setLocation] = useState('Academia');
    const [limitations, setLimitations] = useState('');

    // AI Result State
    const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            fetchStudents();
            fetchLibrary();
            fetchRecentDrafts();
        }, [])
    );

    const fetchRecentDrafts = async () => {
        const { data } = await supabase
            .from('workouts')
            .select('*')
            .eq('source', 'manual')
            .order('created_at', { ascending: false })
            .limit(5);
        if (data) setRecentDrafts(data);
    };

    const fetchLibrary = async () => {
        const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .is('student_id', null)
            .order('name');

        if (data) setLibraryWorkouts(data);
    };

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase.from('students').select('id, name, photo, goal');
            if (error) throw error;
            if (data) setStudents(data);
        } catch (error: any) {
            console.error('Error fetching students in workouts:', error);
        }
    };

    const handleGenerate = async () => {
        if (!selectedStudent) {
            Alert.alert('Ops!', 'Selecione um aluno primeiro.');
            return;
        }

        setLoading(true);
        try {
            const params: WorkoutParams = {
                studentName: selectedStudent.name,
                goal: goal || selectedStudent.goal || 'Hipertrofia',
                level,
                frequency,
                location,
                limitations
            };
            const result = await generateAIWorkout(params);
            setGeneratedWorkout(result);
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWorkout = async (asTemplate: boolean = false) => {
        if (!generatedWorkout) return;
        if (!asTemplate && !selectedStudent) {
            Alert.alert('Ops!', 'Selecione um aluno para salvar o treino.');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Workout Header
            const { data: workout, error: workoutError } = await supabase
                .from('workouts')
                .insert({
                    student_id: asTemplate ? null : selectedStudent.id,
                    name: generatedWorkout.workout_name,
                    goal: generatedWorkout.goal,
                    source: 'ai',
                })
                .select()
                .single();

            if (workoutError) throw workoutError;

            // 2. Create Exercises
            const exercisesToInsert = generatedWorkout.exercises.map((ex: any, index: number) => ({
                workout_id: workout.id,
                name: ex.name,
                sets: parseInt(ex.sets),
                reps: ex.reps,
                load: ex.load,
                rest: ex.rest,
                muscle_group: ex.muscle_group,
                observation: ex.observation,
                order_index: index,
            }));

            const { error: exercisesError } = await supabase
                .from('exercises')
                .insert(exercisesToInsert);

            if (exercisesError) throw exercisesError;

            Alert.alert(
                'Sucesso!',
                asTemplate ? 'Treino salvo na sua biblioteca.' : `Treino salvo na ficha do aluno ${selectedStudent.name}.`
            );

            if (asTemplate) {
                fetchLibrary();
            } else {
                setGeneratedWorkout(null);
                // Reset form
                setGoal('');
                setLimitations('');
            }
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Erro ao Salvar', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        Alert.alert(
            'Excluir Modelo',
            'Tem certeza que deseja excluir este modelo da biblioteca?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { error } = await supabase
                                .from('workouts')
                                .delete()
                                .eq('id', templateId);

                            if (error) throw error;

                            Alert.alert('Sucesso', 'Modelo removido da biblioteca.');
                            fetchLibrary();
                        } catch (error: any) {
                            Alert.alert('Erro', error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCreateEmptyWorkout = async (studentId: string | null) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('workouts')
                .insert({
                    name: 'Novo Treino Manual',
                    student_id: studentId,
                    source: 'manual',
                    goal: 'Foco Geral',
                    active: true,
                })
                .select()
                .single();

            if (error) throw error;

            setShowStudentModal(false);
            setSearchStudent('');
            router.push(`/(app)/trainer/workout/edit/${data.id}`);
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível iniciar o treino. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyTemplate = async (template: any, studentForTemplate?: any) => {
        const student = studentForTemplate || selectedStudent;

        if (!student) {
            setTemplateToApply(template);
            setShowStudentModal(true);
            return;
        }

        setLoading(true);
        try {
            // 1. Get original exercises
            const { data: sourceExercises, error: fetchError } = await supabase
                .from('exercises')
                .select('*')
                .eq('workout_id', template.id);

            if (fetchError) throw fetchError;

            // 2. Create New Workout Header for the Student
            const { data: newWorkout, error: workoutError } = await supabase
                .from('workouts')
                .insert({
                    student_id: student.id,
                    name: template.name,
                    goal: template.goal,
                    source: 'library',
                })
                .select()
                .single();

            if (workoutError) throw workoutError;

            // 3. Clone Exercises
            if (sourceExercises && sourceExercises.length > 0) {
                const clones = sourceExercises.map((ex: any) => ({
                    workout_id: newWorkout.id,
                    name: ex.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    load: ex.load,
                    rest: ex.rest,
                    muscle_group: ex.muscle_group,
                    observation: ex.observation,
                    order_index: ex.order_index,
                }));

                const { error: exercisesError } = await supabase
                    .from('exercises')
                    .insert(clones);

                if (exercisesError) throw exercisesError;
            }

            Alert.alert('Sucesso!', `Modelo "${template.name}" aplicado com sucesso para ${student.name}.`);
            setShowStudentModal(false);
            setTemplateToApply(null);
            setActiveTab('ia'); // Navigate back or show success
        } catch (error: any) {
            console.error('Apply error:', error);
            Alert.alert('Erro ao Aplicar', error.message);
        } finally {
            setLoading(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <TouchableOpacity
            onPress={() => setActiveTab(id)}
            className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-xl ${activeTab === id ? 'bg-indigo-600' : 'bg-white'}`}
        >
            <Icon size={16} color={activeTab === id ? 'white' : '#64748b'} />
            <Text className={`ml-2 font-bold text-xs ${activeTab === id ? 'text-white' : 'text-slate-500'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 px-6 pt-6">
                <Text className="text-2xl font-bold text-slate-900 mb-6">Central de Treinos</Text>

                {/* Internal Tabs */}
                <View className="flex-row gap-2 bg-slate-200/50 p-1.5 rounded-2xl mb-8">
                    <TabButton id="ia" label="Treino IA" icon={Sparkles} />
                    <TabButton id="build" label="Montar" icon={PenTool} />
                    <TabButton id="library" label="Biblioteca" icon={Library} />
                </View>

                {/* Render Content based on active tab with KeyboardAvoidingView */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {activeTab === 'ia' && (
                            <View>
                                {!generatedWorkout ? (
                                    <View>
                                        <View className="bg-white p-6 rounded-3xl border border-slate-100 mb-6 shadow-sm">
                                            <View className="flex-row items-center mb-6">
                                                <View className="h-10 w-10 bg-indigo-50 rounded-xl items-center justify-center mr-3">
                                                    <Sparkles size={20} color="#4f46e5" />
                                                </View>
                                                <Text className="text-lg font-bold text-slate-900">Configurar Gerador</Text>
                                            </View>

                                            {/* Student Selection */}
                                            <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Aluno</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
                                                {students.map(s => (
                                                    <TouchableOpacity
                                                        key={s.id}
                                                        onPress={() => setSelectedStudent(s)}
                                                        className={`mr-3 items-center p-2 rounded-2xl border ${selectedStudent?.id === s.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}
                                                    >
                                                        <View className="h-12 w-12 rounded-full overflow-hidden mb-1">
                                                            {s.photo ? (
                                                                <Image source={{ uri: s.photo }} className="w-full h-full" />
                                                            ) : (
                                                                <View className="w-full h-full bg-slate-100 items-center justify-center">
                                                                    <User size={20} color="#94a3b8" />
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text className="text-[10px] font-bold text-slate-700" numberOfLines={1}>{s.name.split(' ')[0]}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>

                                            {/* Goal */}
                                            <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Objetivo (ex: Hipertrofia)</Text>
                                            <TextInput
                                                className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4"
                                                placeholder={selectedStudent?.goal || "Qual o foco deste treino?"}
                                                value={goal}
                                                onChangeText={setGoal}
                                            />

                                            {/* Level & Frequency */}
                                            <View className="flex-row gap-4 mb-4">
                                                <View className="flex-1">
                                                    <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Nível</Text>
                                                    <View className="flex-row gap-1">
                                                        {['Iniciante', 'Inter.', 'Avanç.'].map((l, idx) => {
                                                            const fullLevels = ['Iniciante', 'Intermediário', 'Avançado'];
                                                            const fullLevel = fullLevels[idx];
                                                            return (
                                                                <TouchableOpacity
                                                                    key={fullLevel}
                                                                    onPress={() => setLevel(fullLevel)}
                                                                    className={`flex-1 py-3 items-center rounded-xl border ${level === fullLevel ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                                                                >
                                                                    <Text className={`text-[10px] font-bold ${level === fullLevel ? 'text-indigo-600' : 'text-slate-500'}`}>{l}</Text>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Dias/Semana</Text>
                                                    <TextInput
                                                        keyboardType="numeric"
                                                        className="bg-slate-50 p-3 rounded-xl border border-slate-100"
                                                        value={frequency}
                                                        onChangeText={setFrequency}
                                                    />
                                                </View>
                                            </View>

                                            {/* Location */}
                                            <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Local do Treino</Text>
                                            <View className="flex-row gap-2 mb-4">
                                                {['Academia', 'Casa', 'Parque'].map(loc => (
                                                    <TouchableOpacity
                                                        key={loc}
                                                        onPress={() => setLocation(loc)}
                                                        className={`flex-1 py-3 items-center rounded-xl border ${location === loc ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                                                    >
                                                        <Text className={`text-xs font-bold ${location === loc ? 'text-indigo-600' : 'text-slate-500'}`}>{loc}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            {/* Limitations */}
                                            <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Limitações (Opcional)</Text>
                                            <TextInput
                                                multiline
                                                className="bg-slate-50 p-3 rounded-xl border border-slate-100 h-20"
                                                placeholder="Lesões, problemas de saúde..."
                                                value={limitations}
                                                onChangeText={setLimitations}
                                            />
                                        </View>

                                        <TouchableOpacity
                                            onPress={handleGenerate}
                                            disabled={loading}
                                            className="bg-indigo-600 p-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-200"
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <>
                                                    <Sparkles size={20} color="white" />
                                                    <View className="w-2" />
                                                    <Text className="text-white font-bold text-lg">Gerar Treino Mágico</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View>
                                        <View className="bg-indigo-600 p-6 rounded-3xl mb-6 shadow-lg shadow-indigo-200">
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest">Treino Recomendado</Text>
                                                <Sparkles size={16} color="white" />
                                            </View>
                                            <Text className="text-white text-2xl font-bold mb-1">{generatedWorkout.workout_name}</Text>
                                            <Text className="text-indigo-100 text-sm">{generatedWorkout.goal}</Text>
                                        </View>

                                        {generatedWorkout.exercises.map((ex: any, idx: number) => (
                                            <View key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 flex-row items-center">
                                                <View className="h-8 w-8 bg-slate-100 rounded-lg items-center justify-center mr-3">
                                                    <Text className="text-slate-500 font-bold text-xs">{idx + 1}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-slate-900 font-bold">{ex.name}</Text>
                                                    <View className="flex-row items-center mt-1 gap-2">
                                                        <View className="flex-row items-center border border-slate-50 px-1.5 py-0.5 rounded-md">
                                                            <Dumbbell size={10} color="#94a3b8" />
                                                            <Text className="text-slate-500 text-[10px] ml-1">{ex.sets}x{ex.reps}</Text>
                                                        </View>
                                                        <View className="flex-row items-center border border-slate-50 px-1.5 py-0.5 rounded-md">
                                                            <Clock size={10} color="#94a3b8" />
                                                            <Text className="text-slate-500 text-[10px] ml-1">{ex.rest}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <ChevronRight size={16} color="#cbd5e1" />
                                            </View>
                                        ))}

                                        <View className="flex-row gap-3 mt-4">
                                            <TouchableOpacity
                                                onPress={() => setGeneratedWorkout(null)}
                                                className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 items-center flex-row justify-center"
                                            >
                                                <RotateCcw size={18} color="#64748b" />
                                                <View className="w-1" />
                                                <Text className="text-slate-600 font-bold text-xs">Refazer</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleSaveWorkout(true)}
                                                disabled={loading}
                                                className="flex-1 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 items-center flex-row justify-center"
                                            >
                                                <Library size={18} color="#4f46e5" />
                                                <View className="w-1" />
                                                <Text className="text-indigo-600 font-bold text-xs">Biblioteca</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleSaveWorkout(false)}
                                                disabled={loading}
                                                className="flex-[1.5] bg-green-500 p-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-green-100"
                                            >
                                                {loading ? (
                                                    <ActivityIndicator color="white" />
                                                ) : (
                                                    <>
                                                        <Save size={18} color="white" />
                                                        <View className="w-1" />
                                                        <Text className="text-white font-bold text-xs">Salvar p/ Aluno</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'build' && (
                            <View>
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-slate-900 font-bold text-lg">Montar Novo Treino</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => {
                                        setModalMode('create');
                                        setShowStudentModal(true);
                                    }}
                                    className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 items-center justify-center mb-6"
                                >
                                    <View className="bg-indigo-50 p-4 rounded-full mb-4">
                                        <Plus size={32} color="#4f46e5" />
                                    </View>
                                    <Text className="text-slate-900 font-bold">Criar do Zero</Text>
                                    <Text className="text-slate-500 text-sm text-center mt-1">Crie um treino personalizado para um aluno ou para sua biblioteca.</Text>
                                </TouchableOpacity>

                                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Treinos Manuais Recentes</Text>
                                {recentDrafts.length > 0 ? (
                                    recentDrafts.map((draft) => (
                                        <TouchableOpacity
                                            key={draft.id}
                                            onPress={() => router.push(`/(app)/trainer/workout/edit/${draft.id}`)}
                                            className="bg-white p-4 rounded-2xl border border-slate-100 flex-row items-center mb-3 shadow-sm shadow-slate-200/50"
                                        >
                                            <View className="h-10 w-10 bg-slate-50 rounded-xl items-center justify-center mr-3">
                                                <PenTool size={18} color="#64748b" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-slate-900 font-bold text-sm">{draft.name}</Text>
                                                <Text className="text-slate-500 text-[10px]">{draft.student_id ? 'Destinado a Aluno' : 'Salvo na Biblioteca'}</Text>
                                            </View>
                                            <ChevronRight size={16} color="#cbd5e1" />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text className="text-slate-400 text-sm italic">Nenhum treino manual recente.</Text>
                                )}
                            </View>
                        )}

                        {activeTab === 'library' && (
                            <View>
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-slate-900 font-bold text-lg">Sua Biblioteca</Text>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab('build')}
                                        className="bg-indigo-600 px-3 py-1.5 rounded-lg flex-row items-center"
                                    >
                                        <Plus size={14} color="white" />
                                        <Text className="text-white font-bold text-xs ml-1">Novo</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Library Search */}
                                <View className="flex-row items-center bg-white px-4 py-3 rounded-2xl border border-slate-100 mb-6 shadow-sm">
                                    <Search size={20} color="#94a3b8" />
                                    <TextInput
                                        placeholder="Buscar na biblioteca..."
                                        className="flex-1 ml-3 text-slate-700"
                                        value={searchLibrary}
                                        onChangeText={setSearchLibrary}
                                    />
                                </View>

                                {libraryWorkouts.filter(w => w.name.toLowerCase().includes(searchLibrary.toLowerCase())).length > 0 ? (
                                    libraryWorkouts
                                        .filter(w => w.name.toLowerCase().includes(searchLibrary.toLowerCase()))
                                        .map((workout) => (
                                            <View
                                                key={workout.id}
                                                className="bg-white p-6 rounded-3xl border border-slate-100 mb-4 shadow-sm"
                                            >
                                                <View className="flex-row items-center mb-4">
                                                    <View className="bg-indigo-50 h-12 w-12 rounded-2xl items-center justify-center mr-4">
                                                        <Library size={24} color="#4f46e5" />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-slate-900 font-bold text-lg">{workout.name}</Text>
                                                        <View className="flex-row items-center mt-1">
                                                            <Text className="text-slate-500 text-xs">{workout.goal || 'Sem objetivo'}</Text>
                                                            <View className="h-1 w-1 bg-slate-300 rounded-full mx-2" />
                                                            <View className={`px-2 py-0.5 rounded-full ${workout.source === 'ai' ? 'bg-indigo-50' : 'bg-amber-50'}`}>
                                                                <Text className={`text-[9px] font-bold uppercase tracking-widest ${workout.source === 'ai' ? 'text-indigo-600' : 'text-amber-600'}`}>
                                                                    {workout.source === 'ai' ? 'IA' : 'Treinador'}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View className="flex-row gap-2">
                                                    <TouchableOpacity
                                                        onPress={() => handleApplyTemplate(workout)}
                                                        className="flex-1 bg-indigo-600 py-3 rounded-xl items-center justify-center flex-row shadow-sm shadow-indigo-100"
                                                    >
                                                        <User size={14} color="white" />
                                                        <Text className="text-white font-bold text-xs ml-2">Aplicar</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => router.push(`/(app)/trainer/workout/edit/${workout.id}`)}
                                                        className="px-4 py-3 bg-white rounded-xl border border-slate-200 items-center justify-center shadow-sm"
                                                    >
                                                        <Edit2 size={16} color="#64748b" />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => handleDeleteTemplate(workout.id)}
                                                        className="px-4 py-3 bg-red-50 rounded-xl border border-red-100 items-center justify-center"
                                                    >
                                                        <Trash2 size={16} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))
                                ) : (
                                    <View className="items-center justify-center py-10">
                                        <View className="bg-slate-100 p-6 rounded-full mb-4">
                                            <Library size={48} color="#94a3b8" />
                                        </View>
                                        <Text className="text-slate-900 font-bold text-center">Nenhum modelo encontrado</Text>
                                        <Text className="text-slate-500 text-center mt-2 px-6">
                                            {searchLibrary ? 'Tente buscar por outro nome.' : 'Você ainda não possui treinos salvos na sua biblioteca.'}
                                        </Text>
                                    </View>
                                )}

                                <Text className="text-slate-400 text-xs text-center mt-10 italic">
                                    Use a biblioteca para economizar tempo ao prescrever treinos. Templates podem ser aplicados a qualquer aluno com um clique.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

            {/* Student Selection Modal for Library */}
            <Modal visible={showStudentModal} animationType="slide" transparent={true} onRequestClose={() => setShowStudentModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white h-[80%] rounded-t-[40px] p-6 shadow-2xl">
                        <View className="flex-row items-center justify-between mb-6">
                            <View>
                                <Text className="text-xl font-bold text-slate-900">Aplicar Treino</Text>
                                <Text className="text-slate-500 text-xs">Selecione o aluno para este modelo</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowStudentModal(false);
                                    setSearchStudent('');
                                    setTemplateToApply(null);
                                }}
                                className="bg-slate-100 p-2 rounded-full"
                            >
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Student Search */}
                        <View className="flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl mb-6">
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3 text-slate-700"
                                placeholder="Buscar aluno pelo nome..."
                                value={searchStudent}
                                onChangeText={setSearchStudent}
                            />
                        </View>

                        <FlatList
                            data={students.filter(s => s.name.toLowerCase().includes(searchStudent.toLowerCase()))}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={
                                modalMode === 'create' ? (
                                    <TouchableOpacity
                                        onPress={() => handleCreateEmptyWorkout(null)}
                                        className="flex-row items-center p-4 bg-indigo-50 rounded-2xl mb-4 border border-indigo-100"
                                    >
                                        <View className="h-12 w-12 rounded-full bg-white items-center justify-center mr-4 shadow-sm">
                                            <Library size={24} color="#4f46e5" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-indigo-900 font-bold text-base">Salvar na Biblioteca</Text>
                                            <Text className="text-indigo-600 text-xs">Cria um modelo (template) permanente</Text>
                                        </View>
                                        <ChevronRight size={20} color="#4f46e5" />
                                    </TouchableOpacity>
                                ) : null
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => modalMode === 'apply' ? handleApplyTemplate(templateToApply, item) : handleCreateEmptyWorkout(item.id)}
                                    className="flex-row items-center p-4 bg-slate-50 rounded-2xl mb-3 border border-slate-50"
                                >
                                    <View className="h-12 w-12 rounded-full bg-white p-1 shadow-sm mr-4">
                                        <View className="h-full w-full rounded-full bg-indigo-50 items-center justify-center overflow-hidden">
                                            {item.photo ? (
                                                <Image source={{ uri: item.photo }} className="w-full h-full" />
                                            ) : (
                                                <User size={20} color="#4f46e5" />
                                            )}
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-base">{item.name}</Text>
                                        <Text className="text-slate-500 text-xs">{item.goal || 'Sem objetivo definido'}</Text>
                                    </View>
                                    <View className="bg-indigo-600 h-8 w-8 rounded-full items-center justify-center">
                                        <Plus size={16} color="white" />
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-20">
                                    <Text className="text-slate-400">Nenhum aluno encontrado.</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
