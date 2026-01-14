import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, FlatList, Alert, Modal, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
// NOTE: Replaced AlertTriangle with AlertCircle to avoid import errors
import { ArrowLeft, Dumbbell, Clock, Repeat, Weight, FileText, PlayCircle, X, AlertCircle } from 'lucide-react-native';

import YoutubePlayer from 'react-native-youtube-iframe';

interface Exercise {
    id: string;
    name: string;
    sets: number | null;
    reps: string | null;
    load: string | null;
    rest: string | null;
    observation: string | null;
    order_index: number;
    video_url?: string;
}

interface WorkoutDetails {
    id: string;
    name: string;
    active: boolean;
    frequency: string;
    goal: string;
}

export default function WorkoutDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [workout, setWorkout] = useState<WorkoutDetails | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
    const [videoError, setVideoError] = useState(false);

    console.log('[WorkoutDetails] Render. ID:', id);

    useEffect(() => {
        if (id) {
            fetchWorkoutDetails();
        } else {
            console.log('[WorkoutDetails] No ID.');
            setLoading(false);
        }
    }, [id]);

    const fetchWorkoutDetails = async () => {
        try {
            setLoading(true);
            const { data: workoutData, error: workoutError } = await supabase
                .from('workouts')
                .select('id, name, active, frequency, goal')
                .eq('id', id)
                .single();

            if (workoutError) throw workoutError;
            setWorkout(workoutData);

            const { data: exercisesData, error: exercisesError } = await supabase
                .from('exercises')
                .select('*')
                .eq('workout_id', id)
                .order('order_index', { ascending: true });

            if (exercisesError) throw exercisesError;
            setExercises(exercisesData || []);

        } catch (error) {
            console.error('Error fetching workout details:', error);
            Alert.alert('Erro', 'Não foi possível carregar o treino.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleOpenVideo = (url: string) => {
        setVideoError(false);
        // Robust Regex
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        const videoId = match ? match[1] : null;

        if (videoId) {
            setCurrentVideoUrl(videoId);
            setVideoModalVisible(true);
        } else {
            if (url.length === 11) {
                setCurrentVideoUrl(url);
                setVideoModalVisible(true);
            } else {
                Alert.alert('Erro', 'Link de vídeo inválido ou não suportado.');
            }
        }
    };

    const renderExerciseItem = ({ item }: { item: Exercise }) => (
        <View className="bg-white p-5 rounded-2xl mb-4 border border-slate-100 shadow-sm">
            <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center flex-1">
                    <View className="h-10 w-10 bg-indigo-50 rounded-xl items-center justify-center mr-3">
                        <Dumbbell size={20} color="#4f46e5" />
                    </View>
                    <View className="flex-1 mr-2">
                        <Text className="text-slate-900 font-bold text-lg">{item.name}</Text>
                        {item.observation && (
                            <Text className="text-slate-500 text-xs italic mt-1">{item.observation}</Text>
                        )}
                    </View>
                </View>
                {item.video_url && item.video_url.length > 5 && (
                    <TouchableOpacity
                        onPress={() => handleOpenVideo(item.video_url!)}
                        className="bg-red-100 h-8 w-8 rounded-full items-center justify-center"
                    >
                        <PlayCircle size={18} color="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    </TouchableOpacity>
                )}
            </View>

            <View className="flex-row items-center justify-between bg-slate-50 p-3 rounded-xl">
                <View className="items-center flex-1 border-r border-slate-200">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Séries</Text>
                    <Text className="text-slate-700 font-bold text-base">{item.sets || '-'}</Text>
                </View>
                <View className="items-center flex-1 border-r border-slate-200">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Reps</Text>
                    <Text className="text-slate-700 font-bold text-base">{item.reps || '-'}</Text>
                </View>
                <View className="items-center flex-1 border-r border-slate-200">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Carga</Text>
                    <Text className="text-slate-700 font-bold text-base">{item.load || '-'}</Text>
                </View>
                <View className="items-center flex-1">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Descanso</Text>
                    <Text className="text-slate-700 font-bold text-base">{item.rest || '-'}</Text>
                </View>
            </View>
        </View>
    );

    if (!id) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-red-500">Erro: ID ausente.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-gray-200 p-2 rounded">
                    <Text>Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
            </SafeAreaView>
        );
    }

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-slate-500 mb-4">Treino não encontrado.</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-indigo-500 py-2 px-4 rounded-lg">
                    <Text className="text-white">Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 px-6 pt-6">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="h-10 w-10 bg-white items-center justify-center rounded-xl border border-slate-100 shadow-sm"
                    >
                        <ArrowLeft size={24} color="#64748b" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-slate-900 font-bold text-lg">{workout.name}</Text>
                        <Text className="text-slate-500 text-xs">{workout.frequency}</Text>
                    </View>
                    <View className="w-10"></View>
                </View>

                <View className="flex-1">
                    <Text className="text-slate-900 font-bold text-lg mb-4">Você tem {exercises.length} Exercícios</Text>
                    <FlatList
                        data={exercises}
                        keyExtractor={item => item.id}
                        renderItem={renderExerciseItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Text className="text-slate-400 italic">Nenhum exercício cadastrado.</Text>
                            </View>
                        }
                    />
                </View>

                {/* Video Modal */}
                <Modal
                    visible={videoModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setVideoModalVisible(false)}
                >
                    <View className="flex-1 bg-black/90 justify-center">
                        <SafeAreaView className="flex-1">
                            <View className="items-end px-4 py-2">
                                <TouchableOpacity
                                    onPress={() => setVideoModalVisible(false)}
                                    className="p-2 bg-white/20 rounded-full"
                                >
                                    <X size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-1 justify-center p-4">
                                <View className="bg-black rounded-xl overflow-hidden shadow-2xl w-full">
                                    {!videoError ? (
                                        <YoutubePlayer
                                            height={220}
                                            play={true}
                                            videoId={currentVideoUrl || ''}
                                            onError={(e) => {
                                                console.log('Youtube Player Error:', e);
                                                setVideoError(true);
                                            }}
                                            webViewProps={{
                                                allowsInlineMediaPlayback: true,
                                                originWhitelist: ['*'],
                                                baseUrl: 'https://www.youtube.com'
                                            }}
                                        />
                                    ) : (
                                        <View className="h-[220px] items-center justify-center bg-zinc-900 p-4">
                                            <AlertCircle size={40} color="#f87171" className="mb-2" />
                                            <Text className="text-white font-bold text-center">Vídeo Indisponível no App</Text>
                                            <Text className="text-zinc-400 text-xs text-center mt-1">
                                                Este vídeo possui restrições de reprodução.
                                            </Text>
                                        </View>
                                    )}

                                    <View className="p-4 bg-zinc-900">
                                        <Text className="text-white/60 text-xs text-center mb-2">
                                            {videoError ? 'Para assistir, toque no botão abaixo:' : 'Problemas? Abra diretamente no YouTube:'}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (currentVideoUrl) {
                                                    Linking.openURL(`https://www.youtube.com/watch?v=${currentVideoUrl}`);
                                                }
                                            }}
                                            className="bg-red-600 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                        >
                                            <PlayCircle size={20} color="white" className="mr-2" />
                                            <Text className="text-white font-bold ml-2">Abrir no YouTube</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}
