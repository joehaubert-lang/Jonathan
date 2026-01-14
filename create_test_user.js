
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnchixvmuceumlmlqcus.supabase.co';
const supabaseKey = 'sb_publishable_eNaqiEff3coa0ayTWOKYaA_Sd8-JgKA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
    const email = 'mobile_test@fitflow.com';
    const password = 'fitflow_mobile';

    console.log(`Processing user: ${email}...`);

    // 1. Try Sign In First
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInData.user) {
        console.log("Signed in. User ID:", signInData.user.id);
        await addToTrainers(signInData.user.id, email);
        return;
    }

    // 2. If Sign In fails, Try Sign Up
    console.log("Sign in failed, trying sign up...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Error creating auth user:', authError.message);
        return;
    }

    if (authData.user) {
        console.log('Auth user created. ID:', authData.user.id);
        await addToTrainers(authData.user.id, email);
    }
}

async function addToTrainers(userId, email) {
    // 2. Insert into public.trainers
    // We need to check if it exists first?
    // Assuming RLS allows insert for authenticated user matching ID, or public insert if policy is open.
    // If not, this might fail, but worth a try.

    const { error: insertError } = await supabase.from('trainers').upsert({
        id: userId,
        name: 'Mobile Test Trainer',
        email: email
    });

    if (insertError) {
        console.error('Error inserting into trainers:', insertError);
    } else {
        console.log('Success! User linked to Trainers table.');
        console.log('------------------------------------------------');
        console.log('Credential for testing:');
        console.log('Email: mobile_test@fitflow.com');
        console.log('Password: fitflow_mobile');
        console.log('------------------------------------------------');
    }
}

createTestUser();
