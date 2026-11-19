import type { Questao } from '../../data/questoes';
import type { SistemaId } from '../../data/sistemas';

export type Tema = SistemaId | 'tudo';

// Questão pronta para mostrar: opções já embaralhadas
export type QuestaoNaTela = { questao: Questao; opcoes: string[]; correta: number };

export type Resposta = { item: QuestaoNaTela; escolhida: number };
