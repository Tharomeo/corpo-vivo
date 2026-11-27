// Placar: guarda as partidas no celular e, com conta e servidor, envia para o ranking mundial.
// Tabelas e views em supabase/schema.sql.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Nivel } from '../data/sistemas';
import type { ModoId } from './pontos';
import { supabase } from './supabase';

export const rankingMundialAtivo = supabase !== null;

const K_PARTIDAS = 'corpovivo:partidas';

export type Partida = {
  jogo: ModoId;
  nivel: Nivel;
  pontos: number;
  acertos: number;
  erros: number;
  tempo_ms: number;
  quando: number;
};

export type LinhaRanking = { jogador_id: string; apelido: string; melhor: number; media: number; partidas: number };
export type ResultadoEnvio = { posicao: number | null; mediaMundial: number | null; online: boolean; pontos?: number };

// ---------- Partidas locais ----------

export async function lerPartidas(): Promise<Partida[]> {
  try {
    const bruto = await AsyncStorage.getItem(K_PARTIDAS);
    return bruto ? (JSON.parse(bruto) as Partida[]) : [];
  } catch {
    return [];
  }
}

// ---------- Servidor ----------

export async function buscarMedia(jogo: ModoId, nivel: Nivel): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('media_jogo').select('media').eq('jogo', jogo).eq('nivel', nivel).maybeSingle();
  return error || !data ? null : (data.media as number);
}

export async function buscarRanking(jogo: ModoId, nivel: Nivel): Promise<LinhaRanking[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('ranking')
    .select('jogador_id, apelido, melhor, media, partidas')
    .eq('jogo', jogo)
    .eq('nivel', nivel)
    .order('melhor', { ascending: false })
    .limit(20);
  return error ? null : (data as LinhaRanking[]);
}

// Salva no celular e, com conta, envia ao ranking mundial
export async function registrarPartida(p: Omit<Partida, 'quando'>, comConta: boolean): Promise<ResultadoEnvio> {
  const lista = await lerPartidas();
  lista.push({ ...p, quando: Date.now() });
  await AsyncStorage.setItem(K_PARTIDAS, JSON.stringify(lista.slice(-500)));

  if (!supabase || !comConta) return { posicao: null, mediaMundial: null, online: false };
  try {
    // O servidor confere a partida e calcula os pontos (supabase/migracoes/2026-11-25-validacao-e-privacidade.sql)
    const { data, error } = await supabase.rpc('registrar_jogada', {
      p_jogo: p.jogo,
      p_nivel: p.nivel,
      p_acertos: p.acertos,
      p_erros: p.erros,
      p_tempo_ms: Math.round(p.tempo_ms),
    });
    if (error || !data) return { posicao: null, mediaMundial: null, online: false };
    const r = data as { pontos: number; posicao: number | null; media: number | null };
    return { posicao: r.posicao, mediaMundial: r.media, online: true, pontos: r.pontos };
  } catch {
    return { posicao: null, mediaMundial: null, online: false };
  }
}

// Ranking feito só com as partidas deste celular (modo de teste ou sem internet)
export function rankingLocal(partidas: Partida[], jogo: ModoId, nivel: Nivel, id: string, apelido: string): LinhaRanking[] {
  const minhas = partidas.filter((p) => p.jogo === jogo && p.nivel === nivel);
  if (!minhas.length) return [];
  const melhor = Math.max(...minhas.map((p) => p.pontos));
  const media = Math.round(minhas.reduce((s, p) => s + p.pontos, 0) / minhas.length);
  return [{ jogador_id: id, apelido, melhor, media, partidas: minhas.length }];
}
