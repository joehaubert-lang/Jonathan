import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../../../../lib/supabase';
import { ArrowLeft, TrendingDown, TrendingUp, Minus, Share, Download, Camera } from 'lucide-react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface Evaluation {
    id: string;
    date: string;
    weight: number;
    body_fat: number;
    measurements: {
        folds?: any;
        photos?: {
            front?: string;
            back?: string;
            right?: string;
            left?: string;
        };
    };
}

interface Student {
    name: string;
}

export default function ComparisonScreen() {
    const router = useRouter();
    const { id, ids } = useLocalSearchParams();
    const [evals, setEvals] = useState<Evaluation[]>([]);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const viewShotRef = useRef<any>(null);

    useEffect(() => {
        if (ids && id) {
            fetchData();
        }
    }, [ids, id]);

    const fetchData = async () => {
        try {
            const idList = (ids as string).split(',');

            // Fetch Evaluations
            const { data: evData, error: evError } = await supabase
                .from('evaluations')
                .select('*')
                .in('id', idList)
                .order('date', { ascending: true });

            if (evError) throw evError;
            setEvals(evData || []);

            // Fetch Student
            const { data: stData, error: stError } = await supabase
                .from('students')
                .select('name')
                .eq('id', id)
                .single();

            if (stError) throw stError;
            setStudent(stData);

        } catch (error) {
            console.error('Error fetching data for comparison:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!viewShotRef.current) return;
        setExporting(true);
        try {
            const uri = await captureRef(viewShotRef, {
                format: 'png',
                quality: 1,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Compartilhar Evolução',
                UTI: 'public.png',
            });
        } catch (error) {
            console.error('Error exporting image:', error);
            Alert.alert('Erro', 'Não foi possível gerar a imagem.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
            </SafeAreaView>
        );
    }

    if (evals.length < 2) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <Text className="text-slate-500 text-center">Não foi possível carregar o comparativo.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-indigo-600 px-6 py-2 rounded-lg">
                    <Text className="text-white font-bold">Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const ev1 = evals[0];
    const ev2 = evals[1];

    const renderDelta = (val1: number, val2: number, invert = false) => {
        const delta = val2 - val1;
        const color = delta === 0 ? 'text-slate-400' : (delta > 0 ? (invert ? 'text-red-500' : 'text-emerald-500') : (invert ? 'text-emerald-500' : 'text-red-500'));
        const Icon = delta === 0 ? Minus : (delta > 0 ? TrendingUp : TrendingDown);

        return (
            <View className="flex-row items-center">
                <Icon size={14} color={delta === 0 ? '#94a3b8' : (delta > 0 ? (invert ? '#ef4444' : '#10b981') : (invert ? '#10b981' : '#ef4444'))} />
                <Text className={`text-xs font-bold ml-1 ${color}`}>
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                </Text>
            </View>
        );
    };

    const MetricRow = ({ label, val1, val2, unit = '', invert = false }: any) => (
        <View className="flex-row items-center border-b border-slate-100 py-4">
            <View className="flex-1">
                <Text className="text-slate-500 text-xs uppercase font-bold">{label}</Text>
            </View>
            <View className="flex-1 items-center">
                <Text className="text-slate-900 font-bold">{val1}{unit}</Text>
            </View>
            <View className="flex-1 items-center">
                <Text className="text-slate-900 font-bold">{val2}{unit}</Text>
            </View>
            <View className="w-16 items-end">
                {renderDelta(val1, val2, invert)}
            </View>
        </View>
    );

    const folds1 = ev1.measurements?.folds || {};
    const folds2 = ev2.measurements?.folds || {};
    const photos1 = (ev1.measurements?.photos as any) || {};
    const photos2 = (ev2.measurements?.photos as any) || {};

    const allFoldKeys = Array.from(new Set([...Object.keys(folds1), ...Object.keys(folds2)]));
    const labels: any = {
        chest: 'Peitoral',
        abdomen: 'Abdominal',
        thigh: 'Coxa',
        triceps: 'Tríceps',
        suprailiac: 'Supra-ilíaca',
        subscapular: 'Subescapular',
        axillary: 'Axilar Média'
    };

    const photoPositions = [
        { key: 'front', label: 'Frente' },
        { key: 'back', label: 'Costas' },
        { key: 'right', label: 'Lado Direito' },
        { key: 'left', label: 'Lado Esquerdo' }
    ];

    const availablePhotos = photoPositions.filter(pos => photos1[pos.key] || photos2[pos.key]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-slate-100">
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center bg-slate-50 rounded-xl">
                        <ArrowLeft size={24} color="#64748b" />
                    </TouchableOpacity>
                    <Text className="font-bold text-lg text-slate-900">Comparativo</Text>
                </View>
                <TouchableOpacity
                    onPress={handleExport}
                    disabled={exporting}
                    className="h-10 px-4 flex-row items-center justify-center bg-indigo-600 rounded-xl"
                >
                    {exporting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Share size={18} color="white" />
                            <Text className="text-white font-bold ml-2 text-xs">Exportar</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                    <View className="bg-white p-6">
                        {/* Branding Header */}
                        <View className="items-center mb-8">
                            <View className="h-16 w-16 bg-indigo-600 rounded-2xl items-center justify-center mb-2">
                                <TrendingUp size={32} color="white" />
                            </View>
                            <Text className="text-2xl font-bold text-slate-900">FitFlow</Text>
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Resumo Comparativo</Text>
                        </View>

                        {/* Student Info */}
                        <View className="bg-slate-50 p-4 rounded-2xl mb-6 items-center">
                            <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Aluno(a)</Text>
                            <Text className="text-xl font-bold text-slate-900">{student?.name || 'Carregando...'}</Text>
                        </View>

                        {/* Header Dates */}
                        <View className="flex-row py-4 border-b border-slate-200">
                            <View className="flex-1" />
                            <View className="flex-1 items-center">
                                <Text className="text-slate-400 text-xxs uppercase font-bold mb-1">Anterior</Text>
                                <Text className="text-slate-900 font-bold text-xs">{new Date(ev1.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-indigo-600 text-xxs uppercase font-bold mb-1">Atual</Text>
                                <Text className="text-indigo-600 font-bold text-xs">{new Date(ev2.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
                            </View>
                            <View className="w-16 items-end">
                                <Text className="text-slate-400 text-xxs uppercase font-bold mb-1">Evol.</Text>
                            </View>
                        </View>

                        {/* Core Metrics */}
                        <MetricRow label="Peso" val1={ev1.weight} val2={ev2.weight} unit="kg" invert={true} />
                        <MetricRow label="Gordura" val1={ev1.body_fat} val2={ev2.body_fat} unit="%" invert={true} />

                        {/* Folds Section */}
                        {allFoldKeys.length > 0 && (
                            <>
                                <View className="mt-8 mb-2">
                                    <Text className="text-slate-900 font-bold text-lg">Dobras Cutâneas (mm)</Text>
                                </View>

                                {allFoldKeys.map(key => {
                                    const v1 = parseFloat(folds1[key] || '0');
                                    const v2 = parseFloat(folds2[key] || '0');
                                    if (v1 === 0 && v2 === 0) return null;
                                    return (
                                        <MetricRow
                                            key={key}
                                            label={labels[key] || key}
                                            val1={v1}
                                            val2={v2}
                                            invert={true}
                                        />
                                    );
                                })}
                            </>
                        )}

                        {/* Photo Comparison Section */}
                        {availablePhotos.length > 0 && (
                            <>
                                <View className="mt-10 mb-4">
                                    <Text className="text-slate-900 font-bold text-lg">Evolução Visual</Text>
                                </View>
                                {availablePhotos.map(pos => (
                                    <View key={pos.key} className="mb-8">
                                        <Text className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            {pos.label}
                                        </Text>
                                        <View className="flex-row justify-between">
                                            <View className="w-[48%] aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 items-center justify-center">
                                                {photos1[pos.key] ? (
                                                    <Image source={{ uri: photos1[pos.key] }} className="w-full h-full" resizeMode="cover" />
                                                ) : (
                                                    <Camera size={24} color="#cbd5e1" />
                                                )}
                                            </View>
                                            <View className="w-[48%] aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-indigo-200 items-center justify-center">
                                                {photos2[pos.key] ? (
                                                    <Image source={{ uri: photos2[pos.key] }} className="w-full h-full" resizeMode="cover" />
                                                ) : (
                                                    <Camera size={24} color="#cbd5e1" />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}

                        <View className="mt-12 items-center">
                            <Text className="text-slate-300 text-[10px] font-bold tracking-[4px]">GERADO POR FITFLOW APP</Text>
                        </View>
                    </View>
                </ViewShot>
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}

