// Pontuação dos jogos: acertos valem pontos, agilidade dá bônus e erros descontam.
//
//   pontos = acertos × 100 + bônus de agilidade − erros × 40   (nunca abaixo de 0)
//   bônus de agilidade = 10 pontos por segundo que sobrar do "tempo ideal"
//
// O tempo ideal é calculado por jogo (segundos por acerto), então terminar rápido
// rende mais, mas quem demora não perde pontos por isso: só deixa de ganhar o bônus.

export const PONTOS_ACERTO = 100;
export const DESCONTO_ERRO = 40;
export const BONUS_POR_SEGUNDO = 10;

export type Resultado = {
  acertos: number;
  erros: number;
  tempoMs: number;
  tempoIdealSeg: number;
};

export type Detalhe = { acertos: number; agilidade: number; erros: number; total: number; segundos: number };

export function calcularPontos(r: Resultado): Detalhe {
  const segundos = Math.round(r.tempoMs / 1000);
  const acertos = r.acertos * PONTOS_ACERTO;
  const agilidade = Math.max(0, Math.round((r.tempoIdealSeg - r.tempoMs / 1000) * BONUS_POR_SEGUNDO));
  const erros = r.erros * DESCONTO_ERRO;
  return { acertos, agilidade, erros, total: Math.max(0, acertos + agilidade - erros), segundos };
}

// Pontos parciais para o contador durante o jogo (sem o bônus, que só vem no fim)
export function pontosParciais(acertos: number, erros: number) {
  return Math.max(0, acertos * PONTOS_ACERTO - erros * DESCONTO_ERRO);
}

// Modos que têm ranking próprio (pontuações de modos diferentes não se comparam)
export type ModoId = 'monte-1' | 'monte-2' | 'monte-3' | 'caca' | 'viagem-comida' | 'viagem-ar' | 'viagem-agua' | 'memoria' | 'mendel' | 'sistemas' | 'prato';

export const MODOS: { id: ModoId; nome: string; emoji: string; niveis: ('iniciais' | 'finais')[] }[] = [
  { id: 'monte-1', nome: 'Monte o corpo · Fase 1', emoji: '🧩', niveis: ['iniciais'] },
  { id: 'monte-2', nome: 'Monte o corpo · Fase 2', emoji: '🧩', niveis: ['iniciais'] },
  { id: 'monte-3', nome: 'Monte o corpo · Fase 3', emoji: '🧩', niveis: ['iniciais'] },
  { id: 'caca', nome: 'Caça ao órgão', emoji: '🔍', niveis: ['iniciais', 'finais'] },
  { id: 'viagem-comida', nome: 'Viagem da maçã', emoji: '🍎', niveis: ['iniciais'] },
  { id: 'viagem-ar', nome: 'Viagem do ar', emoji: '💨', niveis: ['iniciais'] },
  { id: 'viagem-agua', nome: 'Viagem da água', emoji: '💧', niveis: ['iniciais'] },
  { id: 'memoria', nome: 'Jogo da memória', emoji: '🃏', niveis: ['iniciais'] },
  { id: 'mendel', nome: 'Ervilhas de Mendel', emoji: '🫛', niveis: ['finais'] },
  { id: 'sistemas', nome: 'Sistemas em equipe', emoji: '🤝', niveis: ['finais'] },
  { id: 'prato', nome: 'Prato equilibrado', emoji: '🍽️', niveis: ['finais'] },
];
