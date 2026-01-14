import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'url-polyfill';

const supabaseUrl = 'https://nnchixvmuceumlmlqcus.supabase.co';
const supabaseAnonKey = 'sb_publishable_eNaqiEff3coa0ayTWOKYaA_Sd8-JgKA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
