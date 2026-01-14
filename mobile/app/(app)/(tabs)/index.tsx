import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { TrendingUp, Users, ClipboardList, DollarSign, LogOut } from 'lucide-react-native';

export default function DashboardScreen() {
    const { user, signOut } = useAuth();

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <View className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm w-[48%] mb-4">
            <View className={`h-10 w-10 rounded-2xl items-center justify-center mb-3 ${color}`}>
                <Icon size={20} color="white" />
            </View>
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</Text>
            <Text className="text-xl font-bold text-slate-900">{value}</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1 px-6 pt-6">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-slate-500 text-sm">Bem-vindo,</Text>
                        <Text className="text-2xl font-bold text-slate-900">Treinador</Text>
                    </View>
                    <TouchableOpacity
                        onPress={signOut}
                        className="h-10 w-10 bg-white items-center justify-center rounded-full shadow-sm border border-slate-100"
                    >
                        <LogOut size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {/* Dashboard Indicators */}
                <Text className="text-slate-900 font-bold text-lg mb-4">Indicadores</Text>
                <View className="flex-row flex-wrap justify-between">
                    <StatCard
                        title="Alunos Ativos"
                        value="1"
                        icon={Users}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        title="Avaliações"
                        value="12"
                        icon={ClipboardList}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        title="Receita/Mês"
                        value="R$ 0,00"
                        icon={DollarSign}
                        color="bg-amber-500"
                    />
                    <StatCard
                        title="Evolução"
                        value="+15%"
                        icon={TrendingUp}
                        color="bg-rose-500"
                    />
                </View>

                {/* Future section placeholders */}
                <View className="mt-8 bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-200">
                    <Text className="text-white text-lg font-bold mb-2">Seus indicadores em tempo real</Text>
                    <Text className="text-indigo-100 text-sm">Visualize o crescimento da sua consultoria e o engajamento dos seus alunos em um só lugar.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
