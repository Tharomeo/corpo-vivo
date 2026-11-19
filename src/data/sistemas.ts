// Conteúdo do Fundamental (gratuito, aberto).
// "iniciais" = 1º ao 5º ano: linguagem simples.
// "finais"   = 6º ao 9º ano: mais detalhe, temas de saúde citados no texto.

export type Nivel = 'iniciais' | 'finais';

export type SistemaId =
  | 'tegumentar'
  | 'muscular'
  | 'esqueletico'
  | 'nervoso'
  | 'circulatorio'
  | 'respiratorio'
  | 'digestorio'
  | 'urinario';

export type Sistema = {
  nome: string;
  emoji: string;
  cor: string;
  corClara: string;
  iniciais: string;
  finais: string;
  saibaMais: string[]; // aparece só nos anos finais
  celula: string; // célula que será mostrada no zoom (anos finais, próxima etapa)
};

export const SISTEMAS: Record<SistemaId, Sistema> = {
  tegumentar: {
    nome: 'Pele',
    emoji: '🖐️',
    cor: '#E8946A',
    corClara: '#FFF0E6',
    iniciais:
      'A pele é o maior órgão do corpo! Ela cobre e protege tudo por dentro, ajuda a controlar a temperatura com o suor e é por ela que sentimos o toque, o calor e o frio.',
    finais:
      'O sistema tegumentar é formado pela pele e por anexos como pelos, unhas e glândulas. A pele tem duas camadas principais: a epiderme, mais externa, que se renova o tempo todo, e a derme, onde ficam vasos sanguíneos, terminações nervosas e glândulas de suor.',
    saibaMais: [
      'A melanina é o pigmento que dá cor à pele e ajuda a proteger contra a radiação do sol.',
      'O suor evapora e leva calor embora: é assim que o corpo se resfria.',
      'A pele é a primeira barreira contra microrganismos. Um corte é uma porta de entrada, por isso limpar ferimentos é importante.',
    ],
    celula: 'Queratinócito e melanócito',
  },
  muscular: {
    nome: 'Músculos',
    emoji: '💪',
    cor: '#E04B6A',
    corClara: '#FFE8EE',
    iniciais:
      'Temos mais de 600 músculos! Eles se contraem e puxam os ossos, e é assim que conseguimos andar, pular, sorrir e até piscar.',
    finais:
      'O sistema muscular trabalha junto com o esquelético e o nervoso para produzir movimento. Existem três tipos de músculo: o esquelético, que movemos quando queremos; o liso, que fica em órgãos como estômago e intestino e trabalha sozinho; e o cardíaco, que forma o coração.',
    saibaMais: [
      'Músculos só puxam, nunca empurram. Por isso trabalham em pares: o bíceps dobra o braço e o tríceps estica.',
      'Os tendões prendem os músculos aos ossos.',
      'Atividade física fortalece os músculos, inclusive o coração.',
    ],
    celula: 'Fibra muscular',
  },
  esqueletico: {
    nome: 'Esqueleto',
    emoji: '🦴',
    cor: '#C9A86A',
    corClara: '#FFF7E3',
    iniciais:
      'O esqueleto é a estrutura que sustenta o corpo e protege órgãos importantes, como o cérebro e o coração. Um adulto tem 206 ossos!',
    finais:
      'Os ossos sustentam o corpo, protegem órgãos e servem de apoio para os músculos. Dentro de alguns ossos fica a medula óssea vermelha, que produz as células do sangue. Os ossos também guardam cálcio. As articulações, como joelho e cotovelo, são os pontos onde os ossos se encontram e permitem o movimento.',
    saibaMais: [
      'O bebê nasce com cerca de 300 ossos. Muitos se juntam durante o crescimento até chegar a 206.',
      'O fêmur, na coxa, é o maior osso do corpo. O menor fica dentro da orelha.',
      'Cálcio, vitamina D e exercícios ajudam a manter os ossos fortes.',
    ],
    celula: 'Osteócito',
  },
  nervoso: {
    nome: 'Sistema nervoso',
    emoji: '🧠',
    cor: '#8B4FD9',
    corClara: '#F1E8FF',
    iniciais:
      'O sistema nervoso é o centro de comando do corpo. O cérebro pensa, lembra e sente, e manda mensagens por nervos para o corpo todo, mais rápido que um piscar de olhos.',
    finais:
      'O sistema nervoso central é formado pelo encéfalo e pela medula espinal. O sistema nervoso periférico são os nervos, que levam informações do corpo para o centro e trazem as respostas de volta. A unidade básica é o neurônio, uma célula especializada em transmitir impulsos elétricos.',
    saibaMais: [
      'Os reflexos, como tirar a mão de algo quente, passam pela medula antes mesmo de o cérebro perceber.',
      'Álcool e outras drogas alteram a comunicação entre neurônios e afetam atenção, memória e coordenação.',
      'Na puberdade, o encéfalo comanda a liberação de hormônios que provocam as mudanças no corpo.',
    ],
    celula: 'Neurônio',
  },
  circulatorio: {
    nome: 'Sistema circulatório',
    emoji: '❤️',
    cor: '#E63950',
    corClara: '#FFE6EA',
    iniciais:
      'O coração é uma bomba que empurra o sangue pelo corpo todo através de tubinhos chamados vasos sanguíneos. O sangue leva oxigênio e alimento para cada pedacinho do corpo.',
    finais:
      'O coração tem quatro cavidades e bombeia o sangue por artérias, que saem do coração, e veias, que voltam para ele. O sangue é formado por plasma, hemácias (que carregam oxigênio), leucócitos (que defendem o corpo) e plaquetas (que ajudam na coagulação).',
    saibaMais: [
      'Em repouso, o coração bate de 60 a 100 vezes por minuto.',
      'As vacinas ensinam os leucócitos a reconhecer um microrganismo antes de a doença aparecer.',
      'Pressão arterial e frequência cardíaca são indicadores de saúde usados em consultas.',
    ],
    celula: 'Hemácia',
  },
  respiratorio: {
    nome: 'Sistema respiratório',
    emoji: '🫁',
    cor: '#1FA9D6',
    corClara: '#E3F7FF',
    iniciais:
      'Quando respiramos, o ar entra pelo nariz, desce pela traqueia e chega aos pulmões. Lá o corpo pega o oxigênio e devolve o gás carbônico quando soltamos o ar.',
    finais:
      'O ar passa por fossas nasais, faringe, laringe, traqueia e brônquios até os alvéolos, pequenos sacos dentro dos pulmões. Nos alvéolos acontece a troca gasosa: o oxigênio passa para o sangue e o gás carbônico sai. O diafragma, um músculo abaixo dos pulmões, ajuda a puxar e empurrar o ar.',
    saibaMais: [
      'Os pulmões têm milhões de alvéolos. Abertos, ocupariam uma área enorme, parecida com uma quadra.',
      'O cigarro danifica os alvéolos e diminui a capacidade de respirar.',
      'Doenças respiratórias se espalham por gotículas, por isso cobrir a boca ao tossir protege outras pessoas.',
    ],
    celula: 'Célula do alvéolo',
  },
  digestorio: {
    nome: 'Sistema digestório',
    emoji: '🍎',
    cor: '#F28C0F',
    corClara: '#FFF1DE',
    iniciais:
      'O sistema digestório transforma a comida em pedacinhos bem pequenos que o corpo consegue usar. A viagem começa na boca, passa pelo esôfago, estômago e intestinos.',
    finais:
      'A digestão é mecânica (mastigar, misturar) e química (enzimas quebram os alimentos). No estômago, o suco gástrico começa a digerir proteínas. No intestino delgado os nutrientes são absorvidos e vão para o sangue. O intestino grosso absorve água e forma as fezes. Fígado e pâncreas produzem substâncias que ajudam na digestão.',
    saibaMais: [
      'Uma alimentação equilibrada tem carboidratos, proteínas, gorduras boas, vitaminas, sais minerais e fibras.',
      'O excesso de ultraprocessados está ligado a obesidade e outros problemas de saúde.',
      'Lavar as mãos e os alimentos evita verminoses e outras doenças.',
    ],
    celula: 'Célula do intestino (enterócito)',
  },
  urinario: {
    nome: 'Sistema urinário',
    emoji: '💧',
    cor: '#E0A800',
    corClara: '#FFF8D9',
    iniciais:
      'Os rins são filtros que limpam o sangue e tiram o que o corpo não precisa. Isso vira xixi, que fica guardado na bexiga até a hora de ir ao banheiro.',
    finais:
      'Os rins filtram o sangue continuamente, retiram resíduos e o excesso de água e sais, formando a urina. Ela desce pelos ureteres até a bexiga e sai pela uretra. Assim o sistema urinário mantém o equilíbrio de água e sais no corpo.',
    saibaMais: [
      'Cada rim tem cerca de um milhão de pequenos filtros chamados néfrons.',
      'Beber água ajuda os rins a trabalhar e previne cálculos (pedras) nos rins.',
      'A cor da urina dá uma pista de hidratação: mais clara costuma indicar boa hidratação.',
    ],
    celula: 'Célula do néfron',
  },
};

export type Orgao = { nome: string; sistema: SistemaId; fato: string };

export const ORGAOS: Record<string, Orgao> = {
  // Pele
  pele: { nome: 'Pele', sistema: 'tegumentar', fato: 'Cobre o corpo inteiro e se renova o tempo todo.' },
  // Músculos
  musculos_rosto: { nome: 'Músculos do rosto', sistema: 'muscular', fato: 'Fazem as expressões, como sorrir e franzir a testa.' },
  musculos_tronco: { nome: 'Músculos do tronco', sistema: 'muscular', fato: 'Ajudam a manter a postura e a respirar.' },
  peitoral: { nome: 'Peitoral', sistema: 'muscular', fato: 'Leva os braços para a frente, como num abraço.' },
  abdominais: { nome: 'Abdominais', sistema: 'muscular', fato: 'Protegem os órgãos da barriga e firmam o tronco.' },
  deltoide: { nome: 'Deltoide', sistema: 'muscular', fato: 'Arredonda o ombro e levanta o braço.' },
  biceps: { nome: 'Bíceps', sistema: 'muscular', fato: 'Dobra o cotovelo. Faz dupla com o tríceps, que estica.' },
  antebraco: { nome: 'Músculos do antebraço', sistema: 'muscular', fato: 'Movem o punho e os dedos.' },
  quadriceps: { nome: 'Quadríceps', sistema: 'muscular', fato: 'Estica o joelho: usado para chutar e subir escadas.' },
  gluteo: { nome: 'Glúteo', sistema: 'muscular', fato: 'Um dos maiores músculos do corpo, ajuda a ficar de pé.' },
  panturrilha: { nome: 'Panturrilha', sistema: 'muscular', fato: 'Levanta o calcanhar para andar, correr e pular.' },
  // Ossos
  cranio: { nome: 'Crânio', sistema: 'esqueletico', fato: 'Uma caixa de ossos que protege o encéfalo.' },
  mandibula: { nome: 'Mandíbula', sistema: 'esqueletico', fato: 'Único osso da cabeça que se mexe: mastiga e ajuda a falar.' },
  coluna: { nome: 'Coluna vertebral', sistema: 'esqueletico', fato: 'Pilha de 33 vértebras que sustenta o corpo e protege a medula.' },
  costelas: { nome: 'Costelas', sistema: 'esqueletico', fato: 'São 12 pares que formam uma gaiola em volta do coração e dos pulmões.' },
  esterno: { nome: 'Esterno', sistema: 'esqueletico', fato: 'Osso achatado no meio do peito onde as costelas se prendem.' },
  clavicula: { nome: 'Clavícula', sistema: 'esqueletico', fato: 'Liga o braço ao tronco, na altura do ombro.' },
  umero: { nome: 'Úmero', sistema: 'esqueletico', fato: 'Osso do braço, entre o ombro e o cotovelo.' },
  radio_ulna: { nome: 'Rádio e ulna', sistema: 'esqueletico', fato: 'Os dois ossos do antebraço. Juntos deixam a mão girar.' },
  maos: { nome: 'Ossos da mão', sistema: 'esqueletico', fato: 'Cada mão tem 27 ossos.' },
  pelve: { nome: 'Pelve', sistema: 'esqueletico', fato: 'A bacia: liga a coluna às pernas e apoia os órgãos da barriga.' },
  femur: { nome: 'Fêmur', sistema: 'esqueletico', fato: 'O maior e mais forte osso do corpo.' },
  patela: { nome: 'Patela', sistema: 'esqueletico', fato: 'Pequeno osso na frente do joelho.' },
  tibia_fibula: { nome: 'Tíbia e fíbula', sistema: 'esqueletico', fato: 'Ossos da perna, entre o joelho e o tornozelo.' },
  pes: { nome: 'Ossos do pé', sistema: 'esqueletico', fato: 'Cada pé tem 26 ossos.' },
  // Nervoso
  encefalo: { nome: 'Encéfalo', sistema: 'nervoso', fato: 'Pensa, lembra, sente emoções e comanda o corpo.' },
  cerebelo: { nome: 'Cerebelo', sistema: 'nervoso', fato: 'Cuida do equilíbrio e da coordenação dos movimentos.' },
  medula: { nome: 'Medula espinal', sistema: 'nervoso', fato: 'Protegida pela coluna, leva mensagens entre o encéfalo e o corpo.' },
  nervos: { nome: 'Nervos', sistema: 'nervoso', fato: 'Cabos que levam e trazem mensagens entre o corpo e o encéfalo.' },
  // Respiratório
  traqueia: { nome: 'Traqueia', sistema: 'respiratorio', fato: 'Tubo com anéis de cartilagem que leva o ar até os pulmões.' },
  pulmoes: { nome: 'Pulmões', sistema: 'respiratorio', fato: 'Cheios de alvéolos, onde o oxigênio passa para o sangue.' },
  // Circulatório
  coracao: { nome: 'Coração', sistema: 'circulatorio', fato: 'Mais ou menos do tamanho de uma mão fechada, bate sem parar a vida toda.' },
  aorta: { nome: 'Aorta', sistema: 'circulatorio', fato: 'A maior artéria do corpo: leva o sangue rico em oxigênio para todo lado.' },
  arterias: { nome: 'Artérias', sistema: 'circulatorio', fato: 'Levam o sangue do coração para os órgãos e músculos.' },
  // Digestório
  esofago: { nome: 'Esôfago', sistema: 'digestorio', fato: 'Tubo que empurra o alimento da boca até o estômago.' },
  estomago: { nome: 'Estômago', sistema: 'digestorio', fato: 'Mistura o alimento com o suco gástrico, que é bem ácido.' },
  figado: { nome: 'Fígado', sistema: 'digestorio', fato: 'Maior órgão interno: produz a bile, que ajuda a digerir gorduras.' },
  intestino_delgado: { nome: 'Intestino delgado', sistema: 'digestorio', fato: 'Mede cerca de 6 metros e absorve a maior parte dos nutrientes.' },
  intestino_grosso: { nome: 'Intestino grosso', sistema: 'digestorio', fato: 'Absorve água e forma as fezes.' },
  // Urinário
  rins: { nome: 'Rins', sistema: 'urinario', fato: 'Filtram o sangue o tempo todo e produzem a urina.' },
  bexiga: { nome: 'Bexiga', sistema: 'urinario', fato: 'Guarda a urina até a hora de ir ao banheiro.' },
};
