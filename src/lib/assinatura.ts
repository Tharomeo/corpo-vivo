// Assinaturas: quais etapas são pagas, preços mostrados e as chamadas às funções de pagamento
// (supabase/functions). Os preços cobrados de verdade ficam na Stripe; os daqui são só para exibir.
import { Linking, Platform } from 'react-native';
import type { Nivel } from '../data/sistemas';
import { supabase } from './supabase';

export type Produto = 'finais' | 'medio';
export type Periodo = 'mensal' | 'anual';

export const PRODUTOS: Record<Produto, { nome: string; descricao: string; mensal: number; anual: number; emoji: string; cor: string; corClara: string }> = {
  finais: {
    nome: 'Anos Finais',
    descricao: '6º ao 9º ano: corpo 3D completo, zoom na célula, sistemas endócrino e reprodutor, Me testar e jogos.',
    mensal: 15,
    anual: 150,
    emoji: '🧬',
    cor: '#FF8C42',
    corClara: '#FFE9DA',
  },
  medio: {
    nome: 'Ensino Médio',
    descricao: 'Todo o conteúdo do Ensino Médio, com os Anos Finais incluídos.',
    mensal: 35,
    anual: 350,
    emoji: '🎓',
    cor: '#9B5DE5',
    corClara: '#F0E6FF',
  },
};

// O Ensino Médio só pode ser comprado quando tiver conteúdo
export const VENDA_MEDIO_ATIVA = false;

export const reais = (v: number) => `R$ ${v.toFixed(2).replace('.', ',').replace(',00', '')}`;

// Produto que libera uma etapa (Anos Iniciais são grátis)
export function produtoDaEtapa(nivel: Nivel | 'medio'): Produto | null {
  return nivel === 'iniciais' ? null : nivel === 'finais' ? 'finais' : 'medio';
}

async function chamar(funcao: string, corpo: object): Promise<{ url?: string; erro?: string }> {
  if (!supabase) return { erro: 'O pagamento precisa do servidor ligado.' };
  const { data, error } = await supabase.functions.invoke(funcao, { body: corpo });
  if (error) {
    // A função responde { erro } mesmo quando o status não é 200
    try {
      const r = (await (error as { context?: Response }).context?.json()) as { erro?: string } | undefined;
      if (r?.erro) return { erro: r.erro };
    } catch {
      // segue para a mensagem padrão
    }
    return { erro: 'Não consegui falar com o servidor. Confira a internet.' };
  }
  return data as { url?: string; erro?: string };
}

async function abrir(url: string) {
  if (Platform.OS === 'web') window.location.href = url;
  else await Linking.openURL(url);
}

// Abre a página de pagamento da Stripe
export async function assinar(produto: Produto, periodo: Periodo): Promise<string | null> {
  const r = await chamar('criar-checkout', { produto, periodo });
  if (r.url) {
    await abrir(r.url);
    return null;
  }
  return r.erro ?? 'Não consegui abrir o pagamento.';
}

// Faturas, trocar cartão e cancelar a assinatura mensal
export async function gerenciarAssinatura(): Promise<string | null> {
  const r = await chamar('portal-cliente', {});
  if (r.url) {
    await abrir(r.url);
    return null;
  }
  return r.erro ?? 'Não consegui abrir a assinatura.';
}
