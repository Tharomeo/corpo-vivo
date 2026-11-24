// Sorteio das partes da Caça ao órgão, sem repetir as das últimas partidas.
import { PARTES_CACA, type ParteCaca } from '../data/jogos';
import { camadaDoSistema, ORGAOS, SISTEMAS, type Nivel } from '../data/sistemas';
import { embaralhar } from '../utils/embaralhar';

export type Alvo3D = ParteCaca & { camada: 'pele' | 'musculos' | 'ossos'; emoji: string };

// Partes usadas recentemente (vale enquanto o app está aberto)
const recentes: Record<Nivel, string[]> = { iniciais: [], finais: [] };

export function sortearAlvos(nivel: Nivel, quantidade: number): Alvo3D[] {
  // Anos Iniciais: só as partes básicas. Anos Finais: todas (as difíceis têm mais chance).
  const lista = PARTES_CACA.filter((p) => ORGAOS[p.orgao] && (nivel === 'finais' || !p.finais));
  const ja = new Set(recentes[nivel]);
  const novas = embaralhar(lista.filter((p) => !ja.has(p.orgao)));
  const repetidas = embaralhar(lista.filter((p) => ja.has(p.orgao)));
  let escolhidas = [...novas, ...repetidas];
  if (nivel === 'finais') {
    // Garante metade ou mais de partes difíceis no desafio
    const dificeis = escolhidas.filter((p) => p.finais);
    const faceis = escolhidas.filter((p) => !p.finais);
    const nDificeis = Math.min(dificeis.length, Math.ceil(quantidade * 0.6));
    escolhidas = embaralhar([...dificeis.slice(0, nDificeis), ...faceis.slice(0, quantidade - nDificeis)]);
  }
  const rodada = escolhidas.slice(0, quantidade);

  // Lembra as últimas ~2 partidas para não repetir logo em seguida
  recentes[nivel] = [...rodada.map((p) => p.orgao), ...recentes[nivel]].slice(0, quantidade * 2);

  return rodada.map((p) => {
    const sistema = ORGAOS[p.orgao].sistema;
    return { ...p, camada: camadaDoSistema(sistema), emoji: SISTEMAS[sistema].emoji };
  });
}
