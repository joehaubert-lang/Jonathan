import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, FlatList, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { DollarSign, TrendingUp, TrendingDown, Plus, Receipt, ChevronRight, X, Calendar, Search, User, CreditCard, Wallet, Banknote, Trash2, Edit2 } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useFocusEffect } from 'expo-router';

interface FinancialRecord {
    id: string;
    created_at: string;
    student_id: string | null;
    type: 'income' | 'expense';
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue';
    payment_method: 'pix' | 'credit_card' | 'cash' | 'boleto' | null;
    description: string | null;
    student?: { name: string } | null;
}

export default function FinanceScreen() {
    const [activeView, setActiveView] = useState<'flow' | 'income' | 'expenses'>('flow');
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [totals, setTotals] = useState({ balance: 0, income: 0, expenses: 0 });
    const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [searchStudent, setSearchStudent] = useState('');

    // New Record Form State
    const [newType, setNewType] = useState<'income' | 'expense'>('income');
    const [newAmount, setNewAmount] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newStudent, setNewStudent] = useState<any>(null);
    const [isSelectingStudent, setIsSelectingStudent] = useState(false);
    const [newMethod, setNewMethod] = useState<'pix' | 'credit_card' | 'cash' | 'boleto'>('pix');

    useFocusEffect(
        useCallback(() => {
            fetchFinancialData();
            fetchStudents();
        }, [])
    );

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('financial_records')
                .select(`
                    *,
                    student:students(name)
                `)
                .order('due_date', { ascending: false });

            if (error) throw error;

            if (data) {
                const typedData = data as any[];
                setRecords(typedData);

                // Calculate Totals
                const income = typedData
                    .filter(r => r.type === 'income')
                    .reduce((sum, r) => sum + Number(r.amount), 0);
                const expenses = typedData
                    .filter(r => r.type === 'expense')
                    .reduce((sum, r) => sum + Number(r.amount), 0);

                setTotals({
                    income,
                    expenses,
                    balance: income - expenses
                });
            }
        } catch (error: any) {
            console.error('Error fetching financial records:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase.from('students').select('id, name, photo').order('name');
            if (error) throw error;
            if (data) setStudents(data);
        } catch (error: any) {
            console.error('Error fetching students:', error);
        }
    };

    const handleSaveRecord = async () => {
        if (!newAmount || parseFloat(newAmount) <= 0) {
            Alert.alert('Ops!', 'Insira um valor válido.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                type: newType,
                amount: parseFloat(newAmount),
                description: newDescription || (newType === 'income' ? 'Receita' : 'Despesa'),
                student_id: newType === 'income' ? newStudent?.id : null,
                payment_method: newMethod,
                due_date: editingRecord ? editingRecord.due_date : new Date().toISOString().split('T')[0],
                status: editingRecord ? editingRecord.status : 'paid'
            };

            if (editingRecord) {
                const { error } = await supabase
                    .from('financial_records')
                    .update(payload)
                    .eq('id', editingRecord.id);
                if (error) throw error;
                Alert.alert('Sucesso', 'Lançamento atualizado!');
            } else {
                const { error } = await supabase
                    .from('financial_records')
                    .insert(payload);
                if (error) throw error;
                Alert.alert('Sucesso', 'Lançamento registrado!');
            }

            setShowAddModal(false);
            resetForm();
            fetchFinancialData();
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecord = async (id: string) => {
        Alert.alert(
            'Excluir Lançamento',
            'Tem certeza que deseja excluir este registro financeiro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('financial_records')
                                .delete()
                                .eq('id', id);

                            if (error) throw error;
                            fetchFinancialData();
                        } catch (error: any) {
                            Alert.alert('Erro', error.message);
                        }
                    }
                }
            ]
        );
    };

    const startEditing = (record: FinancialRecord) => {
        setEditingRecord(record);
        setNewType(record.type);
        setNewAmount(record.amount.toString());
        setNewDescription(record.description || '');
        setNewMethod(record.payment_method || 'pix');
        if (record.student_id) {
            setNewStudent({ id: record.student_id, name: record.student?.name });
        } else {
            setNewStudent(null);
        }
        setShowAddModal(true);
    };

    const resetForm = () => {
        setNewAmount('');
        setNewDescription('');
        setNewStudent(null);
        setNewType('income');
        setNewMethod('pix');
        setEditingRecord(null);
    };

    const formatCurrency = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const filteredRecords = records.filter(r => {
        if (activeView === 'expenses') return r.type === 'expense';
        if (activeView === 'income') return r.type === 'income';
        return true;
    });

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 px-6 pt-6">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-slate-900">Gestão Financeira</Text>
                    <TouchableOpacity
                        onPress={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="h-10 w-10 bg-indigo-600 items-center justify-center rounded-full shadow-lg"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <View className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200 mb-8">
                    <Text className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-1">Saldo Acumulado</Text>
                    <Text className="text-white text-3xl font-bold">{formatCurrency(totals.balance)}</Text>

                    <View className="flex-row mt-6 gap-4">
                        <View className="flex-1 bg-white/10 p-3 rounded-2xl">
                            <View className="flex-row items-center mb-1">
                                <TrendingUp size={14} color="#10b981" />
                                <Text className="text-emerald-300 text-[10px] font-bold ml-1">RECEITAS</Text>
                            </View>
                            <Text className="text-white font-bold">{formatCurrency(totals.income)}</Text>
                        </View>
                        <View className="flex-1 bg-white/10 p-3 rounded-2xl">
                            <View className="flex-row items-center mb-1">
                                <TrendingDown size={14} color="#fb7185" />
                                <Text className="text-rose-300 text-[10px] font-bold ml-1">DESPESAS</Text>
                            </View>
                            <Text className="text-white font-bold">{formatCurrency(totals.expenses)}</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View className="flex-row gap-6 mb-6 px-1">
                    <TouchableOpacity
                        onPress={() => setActiveView('flow')}
                        className={`pb-2 ${activeView === 'flow' ? 'border-b-2 border-indigo-600' : ''}`}
                    >
                        <Text className={`font-bold text-sm ${activeView === 'flow' ? 'text-indigo-600' : 'text-slate-400'}`}>Fluxo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveView('income')}
                        className={`pb-2 ${activeView === 'income' ? 'border-b-2 border-indigo-600' : ''}`}
                    >
                        <Text className={`font-bold text-sm ${activeView === 'income' ? 'text-indigo-600' : 'text-slate-400'}`}>Receitas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveView('expenses')}
                        className={`pb-2 ${activeView === 'expenses' ? 'border-b-2 border-indigo-600' : ''}`}
                    >
                        <Text className={`font-bold text-sm ${activeView === 'expenses' ? 'text-indigo-600' : 'text-slate-400'}`}>Despesas</Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    {loading ? (
                        <ActivityIndicator color="#4f46e5" size="large" className="mt-10" />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((item) => (
                                    <View key={item.id} className="bg-white p-3 rounded-2xl mb-2 border border-slate-100 shadow-sm flex-row items-center">
                                        <View className={`h-10 w-10 rounded-xl items-center justify-center mr-3 ${item.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                            {item.type === 'income' ? (
                                                <TrendingUp size={20} color="#10b981" />
                                            ) : (
                                                <TrendingDown size={20} color="#ef4444" />
                                            )}
                                        </View>
                                        <View className="flex-1 mr-2">
                                            <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>{item.description}</Text>
                                            <Text className="text-slate-400 text-[10px]" numberOfLines={1}>
                                                {item.student?.name || (item.type === 'income' ? 'Geral' : 'Gasto Operacional')}
                                            </Text>
                                        </View>
                                        <View className="items-end mr-3">
                                            <Text className={`font-bold text-xs ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                                            </Text>
                                            <Text className="text-slate-400 text-[10px]">{new Date(item.due_date).toLocaleDateString('pt-BR').substring(0, 5)}</Text>
                                        </View>
                                        <View className="flex-row gap-2">
                                            <TouchableOpacity
                                                onPress={() => startEditing(item)}
                                                className="bg-slate-50 p-2 rounded-lg"
                                            >
                                                <Edit2 size={14} color="#64748b" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteRecord(item.id)}
                                                className="bg-rose-50 p-2 rounded-lg"
                                            >
                                                <Trash2 size={14} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className="items-center justify-center py-20">
                                    <View className="bg-slate-100 p-6 rounded-full mb-4">
                                        <Receipt size={40} color="#cbd5e1" />
                                    </View>
                                    <Text className="text-slate-500 font-medium text-center">Nenhum lançamento encontrado.</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowAddModal(true)}
                                        className="mt-4 bg-white border border-slate-200 px-6 py-2 rounded-xl"
                                    >
                                        <Text className="text-indigo-600 font-bold text-xs">Novo Lançamento</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </KeyboardAvoidingView>
            </View>

            {/* Add Transaction Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent={true}>
                <View className="flex-1 bg-black/50 justify-end">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="bg-white h-[92%] rounded-t-[40px] p-6 shadow-2xl"
                    >
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-2xl font-bold text-slate-900">
                                {isSelectingStudent ? 'Selecionar Aluno' : (editingRecord ? 'Editar Lançamento' : 'Novo Lançamento')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => isSelectingStudent ? setIsSelectingStudent(false) : setShowAddModal(false)}
                                className="bg-slate-100 p-2 rounded-full"
                            >
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {isSelectingStudent ? (
                            <View className="flex-1">
                                <View className="bg-slate-100 flex-row items-center px-4 py-3 rounded-2xl mb-4">
                                    <Search size={18} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-2 text-slate-700"
                                        placeholder="Buscar por nome..."
                                        value={searchStudent}
                                        onChangeText={setSearchStudent}
                                    />
                                </View>

                                <FlatList
                                    data={students.filter(s => s.name.toLowerCase().includes(searchStudent.toLowerCase()))}
                                    keyExtractor={item => item.id}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setNewStudent(item);
                                                setIsSelectingStudent(false);
                                            }}
                                            className="flex-row items-center py-4 border-b border-slate-50"
                                        >
                                            <View className="h-10 w-10 bg-slate-100 rounded-full items-center justify-center overflow-hidden mr-4">
                                                {item.photo ? (
                                                    <Image source={{ uri: item.photo }} className="w-full h-full" />
                                                ) : (
                                                    <User size={20} color="#94a3b8" />
                                                )}
                                            </View>
                                            <Text className="text-slate-900 font-bold">{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <View className="items-center justify-center py-10">
                                            <Text className="text-slate-400">Nenhum aluno encontrado</Text>
                                        </View>
                                    }
                                />
                            </View>
                        ) : (

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{ paddingBottom: 60 }}
                            >
                                {/* Type Selector */}
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Tipo de Transação</Text>
                                <View className="flex-row gap-4 mb-6">
                                    <TouchableOpacity
                                        onPress={() => setNewType('income')}
                                        className={`flex-1 py-4 rounded-2xl flex-row items-center justify-center border ${newType === 'income' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}
                                    >
                                        <TrendingUp size={18} color={newType === 'income' ? '#10b981' : '#94a3b8'} />
                                        <Text className={`ml-2 font-bold ${newType === 'income' ? 'text-emerald-700' : 'text-slate-500'}`}>Receita</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setNewType('expense')}
                                        className={`flex-1 py-4 rounded-2xl flex-row items-center justify-center border ${newType === 'expense' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}
                                    >
                                        <TrendingDown size={18} color={newType === 'expense' ? '#ef4444' : '#94a3b8'} />
                                        <Text className={`ml-2 font-bold ${newType === 'expense' ? 'text-rose-700' : 'text-slate-500'}`}>Despesa</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Amount Input */}
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Valor (R$)</Text>
                                <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row items-center mb-6">
                                    <DollarSign size={24} color="#64748b" />
                                    <TextInput
                                        className="flex-1 ml-4 text-2xl font-bold text-slate-900"
                                        placeholder="0,00"
                                        keyboardType="numeric"
                                        value={newAmount}
                                        onChangeText={setNewAmount}
                                    />
                                </View>

                                {/* Description */}
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Descrição / Título</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-slate-900 font-medium"
                                    placeholder={newType === 'income' ? "Mensalidade, consultoria..." : "Aluguel, equipamento..."}
                                    value={newDescription}
                                    onChangeText={setNewDescription}
                                />

                                {newType === 'income' && (
                                    <>
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Vincular a Aluno (Opcional)</Text>
                                        <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex-row items-center justify-between">
                                            <TouchableOpacity
                                                onPress={() => setIsSelectingStudent(true)}
                                                className="flex-1 flex-row items-center"
                                            >
                                                <User size={20} color="#64748b" />
                                                <Text className={`ml-3 font-medium ${newStudent ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {newStudent ? newStudent.name : 'Selecione um aluno...'}
                                                </Text>
                                            </TouchableOpacity>
                                            {newStudent && (
                                                <TouchableOpacity onPress={() => setNewStudent(null)} className="p-1">
                                                    <X size={16} color="#ef4444" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </>
                                )}

                                {/* Payment Method */}
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Forma de Pagamento</Text>
                                <View className="flex-row flex-wrap gap-2 mb-10">
                                    {[
                                        { id: 'pix', label: 'PIX', icon: Wallet },
                                        { id: 'credit_card', label: 'Cartão', icon: CreditCard },
                                        { id: 'cash', label: 'Dinheiro', icon: Banknote },
                                        { id: 'boleto', label: 'Boleto', icon: Receipt }
                                    ].map((meth) => (
                                        <TouchableOpacity
                                            key={meth.id}
                                            onPress={() => setNewMethod(meth.id as any)}
                                            className={`flex-row items-center bg-slate-50 px-4 py-3 rounded-xl border ${newMethod === meth.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}
                                        >
                                            <meth.icon size={16} color={newMethod === meth.id ? '#4f46e5' : '#94a3b8'} />
                                            <Text className={`ml-2 text-xs font-bold ${newMethod === meth.id ? 'text-indigo-600' : 'text-slate-500'}`}>{meth.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    onPress={handleSaveRecord}
                                    disabled={loading}
                                    className="bg-indigo-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100 mb-10"
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold text-lg">Confirmar Lançamento</Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </SafeAreaView >
    );
}
