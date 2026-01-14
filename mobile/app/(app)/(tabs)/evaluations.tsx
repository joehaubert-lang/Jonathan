import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert, Modal, Image } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Search, Calendar, ChevronRight, ClipboardList, Trash2, Edit2, Plus, User, ArrowRight } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

export default function EvaluationsScreen() {
    const router = useRouter();
    const [evals, setEvals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [availableYears, setAvailableYears] = useState<string[]>([new Date().getFullYear().toString()]);

    // New Eval Modal
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchEvaluations();
            fetchStudents();
        }, [])
    );

    const fetchEvaluations = async () => {
        try {
            const { data, error } = await supabase
                .from('evaluations')
                .select(`
                    id, 
                    date, 
                    weight, 
                    body_fat, 
                    student_id,
                    student:students(name)
                `)
                .order('date', { ascending: false });

            if (data) {
                setEvals(data);

                // Extract unique years
                const years = Array.from(new Set(data.map(e => new Date(e.date).getFullYear().toString())));
                if (years.length > 0) {
                    setAvailableYears(years.sort((a, b) => b.localeCompare(a)));
                }
            }
        } catch (error) {
            console.error('Error fetching global evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        const { data } = await supabase.from('students').select('id, name, goal, photo').order('name');
        if (data) setStudents(data);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Excluir Avaliação',
            'Tem certeza que deseja excluir esta avaliação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.from('evaluations').delete().eq('id', id);
                        if (!error) fetchEvaluations();
                        else Alert.alert('Erro', 'Não foi possível excluir.');
                    }
                }
            ]
        );
    };

    const handleEdit = (evalItem: any) => {
        router.push(`/(app)/trainer/student/${evalItem.student_id}/new-evaluation?editId=${evalItem.id}`);
    };

    const handleView = (evalItem: any) => {
        router.push(`/(app)/trainer/student/${evalItem.student_id}/evaluation/${evalItem.id}`);
    };

    const handleNewEval = (studentId: string) => {
        setShowStudentModal(false);
        router.push(`/(app)/trainer/student/${studentId}/new-evaluation`);
    };

    const filteredEvals = evals.filter(item => {
        const matchesSearch = item.student?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = new Date(item.date).getFullYear().toString() === selectedYear;
        return matchesSearch && matchesYear;
    });

    const renderItem = ({ item }: any) => (
        <View className="bg-white p-3 rounded-2xl mb-2 border border-slate-100 shadow-sm flex-row items-center">
            <TouchableOpacity onPress={() => handleView(item)} className="flex-row items-center flex-1">
                <View className="h-10 w-10 bg-indigo-50 rounded-xl items-center justify-center mr-3">
                    <ClipboardList size={20} color="#4f46e5" />
                </View>
                <View className="flex-1 mr-2">
                    <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>{item.student?.name}</Text>
                    <Text className="text-slate-500 text-[10px] mt-0.5">
                        {new Date(item.date).toLocaleDateString('pt-BR')} • {item.weight}kg
                    </Text>
                </View>
            </TouchableOpacity>

            <View className="flex-row gap-2">
                <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    className="bg-slate-50 p-2 rounded-lg"
                >
                    <Edit2 size={14} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    className="bg-rose-50 p-2 rounded-lg"
                >
                    <Trash2 size={14} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 px-6 pt-6">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-slate-900">Histórico</Text>
                    <TouchableOpacity
                        onPress={() => setShowStudentModal(true)}
                        className="h-10 w-10 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search and Filter */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-white rounded-xl flex-row items-center px-4 py-3 border border-slate-100 shadow-sm">
                        <Search size={18} color="#94a3b8" />
                        <TextInput
                            className="flex-1 ml-2 text-slate-700"
                            placeholder="Nome do aluno..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm items-center justify-center">
                        <Calendar size={18} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Year Select (Quick access) */}
                <View style={{ height: 44, marginBottom: 12 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ alignItems: 'center', paddingVertical: 2 }}
                    >
                        {availableYears.map(year => (
                            <TouchableOpacity
                                key={year}
                                onPress={() => setSelectedYear(year)}
                                className={`px-4 py-1.5 rounded-xl mr-2.5 ${selectedYear === year ? 'bg-indigo-600 shadow-sm shadow-indigo-200' : 'bg-white border border-slate-100'}`}
                            >
                                <Text className={`font-bold text-xs ${selectedYear === year ? 'text-white' : 'text-slate-500'}`}>{year}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
                ) : (
                    <FlatList
                        className="flex-1"
                        style={{ flex: 1 }}
                        data={filteredEvals}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 150 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <ClipboardList size={40} color="#cbd5e1" />
                                <Text className="text-slate-400 mt-4 font-medium">Nenhuma avaliação encontrada.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Student Selection Modal */}
            <Modal
                visible={showStudentModal}
                animationType="slide"
                transparent={true}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] h-[80%] px-6 pt-8">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-slate-900">Novo para quem?</Text>
                            <TouchableOpacity onPress={() => setShowStudentModal(false)}>
                                <Text className="text-red-500 font-bold">FECHAR</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="bg-slate-100 rounded-2xl flex-row items-center px-4 py-3 mb-6">
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                className="flex-1 ml-3"
                                placeholder="Filtrar aluno..."
                                value={studentSearch}
                                onChangeText={setStudentSearch}
                            />
                        </View>

                        <FlatList
                            data={students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleNewEval(item.id)}
                                    className="flex-row items-center bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-100"
                                >
                                    <View className="h-12 w-12 bg-slate-200 rounded-full overflow-hidden mr-4">
                                        {item.photo ? (
                                            <Image source={{ uri: item.photo }} className="w-full h-full" />
                                        ) : (
                                            <View className="w-full h-full items-center justify-center">
                                                <User size={24} color="#94a3b8" />
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold">{item.name}</Text>
                                        <Text className="text-slate-500 text-xs">{item.goal || 'Sem objetivo'}</Text>
                                    </View>
                                    <ArrowRight size={20} color="#cbd5e1" />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
