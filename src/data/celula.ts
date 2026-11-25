// Zoom na célula (Anos Finais): organelas e o tipo de célula de cada sistema.
import type { SistemaId } from './sistemas';

export type OrganelaId = 'membrana' | 'nucleo' | 'mitocondria' | 'ribossomo' | 'reticulo' | 'golgi' | 'lisossomo' | 'centriolo' | 'hemoglobina';

export type Organela = { nome: string; cor: string; funcao: string; comparacao: string };

export const ORGANELAS: Record<OrganelaId, Organela> = {
  membrana: {
    nome: 'Membrana plasmática',
    cor: '#7FC8F8',
    funcao: 'Envolve a célula e controla o que entra e o que sai. Deixa passar nutrientes e oxigênio e põe para fora os resíduos.',
    comparacao: 'É como o portão de uma fábrica, com seguranças escolhendo quem entra.',
  },
  nucleo: {
    nome: 'Núcleo',
    cor: '#8B4FD9',
    funcao: 'Guarda o DNA, organizado nos cromossomos, com as instruções para a célula funcionar e se dividir. É separado do citoplasma pela carioteca.',
    comparacao: 'É a sala de comando, onde ficam os projetos da fábrica.',
  },
  mitocondria: {
    nome: 'Mitocôndrias',
    cor: '#FF8C42',
    funcao: 'Fazem a respiração celular: usam oxigênio para liberar a energia da glicose. Produzem gás carbônico, que sai pelos pulmões.',
    comparacao: 'São as usinas de energia da fábrica.',
  },
  ribossomo: {
    nome: 'Ribossomos',
    cor: '#3A3F75',
    funcao: 'Produzem as proteínas, seguindo as instruções que vêm do núcleo. Ficam soltos no citoplasma ou presos ao retículo.',
    comparacao: 'São as máquinas de montar peças.',
  },
  reticulo: {
    nome: 'Retículo endoplasmático',
    cor: '#4CC9F0',
    funcao: 'Rede de canais e bolsas em volta do núcleo. Transporta substâncias dentro da célula; a parte com ribossomos ajuda a fazer proteínas.',
    comparacao: 'São os corredores e as esteiras da fábrica.',
  },
  golgi: {
    nome: 'Complexo golgiense',
    cor: '#FFC93C',
    funcao: 'Recebe as proteínas, termina de prepará-las e as embala em bolsinhas (vesículas) para usar na célula ou mandar para fora, como os hormônios e as enzimas.',
    comparacao: 'É o setor de embalagem e entrega.',
  },
  lisossomo: {
    nome: 'Lisossomos',
    cor: '#2EC4B6',
    funcao: 'Bolsinhas com enzimas que digerem partículas e partes velhas da própria célula.',
    comparacao: 'É a equipe de limpeza e reciclagem.',
  },
  centriolo: {
    nome: 'Centríolos',
    cor: '#E04B6A',
    funcao: 'Ajudam a organizar a divisão da célula, separando os cromossomos para as duas células-filhas.',
    comparacao: 'São os organizadores da mudança quando a fábrica se divide em duas.',
  },
  hemoglobina: {
    nome: 'Hemoglobina',
    cor: '#E63950',
    funcao: 'Proteína vermelha que enche a hemácia. Prende o oxigênio nos pulmões e o solta nos tecidos. Precisa de ferro para ser formada.',
    comparacao: 'São os assentos do ônibus, onde o oxigênio viaja.',
  },
};

// Forma da célula na cena 3D
export type FormaCelula = 'redonda' | 'alongada' | 'neuronio' | 'estrelada' | 'achatada' | 'colunar' | 'disco';

export type TipoCelula = {
  nome: string;
  forma: FormaCelula;
  especial: string; // o que essa célula tem de diferente
  organelas: OrganelaId[]; // organelas que aparecem (a hemácia madura não tem núcleo)
};

const TODAS: OrganelaId[] = ['membrana', 'nucleo', 'mitocondria', 'ribossomo', 'reticulo', 'golgi', 'lisossomo', 'centriolo'];

export const CELULAS: Record<SistemaId, TipoCelula> = {
  tegumentar: {
    nome: 'Queratinócito',
    forma: 'achatada',
    especial: 'É a célula principal da epiderme. Produz queratina, uma proteína resistente que protege a pele. Na camada mais externa, os queratinócitos já estão mortos e achatados e vão descamando. Os melanócitos, vizinhos dele, produzem a melanina que dá cor à pele.',
    organelas: TODAS,
  },
  muscular: {
    nome: 'Fibra muscular',
    forma: 'alongada',
    especial: 'É uma célula longa, com vários núcleos e muitas mitocôndrias, porque gasta muita energia para se contrair. Por dentro tem filamentos de proteína que deslizam uns sobre os outros e encurtam a fibra.',
    organelas: TODAS,
  },
  esqueletico: {
    nome: 'Osteócito',
    forma: 'estrelada',
    especial: 'Fica preso dentro do osso, numa pequena cavidade. Seus prolongamentos se comunicam com os vizinhos por canalículos. Ajuda a manter a matriz do osso, rica em cálcio e fósforo.',
    organelas: TODAS,
  },
  nervoso: {
    nome: 'Neurônio',
    forma: 'neuronio',
    especial: 'Recebe estímulos pelos dendritos, e o impulso nervoso segue pelo axônio até as terminações, onde passa para a próxima célula na sinapse. Na maior parte dos casos, os neurônios adultos não se dividem.',
    organelas: TODAS,
  },
  circulatorio: {
    nome: 'Hemácia',
    forma: 'disco',
    especial: 'Tem formato de disco com o centro mais fino, o que aumenta a área para trocar gases. A hemácia madura não tem núcleo nem mitocôndrias: sobra mais espaço para a hemoglobina. Vive cerca de 120 dias.',
    organelas: ['membrana', 'hemoglobina'],
  },
  respiratorio: {
    nome: 'Célula do alvéolo',
    forma: 'achatada',
    especial: 'É muito fina e fica encostada nos capilares. Assim, o oxigênio passa do ar para o sangue e o gás carbônico faz o caminho contrário com facilidade: é a hematose.',
    organelas: TODAS,
  },
  digestorio: {
    nome: 'Enterócito',
    forma: 'colunar',
    especial: 'Reveste o intestino delgado. Tem formato de coluna e, no topo, prolongamentos chamados microvilosidades, que aumentam muito a superfície para absorver os nutrientes.',
    organelas: TODAS,
  },
  urinario: {
    nome: 'Célula do néfron',
    forma: 'colunar',
    especial: 'Forra os túbulos do néfron e reabsorve água, glicose e sais do filtrado de volta para o sangue. Tem muitas mitocôndrias, porque esse transporte gasta energia.',
    organelas: TODAS,
  },
  sensorial: {
    nome: 'Cone e bastonete',
    forma: 'colunar',
    especial: 'São as células da retina que percebem a luz. Têm pigmentos que mudam quando recebem luz e geram o impulso nervoso. Os cones percebem as cores; os bastonetes funcionam com pouca luz.',
    organelas: TODAS,
  },
  endocrino: {
    nome: 'Célula das ilhotas do pâncreas',
    forma: 'redonda',
    especial: 'Algumas dessas células produzem insulina. Por isso têm muito retículo e complexo golgiense: fabricam o hormônio, embalam em vesículas e o liberam no sangue quando a glicose sobe.',
    organelas: TODAS,
  },
  reprodutor: {
    nome: 'Óvulo',
    forma: 'redonda',
    especial: 'É uma das maiores células do corpo e tem reserva de nutrientes para as primeiras divisões do embrião. Como todo gameta, tem 23 cromossomos. O espermatozoide, ao contrário, é pequeno, quase só núcleo, mitocôndrias e um flagelo para nadar.',
    organelas: TODAS,
  },
};
