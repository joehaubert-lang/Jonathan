import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Save, Search, Dumbbell, Clock, Repeat, FileText, ChevronRight, X, List, Weight } from 'lucide-react-native';
import { supabase } from '../../../../../lib/supabase';

interface Exercise {
    id?: string;
    name: string;
    sets: number;
    reps: string;
    load: string;
    rest: string;
    muscle_group: string;
    observation: string;
    order_index: number;
    tempId?: string; // For new ones
}

export default function EditWorkoutScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Workout State
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [frequency, setFrequency] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);

    // Catalog State
    const [showCatalog, setShowCatalog] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [catalogItems, setCatalogItems] = useState<any[]>([]);

    useEffect(() => {
        fetchWorkoutData();
        fetchCatalog();
    }, [id]);

    const fetchWorkoutData = async () => {
        try {
            setLoading(true);
            const { data: workout, error: workoutError } = await supabase
                .from('workouts')
                .select('*')
                .eq('id', id)
                .single();

            if (workoutError) throw workoutError;

            setName(workout.name);
            setGoal(workout.goal || '');
            setFrequency(workout.frequency || '');

            const { data: exercisesData, error: exercisesError } = await supabase
                .from('exercises')
                .select('*')
                .eq('workout_id', id)
                .order('order_index', { ascending: true });

            if (exercisesError) throw exercisesError;
            setExercises(exercisesData || []);
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível carregar o treino.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalog = async () => {
        const { data } = await supabase.from('exercise_library').select('*').order('name');
        if (data) setCatalogItems(data);
    };

    const handleUpdateExercise = (index: number, field: keyof Exercise, value: any) => {
        const newExercises = [...exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setExercises(newExercises);
    };

    const handleRemoveExercise = (index: number) => {
        const newExercises = exercises.filter((_, i) => i !== index);
        setExercises(newExercises);
    };

    const handleAddFromCatalog = (item: any) => {
        const newExercise: Exercise = {
            name: item.name,
            muscle_group: item.muscle_group || '',
            sets: 3,
            reps: '12',
            load: 'Moderada',
            rest: '60s',
            observation: '',
            order_index: exercises.length,
            tempId: Math.random().toString(36).substring(7)
        };
        setExercises([...exercises, newExercise]);
        setShowCatalog(false);
        setCatalogSearch('');
    };

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Ops!', 'O nome do treino é obrigatório.');
            return;
        }

        setSaving(true);
        try {
            // 1. Update Workout Header
            const { error: workoutError } = await supabase
                .from('workouts')
                .update({ name, goal, frequency })
                .eq('id', id);

            if (workoutError) throw workoutError;

            // 2. Clear old exercises and insert new ones
            // Using a simple delete/insert approach for now
            const { error: deleteError } = await supabase
                .from('exercises')
                .delete()
                .eq('workout_id', id);

            if (deleteError) throw deleteError;

            if (exercises.length > 0) {
                const exercisesToInsert = exercises.map((ex, index) => {
                    const { id: _, tempId: __, ...rest } = ex as any; // Remove internal IDs
                    return {
                        ...rest,
                        workout_id: id,
                        order_index: index,
                        sets: parseInt(String(ex.sets)) || 0
                    };
                });

                const { error: insertError } = await supabase
                    .from('exercises')
                    .insert(exercisesToInsert);

                if (insertError) throw insertError;
            }

            Alert.alert('Sucesso!', 'Treino atualizado com sucesso.');
            router.back();
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Erro ao Salvar', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator color="#4f46e5" size="large" />
                <Text className="text-slate-500 mt-4 font-medium">Carregando treino...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 px-6 pt-4">
                {/* Header Actions */}
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="h-10 w-10 bg-white items-center justify-center rounded-xl border border-slate-100 shadow-sm"
                    >
                        <ArrowLeft size={24} color="#64748b" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900">Editar Treino</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className="h-10 w-10 bg-indigo-600 items-center justify-center rounded-xl shadow-sm shadow-indigo-200"
                    >
                        {saving ? <ActivityIndicator size="small" color="white" /> : <Save size={20} color="white" />}
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Basic Info Card */}
                        <View className="bg-white p-6 rounded-3xl border border-slate-100 mb-6 shadow-sm">
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Informações Básicas</Text>

                            <Text className="text-slate-500 text-xs mb-1 ml-1">Nome do Treino</Text>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 font-bold text-slate-800"
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Treino A - Peito e Tríceps"
                            />

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Text className="text-slate-500 text-xs mb-1 ml-1">Objetivo</Text>
                                    <TextInput
                                        className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-slate-700"
                                        value={goal}
                                        onChangeText={setGoal}
                                        placeholder="Ex: Hipertrofia"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-500 text-xs mb-1 ml-1">Frequência</Text>
                                    <TextInput
                                        className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-slate-700"
                                        value={frequency}
                                        onChangeText={setFrequency}
                                        placeholder="Ex: 3x semana"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Exercises Section */}
                        <View className="flex-row items-center justify-between mb-4 px-2">
                            <Text className="text-slate-900 font-bold text-lg">Exercícios ({exercises.length})</Text>
                            <TouchableOpacity
                                onPress={() => setShowCatalog(true)}
                                className="bg-indigo-50 px-3 py-1.5 rounded-lg flex-row items-center"
                            >
                                <Plus size={14} color="#4f46e5" />
                                <Text className="text-indigo-600 font-bold text-xs ml-1">Adicionar</Text>
                            </TouchableOpacity>
                        </View>

                        {exercises.map((ex, index) => (
                            <View key={ex.id || ex.tempId} className="bg-white p-5 rounded-3xl border border-slate-100 mb-4 shadow-sm">
                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center flex-1">
                                        <View className="bg-slate-50 h-8 w-8 rounded-lg items-center justify-center mr-3 border border-slate-100">
                                            <Text className="text-slate-500 font-bold text-xs">{index + 1}</Text>
                                        </View>
                                        <TextInput
                                            className="text-slate-900 font-bold text-base flex-1"
                                            value={ex.name}
                                            onChangeText={(v) => handleUpdateExercise(index, 'name', v)}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveExercise(index)}
                                        className="p-2"
                                    >
                                        <Trash2 size={18} color="#f87171" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    <View className="bg-slate-50 px-3 py-2 rounded-xl flex-row items-center border border-slate-100 min-w-[70px]">
                                        <Repeat size={12} color="#94a3b8" />
                                        <TextInput
                                            className="ml-2 text-slate-700 font-bold text-xs p-0 min-w-[20px]"
                                            value={String(ex.sets)}
                                            keyboardType="numeric"
                                            onChangeText={(v) => handleUpdateExercise(index, 'sets', v)}
                                        />
                                        <Text className="text-slate-400 text-[10px] ml-1">sets</Text>
                                    </View>
                                    <View className="bg-slate-50 px-3 py-2 rounded-xl flex-row items-center border border-slate-100 min-w-[80px]">
                                        <Dumbbell size={12} color="#94a3b8" />
                                        <TextInput
                                            className="ml-2 text-slate-700 font-bold text-xs p-0 min-w-[30px]"
                                            value={ex.reps}
                                            onChangeText={(v) => handleUpdateExercise(index, 'reps', v)}
                                        />
                                        <Text className="text-slate-400 text-[10px] ml-1">reps</Text>
                                    </View>
                                    <View className="bg-slate-50 px-3 py-2 rounded-xl flex-row items-center border border-slate-100 min-w-[80px]">
                                        <Weight size={12} color="#94a3b8" />
                                        <TextInput
                                            className="ml-2 text-slate-700 font-bold text-xs p-0 min-w-[40px]"
                                            value={ex.load}
                                            onChangeText={(v) => handleUpdateExercise(index, 'load', v)}
                                        />
                                        <Text className="text-slate-400 text-[10px] ml-1">kg</Text>
                                    </View>
                                    <View className="bg-slate-50 px-3 py-2 rounded-xl flex-row items-center border border-slate-100 min-w-[80px]">
                                        <Clock size={12} color="#94a3b8" />
                                        <TextInput
                                            className="ml-2 text-slate-700 font-bold text-xs p-0 min-w-[30px]"
                                            value={ex.rest}
                                            onChangeText={(v) => handleUpdateExercise(index, 'rest', v)}
                                        />
                                    </View>
                                </View>

                                <View className="bg-slate-50 p-3 rounded-2xl flex-row border border-slate-50">
                                    <FileText size={16} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-2 text-slate-600 text-xs"
                                        placeholder="Observações (opcional)"
                                        value={ex.observation}
                                        onChangeText={(v) => handleUpdateExercise(index, 'observation', v)}
                                        multiline
                                    />
                                </View>
                            </View>
                        ))}

                        {exercises.length === 0 && (
                            <View className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 items-center justify-center">
                                <Dumbbell size={40} color="#cbd5e1" className="mb-2" />
                                <Text className="text-slate-400 text-center">Nenhum exercício neste treino ainda.</Text>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

            {/* Catalog Modal */}
            <Modal visible={showCatalog} animationType="slide" transparent={true}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white h-[80%] rounded-t-[40px] p-6 shadow-2xl">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-slate-900">Catálogo de Exercícios</Text>
                            <TouchableOpacity onPress={() => setShowCatalog(false)} className="bg-slate-100 p-2 rounded-full">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl mb-6">
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3 text-slate-700"
                                placeholder="Buscar exercício..."
                                value={catalogSearch}
                                onChangeText={setCatalogSearch}
                            />
                        </View>

                        <FlatList
                            data={catalogItems.filter(item => item.name.toLowerCase().includes(catalogSearch.toLowerCase()))}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleAddFromCatalog(item)}
                                    className="flex-row items-center p-4 bg-slate-50 rounded-2xl mb-3 border border-slate-100"
                                >
                                    <View className="bg-white h-10 w-10 rounded-xl items-center justify-center mr-4 shadow-sm shadow-slate-100">
                                        <Dumbbell size={20} color="#4f46e5" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold">{item.name}</Text>
                                        <Text className="text-slate-500 text-xs">{item.muscle_group}</Text>
                                    </View>
                                    <ChevronRight size={16} color="#cbd5e1" />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-20">
                                    <Text className="text-slate-400">Nenhum exercício encontrado.</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
