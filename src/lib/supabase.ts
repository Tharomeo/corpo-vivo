// Cliente do Supabase (login, perfil e ranking).
// Configuração no .env.local (veja .env.example). Sem ele, o app roda em "modo de teste".
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// Limpa espaços e aspas que às vezes vêm junto ao copiar
const limpar = (v?: string) => (v ?? '').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
const URL_SUPABASE = limpar(process.env.EXPO_PUBLIC_SUPABASE_URL);
const CHAVE = limpar(process.env.EXPO_PUBLIC_SUPABASE_KEY);

// Só liga o servidor se a URL for do tipo https://xxxx.supabase.co (ou http para testes locais)
const urlValida = /^https?:\/\/[^\s/]+\.[^\s/]+$/.test(URL_SUPABASE) && !URL_SUPABASE.includes('SEU-PROJETO');
export const servidorConfigurado = Boolean(urlValida && CHAVE && !CHAVE.startsWith('sua-chave'));
export const problemaConfiguracao =
  URL_SUPABASE && !urlValida
    ? `A URL do Supabase no .env.local está inválida: "${URL_SUPABASE}". Use o formato https://xxxx.supabase.co`
    : null;

export const supabase: SupabaseClient | null = servidorConfigurado
  ? createClient(URL_SUPABASE, CHAVE, {
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
