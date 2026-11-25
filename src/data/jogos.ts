// Dados dos mini-jogos.
import type { Nivel } from './sistemas';

// ---------- Peças 2D (desenhadas em Orgao2D.tsx) ----------
export type Peca2D =
  | 'cerebro'
  | 'coracao'
  | 'pulmoes'
  | 'estomago'
  | 'figado'
  | 'intestinos'
  | 'intestino_delgado'
  | 'intestino_grosso'
  | 'rins'
  | 'bexiga'
  | 'boca'
  | 'nariz'
  | 'esofago'
  | 'traqueia'
  | 'bronquios'
  | 'sangue'
  | 'ossos'
  | 'pele'
  | 'musculo'
  | 'olho'
  | 'orelha'
  | 'lingua';

export const NOME_PECA: Record<Peca2D, string> = {
  cerebro: 'Cérebro',
  coracao: 'Coração',
  pulmoes: 'Pulmões',
  estomago: 'Estômago',
  figado: 'Fígado',
  intestinos: 'Intestinos',
  intestino_delgado: 'Intestino delgado',
  intestino_grosso: 'Intestino grosso',
  rins: 'Rins',
  bexiga: 'Bexiga',
  boca: 'Boca',
  nariz: 'Nariz',
  esofago: 'Esôfago',
  traqueia: 'Traqueia',
  bronquios: 'Brônquios',
  sangue: 'Sangue',
  ossos: 'Ossos',
  pele: 'Pele',
  musculo: 'Músculos',
  olho: 'Olhos',
  orelha: 'Orelhas',
  lingua: 'Língua',
};

// ---------- Monte o corpo ----------
// Coordenadas num corpo de 100 x 130 unidades (ver Silhueta em monte.tsx)
export type Encaixe = { peca: Peca2D; x: number; y: number; w: number; h: number; dica: string; fato: string };

export const ENCAIXES: Record<string, Encaixe> = {
  cerebro: { peca: 'cerebro', x: 50, y: 11, w: 15, h: 11, dica: 'Ele fica dentro da cabeça!', fato: 'O cérebro pensa e comanda o corpo todo.' },
  pulmoes: { peca: 'pulmoes', x: 50, y: 39, w: 26, h: 18, dica: 'Ficam no peito, protegidos pelas costelas.', fato: 'Os pulmões pegam o oxigênio do ar.' },
  coracao: { peca: 'coracao', x: 56, y: 46, w: 11, h: 11, dica: 'Fica no peito, entre os pulmões, um pouco para a esquerda da pessoa.', fato: 'O coração bombeia o sangue sem parar.' },
  figado: { peca: 'figado', x: 41, y: 55, w: 16, h: 9, dica: 'Fica na barriga, logo abaixo dos pulmões, do lado direito da pessoa.', fato: 'O fígado ajuda a digerir as gorduras.' },
  estomago: { peca: 'estomago', x: 59, y: 56, w: 13, h: 10, dica: 'Fica na parte de cima da barriga, do lado esquerdo da pessoa.', fato: 'O estômago mistura a comida com um suco ácido.' },
  rins: { peca: 'rins', x: 50, y: 63.5, w: 19, h: 7, dica: 'São dois, um de cada lado, no meio da barriga.', fato: 'Os rins limpam o sangue e fazem o xixi.' },
  intestinos: { peca: 'intestinos', x: 50, y: 71, w: 20, h: 12, dica: 'Ficam na parte de baixo da barriga, todos enroladinhos.', fato: 'Os intestinos tiram os nutrientes da comida.' },
  bexiga: { peca: 'bexiga', x: 50, y: 80, w: 9, h: 7, dica: 'Fica bem embaixo da barriga.', fato: 'A bexiga guarda o xixi.' },
};

export const FASES_MONTE: { titulo: string; pecas: string[]; mostrarContorno: boolean }[] = [
  { titulo: 'Fase 1: os principais', pecas: ['cerebro', 'pulmoes', 'coracao', 'estomago'], mostrarContorno: true },
  { titulo: 'Fase 2: corpo completo', pecas: ['cerebro', 'pulmoes', 'coracao', 'figado', 'estomago', 'rins', 'intestinos', 'bexiga'], mostrarContorno: true },
  { titulo: 'Fase 3: sem pistas!', pecas: ['cerebro', 'pulmoes', 'coracao', 'figado', 'estomago', 'rins', 'intestinos', 'bexiga'], mostrarContorno: false },
];

// ---------- Jogo da memória ----------
export const PARES_MEMORIA: { peca: Peca2D; funcao: string }[] = [
  { peca: 'cerebro', funcao: 'Pensa e comanda o corpo' },
  { peca: 'coracao', funcao: 'Bombeia o sangue' },
  { peca: 'pulmoes', funcao: 'Pegam o oxigênio do ar' },
  { peca: 'estomago', funcao: 'Mistura a comida com suco ácido' },
  { peca: 'intestinos', funcao: 'Tiram os nutrientes da comida' },
  { peca: 'rins', funcao: 'Limpam o sangue e fazem o xixi' },
  { peca: 'ossos', funcao: 'Seguram o corpo de pé' },
  { peca: 'pele', funcao: 'Protege e sente o toque' },
  { peca: 'musculo', funcao: 'Puxam os ossos para mexer' },
  { peca: 'bexiga', funcao: 'Guarda o xixi' },
  { peca: 'olho', funcao: 'Enxerga as cores e as formas' },
  { peca: 'orelha', funcao: 'Ouve os sons e ajuda no equilíbrio' },
  { peca: 'nariz', funcao: 'Sente os cheiros' },
  { peca: 'lingua', funcao: 'Sente os sabores' },
];

// ---------- Viagens (tocar na ordem certa) ----------
export type Viagem = {
  id: string;
  titulo: string;
  viajante: string; // emoji que faz o caminho
  cor: string;
  corClara: string;
  caminho: { peca: Peca2D; fala: string }[];
  distracoes: Peca2D[];
  final: string;
};

export const VIAGENS: Viagem[] = [
  {
    id: 'comida',
    titulo: 'A viagem da maçã',
    viajante: '🍎',
    cor: '#E8820C',
    corClara: '#FFF1DE',
    caminho: [
      { peca: 'boca', fala: 'Os dentes trituram e a saliva amolece.' },
      { peca: 'esofago', fala: 'Desce pelo tubo até o estômago.' },
      { peca: 'estomago', fala: 'Misturada com um suco bem ácido!' },
      { peca: 'intestino_delgado', fala: 'Os nutrientes passam para o sangue.' },
      { peca: 'intestino_grosso', fala: 'A água é aproveitada.' },
    ],
    distracoes: ['pulmoes', 'coracao', 'traqueia'],
    final: 'O que sobrou vira cocô! 💩',
  },
  {
    id: 'ar',
    titulo: 'A viagem do ar',
    viajante: '💨',
    cor: '#1E9FCB',
    corClara: '#E3F7FF',
    caminho: [
      { peca: 'nariz', fala: 'O nariz limpa e esquenta o ar.' },
      { peca: 'traqueia', fala: 'Desce pelo tubo do pescoço.' },
      { peca: 'bronquios', fala: 'Se divide: um caminho para cada pulmão.' },
      { peca: 'pulmoes', fala: 'Chegou nos pulmões!' },
      { peca: 'sangue', fala: 'O oxigênio passa para o sangue.' },
    ],
    distracoes: ['esofago', 'estomago', 'bexiga'],
    final: 'O sangue leva o oxigênio para o corpo todo! ❤️',
  },
  {
    id: 'agua',
    titulo: 'A viagem da água',
    viajante: '💧',
    cor: '#C99400',
    corClara: '#FFF8D9',
    caminho: [
      { peca: 'boca', fala: 'Um gole de água!' },
      { peca: 'estomago', fala: 'Passa pelo estômago.' },
      { peca: 'intestinos', fala: 'Os intestinos absorvem a água.' },
      { peca: 'sangue', fala: 'A água vai para o sangue.' },
      { peca: 'rins', fala: 'Os rins filtram o sangue.' },
      { peca: 'bexiga', fala: 'O que sobra vai para a bexiga.' },
    ],
    distracoes: ['pulmoes', 'cerebro'],
    final: 'Hora de fazer xixi! 🚽',
  },
];

// ---------- Caça ao órgão (no boneco 3D) ----------
// Lista com todas as partes que dá para tocar no boneco. A cada partida o jogo sorteia
// algumas, evitando repetir as das últimas partidas. "finais: true" = só nos Anos Finais.
// A camada (pele, músculos, ossos e órgãos) vem do sistema da parte.

export type ParteCaca = { orgao: string; nome: string; finais?: boolean };

export const PARTES_CACA: ParteCaca[] = [
  // Pele
  { orgao: 'unhas', nome: 'as unhas' },
  // Músculos
  { orgao: 'peitoral', nome: 'o peitoral' },
  { orgao: 'abdominais', nome: 'os abdominais' },
  { orgao: 'deltoide', nome: 'o deltoide' },
  { orgao: 'biceps', nome: 'o bíceps' },
  { orgao: 'quadriceps', nome: 'o quadríceps' },
  { orgao: 'gluteo', nome: 'o glúteo' },
  { orgao: 'panturrilha', nome: 'a panturrilha' },
  { orgao: 'antebraco', nome: 'os músculos do antebraço', finais: true },
  { orgao: 'musculos_rosto', nome: 'os músculos do rosto', finais: true },
  { orgao: 'tendoes', nome: 'o tendão de Aquiles', finais: true },
  // Ossos
  { orgao: 'mandibula', nome: 'a mandíbula' },
  { orgao: 'coluna', nome: 'a coluna vertebral' },
  { orgao: 'costelas', nome: 'as costelas' },
  { orgao: 'clavicula', nome: 'a clavícula' },
  { orgao: 'pelve', nome: 'a pelve (bacia)' },
  { orgao: 'femur', nome: 'o fêmur, osso da coxa' },
  { orgao: 'patela', nome: 'a patela, osso do joelho' },
  { orgao: 'maos', nome: 'os ossos da mão' },
  { orgao: 'pes', nome: 'os ossos do pé' },
  { orgao: 'esterno', nome: 'o esterno', finais: true },
  { orgao: 'umero', nome: 'o úmero', finais: true },
  { orgao: 'radio_ulna', nome: 'o rádio e a ulna', finais: true },
  { orgao: 'tibia_fibula', nome: 'a tíbia e a fíbula', finais: true },
  { orgao: 'cartilagens', nome: 'os discos de cartilagem da coluna', finais: true },
  // Nervoso
  { orgao: 'encefalo', nome: 'o cérebro' },
  { orgao: 'cerebelo', nome: 'o cerebelo', finais: true },
  { orgao: 'tronco_encefalico', nome: 'o tronco encefálico', finais: true },
  { orgao: 'medula', nome: 'a medula espinal', finais: true },
  { orgao: 'nervos', nome: 'os nervos', finais: true },
  // Circulatório
  { orgao: 'coracao', nome: 'o coração' },
  { orgao: 'aorta', nome: 'a aorta', finais: true },
  { orgao: 'arterias', nome: 'as artérias (vermelhas)', finais: true },
  { orgao: 'veias', nome: 'as veias (azuis)', finais: true },
  // Respiratório
  { orgao: 'pulmoes', nome: 'os pulmões' },
  { orgao: 'traqueia', nome: 'a traqueia' },
  { orgao: 'fossas_nasais', nome: 'as fossas nasais', finais: true },
  { orgao: 'faringe', nome: 'a faringe', finais: true },
  { orgao: 'laringe', nome: 'a laringe', finais: true },
  { orgao: 'bronquios', nome: 'os brônquios', finais: true },
  { orgao: 'diafragma', nome: 'o diafragma', finais: true },
  // Digestório
  { orgao: 'boca', nome: 'a boca' },
  { orgao: 'esofago', nome: 'o esôfago' },
  { orgao: 'estomago', nome: 'o estômago' },
  { orgao: 'figado', nome: 'o fígado' },
  { orgao: 'intestino_delgado', nome: 'o intestino delgado' },
  { orgao: 'intestino_grosso', nome: 'o intestino grosso' },
  { orgao: 'pancreas', nome: 'o pâncreas', finais: true },
  { orgao: 'vesicula', nome: 'a vesícula biliar', finais: true },
  // Urinário
  { orgao: 'rins', nome: 'os rins' },
  { orgao: 'bexiga', nome: 'a bexiga' },
  { orgao: 'ureteres', nome: 'os ureteres', finais: true },
  { orgao: 'uretra', nome: 'a uretra', finais: true },
  // Sentidos
  { orgao: 'olhos', nome: 'os olhos' },
  { orgao: 'orelhas', nome: 'as orelhas' },
  { orgao: 'lingua', nome: 'a língua' },
  { orgao: 'olfato', nome: 'o local do olfato, no alto do nariz', finais: true },
  // Endócrino
  { orgao: 'hipofise', nome: 'a hipófise', finais: true },
  { orgao: 'tireoide', nome: 'a tireoide', finais: true },
  { orgao: 'suprarrenais', nome: 'as glândulas suprarrenais', finais: true },
  // Reprodutor
  { orgao: 'utero', nome: 'o útero', finais: true },
  { orgao: 'ovarios', nome: 'os ovários', finais: true },
  { orgao: 'testiculos', nome: 'os testículos', finais: true },
];

// ---------- Lista de jogos por etapa ----------
export type InfoJogo = { rota: string; titulo: string; descricao: string; emoji: string; cor: string; corClara: string; emBreve?: boolean };

export const JOGOS: Record<Nivel, InfoJogo[]> = {
  iniciais: [
    { rota: '/jogo-monte', titulo: 'Monte o corpo', descricao: 'Arraste cada órgão para o lugar certo', emoji: '🧩', cor: '#FF5D8F', corClara: '#FFE4EC' },
    { rota: '/jogo-caca', titulo: 'Caça ao órgão', descricao: 'Encontre as partes no boneco 3D', emoji: '🔍', cor: '#7B5CFA', corClara: '#ECE6FF' },
    { rota: '/jogo-viagem', titulo: 'Viagens pelo corpo', descricao: 'Leve a maçã, o ar e a água pelo caminho certo', emoji: '🍎', cor: '#E8820C', corClara: '#FFF1DE' },
    { rota: '/jogo-memoria', titulo: 'Jogo da memória', descricao: 'Ache o par de cada órgão com o que ele faz', emoji: '🃏', cor: '#2EC4B6', corClara: '#DDF6F3' },
  ],
  finais: [
    { rota: '/jogo-caca', titulo: 'Caça ao órgão: desafio', descricao: 'Partes difíceis de achar no boneco 3D', emoji: '🔍', cor: '#7B5CFA', corClara: '#ECE6FF' },
    { rota: '/jogo-mendel', titulo: 'Ervilhas de Mendel', descricao: 'Cruze ervilhas e descubra a genética', emoji: '🫛', cor: '#1E9C90', corClara: '#DDF6F3' },
    { rota: '/jogo-sistemas', titulo: 'Sistemas em equipe', descricao: 'Descubra a dupla de sistemas de cada tarefa', emoji: '🤝', cor: '#E8820C', corClara: '#FFF1DE' },
    { rota: '/jogo-prato', titulo: 'Prato equilibrado', descricao: 'Monte refeições com comida de verdade', emoji: '🍽️', cor: '#2BA84A', corClara: '#E3F7E8' },
  ],
};
