// ================================================
// Supabase Client — Frontend (React Native / Expo)
// ================================================
// This client uses the ANON key and respects RLS.
// Session persistence is handled via AsyncStorage.
// ================================================

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,       // Persist sessions across app restarts
    autoRefreshToken: true,      // Automatically refresh expired tokens
    persistSession: true,        // Keep users logged in
    detectSessionInUrl: false,   // Not needed in React Native
  },
});
