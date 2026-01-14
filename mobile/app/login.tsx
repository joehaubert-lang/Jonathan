import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const role = params.role as string || 'user';
    const { user, role: userRole, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            if (userRole === 'trainer') {
                router.replace('/(app)/trainer');
            } else if (userRole === 'student') {
                router.replace('/(app)/student');
            } else if (userRole) {
                // Fallback if role doesn't match expected params or specific logic needed
                Alert.alert("Acesso Negado", "Seu perfil não tem permissão para esta área.");
                supabase.auth.signOut();
            }
        }
    }, [user, userRole, authLoading]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const getRoleTitle = () => {
        switch (role) {
            case 'trainer': return 'Área do Treinador';
            case 'student': return 'Área do Aluno';
            case 'doctor': return 'Acesso Médico';
            case 'psychologist': return 'Acesso Psicólogo';
            default: return 'Login';
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Erro no Login', error.message);
            setLoading(false);
        } else {
            // Navigation handled by Layout/AuthContext, but we can force clear loading just in case
            // The auth listener in Context will upgrade the session and trigger re-render
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-8 pt-4">

                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-10 w-10 bg-slate-50 items-center justify-center rounded-xl mb-8"
                >
                    <ArrowLeft size={24} color="#64748b" />
                </TouchableOpacity>

                <View className="mb-10">
                    <Text className="text-3xl font-bold text-slate-900 mb-2">{getRoleTitle()}</Text>
                    <Text className="text-slate-500">Entre com suas credenciais para continuar.</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-slate-600 font-bold mb-2">E-mail</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 focus:border-indigo-500"
                            placeholder="seu@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    <View>
                        <Text className="text-slate-600 font-bold mb-2">Senha</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 focus:border-indigo-500"
                            placeholder="******"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-indigo-600 py-4 rounded-xl mt-8 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform flex-row justify-center"
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-center text-lg">Entrar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
