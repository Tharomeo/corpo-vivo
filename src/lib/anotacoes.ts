// Caderno de anotações. Com servidor, cada anotação fica na conta (Supabase, com RLS:
// só a dona vê). No modo de teste, sem servidor, fica salva só neste celular.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ORGAOS, SISTEMAS, type Nivel, type SistemaId } from '../data/sistemas';
import { supabase } from './supabase';

export type Anotacao = {
  id: string;
  titulo: string;
  texto: string;
  tema: string | null; // id de um sistema ou de uma parte do corpo
  nivel: Nivel;
  criado_em: string;
  atualizado_em: string;
};

export type NovaAnotacao = Pick<Anotacao, 'titulo' | 'texto' | 'tema' | 'nivel'>;

export const LIMITE_TITULO = 80;
export const LIMITE_TEXTO = 5000;

const K_LOCAL = 'corpovivo:anotacoes';
const CAMPOS = 'id, titulo, texto, tema, nivel, criado_em, atualizado_em';

// Nome e emoji do tema (sistema ou parte)
export function infoTema(tema: string | null) {
  if (!tema) return null;
  const s = SISTEMAS[tema as SistemaId];
  if (s) return { nome: s.nome, emoji: s.emoji, cor: s.cor, corClara: s.corClara, orgao: null as string | null };
  const o = ORGAOS[tema];
  if (!o) return null;
  const sis = SISTEMAS[o.sistema];
  return { nome: o.nome, emoji: sis.emoji, cor: sis.cor, corClara: sis.corClara, orgao: tema };
}

// ---------- Modo de teste (no celular) ----------
async function lerLocal(): Promise<Anotacao[]> {
  const bruto = await AsyncStorage.getItem(K_LOCAL);
  return bruto ? (JSON.parse(bruto) as Anotacao[]) : [];
}
async function gravarLocal(lista: Anotacao[]) {
  await AsyncStorage.setItem(K_LOCAL, JSON.stringify(lista));
}

// ---------- API ----------
export async function listarAnotacoes(): Promise<Anotacao[]> {
  if (!supabase) return (await lerLocal()).sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em));
  const { data, error } = await supabase.from('anotacoes').select(CAMPOS).order('atualizado_em', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Anotacao[];
}

export async function buscarAnotacao(id: string): Promise<Anotacao | null> {
  if (!supabase) return (await lerLocal()).find((a) => a.id === id) ?? null;
  const { data, error } = await supabase.from('anotacoes').select(CAMPOS).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Anotacao | null) ?? null;
}

// A anotação mais recente sobre um tema (para o botão "Anotar" dos cartões abrir a mesma)
export async function anotacaoDoTema(tema: string): Promise<Anotacao | null> {
  if (!supabase) return (await listarAnotacoes()).find((a) => a.tema === tema) ?? null;
  const { data, error } = await supabase
    .from('anotacoes')
    .select(CAMPOS)
    .eq('tema', tema)
    .order('atualizado_em', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Anotacao | null) ?? null;
}

export async function criarAnotacao(n: NovaAnotacao): Promise<Anotacao> {
  const limpa = limpar(n);
  if (!supabase) {
    const agora = new Date().toISOString();
    const nova: Anotacao = { ...limpa, id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, criado_em: agora, atualizado_em: agora };
    await gravarLocal([nova, ...(await lerLocal())]);
    return nova;
  }
  const { data, error } = await supabase.from('anotacoes').insert(limpa).select(CAMPOS).single();
  if (error) throw new Error(error.message);
  return data as Anotacao;
}

export async function atualizarAnotacao(id: string, n: Pick<Anotacao, 'titulo' | 'texto'>): Promise<void> {
  const limpa = { titulo: n.titulo.slice(0, LIMITE_TITULO), texto: n.texto.slice(0, LIMITE_TEXTO) };
  if (!supabase) {
    const agora = new Date().toISOString();
    await gravarLocal((await lerLocal()).map((a) => (a.id === id ? { ...a, ...limpa, atualizado_em: agora } : a)));
    return;
  }
  const { error } = await supabase.from('anotacoes').update(limpa).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function apagarAnotacao(id: string): Promise<void> {
  if (!supabase) {
    await gravarLocal((await lerLocal()).filter((a) => a.id !== id));
    return;
  }
  const { error } = await supabase.from('anotacoes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function limpar(n: NovaAnotacao): NovaAnotacao {
  return { titulo: n.titulo.slice(0, LIMITE_TITULO), texto: n.texto.slice(0, LIMITE_TEXTO), tema: n.tema, nivel: n.nivel };
}

// "há 5 min", "ontem", "12/11"
export function quando(iso: string) {
  const d = new Date(iso);
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  if (h < 48) return 'ontem';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
