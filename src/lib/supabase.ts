// Cliente do Supabase (login, perfil e ranking).
// Configuração no .env.local (veja .env.example). Sem ele, o app roda em "modo de teste".
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const CHAVE = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

export const servidorConfigurado = Boolean(URL && CHAVE);

export const supabase: SupabaseClient | null = servidorConfigurado
  ? createClient(URL, CHAVE, {
      auth: {
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// No celular, só renova o login enquanto o app está aberto
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => {
    if (estado === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
