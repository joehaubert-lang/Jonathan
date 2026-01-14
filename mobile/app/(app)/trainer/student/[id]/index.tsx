import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, FlatList, Alert, Linking, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { ArrowLeft, Dumbbell, User as UserIcon, Calendar, Cake, MessageCircle, Trash2, Edit2, X } from 'lucide-react-native';

interface StudentDetails {
    id: string;
    name: string;
    photo: string;
    status: 'active' | 'inactive' | 'pending';
    goal: string;
    email: string;
    phone: string;
    birth_date?: string;
    plan_expiry_date?: string;
}

interface Workout {
    id: string;
    name: string;
    active: boolean;
    frequency: string;
    created_at: string;
}

interface Evaluation {
    id: string;
    created_at: string;
    date: string;
    protocol: string;
    weight: number;
    body_fat: number;
}

export default function StudentDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [student, setStudent] = useState<StudentDetails | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'workouts' | 'evaluations'>('workouts');

    // Comparison State
    const [isComparing, setIsComparing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editBirthDate, setEditBirthDate] = useState('');
    const [editExpiryDate, setEditExpiryDate] = useState('');

    // Use useFocusEffect to refresh data when screen comes into focus (e.g. back from new evaluation)
    useFocusEffect(
        useCallback(() => {
            if (id) {
                fetchStudentDetails();
            }
        }, [id])
    );

    const fetchStudentDetails = async () => {
        try {
            setLoading(true);
            const { data: studentData, error: studentError } = await supabase
                .from('students').select('*').eq('id', id).single();
            if (studentError) throw studentError;
            setStudent(studentData);

            const { data: workoutData } = await supabase
                .from('workouts').select('id, name, active, frequency, created_at').eq('student_id', id).order('created_at', { ascending: false });
            setWorkouts(workoutData || []);

            const { data: evalData } = await supabase
                .from('evaluations').select('*').eq('student_id', id).order('date', { ascending: false });
            setEvaluations(evalData || []);
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (evalId: string) => {
        setSelectedIds(prev => {
            if (prev.includes(evalId)) {
                return prev.filter(id => id !== evalId);
            }
            if (prev.length >= 2) {
                Alert.alert('Limite atingido', 'Selecione apenas 2 avaliações para comparar.');
                return prev;
            }
            return [...prev, evalId];
        });
    };

    const handleDeleteWorkout = async (workoutId: string) => {
        Alert.alert(
            'Excluir Treino',
            'Tem certeza que deseja excluir este treino do aluno?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('workouts')
                                .delete()
                                .eq('id', workoutId);

                            if (error) throw error;

                            Alert.alert('Sucesso', 'Treino removido com sucesso.');
                            fetchStudentDetails(); // Refresh
                        } catch (error: any) {
                            Alert.alert('Erro', error.message);
                        }
                    }
                }
            ]
        );
    };

    const handleEditWorkout = (workoutId: string) => {
        router.push(`/(app)/trainer/workout/edit/${workoutId}`);
    };

    const handleWorkoutPress = (workoutId: string) => {
        router.push(`/(app)/trainer/workout/${workoutId}`);
    };

    const openWhatsApp = () => {
        if (!student?.phone) return;
        const phone = student.phone.replace(/\D/g, '');
        const url = `whatsapp://send?phone=55${phone}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) Linking.openURL(url);
            else Alert.alert('Erro', 'WhatsApp não está instalado neste dispositivo.');
        }).catch(err => console.error("An error occurred", err));
    };

    const handleSendPlanNotification = async () => {
        if (!student) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('notifications')
                .insert({
                    student_id: student.id,
                    type: 'payment',
                    title: 'Vencimento de Plano',
                    description: `Olá ${student.name.split(' ')[0]}, seu plano está próximo do vencimento${student.plan_expiry_date ? ' (' + new Date(student.plan_expiry_date).toLocaleDateString('pt-BR') + ')' : ''}. Entre em contato para renovar!`,
                });

            if (error) throw error;
            Alert.alert('Sucesso', 'Notificação enviada para o aluno!');
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível enviar a notificação: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStudentDetails = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('students')
                .update({
                    birth_date: editBirthDate ? `${editBirthDate}T12:00:00` : null,
                    plan_expiry_date: editExpiryDate ? `${editExpiryDate}T12:00:00` : null
                })
                .eq('id', id);

            if (error) throw error;
            Alert.alert('Sucesso', 'Dados do aluno atualizados!');
            setShowEditModal(false);
            fetchStudentDetails();
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    const startEditingDetails = () => {
        setEditBirthDate(student?.birth_date?.substring(0, 10) || '');
        setEditExpiryDate(student?.plan_expiry_date || '');
        setShowEditModal(true);
    };

    const getBirthDateString = (dateString?: string) => {
        if (!dateString) return '-';
        const cleanDate = dateString.substring(0, 10);
        const [year, month, day] = cleanDate.split('-');
        const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        const monthIndex = parseInt(month) - 1;
        if (monthIndex < 0 || monthIndex > 11) return cleanDate;
        return `${day} de ${months[monthIndex]}`;
    };

    const renderWorkoutItem = ({ item }: { item: Workout }) => (
        <View className="bg-white p-4 rounded-xl mb-3 border border-slate-100 shadow-sm">
            <TouchableOpacity
                className="flex-row items-center mb-3"
                onPress={() => handleWorkoutPress(item.id)}
            >
                <View className={`h-10 w-10 rounded-full items-center justify-center mr-4 ${item.active ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                    <Dumbbell size={20} color={item.active ? '#4f46e5' : '#94a3b8'} />
                </View>
                <View className="flex-1">
                    <Text className="text-slate-900 font-bold">{item.name}</Text>
                    <Text className="text-slate-500 text-xs">Freq: {item.frequency || 'N/A'}</Text>
                </View>
                <View className="items-end">
                    <View className={`px-2 py-0.5 rounded-full mb-1 ${item.active ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <Text className={`text-[10px] font-bold ${item.active ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {item.active ? 'ATIVO' : 'INATIVO'}
                        </Text>
                    </View>
                    <Text className="text-slate-400 text-[10px]">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </TouchableOpacity>

            <View className="flex-row gap-2 border-t border-slate-50 pt-3">
                <TouchableOpacity
                    onPress={() => handleWorkoutPress(item.id)}
                    className="flex-1 bg-indigo-50 py-2 rounded-lg items-center justify-center flex-row"
                >
                    <Dumbbell size={14} color="#4f46e5" />
                    <Text className="text-indigo-600 font-bold text-[10px] ml-2">Ver Detalhes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleEditWorkout(item.id)}
                    className="bg-slate-50 px-3 py-2 rounded-lg items-center justify-center"
                >
                    <Edit2 size={14} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteWorkout(item.id)}
                    className="bg-red-50 px-3 py-2 rounded-lg items-center justify-center"
                >
                    <Trash2 size={14} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEvaluationItem = ({ item }: { item: Evaluation }) => {
        const isSelected = selectedIds.includes(item.id);

        return (
            <TouchableOpacity
                className={`p-4 rounded-xl mb-3 border shadow-sm flex-row items-center justify-between ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}
                onPress={() => {
                    if (isComparing) {
                        toggleSelection(item.id);
                    } else {
                        router.push(`/(app)/trainer/student/${id}/evaluation/${item.id}`);
                    }
                }}
            >
                <View className="flex-row items-center gap-3">
                    {isComparing ? (
                        <View className={`h-6 w-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                            {isSelected && <View className="h-2.5 w-2.5 bg-white rounded-full" />}
                        </View>
                    ) : (
                        <View className="h-10 w-10 bg-indigo-50 rounded-full items-center justify-center">
                            <Calendar size={20} color="#4f46e5" />
                        </View>
                    )}
                    <View>
                        <Text className="text-slate-900 font-bold">
                            {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </Text>
                        <Text className="text-slate-500 text-xs uppercase font-bold">
                            {item.protocol === 'pollock3' ? 'Pollock 3' : item.protocol === 'pollock7' ? 'Pollock 7' : 'Bioimpedância'}
                        </Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-slate-900 font-bold">{item.weight} kg</Text>
                    <Text className="text-slate-500 text-xs font-bold text-indigo-600">{item.body_fat ? `${item.body_fat}% BF` : '-'}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !student) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
            </SafeAreaView>
        );
    }

    if (!student) return null;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 relative">
                {/* Header Gradient Background */}
                <View className="absolute top-0 left-0 right-0 h-48 bg-indigo-600 rounded-b-[40px] z-0" />

                <View className="flex-1 px-6 pt-6 z-10">
                    {/* Top Bar */}
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="h-10 w-10 bg-white/20 items-center justify-center rounded-xl backdrop-blur-md"
                        >
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Perfil do Aluno</Text>
                        <TouchableOpacity
                            onPress={startEditingDetails}
                            className="h-10 w-10 bg-white/20 items-center justify-center rounded-xl backdrop-blur-md"
                        >
                            <Edit2 size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Card */}
                    <View className="items-center -mb-12 z-20">
                        <View className="h-24 w-24 bg-white rounded-full p-1 shadow-lg shadow-indigo-900/20 mb-3">
                            <View className="h-full w-full rounded-full bg-slate-100 items-center justify-center overflow-hidden">
                                {student.photo ? (
                                    <Image source={{ uri: student.photo }} className="w-full h-full" />
                                ) : (
                                    <UserIcon size={40} color="#94a3b8" />
                                )}
                            </View>
                        </View>
                        <Text className="text-xl font-bold text-slate-900">{student.name}</Text>
                        {student.goal && (
                            <Text className="text-indigo-600 text-sm font-medium mb-1">{student.goal}</Text>
                        )}
                        <View className={`px-3 py-1 rounded-full ${student.status === 'active' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                            <Text className={`text-xs font-bold ${student.status === 'active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {student.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Text>
                        </View>
                    </View>

                    {/* Info Grid */}
                    <View className="mt-16 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                        <View className="flex-row justify-between mb-4">
                            <View className="flex-1 items-center border-r border-slate-100">
                                <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Contato</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-slate-700 text-sm font-medium mr-2" numberOfLines={1}>{student.phone || '-'}</Text>
                                    {student.phone && (
                                        <TouchableOpacity onPress={openWhatsApp}>
                                            <MessageCircle size={16} color="#25D366" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Aniversário</Text>
                                <View className="flex-row items-center">
                                    <Cake size={16} color="#f472b6" style={{ marginRight: 6 }} />
                                    <Text className="text-slate-700 text-sm font-medium">
                                        {getBirthDateString(student.birth_date)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="pt-4 border-t border-slate-100 flex-row items-center justify-between">
                            <View>
                                <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Vencimento do Plano</Text>
                                <View className="flex-row items-center">
                                    <Calendar size={16} color="#64748b" style={{ marginRight: 6 }} />
                                    <Text className="text-slate-700 font-bold">
                                        {student.plan_expiry_date ? (() => {
                                            const [y, m, d] = student.plan_expiry_date.substring(0, 10).split('-');
                                            return `${d}/${m}/${y}`;
                                        })() : 'Não definido'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={handleSendPlanNotification}
                                className="bg-amber-50 px-4 py-2 rounded-xl flex-row items-center border border-amber-100"
                            >
                                <MessageCircle size={14} color="#d97706" />
                                <Text className="text-amber-700 text-[10px] font-bold ml-2 text-center">NOTIFICAR{'\n'}VENCIMENTO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tab Navigation */}
                    <View className="flex-row mb-4 bg-slate-100 p-1 rounded-xl">
                        <TouchableOpacity
                            className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'workouts' ? 'bg-white shadow-sm' : ''}`}
                            onPress={() => setActiveTab('workouts')}
                        >
                            <Text className={`font-bold ${activeTab === 'workouts' ? 'text-indigo-600' : 'text-slate-500'}`}>Treinos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'evaluations' ? 'bg-white shadow-sm' : ''}`}
                            onPress={() => setActiveTab('evaluations')}
                        >
                            <Text className={`font-bold ${activeTab === 'evaluations' ? 'text-indigo-600' : 'text-slate-500'}`}>Avaliações</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content Section */}
                    <View className="flex-1">
                        {activeTab === 'workouts' ? (
                            <View>
                                <Text className="text-slate-900 font-bold text-lg mb-3">Treinos Atribuídos ({workouts.length})</Text>
                                <FlatList
                                    data={workouts}
                                    keyExtractor={item => item.id}
                                    renderItem={renderWorkoutItem}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    ListEmptyComponent={
                                        <View className="items-center justify-center py-10 bg-white rounded-xl border border-slate-100 border-dashed">
                                            <View className="bg-slate-50 p-4 rounded-full mb-2">
                                                <Dumbbell size={24} color="#94a3b8" />
                                            </View>
                                            <Text className="text-slate-500 font-medium">Nenhum treino atribuído</Text>
                                            <Text className="text-slate-400 text-xs mt-1">Clique em + para adicionar</Text>
                                        </View>
                                    }
                                />
                            </View>
                        ) : (
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text className="text-slate-900 font-bold text-lg">Histórico ({evaluations.length})</Text>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            className={`px-3 py-1.5 rounded-lg border ${isComparing ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                                            onPress={() => {
                                                setIsComparing(!isComparing);
                                                setSelectedIds([]);
                                            }}
                                        >
                                            <Text className={`text-xs font-bold ${isComparing ? 'text-white' : 'text-slate-600'}`}>
                                                {isComparing ? 'Cancelar' : 'Comparar'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="bg-indigo-600 px-3 py-1.5 rounded-lg"
                                            onPress={() => router.push(`/(app)/trainer/student/${id}/new-evaluation`)}
                                        >
                                            <Text className="text-white text-xs font-bold">+ Nova</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Evaluations List */}
                                <FlatList
                                    data={evaluations}
                                    keyExtractor={item => item.id}
                                    renderItem={renderEvaluationItem}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 80 }}
                                    ListEmptyComponent={
                                        <View className="items-center justify-center py-10 bg-white rounded-xl border border-slate-100 border-dashed">
                                            <View className="bg-slate-50 p-4 rounded-full mb-2">
                                                <Calendar size={24} color="#94a3b8" />
                                            </View>
                                            <Text className="text-slate-500 font-medium">Nenhuma avaliação encontrada</Text>
                                        </View>
                                    }
                                />

                                {isComparing && selectedIds.length > 0 && (
                                    <View className="absolute bottom-4 left-6 right-6">
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (selectedIds.length === 2) {
                                                    router.push({
                                                        pathname: `/(app)/trainer/student/${id}/evaluation/compare`,
                                                        params: { ids: selectedIds.join(',') }
                                                    });
                                                } else {
                                                    Alert.alert('Seleção incompleta', 'Selecione mais uma avaliação para comparar.');
                                                }
                                            }}
                                            disabled={selectedIds.length < 2}
                                            className={`py-4 rounded-xl flex-row items-center justify-center shadow-lg ${selectedIds.length === 2 ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-300'}`}
                                        >
                                            <Text className="text-white font-bold text-lg">
                                                Comparar ({selectedIds.length}/2)
                                            </Text>
                                            {selectedIds.length === 2 && <ArrowLeft size={20} color="white" style={{ marginLeft: 8, transform: [{ rotate: '180deg' }] }} />}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Edit Student Modal */}
            <Modal visible={showEditModal} animationType="slide" transparent={true}>
                <View className="flex-1 bg-black/50 justify-end">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="bg-white rounded-t-[40px] p-6 shadow-2xl"
                    >
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-2xl font-bold text-slate-900">Editar Detalhes</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)} className="bg-slate-100 p-2 rounded-full">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Data de Nascimento (AAAA-MM-DD)</Text>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-slate-900 font-medium"
                                placeholder="1990-01-01"
                                value={editBirthDate}
                                onChangeText={setEditBirthDate}
                            />

                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Vencimento do Plano (AAAA-MM-DD)</Text>
                            <TextInput
                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-slate-900 font-medium"
                                placeholder="2024-12-31"
                                value={editExpiryDate}
                                onChangeText={setEditExpiryDate}
                            />

                            <TouchableOpacity
                                onPress={handleUpdateStudentDetails}
                                disabled={loading}
                                className="bg-indigo-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100 mb-10"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">Salvar Alterações</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
