import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../../../context/AuthContext';

export default function StudentDashboard() {
    const { signOut } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center justify-center p-8">
                <Text className="text-2xl font-bold text-slate-900 mb-4">Área do Aluno</Text>
                <Text className="text-slate-500 text-center mb-8">
                    Seus treinos aparecerão aqui.
                </Text>

                <TouchableOpacity
                    onPress={signOut}
                    className="bg-red-500 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Sair</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
