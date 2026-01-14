import { View, Text, TouchableOpacity, SafeAreaView, FlatList, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, LogOut, User as UserIcon, Plus, Cake } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Define a local interface for the list based on what we need
interface StudentSummary {
    id: string;
    name: string;
    photo: string;
    status: 'active' | 'inactive' | 'pending';
    goal: string;
    birth_date?: string;
}

export default function StudentsScreen() {
    const { signOut, user } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<StudentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'birthdays'>('all');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [searchQuery, students, activeTab]);

    const filterStudents = () => {
        let filtered = students;

        // Filter by Tab (Birthdays)
        if (activeTab === 'birthdays') {
            const currentMonth = new Date().getMonth(); // 0-11
            filtered = filtered.filter(s => {
                if (!s.birth_date) return false;
                const birthDate = new Date(s.birth_date);
                // Note: getMonth() returns 0-indexed month. birth_date string YYYY-MM-DD parses correctly in UTC but we should be careful with timezones.
                // Simpler approach: split string to avoid timezone issues: "YYYY-MM-DD"
                const parts = s.birth_date.split('-');
                if (parts.length !== 3) return false;
                const month = parseInt(parts[1], 10) - 1; // 0-11
                return month === currentMonth;
            });
        }

        // Filter by Search
        if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredStudents(filtered);
    };

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('id, name, photo, status, goal, birth_date')
                .order('name');

            if (error) {
                console.error('Error fetching students:', error);
                Alert.alert('Erro', 'Não foi possível carregar a lista de alunos.');
            } else {
                setStudents(data as StudentSummary[]);
                setFilteredStudents(data as StudentSummary[]);
            }
        } catch (err) {
            console.error('Exception fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentPress = (studentId: string) => {
        router.push(`/(app)/trainer/student/${studentId}`);
    };

    const renderStudentItem = ({ item }: { item: StudentSummary }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl mb-3 flex-row items-center border border-slate-100 shadow-sm"
            onPress={() => handleStudentPress(item.id)}
        >
            <View className="h-12 w-12 bg-slate-100 rounded-full items-center justify-center overflow-hidden mr-4">
                {item.photo ? (
                    <Image source={{ uri: item.photo }} className="w-full h-full" />
                ) : (
                    <UserIcon size={24} color="#94a3b8" />
                )}
            </View>
            <View className="flex-1">
                <Text className="text-slate-900 font-bold text-base">{item.name}</Text>
                <View className="flex-row items-center">
                    <Text className="text-slate-500 text-sm">{item.goal || 'Sem objetivo'}</Text>
                    {item.birth_date && (() => {
                        const parts = item.birth_date.split('-');
                        const month = parseInt(parts[1], 10) - 1;
                        if (month === new Date().getMonth()) {
                            return (
                                <View className="flex-row items-center ml-2 bg-pink-100 px-2 py-0.5 rounded-full">
                                    <Cake size={10} color="#db2777" />
                                    <Text className="text-pink-700 text-[10px] font-bold ml-1">
                                        {parts[2]}/{parts[1]}
                                    </Text>
                                </View>
                            );
                        }
                        return null;
                    })()}
                </View>
            </View>
            <View className={`px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-emerald-100' :
                item.status === 'pending' ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                <Text className={`text-xs font-bold ${item.status === 'active' ? 'text-emerald-700' :
                    item.status === 'pending' ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                    {item.status === 'active' ? 'Ativo' :
                        item.status === 'pending' ? 'Pendente' : 'Inativo'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const getMonthName = () => {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return months[new Date().getMonth()];
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 px-6 pt-6">

                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">Alunos</Text>
                        <Text className="text-slate-500 text-sm">Gerencie seus alunos e objetivos</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Alert.alert('Em breve', 'Adicionar aluno será implementado em breve.')}
                        className="h-10 w-10 bg-indigo-600 items-center justify-center rounded-full shadow-lg"
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View className="flex-row gap-6 mb-6 px-1">
                    <TouchableOpacity
                        onPress={() => setActiveTab('all')}
                        className={`pb-2 ${activeTab === 'all' ? 'border-b-2 border-indigo-600' : ''}`}
                    >
                        <Text className={`font-bold text-sm ${activeTab === 'all' ? 'text-indigo-600' : 'text-slate-400'}`}>Todos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('birthdays')}
                        className={`pb-2 ${activeTab === 'birthdays' ? 'border-b-2 border-indigo-600' : ''}`}
                    >
                        <Text className={`font-bold text-sm ${activeTab === 'birthdays' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            Aniversariantes ({students.filter(s => {
                                if (!s.birth_date) return false;
                                const parts = s.birth_date.split('-');
                                return parseInt(parts[1], 10) - 1 === new Date().getMonth();
                            }).length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-white rounded-xl flex-row items-center px-4 py-3 border border-slate-100 mb-6 shadow-sm">
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        className="flex-1 ml-3 text-slate-700"
                        placeholder="Buscar aluno..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Content */}
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#4f46e5" />
                    </View>
                ) : (
                    <>
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-slate-900 font-bold text-lg">
                                {activeTab === 'birthdays' ? `Aniversariantes de ${getMonthName()}` : 'Seus Alunos'}
                            </Text>
                            <Text className="text-slate-500 text-sm">{filteredStudents.length} alunos</Text>
                        </View>

                        <FlatList
                            data={filteredStudents}
                            keyExtractor={item => item.id}
                            renderItem={renderStudentItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-20">
                                    <View className="bg-slate-100 p-6 rounded-full mb-4">
                                        {activeTab === 'birthdays' ? <Cake size={40} color="#cbd5e1" /> : <UserIcon size={40} color="#cbd5e1" />}
                                    </View>
                                    <Text className="text-slate-500 text-center">
                                        {activeTab === 'birthdays'
                                            ? `Nenhum aniversariante em ${getMonthName()}`
                                            : 'Nenhum aluno encontrado.'}
                                    </Text>
                                </View>
                            }
                        />
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
