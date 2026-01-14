import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView, Image, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../../../../../lib/supabase';
import { ArrowLeft, Trash2, Edit2, Calendar, Scale, Activity, Camera, ExternalLink, Copy } from 'lucide-react-native';

interface EvaluationDetails {
    id: string;
    date: string;
    protocol: string;
    weight: number;
    height: number;
    body_fat: number;
    measurements: any; // JSONB
}

export default function EvaluationDetailsScreen() {
    const router = useRouter();
    const { id, evaluationId } = useLocalSearchParams();
    const [evaluation, setEvaluation] = useState<EvaluationDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (evaluationId) {
                fetchEvaluation();
            }
        }, [evaluationId])
    );

    const fetchEvaluation = async () => {
        try {
            const { data, error } = await supabase
                .from('evaluations')
                .select('*')
                .eq('id', evaluationId)
                .single();

            if (error) throw error;
            setEvaluation(data);
        } catch (error) {
            console.error('Error fetching evaluation:', error);
            Alert.alert('Erro', 'Não foi possível carregar a avaliação.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Excluir Avaliação',
            'Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('evaluations')
                                .delete()
                                .eq('id', evaluationId);

                            if (error) throw error;
                            router.back();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir.');
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        router.push(`/(app)/trainer/student/${id}/new-evaluation?editId=${evaluationId}`);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
            </SafeAreaView>
        );
    }

    if (!evaluation) return null;

    const protocolName = evaluation.protocol === 'pollock3' ? 'Pollock 3 Dobras' : evaluation.protocol === 'pollock7' ? 'Pollock 7 Dobras' : 'Bioimpedância';
    const folds = evaluation.measurements?.folds || {};
    const photos = evaluation.measurements?.photos || {};

    const renderPhotos = () => {
        const photoList = [
            { key: 'front', label: 'Frente' },
            { key: 'back', label: 'Costas' },
            { key: 'right', label: 'Lado D.' },
            { key: 'left', label: 'Lado E.' }
        ].filter(p => photos[p.key]);

        if (photoList.length === 0) return null;

        return (
            <View className="mb-8">
                <Text className="font-bold text-lg text-slate-800 mb-4">Fotos do Aluno</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {photoList.map(item => (
                        <View key={item.key} className="mr-4 items-center">
                            <Text className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">{item.label}</Text>
                            <View className="h-64 w-48 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 justify-center items-center">
                                <View className="absolute">
                                    <Camera size={24} color="#cbd5e1" />
                                </View>
                                <Image
                                    source={{ uri: photos[item.key] }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between bg-white border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center bg-slate-50 rounded-xl">
                    <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-slate-900">Detalhes da Avaliação</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity onPress={handleEdit} className="h-10 w-10 items-center justify-center bg-indigo-50 rounded-xl">
                        <Edit2 size={20} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} className="h-10 w-10 items-center justify-center bg-red-50 rounded-xl">
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">

                {/* Result Card */}
                <View className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-200 mb-6">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-indigo-100 text-sm font-medium mb-1">Gordura Corporal</Text>
                            <Text className="text-white text-4xl font-bold">{evaluation.body_fat}%</Text>
                        </View>
                        <View className="bg-white/20 p-2 rounded-lg">
                            <Activity size={24} color="white" />
                        </View>
                    </View>
                    <View className="flex-row gap-4 border-t border-white/20 pt-4">
                        <View>
                            <Text className="text-indigo-100 text-xs">Peso Total</Text>
                            <Text className="text-white font-bold text-lg">{evaluation.weight} kg</Text>
                        </View>
                        <View>
                            <Text className="text-indigo-100 text-xs">Altura</Text>
                            <Text className="text-white font-bold text-lg">{evaluation.height?.toFixed(2)} m</Text>
                        </View>
                    </View>
                </View>

                {/* Info */}
                <View className="bg-white p-4 rounded-xl border border-slate-100 mb-6">
                    <View className="flex-row items-center gap-3 mb-2">
                        <Calendar size={20} color="#64748b" />
                        <Text className="text-slate-600 font-medium">
                            {new Date(evaluation.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <Scale size={20} color="#64748b" />
                        <Text className="text-slate-600 font-medium">{protocolName}</Text>
                    </View>
                </View>

                {/* Photos Gallery */}
                {renderPhotos()}

                {/* Measurements Grid */}
                {Object.keys(folds).length > 0 && (
                    <View className="mb-8">
                        <Text className="font-bold text-lg text-slate-800 mb-4">Dobras Cutâneas (mm)</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {Object.entries(folds).map(([key, value]) => {
                                if (!value) return null;
                                let label = key;
                                if (key === 'chest') label = 'Peitoral';
                                if (key === 'abdomen') label = 'Abdominal';
                                if (key === 'thigh') label = 'Coxa';
                                if (key === 'triceps') label = 'Tríceps';
                                if (key === 'suprailiac') label = 'Supra-ilíaca';
                                if (key === 'subscapular') label = 'Subescapular';
                                if (key === 'axillary') label = 'Axilar Média';

                                return (
                                    <View key={key} className="w-[48%] bg-white p-3 rounded-xl border border-slate-100">
                                        <Text className="text-slate-400 text-xs uppercase font-bold mb-1">{label}</Text>
                                        <Text className="text-slate-900 font-bold text-lg">{String(value)}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
