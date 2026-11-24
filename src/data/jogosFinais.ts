// Conteúdo dos jogos dos Anos Finais: Ervilhas de Mendel, Sistemas em equipe e Prato equilibrado.
import type { SistemaId } from './sistemas';

// ---------- Ervilhas de Mendel (BNCC EF09CI09) ----------
// As quatro características que Mendel estudou nas ervilhas. A letra maiúscula é o fator dominante.

export type TracoId = 'cor' | 'forma' | 'flor' | 'altura';

export type Traco = {
  id: TracoId;
  titulo: string; // "cor da semente"
  letra: string; // letra maiúscula do fator dominante
  dominante: string; // "amarela"
  recessivo: string; // "verde"
};

export const TRACOS: Traco[] = [
  { id: 'cor', titulo: 'cor da semente', letra: 'V', dominante: 'amarela', recessivo: 'verde' },
  { id: 'forma', titulo: 'forma da semente', letra: 'R', dominante: 'lisa', recessivo: 'rugosa' },
  { id: 'flor', titulo: 'cor da flor', letra: 'P', dominante: 'roxa', recessivo: 'branca' },
  { id: 'altura', titulo: 'altura da planta', letra: 'A', dominante: 'alta', recessivo: 'baixa' },
];

// Genótipo como número de fatores dominantes: 2 = VV, 1 = Vv, 0 = vv
export type Genotipo = 0 | 1 | 2;

export function escreverGenotipo(t: Traco, g: Genotipo) {
  const M = t.letra;
  const m = t.letra.toLowerCase();
  return g === 2 ? M + M : g === 1 ? M + m : m + m;
}

export function fenotipo(t: Traco, g: Genotipo) {
  return g > 0 ? t.dominante : t.recessivo;
}

// Gametas (fatores que cada pai passa): VV → [V, V], Vv → [V, v], vv → [v, v]
export function gametas(g: Genotipo): (0 | 1)[] {
  return g === 2 ? [1, 1] : g === 1 ? [1, 0] : [0, 0];
}

// Quadro de Punnett: linhas = gametas do pai 2, colunas = gametas do pai 1
export function punnett(g1: Genotipo, g2: Genotipo): Genotipo[] {
  const a = gametas(g1);
  const b = gametas(g2);
  return b.flatMap((y) => a.map((x) => (x + y) as Genotipo));
}

// ---------- Sistemas em equipe ----------
// Cada situação tem uma dupla de sistemas: o jogador escolhe exatamente os dois.

export type Situacao = {
  emoji: string;
  texto: string;
  dupla: [SistemaId, SistemaId];
  explicacao: string;
};

export const SITUACOES: Situacao[] = [
  {
    emoji: '🙋',
    texto: 'Dobrar o braço',
    dupla: ['muscular', 'esqueletico'],
    explicacao: 'O bíceps se contrai e puxa os ossos do antebraço. Músculo sozinho não mexe nada: ele precisa do osso como alavanca.',
  },
  {
    emoji: '💨',
    texto: 'Levar o oxigênio do ar até as células',
    dupla: ['respiratorio', 'circulatorio'],
    explicacao: 'Nos pulmões, o oxigênio passa do ar para o sangue. O coração bombeia esse sangue para o corpo todo.',
  },
  {
    emoji: '🥪',
    texto: 'Levar os nutrientes da comida para o corpo',
    dupla: ['digestorio', 'circulatorio'],
    explicacao: 'O intestino absorve os nutrientes e eles entram no sangue, que leva tudo até as células.',
  },
  {
    emoji: '🚽',
    texto: 'Limpar o sangue e formar o xixi',
    dupla: ['urinario', 'circulatorio'],
    explicacao: 'O sangue passa pelos rins, que filtram o que sobra e formam a urina.',
  },
  {
    emoji: '🔥',
    texto: 'Sentir que a panela está quente',
    dupla: ['tegumentar', 'nervoso'],
    explicacao: 'A pele tem sensores de calor. Os nervos levam esse aviso até o cérebro, que entende: está quente!',
  },
  {
    emoji: '😮‍💨',
    texto: 'Puxar o ar para dentro dos pulmões',
    dupla: ['respiratorio', 'muscular'],
    explicacao: 'O diafragma é um músculo. Quando ele desce, os pulmões se enchem de ar.',
  },
  {
    emoji: '🩹',
    texto: 'Fechar um machucado no joelho',
    dupla: ['tegumentar', 'circulatorio'],
    explicacao: 'As plaquetas do sangue formam a casquinha e a pele cresce de novo por baixo dela.',
  },
  {
    emoji: '⚽',
    texto: 'Decidir chutar a bola',
    dupla: ['nervoso', 'muscular'],
    explicacao: 'O cérebro decide e manda a ordem pelos nervos. Os músculos da perna obedecem e fazem o chute.',
  },
  {
    emoji: '😋',
    texto: 'Empurrar a comida até o estômago',
    dupla: ['digestorio', 'muscular'],
    explicacao: 'O esôfago tem músculos que se contraem em ondas e empurram a comida para baixo.',
  },
  {
    emoji: '🎂',
    texto: 'Sentir o cheiro de um bolo',
    dupla: ['respiratorio', 'nervoso'],
    explicacao: 'O cheiro entra pelo nariz junto com o ar. Os nervos do olfato levam a informação até o cérebro.',
  },
];

// ---------- Prato equilibrado ----------
// Grupos como nos livros de Ciências, com a ideia do Guia Alimentar para a População Brasileira:
// comida de verdade no dia a dia e ultraprocessados só de vez em quando.

export type GrupoId = 'reguladores' | 'energeticos' | 'construtores';

export const GRUPOS: Record<GrupoId, { nome: string; singular: string; descricao: string; cor: string; corClara: string; vagas: number }> = {
  reguladores: { nome: 'Reguladores', singular: 'regulador', descricao: 'Verduras, legumes e frutas: vitaminas, minerais e fibras', cor: '#2BA84A', corClara: '#E3F7E8', vagas: 2 },
  energeticos: { nome: 'Energéticos', singular: 'energético', descricao: 'Cereais e tubérculos: carboidratos que dão energia', cor: '#E8A400', corClara: '#FFF4D1', vagas: 1 },
  construtores: { nome: 'Construtores', singular: 'construtor', descricao: 'Feijão, ovos, carnes e leite: proteínas que constroem o corpo', cor: '#E04B6A', corClara: '#FFE4EA', vagas: 1 },
};

export type Alimento = { nome: string; emoji: string; grupo: GrupoId | 'ultra' };

export const ALIMENTOS: Alimento[] = [
  { nome: 'Brócolis', emoji: '🥦', grupo: 'reguladores' },
  { nome: 'Cenoura', emoji: '🥕', grupo: 'reguladores' },
  { nome: 'Alface', emoji: '🥬', grupo: 'reguladores' },
  { nome: 'Tomate', emoji: '🍅', grupo: 'reguladores' },
  { nome: 'Pepino', emoji: '🥒', grupo: 'reguladores' },
  { nome: 'Banana', emoji: '🍌', grupo: 'reguladores' },
  { nome: 'Laranja', emoji: '🍊', grupo: 'reguladores' },
  { nome: 'Maçã', emoji: '🍎', grupo: 'reguladores' },
  { nome: 'Arroz', emoji: '🍚', grupo: 'energeticos' },
  { nome: 'Batata', emoji: '🥔', grupo: 'energeticos' },
  { nome: 'Pão', emoji: '🍞', grupo: 'energeticos' },
  { nome: 'Milho', emoji: '🌽', grupo: 'energeticos' },
  { nome: 'Batata-doce', emoji: '🍠', grupo: 'energeticos' },
  { nome: 'Macarrão', emoji: '🍝', grupo: 'energeticos' },
  { nome: 'Feijão', emoji: '🫘', grupo: 'construtores' },
  { nome: 'Ovo', emoji: '🥚', grupo: 'construtores' },
  { nome: 'Frango', emoji: '🍗', grupo: 'construtores' },
  { nome: 'Peixe', emoji: '🐟', grupo: 'construtores' },
  { nome: 'Carne', emoji: '🥩', grupo: 'construtores' },
  { nome: 'Queijo', emoji: '🧀', grupo: 'construtores' },
  { nome: 'Refrigerante', emoji: '🥤', grupo: 'ultra' },
  { nome: 'Salsicha', emoji: '🌭', grupo: 'ultra' },
  { nome: 'Biscoito recheado', emoji: '🍪', grupo: 'ultra' },
  { nome: 'Miojo', emoji: '🍜', grupo: 'ultra' },
  { nome: 'Pirulito', emoji: '🍭', grupo: 'ultra' },
];
