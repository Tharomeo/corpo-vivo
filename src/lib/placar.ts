// Placar: guarda as partidas no celular e, se o servidor estiver configurado,
// envia para o ranking mundial no Supabase.
//
// Configuração (arquivo .env.local na raiz do projeto, que não vai para o GitHub):
//   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   EXPO_PUBLIC_SUPABASE_KEY=chave publishable (ou anon) do projeto
// A tabela e as views estão em supabase/ranking.sql.
//
// Usa a API REST do Supabase direto com fetch, sem biblioteca extra.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Nivel } from '../data/sistemas';
import type { ModoId } from './pontos';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const CHAVE = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';
export const rankingMundialAtivo = Boolean(URL && CHAVE);

const K_JOGADOR = 'corpovivo:jogador';
const K_PARTIDAS = 'corpovivo:partidas';

export type Jogador = { id: string; apelido: string };

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

// ---------- Jogador (id aleatório do aparelho + apelido) ----------

function novoId() {
  // UUID v4 simples, suficiente para identificar o aparelho no ranking
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function lerJogador(): Promise<Jogador | null> {
  try {
    const bruto = await AsyncStorage.getItem(K_JOGADOR);
    return bruto ? (JSON.parse(bruto) as Jogador) : null;
  } catch {
    return null;
  }
}

export async function salvarApelido(apelido: string): Promise<Jogador> {
  const atual = await lerJogador();
  const jogador = { id: atual?.id ?? novoId(), apelido };
  await AsyncStorage.setItem(K_JOGADOR, JSON.stringify(jogador));
  return jogador;
}

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

function cabecalhos(extra?: Record<string, string>) {
  return { apikey: CHAVE, Authorization: `Bearer ${CHAVE}`, 'Content-Type': 'application/json', ...extra };
}

async function contarMelhores(jogo: ModoId, nivel: Nivel, pontos: number): Promise<number | null> {
  const r = await fetch(`${URL}/rest/v1/ranking?select=jogador_id&jogo=eq.${jogo}&nivel=eq.${nivel}&melhor=gt.${pontos}`, {
    method: 'HEAD',
    headers: cabecalhos({ Prefer: 'count=exact' }),
  });
  const faixa = r.headers.get('content-range'); // ex.: "*/12"
  const total = faixa ? Number(faixa.split('/')[1]) : NaN;
  return Number.isFinite(total) ? total : null;
}

export type ResultadoEnvio = { posicao: number | null; mediaMundial: number | null; online: boolean };

// Salva no celular e tenta enviar ao ranking mundial
export async function registrarPartida(p: Omit<Partida, 'quando'>): Promise<ResultadoEnvio> {
  const partida: Partida = { ...p, quando: Date.now() };
  const lista = await lerPartidas();
  lista.push(partida);
  await AsyncStorage.setItem(K_PARTIDAS, JSON.stringify(lista.slice(-500)));

  const jogador = await lerJogador();
  if (!rankingMundialAtivo || !jogador) return { posicao: null, mediaMundial: null, online: false };

  try {
    const envio = await fetch(`${URL}/rest/v1/jogadas`, {
      method: 'POST',
      headers: cabecalhos({ Prefer: 'return=minimal' }),
      body: JSON.stringify({
        jogo: p.jogo,
        nivel: p.nivel,
        jogador_id: jogador.id,
        apelido: jogador.apelido,
        pontos: p.pontos,
        acertos: p.acertos,
        erros: p.erros,
        tempo_ms: p.tempo_ms,
      }),
    });
    if (!envio.ok) return { posicao: null, mediaMundial: null, online: false };
    const [acima, media] = await Promise.all([contarMelhores(p.jogo, p.nivel, p.pontos), buscarMedia(p.jogo, p.nivel)]);
    return { posicao: acima === null ? null : acima + 1, mediaMundial: media, online: true };
  } catch {
    return { posicao: null, mediaMundial: null, online: false };
  }
}

export async function buscarRanking(jogo: ModoId, nivel: Nivel): Promise<LinhaRanking[] | null> {
  if (!rankingMundialAtivo) return null;
  try {
    const r = await fetch(`${URL}/rest/v1/ranking?select=jogador_id,apelido,melhor,media,partidas&jogo=eq.${jogo}&nivel=eq.${nivel}&order=melhor.desc&limit=20`, {
      headers: cabecalhos(),
    });
    if (!r.ok) return null;
    return (await r.json()) as LinhaRanking[];
  } catch {
    return null;
  }
}

export async function buscarMedia(jogo: ModoId, nivel: Nivel): Promise<number | null> {
  if (!rankingMundialAtivo) return null;
  try {
    const r = await fetch(`${URL}/rest/v1/media_jogo?select=media&jogo=eq.${jogo}&nivel=eq.${nivel}`, { headers: cabecalhos() });
    if (!r.ok) return null;
    const linhas = (await r.json()) as { media: number }[];
    return linhas[0]?.media ?? null;
  } catch {
    return null;
  }
}

// Ranking feito só com as partidas deste celular (quando não há servidor)
export function rankingLocal(partidas: Partida[], jogo: ModoId, nivel: Nivel, jogador: Jogador | null): LinhaRanking[] {
  const minhas = partidas.filter((p) => p.jogo === jogo && p.nivel === nivel);
  if (!minhas.length) return [];
  const melhor = Math.max(...minhas.map((p) => p.pontos));
  const media = Math.round(minhas.reduce((s, p) => s + p.pontos, 0) / minhas.length);
  return [{ jogador_id: jogador?.id ?? 'local', apelido: jogador?.apelido ?? 'Você', melhor, media, partidas: minhas.length }];
}
