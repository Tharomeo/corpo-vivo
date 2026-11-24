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
// "principais": precisam ser escolhidos. "tambem": ajudam, então não contam como erro se escolhidos.

export type Situacao = {
  emoji: string;
  texto: string;
  principais: SistemaId[];
  tambem: SistemaId[];
  explicacao: string;
};

export const SITUACOES: Situacao[] = [
  {
    emoji: '🏃',
    texto: 'Correr para pegar o ônibus',
    principais: ['nervoso', 'muscular', 'esqueletico', 'respiratorio', 'circulatorio'],
    tambem: ['tegumentar'],
    explicacao: 'O cérebro manda a ordem, os músculos puxam os ossos, a respiração acelera e o coração bate mais rápido para levar oxigênio.',
  },
  {
    emoji: '🥪',
    texto: 'Comer um sanduíche e aproveitar os nutrientes',
    principais: ['digestorio', 'circulatorio'],
    tambem: ['nervoso', 'muscular', 'esqueletico'],
    explicacao: 'O digestório quebra o alimento em nutrientes, e o sangue leva esses nutrientes para todas as células.',
  },
  {
    emoji: '☀️',
    texto: 'Esfriar o corpo num dia muito quente',
    principais: ['tegumentar', 'circulatorio'],
    tambem: ['nervoso'],
    explicacao: 'A pele solta suor, que evapora e esfria o corpo. Os vasos da pele se alargam e soltam calor.',
  },
  {
    emoji: '🔥',
    texto: 'Tirar a mão rápido de uma panela quente',
    principais: ['tegumentar', 'nervoso', 'muscular'],
    tambem: ['esqueletico'],
    explicacao: 'A pele sente o calor, os nervos e a medula fazem um reflexo e os músculos puxam a mão antes mesmo de você pensar.',
  },
  {
    emoji: '🚽',
    texto: 'Limpar o sangue e fazer xixi',
    principais: ['urinario', 'circulatorio'],
    tambem: ['nervoso', 'muscular'],
    explicacao: 'O sangue passa pelos rins, que filtram o que sobra e formam a urina. A bexiga guarda a urina até a hora do xixi.',
  },
  {
    emoji: '💨',
    texto: 'Levar o oxigênio do ar até os músculos',
    principais: ['respiratorio', 'circulatorio'],
    tambem: ['muscular', 'nervoso', 'esqueletico'],
    explicacao: 'Nos alvéolos, o oxigênio passa do ar para o sangue. O coração bombeia esse sangue até os músculos.',
  },
  {
    emoji: '📝',
    texto: 'Pensar na resposta de uma prova',
    principais: ['nervoso'],
    tambem: ['circulatorio', 'respiratorio', 'muscular', 'esqueletico'],
    explicacao: 'Pensar, lembrar e decidir é trabalho do encéfalo, a central do sistema nervoso.',
  },
  {
    emoji: '🩹',
    texto: 'Ralar o joelho e o machucado sarar',
    principais: ['tegumentar', 'circulatorio'],
    tambem: ['nervoso'],
    explicacao: 'A pele é a barreira contra micróbios. As plaquetas do sangue fecham o corte e os glóbulos brancos combatem invasores.',
  },
  {
    emoji: '🧍',
    texto: 'Ficar em pé sem cair',
    principais: ['esqueletico', 'muscular'],
    tambem: ['nervoso'],
    explicacao: 'Os ossos sustentam o corpo e os músculos ficam levemente contraídos o tempo todo para manter a postura.',
  },
  {
    emoji: '📱',
    texto: 'Digitar uma mensagem no celular',
    principais: ['nervoso', 'muscular', 'esqueletico'],
    tambem: ['tegumentar', 'circulatorio'],
    explicacao: 'O cérebro comanda os músculos da mão, que movem os ossos dos dedos com muita precisão.',
  },
  {
    emoji: '🤧',
    texto: 'Espirrar para tirar poeira do nariz',
    principais: ['respiratorio', 'nervoso', 'muscular'],
    tambem: ['esqueletico'],
    explicacao: 'Os nervos sentem a poeira e mandam o diafragma e os músculos do peito soltarem o ar com força.',
  },
  {
    emoji: '🥤',
    texto: 'Beber água e repor o que perdeu no suor',
    principais: ['digestorio', 'circulatorio'],
    tambem: ['urinario', 'nervoso', 'tegumentar', 'muscular'],
    explicacao: 'A água é absorvida no intestino e vai para o sangue. Depois os rins controlam quanto dela fica no corpo.',
  },
  {
    emoji: '😋',
    texto: 'Mastigar e engolir a comida',
    principais: ['digestorio', 'muscular', 'esqueletico'],
    tambem: ['nervoso'],
    explicacao: 'Os dentes e a mandíbula trituram, os músculos mastigam e a língua empurra o alimento para o esôfago.',
  },
  {
    emoji: '🤿',
    texto: 'Encher bem o pulmão antes de mergulhar',
    principais: ['respiratorio', 'muscular'],
    tambem: ['nervoso', 'esqueletico', 'circulatorio'],
    explicacao: 'O diafragma desce e os músculos entre as costelas abrem o peito, e o ar entra nos pulmões.',
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
