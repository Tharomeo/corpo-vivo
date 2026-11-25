// Conteúdo do Fundamental (gratuito, aberto).
// "iniciais" = 1º ao 5º ano: linguagem simples.
// "finais"   = 6º ao 9º ano: mais detalhe, nível de vestibulinho e SAEB.
// As questões do Me testar (questoes.ts) são respondíveis com o que está aqui.

export type Nivel = 'iniciais' | 'finais';

export type SistemaId =
  | 'tegumentar'
  | 'muscular'
  | 'esqueletico'
  | 'nervoso'
  | 'circulatorio'
  | 'respiratorio'
  | 'digestorio'
  | 'urinario'
  | 'sensorial'
  | 'endocrino'
  | 'reprodutor';

export type Conteudo = {
  resumo: string;
  comoFunciona: string[]; // passos, em ordem
  saibaMais: string[];
  saude: string[]; // "Cuide bem"
};

export type Sistema = {
  nome: string;
  emoji: string;
  cor: string;
  corClara: string;
  partes: string[];
  celula: string; // célula do zoom
  niveis?: Nivel[]; // etapas em que o sistema aparece (padrão: todas)
  iniciais: Conteudo;
  finais: Conteudo;
};

// Endócrino e reprodutor só aparecem nos Anos Finais; o mesmo texto vale para os dois campos.
const ENDOCRINO: Conteudo = {
      resumo:
        'O sistema endócrino é formado por glândulas que produzem hormônios, mensageiros químicos lançados no sangue. Eles chegam ao corpo todo, mas só agem nas células que têm receptores para eles. Regulam o crescimento, o uso de energia, o açúcar no sangue e as mudanças da puberdade.',
      comoFunciona: [
        'O hipotálamo, no encéfalo, percebe as necessidades do corpo e comanda a hipófise.',
        'A hipófise produz hormônios que estimulam outras glândulas, como a tireoide, as suprarrenais e as gônadas (ovários e testículos).',
        'Cada hormônio viaja pelo sangue até as células-alvo, que respondem: crescer, gastar mais energia, guardar glicose...',
        'Muitos hormônios são controlados por retroalimentação: quando já há hormônio suficiente no sangue, a produção diminui.',
      ],
      saibaMais: [
        'A insulina, produzida pelo pâncreas, faz as células absorverem glicose e baixa o açúcar no sangue. No diabetes, falta insulina ou ela não age direito.',
        'A adrenalina, das suprarrenais, prepara o corpo para emergências: acelera o coração e a respiração e aumenta a glicose no sangue.',
        'Na puberdade, a hipófise estimula ovários e testículos. Eles passam a produzir estrogênio e progesterona ou testosterona, responsáveis pelas características sexuais secundárias.',
        'O sistema nervoso age rápido e por pouco tempo. O endócrino é mais lento, mas seus efeitos duram mais.',
      ],
      saude: [
        'Hormônios só devem ser usados com receita médica. Anabolizantes sem indicação podem prejudicar o coração, o fígado e as gônadas.',
        'Alimentação equilibrada e atividade física ajudam a prevenir o diabetes tipo 2.',
        'No Brasil, o sal de cozinha recebe iodo por lei, para evitar o bócio, o aumento da tireoide.',
      ],
    };

const REPRODUTOR: Conteudo = {
      resumo:
        'O sistema reprodutor permite a reprodução: produz os gametas (óvulos e espermatozoides) e, no sistema feminino, abriga o desenvolvimento do bebê. Ele amadurece na puberdade, sob o comando dos hormônios.',
      comoFunciona: [
        'Na puberdade, hormônios da hipófise estimulam os ovários e os testículos a produzir gametas e hormônios sexuais.',
        'Sistema feminino: em geral, a cada ciclo de cerca de 28 dias, um ovário libera um óvulo (ovulação), que segue pela tuba uterina. Enquanto isso, o útero prepara sua parede interna, o endométrio.',
        'Se não há fecundação, o endométrio descama e sai pela vagina: é a menstruação, e um novo ciclo começa.',
        'Sistema masculino: os testículos produzem espermatozoides o tempo todo. Eles passam pelos ductos deferentes e se misturam às secreções da próstata e das glândulas seminais, formando o sêmen, que sai pela uretra.',
        'A fecundação é o encontro do óvulo com o espermatozoide, em geral na tuba uterina. O zigoto formado se fixa no útero e se desenvolve.',
      ],
      saibaMais: [
        'O óvulo é uma das maiores células do corpo humano. O espermatozoide é uma das menores e se move com o flagelo.',
        'Cada gameta tem 23 cromossomos, metade do normal. Na fecundação, o zigoto fica com 46, metade de cada pai. Por isso herdamos características dos dois.',
        'As mudanças da puberdade (pelos, voz, crescimento, mamas, ciclo menstrual) começam em idades diferentes para cada pessoa, e isso é normal.',
      ],
      saude: [
        'Métodos contraceptivos evitam a gravidez. A camisinha, masculina ou feminina, é o único que também protege contra as infecções sexualmente transmissíveis (ISTs).',
        'A vacina contra o HPV é de graça no SUS, em dose única, para meninas e meninos de 9 a 14 anos. Ela previne cânceres causados pelo vírus.',
        'Dúvidas sobre o corpo e a puberdade podem ser conversadas com a família, com professores ou na Unidade Básica de Saúde (UBS).',
      ],
    };

export const SISTEMAS: Record<SistemaId, Sistema> = {
  tegumentar: {
    nome: 'Pele',
    emoji: '🖐️',
    cor: '#E07A45',
    corClara: '#FFF0E6',
    partes: ['Epiderme', 'Derme', 'Hipoderme', 'Pelos', 'Unhas', 'Glândulas de suor', 'Glândulas de sebo'],
    celula: 'Queratinócito e melanócito',
    iniciais: {
      resumo:
        'A pele é o maior órgão do corpo! Ela cobre e protege tudo por dentro, ajuda a controlar a temperatura com o suor e é por ela que sentimos o toque, o calor, o frio e a dor.',
      comoFunciona: [
        'No calor, o corpo solta suor. Quando o suor seca, leva o calor embora.',
        'No frio, os pelos se arrepiam e a pele fica mais pálida para guardar o calor.',
        'Quando nos machucamos, a pele se fecha sozinha e forma uma casquinha que protege o machucado.',
      ],
      saibaMais: [
        'A pele de fora está sempre se trocando: células velhas caem e novas aparecem.',
        'A ponta dos dedos tem muitos sensores de toque.',
        'A cor da pele vem da melanina, que ajuda a proteger do sol.',
      ],
      saude: [
        'Use protetor solar e evite o sol forte do meio do dia.',
        'Lave machucados com água e sabão.',
        'Tomar banho e lavar as mãos tira a sujeira e os micróbios.',
        'Ande calçado em terra e lama: alguns vermes entram pela pele dos pés.',
      ],
    },
    finais: {
      resumo:
        'O sistema tegumentar é formado pela pele e por anexos como pelos, unhas e glândulas. A pele tem três camadas: a epiderme, externa e sem vasos sanguíneos; a derme, com vasos, nervos e glândulas; e a hipoderme, que guarda gordura.',
      comoFunciona: [
        'No calor, os vasos da derme se dilatam (vasodilatação): mais sangue passa perto da superfície e perde calor. As glândulas sudoríparas liberam suor, que retira calor do corpo ao evaporar.',
        'No frio, os vasos se contraem (vasoconstrição) e menos sangue chega à pele, o que conserva calor. Por isso a pele fica pálida.',
        'A epiderme recebe nutrientes da derme. Suas células mais externas morrem cheias de queratina, formam uma camada protetora e descamam.',
        'Receptores na derme captam tato, pressão, temperatura e dor e mandam sinais pelos nervos até o encéfalo.',
      ],
      saibaMais: [
        'A melanina é produzida pelos melanócitos. O sol estimula sua produção: o bronzeado é uma defesa da pele.',
        'A hipoderme isola o calor do corpo e amortece impactos.',
        'Glândulas sebáceas produzem sebo, que lubrifica pele e pelos.',
        'Com a luz do sol, a pele produz vitamina D, importante para os ossos.',
      ],
      saude: [
        'Radiação ultravioleta em excesso causa queimaduras, envelhecimento e aumenta o risco de câncer de pele.',
        'A pele íntegra é a primeira barreira contra microrganismos. Ferimentos devem ser limpos para evitar infecção.',
        'Ancilostomíase (amarelão): a larva do verme entra pela pele dos pés em solo contaminado por fezes. Calçados e saneamento previnem.',
      ],
    },
  },

  muscular: {
    nome: 'Músculos',
    emoji: '💪',
    cor: '#E04B6A',
    corClara: '#FFE8EE',
    partes: ['Músculos esqueléticos', 'Músculo liso', 'Músculo cardíaco', 'Tendões'],
    celula: 'Fibra muscular',
    iniciais: {
      resumo:
        'Temos mais de 600 músculos! Eles se contraem e puxam os ossos, e é assim que conseguimos andar, pular, sorrir e até piscar.',
      comoFunciona: [
        'O cérebro manda uma mensagem pelos nervos.',
        'O músculo recebe a mensagem e se contrai: fica mais curto e mais grosso.',
        'Ao encurtar, ele puxa o osso e aquela parte do corpo se mexe.',
        'Para voltar, um músculo do outro lado puxa no sentido contrário.',
      ],
      saibaMais: [
        'O coração também é um músculo e nunca para de trabalhar.',
        'Para sorrir usamos vários músculos do rosto.',
        'O glúteo, no bumbum, é um dos maiores músculos do corpo.',
      ],
      saude: [
        'Brincar, correr e praticar esportes deixa os músculos mais fortes.',
        'Alongar antes e depois dos exercícios ajuda a evitar dores.',
        'Feijão, ovo, carne e leite têm proteínas, que ajudam os músculos a crescer.',
      ],
    },
    finais: {
      resumo:
        'O sistema muscular trabalha com o esquelético e o nervoso para produzir movimento. Há três tipos de músculo: esquelético (estriado e voluntário), liso (sem estrias e involuntário, nos órgãos e vasos) e cardíaco (estriado e involuntário, só no coração).',
      comoFunciona: [
        'Um impulso nervoso chega à fibra muscular e provoca a contração: filamentos de proteína (actina e miosina) deslizam uns sobre os outros e a fibra encurta.',
        'A contração gasta energia, produzida principalmente nas mitocôndrias pela respiração celular, que usa glicose e oxigênio.',
        'Músculos esqueléticos agem em pares antagonistas: quando o bíceps contrai para dobrar o braço, o tríceps relaxa. Para esticar, acontece o contrário.',
        'Tendões ligam músculos aos ossos. Ligamentos ligam ossos a ossos nas articulações.',
      ],
      saibaMais: [
        'O músculo liso faz o peristaltismo, ondas de contração que empurram o alimento pelo tubo digestório.',
        'Em exercício intenso, quando falta oxigênio, a fibra passa a obter energia por fermentação, que rende bem menos, e o músculo cansa mais rápido.',
        'O diafragma é um músculo esquelético essencial para a respiração.',
        'Músculos que trabalham com frequência ficam maiores: as fibras engrossam.',
      ],
      saude: [
        'Atividade física regular fortalece músculos e coração e ajuda a controlar o peso.',
        'Anabolizantes sem indicação médica podem causar lesões no fígado e no coração e alterações hormonais.',
        'Aquecer antes do exercício e respeitar o descanso reduz lesões musculares.',
      ],
    },
  },

  esqueletico: {
    nome: 'Esqueleto',
    emoji: '🦴',
    cor: '#B8913F',
    corClara: '#FFF7E3',
    partes: ['Crânio', 'Coluna vertebral', 'Costelas', 'Esterno', 'Pelve', 'Ossos dos membros', 'Articulações', 'Cartilagens'],
    celula: 'Osteócito',
    iniciais: {
      resumo:
        'O esqueleto é a estrutura que sustenta o corpo e protege órgãos importantes, como o cérebro e o coração. Um adulto tem 206 ossos!',
      comoFunciona: [
        'Os ossos formam uma armação que segura o corpo de pé.',
        'Alguns ossos são escudos: o crânio protege o cérebro e as costelas protegem o coração e os pulmões.',
        'Os músculos ficam presos nos ossos e os puxam para o corpo se mexer.',
        'Nas juntas, como joelho e cotovelo, os ossos se encontram e conseguem dobrar.',
      ],
      saibaMais: [
        'O osso é vivo: cresce, se renova e se cola de novo quando quebra.',
        'O menor osso fica dentro da orelha e se chama estribo.',
        'O fêmur, na coxa, é o maior osso do corpo.',
      ],
      saude: [
        'Leite, queijo, iogurte e verduras verde-escuras têm cálcio, que deixa os ossos fortes.',
        'Um pouco de sol ajuda o corpo a produzir vitamina D, que ajuda a aproveitar o cálcio.',
        'Sentar direito e não carregar mochila pesada demais protege as costas.',
      ],
    },
    finais: {
      resumo:
        'Os ossos sustentam o corpo, protegem órgãos, servem de alavanca para os músculos, guardam cálcio e fósforo e produzem as células do sangue na medula óssea vermelha. O esqueleto se divide em axial (crânio, coluna, costelas e esterno) e apendicular (membros e as cinturas que os prendem).',
      comoFunciona: [
        'O osso é um tecido vivo: tem células (osteócitos), vasos sanguíneos e uma matriz rígida de sais de cálcio e fósforo com fibras de colágeno, que dá resistência e um pouco de flexibilidade.',
        'A medula óssea vermelha, dentro de ossos como esterno, costelas, vértebras e pelve, produz hemácias, leucócitos e plaquetas.',
        'Nas articulações móveis, as pontas dos ossos são cobertas por cartilagem, que reduz o atrito, e os ossos são presos por ligamentos.',
        'Os músculos puxam os ossos como alavancas, e as articulações funcionam como o ponto de apoio.',
      ],
      saibaMais: [
        'O bebê tem muitas regiões de cartilagem que viram osso com o tempo (ossificação). Por isso nasce com cerca de 300 ossos e o adulto tem 206.',
        'Placas de crescimento nos ossos longos permitem que eles cresçam até o fim da adolescência.',
        'Ao quebrar, o osso forma um calo ósseo e se regenera. O gesso só mantém as partes alinhadas.',
        'Existem articulações imóveis (suturas do crânio), semimóveis (entre as vértebras) e móveis (joelho, ombro).',
      ],
      saude: [
        'Osteoporose é a perda de massa óssea que deixa os ossos frágeis, comum em idosos. Cálcio, vitamina D e exercício na juventude ajudam a prevenir.',
        'Atividades de impacto, como correr e pular, estimulam o osso a ficar mais denso.',
        'Má postura frequente e peso excessivo nas costas sobrecarregam a coluna e causam dores.',
      ],
    },
  },

  nervoso: {
    nome: 'Sistema nervoso',
    emoji: '🧠',
    cor: '#8B4FD9',
    corClara: '#F1E8FF',
    partes: ['Encéfalo', 'Cerebelo', 'Tronco encefálico', 'Medula espinal', 'Nervos', 'Neurônios'],
    celula: 'Neurônio',
    iniciais: {
      resumo:
        'O sistema nervoso é o centro de comando do corpo. O cérebro pensa, lembra e sente, e manda mensagens pelos nervos para o corpo todo, mais rápido que um piscar de olhos.',
      comoFunciona: [
        'Os sentidos (olhos, ouvidos, pele, nariz e língua) percebem o que acontece ao redor.',
        'Os nervos levam essa informação até o cérebro.',
        'O cérebro entende a informação e decide o que fazer.',
        'Os nervos levam a ordem até os músculos, que se mexem.',
      ],
      saibaMais: [
        'O cerebelo, na parte de trás da cabeça, ajuda a gente a se equilibrar, andar de bicicleta e não cair.',
        'Dormir bem ajuda o cérebro a guardar o que aprendemos.',
        'Tirar a mão de algo quente é tão rápido que acontece antes de pensar: é um reflexo.',
      ],
      saude: [
        'Use capacete na bicicleta, no skate e nos patins para proteger a cabeça.',
        'Dormir bem deixa a memória e a atenção melhores.',
        'Muito tempo de tela antes de dormir atrapalha o sono.',
      ],
    },
    finais: {
      resumo:
        'O sistema nervoso central (SNC) é formado pelo encéfalo (cérebro, cerebelo e tronco encefálico) e pela medula espinal. O sistema nervoso periférico (SNP) são os nervos e gânglios, que ligam o SNC ao resto do corpo. A unidade básica é o neurônio.',
      comoFunciona: [
        'O neurônio recebe estímulos pelos dendritos. O impulso elétrico passa pelo corpo celular e percorre o axônio até as terminações.',
        'Entre dois neurônios existe a sinapse: o impulso passa por substâncias químicas chamadas neurotransmissores.',
        'Nervos sensitivos levam informações dos receptores até o SNC. Nervos motores levam ordens do SNC até músculos e glândulas.',
        'No ato reflexo, o estímulo chega à medula espinal e ela mesma envia a resposta ao músculo, sem passar antes pelo encéfalo. Por isso a resposta é tão rápida.',
      ],
      saibaMais: [
        'O cérebro tem áreas para visão, audição, fala, movimento e memória. O cerebelo coordena movimentos e equilíbrio. O tronco encefálico controla respiração e batimentos cardíacos.',
        'O sistema nervoso autônomo controla funções involuntárias, como batimentos, digestão e dilatação da pupila.',
        'Hormônios (sistema endócrino) também levam mensagens, mas pelo sangue e mais devagar. O hipotálamo e a hipófise ligam os dois sistemas e comandam as mudanças da puberdade.',
      ],
      saude: [
        'Álcool e outras drogas alteram a ação dos neurotransmissores: deixam os reflexos lentos, prejudicam memória e julgamento e podem causar dependência.',
        'Por isso dirigir depois de beber é tão perigoso: o tempo de reação aumenta.',
        'Lesões na medula espinal podem cortar a comunicação com partes do corpo e causar paralisia. Capacete e cinto de segurança protegem.',
      ],
    },
  },

  circulatorio: {
    nome: 'Sistema circulatório',
    emoji: '❤️',
    cor: '#E63950',
    corClara: '#FFE6EA',
    partes: ['Coração', 'Artérias', 'Veias', 'Capilares', 'Sangue'],
    celula: 'Hemácia',
    iniciais: {
      resumo:
        'O coração é uma bomba que empurra o sangue pelo corpo todo através de tubinhos chamados vasos sanguíneos. O sangue leva oxigênio e alimento para cada pedacinho do corpo.',
      comoFunciona: [
        'O coração se aperta e empurra o sangue para dentro das artérias.',
        'O sangue viaja até todas as partes do corpo e entrega oxigênio e alimento.',
        'Depois volta ao coração pelas veias, trazendo o que o corpo não quer mais.',
        'Do coração, o sangue vai aos pulmões buscar mais oxigênio e o caminho recomeça.',
      ],
      saibaMais: [
        'Dá para sentir o coração batendo no pulso e no pescoço.',
        'Quando corremos, o coração bate mais rápido para levar mais oxigênio aos músculos.',
        'O sangue tem glóbulos vermelhos, que levam oxigênio, glóbulos brancos, que defendem o corpo, e plaquetas, que fecham machucados.',
      ],
      saude: [
        'Exercícios deixam o coração forte.',
        'Comer menos sal e menos frituras protege o coração e os vasos.',
        'As vacinas da carteirinha ensinam o corpo a se defender de doenças.',
      ],
    },
    finais: {
      resumo:
        'O coração tem quatro cavidades: dois átrios, que recebem o sangue, e dois ventrículos, que bombeiam. Artérias saem do coração e veias voltam para ele. O sangue é formado por plasma, hemácias (transportam oxigênio), leucócitos (defesa) e plaquetas (coagulação).',
      comoFunciona: [
        'Pequena circulação (pulmonar): o ventrículo direito envia sangue pobre em oxigênio aos pulmões pelas artérias pulmonares. Ele volta oxigenado pelas veias pulmonares ao átrio esquerdo.',
        'Grande circulação (sistêmica): o ventrículo esquerdo, de parede mais grossa, bombeia sangue oxigenado pela aorta para todo o corpo. Ele volta pobre em oxigênio pelas veias cavas ao átrio direito.',
        'Valvas entre as cavidades e nas veias impedem que o sangue volte.',
        'Nos capilares, vasos finíssimos, acontecem as trocas: oxigênio e nutrientes saem para as células, e gás carbônico e resíduos entram no sangue.',
      ],
      saibaMais: [
        'Artérias têm paredes grossas e elásticas porque recebem o sangue sob alta pressão.',
        'Nem toda artéria leva sangue oxigenado: as artérias pulmonares levam sangue pobre em oxigênio aos pulmões.',
        'A hemoglobina, proteína das hemácias que contém ferro, se liga ao oxigênio. Pouco ferro na alimentação pode causar anemia.',
        'O sistema linfático recolhe líquido dos tecidos e tem linfonodos (ínguas), onde leucócitos combatem infecções.',
      ],
      saude: [
        'Vacina contém antígenos (microrganismo enfraquecido, inativado ou partes dele): o corpo produz anticorpos e células de memória. É imunização ativa e duradoura.',
        'Soro traz anticorpos prontos, como o soro antiofídico contra veneno de cobra. Age rápido, mas não cria memória: é imunização passiva e temporária.',
        'Pressão alta, colesterol elevado, sedentarismo e cigarro aumentam o risco de infarto e AVC.',
        'Doar sangue salva vidas, e a medula óssea repõe o sangue doado.',
      ],
    },
  },

  respiratorio: {
    nome: 'Sistema respiratório',
    emoji: '🫁',
    cor: '#1E9FCB',
    corClara: '#E3F7FF',
    partes: ['Fossas nasais', 'Faringe', 'Laringe', 'Traqueia', 'Brônquios', 'Pulmões', 'Alvéolos', 'Diafragma'],
    celula: 'Célula do alvéolo',
    iniciais: {
      resumo:
        'Quando respiramos, o ar entra pelo nariz, desce pela traqueia e chega aos pulmões. Lá o corpo pega o oxigênio e devolve o gás carbônico quando soltamos o ar.',
      comoFunciona: [
        'O ar entra pelo nariz, que limpa, aquece e umedece o ar.',
        'O ar desce pela traqueia e se divide nos brônquios, um para cada pulmão.',
        'Nos pulmões, o oxigênio passa para o sangue.',
        'O gás carbônico sai do sangue e vai embora quando soltamos o ar.',
      ],
      saibaMais: [
        'Os pelinhos e a meleca do nariz seguram poeira e micróbios.',
        'Respiramos cerca de 20 mil vezes por dia.',
        'Quando corremos, respiramos mais rápido porque os músculos precisam de mais oxigênio.',
      ],
      saude: [
        'Respirar pelo nariz é melhor do que pela boca.',
        'Fumaça de cigarro faz mal aos pulmões, até de quem só está perto.',
        'Cubra a boca com o braço ao tossir ou espirrar para proteger os outros.',
      ],
    },
    finais: {
      resumo:
        'O ar passa por fossas nasais, faringe, laringe, traqueia e brônquios até os alvéolos, pequenos sacos dentro dos pulmões, envolvidos por capilares. Nos alvéolos acontece a troca gasosa, chamada hematose.',
      comoFunciona: [
        'Inspiração: o diafragma e os músculos entre as costelas contraem, a caixa torácica aumenta, a pressão dentro dos pulmões diminui e o ar entra.',
        'Expiração: esses músculos relaxam, a caixa torácica diminui e o ar sai.',
        'Hematose: nos alvéolos, o oxigênio passa por difusão para o sangue dos capilares e o gás carbônico passa do sangue para o alvéolo.',
        'Nas células, o oxigênio é usado na respiração celular, dentro das mitocôndrias, para liberar a energia da glicose. Gás carbônico e água são produtos dessa reação.',
      ],
      saibaMais: [
        'A epiglote fecha a laringe quando engolimos, para o alimento não ir para a traqueia.',
        'Na laringe ficam as pregas vocais, que vibram e produzem a voz.',
        'Traqueia e brônquios têm cílios e muco que levam a sujeira para cima, até a garganta.',
        'O ritmo da respiração é controlado pelo tronco encefálico, que responde principalmente ao nível de gás carbônico no sangue.',
      ],
      saude: [
        'O cigarro paralisa os cílios, destrói alvéolos (enfisema) e causa câncer de pulmão. O monóxido de carbono da fumaça se liga à hemoglobina e reduz o transporte de oxigênio.',
        'Asma é uma inflamação que estreita os brônquios e dificulta a passagem do ar.',
        'Gripe, covid-19 e tuberculose se espalham pelo ar. Vacinas, ambientes ventilados e higiene das mãos reduzem o contágio.',
      ],
    },
  },

  digestorio: {
    nome: 'Sistema digestório',
    emoji: '🍎',
    cor: '#E8820C',
    corClara: '#FFF1DE',
    partes: ['Boca', 'Faringe', 'Esôfago', 'Estômago', 'Intestino delgado', 'Intestino grosso', 'Fígado', 'Pâncreas', 'Vesícula biliar'],
    celula: 'Célula do intestino (enterócito)',
    iniciais: {
      resumo:
        'O sistema digestório transforma a comida em pedacinhos bem pequenos que o corpo consegue usar. A viagem começa na boca e passa pelo esôfago, estômago e intestinos.',
      comoFunciona: [
        'Na boca, os dentes cortam e trituram, e a saliva deixa a comida molinha.',
        'A comida desce pelo esôfago até o estômago.',
        'O estômago mistura tudo com um suco bem ácido.',
        'No intestino delgado, o que é útil passa para o sangue.',
        'No intestino grosso a água é aproveitada e o resto vira cocô.',
      ],
      saibaMais: [
        'Mastigar bem ajuda todo o resto da digestão.',
        'A comida leva horas para fazer todo o caminho.',
        'O intestino é tão comprido que fica enroladinho dentro da barriga.',
      ],
      saude: [
        'Frutas, verduras e legumes têm fibras, que ajudam o intestino a funcionar.',
        'Beber água ajuda a digestão.',
        'Lavar as mãos e as frutas e beber água filtrada evita vermes, como a lombriga.',
      ],
    },
    finais: {
      resumo:
        'A digestão é mecânica (mastigar, misturar, empurrar) e química (enzimas quebram as moléculas grandes em pequenas). O tubo digestório vai da boca ao ânus, e órgãos anexos (glândulas salivares, fígado e pâncreas) lançam substâncias que ajudam na digestão.',
      comoFunciona: [
        'Boca: mastigação e início da digestão química: a amilase da saliva começa a quebrar o amido.',
        'Esôfago: o alimento desce por peristaltismo, ondas de contração do músculo liso. Por isso conseguimos engolir até de cabeça para baixo.',
        'Estômago: o suco gástrico tem ácido clorídrico e pepsina, que começa a digerir as proteínas. A acidez também mata muitos microrganismos.',
        'Intestino delgado: recebe a bile e o suco pancreático, a digestão termina e os nutrientes são absorvidos pelas vilosidades, dobras que aumentam muito a superfície de absorção.',
        'Intestino grosso: absorve água e sais e forma as fezes. Abriga bactérias benéficas, a microbiota intestinal.',
      ],
      saibaMais: [
        'A bile não é enzima: ela emulsiona as gorduras, quebrando-as em gotas menores para as enzimas agirem melhor. É produzida no fígado e guardada na vesícula biliar.',
        'O pâncreas produz enzimas digestivas e também a insulina, hormônio que controla a glicose no sangue.',
        'No fim da digestão, carboidratos viram açúcares simples como a glicose, proteínas viram aminoácidos e gorduras viram ácidos graxos e glicerol.',
        'Fibras não são digeridas, mas dão volume às fezes e ajudam o intestino a funcionar.',
      ],
      saude: [
        'Alimentação equilibrada combina carboidratos (energia), proteínas (construção do corpo), lipídios (energia e reserva), vitaminas e sais minerais (regulação) e fibras.',
        'Excesso de ultraprocessados, açúcar e gordura está ligado a obesidade, diabetes tipo 2 e pressão alta. A falta de nutrientes causa desnutrição e anemia.',
        'Ascaridíase (lombriga) se pega ao ingerir ovos do verme em água ou alimentos contaminados. Saneamento básico, água tratada e alimentos bem lavados previnem.',
      ],
    },
  },

  urinario: {
    nome: 'Sistema urinário',
    emoji: '💧',
    cor: '#C99400',
    corClara: '#FFF8D9',
    partes: ['Rins', 'Ureteres', 'Bexiga', 'Uretra', 'Néfrons'],
    celula: 'Célula do néfron',
    iniciais: {
      resumo:
        'Os rins são filtros que limpam o sangue e tiram o que o corpo não precisa. Isso vira xixi, que fica guardado na bexiga até a hora de ir ao banheiro.',
      comoFunciona: [
        'O sangue passa pelos rins.',
        'Os rins funcionam como peneiras: seguram o que é bom e separam a sujeira e a água que sobra.',
        'Isso vira urina, que desce por dois tubinhos até a bexiga.',
        'A bexiga vai enchendo e, quando está cheia, dá vontade de fazer xixi.',
      ],
      saibaMais: [
        'Temos dois rins, cada um mais ou menos do tamanho de uma mão fechada.',
        'Quando bebemos pouca água, o xixi fica mais escuro.',
        'Os rins trabalham dia e noite, sem parar.',
      ],
      saude: [
        'Beba água várias vezes por dia.',
        'Não segure o xixi por muito tempo.',
        'Comer muito sal faz mal para os rins.',
      ],
    },
    finais: {
      resumo:
        'Os rins filtram o sangue continuamente e formam a urina, que desce pelos ureteres até a bexiga e sai pela uretra. Assim o sistema urinário elimina resíduos, como a ureia, e mantém o equilíbrio de água e sais do corpo.',
      comoFunciona: [
        'Filtração: no néfron, o sangue passa por um novelo de capilares (glomérulo). Água, sais, glicose e ureia passam para dentro do néfron. Células do sangue e proteínas ficam no sangue.',
        'Reabsorção: ao longo dos túbulos, o que é útil (quase toda a glicose, muita água e sais) volta para o sangue.',
        'O que sobra é a urina: água com ureia, sais e outros resíduos.',
        'Quando bebemos pouca água, os rins reabsorvem mais água e a urina fica concentrada e escura. Isso é controlado pelo hormônio antidiurético (ADH).',
      ],
      saibaMais: [
        'A ureia vem da quebra das proteínas, feita no fígado, e é o principal resíduo da urina.',
        'Os rins produzem cerca de 180 litros de filtrado por dia, mas só 1 a 2 litros viram urina.',
        'Glicose na urina pode ser sinal de diabetes: há tanto açúcar no sangue que os rins não conseguem reabsorver tudo.',
        'O suor também elimina água, sais e um pouco de ureia.',
      ],
      saude: [
        'Beber pouca água favorece cálculos renais, as pedras nos rins.',
        'Pressão alta e diabetes sem controle podem danificar os rins com o tempo.',
        'Quando os rins param de funcionar, a pessoa precisa de hemodiálise, uma máquina que filtra o sangue, ou de um transplante.',
      ],
    },
  },

  sensorial: {
    nome: 'Órgãos dos sentidos',
    emoji: '👁️',
    cor: '#1B9AAA',
    corClara: '#DFF5F7',
    partes: ['Olhos', 'Orelhas', 'Olfato', 'Língua', 'Pele e tato'],
    celula: 'Cone e bastonete da retina',
    iniciais: {
      resumo:
        'Os órgãos dos sentidos são as janelas do corpo para o mundo. Com os olhos vemos, com as orelhas ouvimos, com o nariz sentimos cheiros, com a língua sentimos sabores e com a pele sentimos o toque.',
      comoFunciona: [
        'Cada órgão dos sentidos percebe uma coisa: luz, som, cheiro, sabor ou toque.',
        'Os nervos levam essa informação até o cérebro.',
        'O cérebro entende o que foi percebido: "é a voz da minha mãe", "está quente", "que cheiro bom!".',
        'Muitas vezes os sentidos trabalham juntos: o cheiro da comida ajuda a sentir o sabor.',
      ],
      saibaMais: [
        'Quando estamos gripados e com o nariz entupido, a comida parece sem gosto.',
        'O olho funciona parecido com uma câmera: a luz entra pela pupila, a bolinha preta no meio do olho.',
        'A orelha não serve só para ouvir: lá dentro existe uma parte que ajuda no equilíbrio.',
      ],
      saude: [
        'Nunca olhe diretamente para o Sol, nem de óculos escuros.',
        'Som muito alto no fone de ouvido pode prejudicar a audição para sempre.',
        'Não coloque objetos dentro da orelha nem do nariz.',
      ],
    },
    finais: {
      resumo:
        'Os órgãos dos sentidos têm receptores, células especializadas que transformam estímulos (luz, som, substâncias químicas, pressão e temperatura) em impulsos nervosos. Os nervos levam esses impulsos até o encéfalo, onde as sensações são interpretadas.',
      comoFunciona: [
        'Visão: a luz atravessa a córnea e a pupila, e o cristalino a focaliza na retina. Cones (cores) e bastonetes (pouca luz) geram impulsos que seguem pelo nervo óptico.',
        'Audição: o som faz vibrar o tímpano e os ossículos (martelo, bigorna e estribo). Na cóclea, as vibrações viram impulsos para o nervo auditivo.',
        'Olfato e paladar: receptores químicos no alto da cavidade nasal e nos botões gustativos da língua detectam substâncias. Os dois sentidos se combinam para formar o sabor dos alimentos.',
        'Tato: receptores na pele percebem pressão, vibração, temperatura e dor.',
      ],
      saibaMais: [
        'Na miopia, a imagem se forma antes da retina e a pessoa não enxerga bem de longe: a correção usa lentes divergentes. Na hipermetropia, a imagem se forma depois da retina e a correção usa lentes convergentes.',
        'Os canais semicirculares da orelha interna informam a posição da cabeça e ajudam no equilíbrio.',
        'A pupila se fecha na luz forte e se abre no escuro: é um reflexo controlado pelo sistema nervoso autônomo.',
      ],
      saude: [
        'Ouvir sons muito altos com frequência, como fones no volume máximo, pode lesar as células da cóclea de forma permanente.',
        'Dificuldade para enxergar a lousa merece consulta com oftalmologista: óculos resolvem a maioria dos casos.',
        'Cotonete dentro do canal da orelha pode empurrar a cera e ferir o tímpano.',
      ],
    },
  },

  endocrino: {
    nome: 'Sistema endócrino',
    emoji: '🧪',
    cor: '#C2307D',
    corClara: '#FDE6F2',
    partes: ['Hipófise', 'Tireoide', 'Suprarrenais', 'Pâncreas', 'Ovários', 'Testículos'],
    celula: 'Célula das ilhotas do pâncreas',
    niveis: ['finais'],
    iniciais: ENDOCRINO,
    finais: ENDOCRINO,
  },

  reprodutor: {
    nome: 'Sistema reprodutor',
    emoji: '🌱',
    cor: '#5563C1',
    corClara: '#E8EAFB',
    partes: ['Ovários', 'Tubas uterinas', 'Útero', 'Vagina', 'Testículos', 'Ductos deferentes', 'Próstata', 'Pênis', 'Gametas'],
    celula: 'Óvulo e espermatozoide',
    niveis: ['finais'],
    iniciais: REPRODUTOR,
    finais: REPRODUTOR,
  },
};

// Tags "Partes" do cartão que têm peça no modelo 3D: ao tocar, a câmera aproxima.
// Partes sem peça própria ficam de fora (a tag aparece sem lupa).
export const PARTE_ORGAO: Record<string, string> = {
  // Pele (bolha de aumento com a pele em corte, e unhas no modelo)
  Epiderme: 'epiderme',
  Derme: 'derme',
  Hipoderme: 'hipoderme',
  Pelos: 'pelos',
  Unhas: 'unhas',
  'Glândulas de suor': 'glandulas_suor',
  'Glândulas de sebo': 'glandulas_sebo',
  // Músculos
  'Músculos esqueléticos': 'quadriceps',
  'Músculo liso': 'estomago',
  'Músculo cardíaco': 'coracao',
  Tendões: 'tendoes',
  // Esqueleto
  Crânio: 'cranio',
  'Coluna vertebral': 'coluna',
  Costelas: 'costelas',
  Esterno: 'esterno',
  Pelve: 'pelve',
  'Ossos dos membros': 'femur',
  Articulações: 'patela',
  Cartilagens: 'cartilagens',
  // Nervoso
  Encéfalo: 'encefalo',
  Cerebelo: 'cerebelo',
  'Tronco encefálico': 'tronco_encefalico',
  'Medula espinal': 'medula',
  Nervos: 'nervos',
  Neurônios: 'neuronios',
  // Circulatório
  Coração: 'coracao',
  Artérias: 'arterias',
  Veias: 'veias',
  Capilares: 'capilares',
  Sangue: 'sangue',
  // Respiratório
  'Fossas nasais': 'fossas_nasais',
  Faringe: 'faringe',
  Laringe: 'laringe',
  Traqueia: 'traqueia',
  Brônquios: 'bronquios',
  Pulmões: 'pulmoes',
  Alvéolos: 'alveolos',
  Diafragma: 'diafragma',
  // Digestório
  Boca: 'boca',
  Esôfago: 'esofago',
  Estômago: 'estomago',
  'Intestino delgado': 'intestino_delgado',
  'Intestino grosso': 'intestino_grosso',
  Fígado: 'figado',
  Pâncreas: 'pancreas',
  'Vesícula biliar': 'vesicula',
  // Urinário
  Rins: 'rins',
  Ureteres: 'ureteres',
  Bexiga: 'bexiga',
  Uretra: 'uretra',
  Néfrons: 'nefrons',
  // Sentidos
  Olhos: 'olhos',
  Orelhas: 'orelhas',
  Olfato: 'olfato',
  Língua: 'lingua',
  'Pele e tato': 'pele',
  // Endócrino
  Hipófise: 'hipofise',
  Tireoide: 'tireoide',
  Suprarrenais: 'suprarrenais',
  Ovários: 'ovarios',
  Testículos: 'testiculos',
  // Reprodutor
  'Tubas uterinas': 'tubas_uterinas',
  Útero: 'utero',
  Vagina: 'vagina',
  'Ductos deferentes': 'ductos_deferentes',
  Próstata: 'prostata',
  Pênis: 'penis',
  Gametas: 'gametas',
};

// Sistemas de cada etapa (endócrino e reprodutor são só dos Anos Finais)
export function sistemasDoNivel(nivel: Nivel): SistemaId[] {
  return (Object.keys(SISTEMAS) as SistemaId[]).filter((id) => !SISTEMAS[id].niveis || SISTEMAS[id].niveis!.includes(nivel));
}

// Em qual camada do modelo cada sistema aparece
export function camadaDoSistema(s: SistemaId): 'pele' | 'musculos' | 'ossos' {
  return s === 'tegumentar' ? 'pele' : s === 'muscular' ? 'musculos' : 'ossos';
}

export type Orgao = {
  nome: string;
  sistema: SistemaId;
  fato: string; // frase curta de destaque
  iniciais: string;
  finais: string;
};

export const ORGAOS: Record<string, Orgao> = {
  // Pele
  pele: {
    nome: 'Pele',
    sistema: 'tegumentar',
    fato: 'Cobre o corpo inteiro e se renova o tempo todo.',
    iniciais: 'É a nossa capa protetora: segura os micróbios do lado de fora, sente o toque e ajuda a manter a temperatura certa.',
    finais: 'Num adulto pesa alguns quilos e tem cerca de 2 m². A epiderme protege, a derme nutre e sente, e a hipoderme isola e reserva energia.',
  },
  // Músculos
  musculos_rosto: {
    nome: 'Músculos do rosto',
    sistema: 'muscular',
    fato: 'Fazem as expressões, como sorrir e franzir a testa.',
    iniciais: 'Eles ajudam a mastigar, piscar e mostrar se estamos felizes, bravos ou surpresos.',
    finais: 'Muitos músculos da face se prendem na pele em vez de ligar dois ossos, por isso conseguem mudar as expressões.',
  },
  musculos_tronco: {
    nome: 'Músculos do tronco',
    sistema: 'muscular',
    fato: 'Ajudam a manter a postura e a respirar.',
    iniciais: 'Seguram as costas retas e ajudam a girar e dobrar o corpo.',
    finais: 'Entre as costelas ficam os intercostais, que com o diafragma fazem a caixa torácica aumentar na inspiração.',
  },
  peitoral: {
    nome: 'Peitoral',
    sistema: 'muscular',
    fato: 'Leva os braços para a frente, como num abraço.',
    iniciais: 'Fica no peito e trabalha quando empurramos ou abraçamos.',
    finais: 'O peitoral maior liga o esterno e a clavícula ao úmero e move o braço para a frente e para dentro.',
  },
  abdominais: {
    nome: 'Abdominais',
    sistema: 'muscular',
    fato: 'Protegem os órgãos da barriga e firmam o tronco.',
    iniciais: 'Ajudam a sentar, levantar e manter a postura.',
    finais: 'Ajudam na expiração forçada, na tosse e na evacuação, apertando o abdome.',
  },
  deltoide: {
    nome: 'Deltoide',
    sistema: 'muscular',
    fato: 'Arredonda o ombro e levanta o braço.',
    iniciais: 'Trabalha quando levantamos o braço para pegar algo no alto.',
    finais: 'É um local comum de aplicação de vacinas por ser um músculo grande e fácil de acessar.',
  },
  biceps: {
    nome: 'Bíceps',
    sistema: 'muscular',
    fato: 'Dobra o cotovelo. Faz dupla com o tríceps, que estica.',
    iniciais: 'Quando você dobra o braço, ele fica mais curto e "estufa".',
    finais: 'Bíceps e tríceps são antagonistas: enquanto um contrai, o outro relaxa. Seus tendões o prendem ao ombro e ao rádio.',
  },
  antebraco: {
    nome: 'Músculos do antebraço',
    sistema: 'muscular',
    fato: 'Movem o punho e os dedos.',
    iniciais: 'Fazem a mão fechar, abrir e segurar as coisas.',
    finais: 'A maioria dos músculos que move os dedos fica no antebraço e puxa os dedos por tendões longos.',
  },
  quadriceps: {
    nome: 'Quadríceps',
    sistema: 'muscular',
    fato: 'Estica o joelho: usado para chutar e subir escadas.',
    iniciais: 'Fica na frente da coxa e é muito forte.',
    finais: 'É formado por quatro músculos que se unem no tendão que passa pela patela até a tíbia.',
  },
  gluteo: {
    nome: 'Glúteo',
    sistema: 'muscular',
    fato: 'Um dos maiores músculos do corpo, ajuda a ficar de pé.',
    iniciais: 'Trabalha quando levantamos da cadeira, subimos ou corremos.',
    finais: 'O glúteo máximo estende o quadril e mantém o tronco ereto ao andar.',
  },
  panturrilha: {
    nome: 'Panturrilha',
    sistema: 'muscular',
    fato: 'Levanta o calcanhar para andar, correr e pular.',
    iniciais: 'É a "batata da perna". Trabalha quando ficamos na ponta dos pés.',
    finais: 'Se prende ao calcanhar pelo tendão calcâneo (de Aquiles), o tendão mais forte do corpo.',
  },
  // Ossos
  cranio: {
    nome: 'Crânio',
    sistema: 'esqueletico',
    fato: 'Uma caixa de ossos que protege o encéfalo.',
    iniciais: 'É como um capacete natural para o cérebro.',
    finais: 'Seus ossos são unidos por suturas, articulações imóveis. No bebê ainda existem as moleiras, que fecham com o crescimento.',
  },
  mandibula: {
    nome: 'Mandíbula',
    sistema: 'esqueletico',
    fato: 'Único osso da cabeça que se mexe: mastiga e ajuda a falar.',
    iniciais: 'Nela ficam os dentes de baixo.',
    finais: 'Articula-se com o crânio perto da orelha, numa articulação móvel que permite abrir, fechar e mover para os lados.',
  },
  coluna: {
    nome: 'Coluna vertebral',
    sistema: 'esqueletico',
    fato: 'Pilha de 33 vértebras que sustenta o corpo e protege a medula.',
    iniciais: 'Segura o corpo em pé e deixa a gente se dobrar.',
    finais: 'Entre as vértebras há discos de cartilagem que amortecem impactos. Essas articulações são semimóveis.',
  },
  costelas: {
    nome: 'Costelas',
    sistema: 'esqueletico',
    fato: 'São 12 pares que formam uma gaiola em volta do coração e dos pulmões.',
    iniciais: 'Protegem o coração e os pulmões e sobem e descem quando respiramos.',
    finais: 'Ligam-se à coluna atrás e, a maioria, ao esterno pela frente por cartilagens. Têm medula óssea vermelha.',
  },
  esterno: {
    nome: 'Esterno',
    sistema: 'esqueletico',
    fato: 'Osso achatado no meio do peito onde as costelas se prendem.',
    iniciais: 'Fica bem na frente do coração.',
    finais: 'Contém medula óssea vermelha, por isso pode ser usado em exames da medula.',
  },
  clavicula: {
    nome: 'Clavícula',
    sistema: 'esqueletico',
    fato: 'Liga o braço ao tronco, na altura do ombro.',
    iniciais: 'Dá para sentir com a mão, logo abaixo do pescoço.',
    finais: 'Faz parte da cintura escapular, junto com a escápula. Por ser fina e exposta, é um osso que quebra com facilidade em quedas.',
  },
  umero: {
    nome: 'Úmero',
    sistema: 'esqueletico',
    fato: 'Osso do braço, entre o ombro e o cotovelo.',
    iniciais: 'É o osso comprido do braço.',
    finais: 'Articula-se com a escápula no ombro, uma das articulações mais móveis do corpo.',
  },
  radio_ulna: {
    nome: 'Rádio e ulna',
    sistema: 'esqueletico',
    fato: 'Os dois ossos do antebraço. Juntos deixam a mão girar.',
    iniciais: 'Ficam entre o cotovelo e o punho.',
    finais: 'Quando giramos a palma da mão para cima e para baixo, o rádio gira em volta da ulna.',
  },
  maos: {
    nome: 'Ossos da mão',
    sistema: 'esqueletico',
    fato: 'Cada mão tem 27 ossos.',
    iniciais: 'São muitos ossinhos para a mão fazer movimentos delicados.',
    finais: 'Carpos (punho), metacarpos (palma) e falanges (dedos). O polegar opositor permite a pinça fina.',
  },
  pelve: {
    nome: 'Pelve',
    sistema: 'esqueletico',
    fato: 'A bacia: liga a coluna às pernas e apoia os órgãos da barriga.',
    iniciais: 'Segura a bexiga e os intestinos e sustenta o peso do tronco.',
    finais: 'Forma a cintura pélvica. Na mulher costuma ser mais larga, o que facilita o parto. Tem medula óssea vermelha.',
  },
  femur: {
    nome: 'Fêmur',
    sistema: 'esqueletico',
    fato: 'O maior e mais forte osso do corpo.',
    iniciais: 'Fica na coxa e aguenta o peso do corpo.',
    finais: 'Tem placas de crescimento nas pontas, por isso a altura aumenta até o fim da adolescência.',
  },
  patela: {
    nome: 'Patela',
    sistema: 'esqueletico',
    fato: 'Pequeno osso na frente do joelho.',
    iniciais: 'Protege o joelho.',
    finais: 'Fica dentro do tendão do quadríceps e aumenta a força que esse músculo faz para esticar o joelho.',
  },
  tibia_fibula: {
    nome: 'Tíbia e fíbula',
    sistema: 'esqueletico',
    fato: 'Ossos da perna, entre o joelho e o tornozelo.',
    iniciais: 'A tíbia é a "canela", que dói quando batemos.',
    finais: 'A tíbia sustenta quase todo o peso. A fíbula, mais fina, serve de apoio para músculos e para o tornozelo.',
  },
  pes: {
    nome: 'Ossos do pé',
    sistema: 'esqueletico',
    fato: 'Cada pé tem 26 ossos.',
    iniciais: 'Formam um arco que ajuda a andar e a pular.',
    finais: 'Tarsos, metatarsos e falanges formam arcos que distribuem o peso e amortecem os passos.',
  },
  // Nervoso
  encefalo: {
    nome: 'Encéfalo',
    sistema: 'nervoso',
    fato: 'Pensa, lembra, sente emoções e comanda o corpo.',
    iniciais: 'O cérebro é a maior parte do encéfalo e fica dentro do crânio.',
    finais: 'Formado por cérebro, cerebelo e tronco encefálico. O cérebro tem dois hemisférios e uma camada externa, o córtex, com bilhões de neurônios.',
  },
  cerebelo: {
    nome: 'Cerebelo',
    sistema: 'nervoso',
    fato: 'Cuida do equilíbrio e da coordenação dos movimentos.',
    iniciais: 'É ele que ajuda você a andar de bicicleta sem cair.',
    finais: 'Ajusta a força e a precisão dos movimentos. O álcool afeta o cerebelo, por isso causa falta de equilíbrio.',
  },
  medula: {
    nome: 'Medula espinal',
    sistema: 'nervoso',
    fato: 'Protegida pela coluna, leva mensagens entre o encéfalo e o corpo.',
    iniciais: 'É como uma estrada de mensagens que desce pelas costas.',
    finais: 'Faz parte do SNC. Além de conduzir impulsos, coordena os atos reflexos.',
  },
  nervos: {
    nome: 'Nervos',
    sistema: 'nervoso',
    fato: 'Levam e trazem mensagens entre o corpo e o sistema nervoso central.',
    iniciais: 'São como fios que ligam o cérebro ao corpo todo.',
    finais: 'São feixes de axônios. Nervos sensitivos levam informação ao SNC, motores levam ordens aos músculos e mistos fazem as duas coisas.',
  },
  // Respiratório
  traqueia: {
    nome: 'Traqueia',
    sistema: 'respiratorio',
    fato: 'Tubo com anéis de cartilagem que leva o ar até os pulmões.',
    iniciais: 'Fica na frente do pescoço, na frente do esôfago.',
    finais: 'Os anéis de cartilagem a mantêm sempre aberta. Seus cílios e muco empurram a sujeira para cima.',
  },
  pulmoes: {
    nome: 'Pulmões',
    sistema: 'respiratorio',
    fato: 'Cheios de alvéolos, onde o oxigênio passa para o sangue.',
    iniciais: 'São dois e ficam protegidos pelas costelas.',
    finais: 'O pulmão esquerdo é um pouco menor, deixando espaço para o coração. Têm milhões de alvéolos envolvidos por capilares.',
  },
  // Circulatório
  coracao: {
    nome: 'Coração',
    sistema: 'circulatorio',
    fato: 'Mais ou menos do tamanho de uma mão fechada, bate sem parar a vida toda.',
    iniciais: 'Em repouso bate de 60 a 100 vezes por minuto. Correndo, bate mais.',
    finais: 'Feito de músculo cardíaco, tem 2 átrios e 2 ventrículos. O ventrículo esquerdo tem a parede mais grossa porque bombeia para o corpo inteiro.',
  },
  aorta: {
    nome: 'Aorta',
    sistema: 'circulatorio',
    fato: 'A maior artéria do corpo.',
    iniciais: 'Leva o sangue cheio de oxigênio que sai do coração.',
    finais: 'Sai do ventrículo esquerdo e se ramifica em artérias para todos os órgãos. Começa a grande circulação.',
  },
  arterias: {
    nome: 'Artérias',
    sistema: 'circulatorio',
    fato: 'Levam o sangue do coração para os órgãos e músculos.',
    iniciais: 'É nelas que sentimos o pulso.',
    finais: 'Têm parede grossa e elástica para aguentar a pressão. Vão se ramificando até virar capilares.',
  },
  // Digestório
  esofago: {
    nome: 'Esôfago',
    sistema: 'digestorio',
    fato: 'Tubo que empurra o alimento da boca até o estômago.',
    iniciais: 'Fica atrás da traqueia.',
    finais: 'Não digere nada: só transporta o bolo alimentar por peristaltismo.',
  },
  estomago: {
    nome: 'Estômago',
    sistema: 'digestorio',
    fato: 'Mistura o alimento com o suco gástrico, que é bem ácido.',
    iniciais: 'Funciona como uma bolsa que se estica quando comemos.',
    finais: 'Produz ácido clorídrico e pepsina, que digere proteínas. Uma camada de muco protege a parede do próprio ácido.',
  },
  figado: {
    nome: 'Fígado',
    sistema: 'digestorio',
    fato: 'Maior órgão interno.',
    iniciais: 'Ajuda na digestão das gorduras e guarda energia.',
    finais: 'Produz a bile, armazena glicose na forma de glicogênio, produz a ureia e neutraliza substâncias tóxicas, como o álcool.',
  },
  intestino_delgado: {
    nome: 'Intestino delgado',
    sistema: 'digestorio',
    fato: 'Mede cerca de 6 metros e absorve a maior parte dos nutrientes.',
    iniciais: 'É fino e muito comprido, todo enrolado na barriga.',
    finais: 'Dividido em duodeno, jejuno e íleo. No duodeno chegam bile e suco pancreático. As vilosidades absorvem os nutrientes.',
  },
  intestino_grosso: {
    nome: 'Intestino grosso',
    sistema: 'digestorio',
    fato: 'Absorve água e forma as fezes.',
    iniciais: 'É mais curto e mais largo que o intestino delgado.',
    finais: 'Mede cerca de 1,5 metro. Sua microbiota produz algumas vitaminas e ajuda a proteger contra microrganismos.',
  },
  // Urinário
  rins: {
    nome: 'Rins',
    sistema: 'urinario',
    fato: 'Filtram o sangue o tempo todo e produzem a urina.',
    iniciais: 'São dois, em formato de feijão, na parte de trás da barriga.',
    finais: 'Cada rim tem cerca de um milhão de néfrons, que filtram o sangue e reabsorvem o que é útil.',
  },
  bexiga: {
    nome: 'Bexiga',
    sistema: 'urinario',
    fato: 'Guarda a urina até a hora de ir ao banheiro.',
    iniciais: 'Funciona como um balão que enche aos poucos.',
    finais: 'Sua parede de músculo liso se estica. Quando enche, receptores avisam o encéfalo e vem a vontade de urinar.',
  },
  // ---- Partes adicionadas para as tags do cartão ----
  epiderme: {
    nome: 'Epiderme',
    sistema: 'tegumentar',
    fato: 'A camada de fora da pele, que se renova o tempo todo.',
    iniciais: 'É a parte da pele que a gente vê e toca. As células velhas caem e nascem novas embaixo.',
    finais: 'Não tem vasos sanguíneos. Suas células externas morrem cheias de queratina e descamam. Ali ficam os melanócitos, que produzem melanina.',
  },
  derme: {
    nome: 'Derme',
    sistema: 'tegumentar',
    fato: 'A camada do meio, com vasos, nervos e glândulas.',
    iniciais: 'Fica embaixo da epiderme. Quando um machucado sangra, chegou na derme.',
    finais: 'Tem fibras de colágeno, vasos que fazem vasodilatação e vasoconstrição, receptores de tato e dor, folículos dos pelos e glândulas.',
  },
  hipoderme: {
    nome: 'Hipoderme',
    sistema: 'tegumentar',
    fato: 'A camada mais funda, que guarda gordura.',
    iniciais: 'Funciona como um cobertor: guarda o calor e protege contra batidas.',
    finais: 'Formada principalmente por tecido adiposo: isola o calor, amortece impactos e guarda energia.',
  },
  pelos: {
    nome: 'Pelos',
    sistema: 'tegumentar',
    fato: 'Crescem a partir de folículos na derme.',
    iniciais: 'No frio, os pelos se arrepiam.',
    finais: 'Cada pelo nasce num folículo. Um pequeno músculo arrepia o pelo no frio ou no susto, e uma glândula sebácea lubrifica.',
  },
  unhas: {
    nome: 'Unhas',
    sistema: 'tegumentar',
    fato: 'Placas duras que protegem a ponta dos dedos.',
    iniciais: 'Crescem sem parar e ajudam a pegar coisas pequenas.',
    finais: 'São feitas de queratina, a mesma proteína dos pelos e da camada externa da epiderme.',
  },
  glandulas_suor: {
    nome: 'Glândulas de suor',
    sistema: 'tegumentar',
    fato: 'Produzem o suor, que esfria o corpo.',
    iniciais: 'Temos milhões delas espalhadas pela pele.',
    finais: 'As glândulas sudoríparas são novelos na derme com um duto até a superfície. O suor tem água, sais e um pouco de ureia.',
  },
  glandulas_sebo: {
    nome: 'Glândulas de sebo',
    sistema: 'tegumentar',
    fato: 'Produzem o sebo, que lubrifica pele e pelos.',
    iniciais: 'Deixam a pele macia e protegida.',
    finais: 'As glândulas sebáceas ficam junto dos pelos. Na puberdade, os hormônios aumentam o sebo e podem surgir espinhas.',
  },
  tendoes: {
    nome: 'Tendões',
    sistema: 'muscular',
    fato: 'Prendem os músculos nos ossos.',
    iniciais: 'São como cordas bem fortes. Este fica atrás do calcanhar.',
    finais: 'O tendão calcâneo (de Aquiles) liga a panturrilha ao calcanhar. Tendões ligam músculo a osso; ligamentos ligam osso a osso.',
  },
  cartilagens: {
    nome: 'Cartilagens',
    sistema: 'esqueletico',
    fato: 'Tecido firme e flexível que amortece e reduz o atrito.',
    iniciais: 'A ponta do nariz e a orelha são de cartilagem. Entre as vértebras há discos que amortecem.',
    finais: 'Os discos intervertebrais amortecem a coluna. Nas articulações móveis, a cartilagem cobre a ponta dos ossos. No bebê, muitas cartilagens viram osso.',
  },
  tronco_encefalico: {
    nome: 'Tronco encefálico',
    sistema: 'nervoso',
    fato: 'Liga o encéfalo à medula e controla funções vitais.',
    iniciais: 'Cuida sozinho da respiração e dos batimentos, até quando dormimos.',
    finais: 'Controla respiração, batimentos, pressão, tosse e deglutição. Responde ao gás carbônico do sangue ajustando o ritmo da respiração.',
  },
  neuronios: {
    nome: 'Neurônios',
    sistema: 'nervoso',
    fato: 'As células que levam as mensagens do sistema nervoso.',
    iniciais: 'Temos bilhões deles, conversando entre si o tempo todo.',
    finais: 'Dendritos recebem, o corpo celular integra e o axônio conduz o impulso. A bainha de mielina deixa a condução mais rápida. A comunicação entre eles acontece nas sinapses.',
  },
  veias: {
    nome: 'Veias',
    sistema: 'circulatorio',
    fato: 'Trazem o sangue de volta ao coração.',
    iniciais: 'São as linhas azuladas que aparecem no pulso.',
    finais: 'Têm parede mais fina que as artérias e valvas que impedem o sangue de voltar. As veias cavas chegam ao átrio direito.',
  },
  capilares: {
    nome: 'Capilares',
    sistema: 'circulatorio',
    fato: 'Vasos finíssimos onde acontecem as trocas com as células.',
    iniciais: 'São tão finos que as células do sangue passam em fila.',
    finais: 'Ligam artérias e veias. Pela parede finíssima saem oxigênio e nutrientes para as células, e entram gás carbônico e resíduos.',
  },
  sangue: {
    nome: 'Sangue',
    sistema: 'circulatorio',
    fato: 'Plasma com hemácias, leucócitos e plaquetas.',
    iniciais: 'Glóbulos vermelhos levam oxigênio, os brancos defendem e as plaquetas fecham machucados.',
    finais: 'Hemácias têm hemoglobina (com ferro) e levam oxigênio. Leucócitos defendem e produzem anticorpos. Plaquetas iniciam a coagulação.',
  },
  fossas_nasais: {
    nome: 'Fossas nasais',
    sistema: 'respiratorio',
    fato: 'A entrada do ar: filtram, aquecem e umedecem.',
    iniciais: 'Os pelinhos e a meleca seguram a poeira.',
    finais: 'O muco retém partículas e microrganismos e os vasos aquecem o ar. Por isso respirar pelo nariz é melhor que pela boca.',
  },
  faringe: {
    nome: 'Faringe',
    sistema: 'respiratorio',
    fato: 'Caminho comum do ar e do alimento.',
    iniciais: 'É a garganta: por ela passam a comida e o ar.',
    finais: 'Pertence aos sistemas respiratório e digestório. Logo abaixo, a epiglote decide o caminho: laringe para o ar, esôfago para o alimento.',
  },
  laringe: {
    nome: 'Laringe',
    sistema: 'respiratorio',
    fato: 'Onde ficam as pregas vocais, que produzem a voz.',
    iniciais: 'O "pomo de adão" fica na laringe.',
    finais: 'A epiglote fecha a laringe quando engolimos. As pregas vocais vibram com a passagem do ar e produzem o som da voz.',
  },
  bronquios: {
    nome: 'Brônquios',
    sistema: 'respiratorio',
    fato: 'Levam o ar da traqueia para dentro dos pulmões.',
    iniciais: 'A traqueia se divide em dois: um brônquio para cada pulmão.',
    finais: 'Ramificam-se em bronquíolos cada vez menores até os alvéolos. Na asma, os brônquios inflamam e estreitam.',
  },
  alveolos: {
    nome: 'Alvéolos',
    sistema: 'respiratorio',
    fato: 'Saquinhos de ar onde o oxigênio passa para o sangue.',
    iniciais: 'São milhões de bolinhas dentro dos pulmões, cercadas de vasos de sangue.',
    finais: 'Envolvidos por capilares, fazem a hematose por difusão. O cigarro destrói alvéolos (enfisema) e reduz a troca de gases.',
  },
  diafragma: {
    nome: 'Diafragma',
    sistema: 'respiratorio',
    fato: 'Músculo em cúpula que faz o ar entrar.',
    iniciais: 'Fica embaixo dos pulmões. O soluço é o diafragma pulando sem querer.',
    finais: 'Na inspiração ele contrai e desce, a caixa torácica aumenta e o ar entra. Na expiração ele relaxa e sobe.',
  },
  boca: {
    nome: 'Boca',
    sistema: 'digestorio',
    fato: 'Onde a digestão começa.',
    iniciais: 'Os dentes cortam e trituram, a língua mistura e a saliva amolece a comida.',
    finais: 'Digestão mecânica pela mastigação e química pela amilase salivar, que começa a quebrar o amido.',
  },
  pancreas: {
    nome: 'Pâncreas',
    sistema: 'digestorio',
    fato: 'Produz enzimas digestivas e insulina.',
    iniciais: 'Fica atrás do estômago e ajuda a digerir a comida.',
    finais: 'Lança o suco pancreático no duodeno, com enzimas para carboidratos, proteínas e gorduras, e libera insulina no sangue, que controla a glicose.',
  },
  vesicula: {
    nome: 'Vesícula biliar',
    sistema: 'digestorio',
    fato: 'Guarda a bile produzida pelo fígado.',
    iniciais: 'É um saquinho embaixo do fígado.',
    finais: 'Libera a bile no duodeno quando comemos gordura. A bile emulsiona as gorduras; quem tira a vesícula pode ter dificuldade com alimentos gordurosos.',
  },
  ureteres: {
    nome: 'Ureteres',
    sistema: 'urinario',
    fato: 'Levam a urina dos rins até a bexiga.',
    iniciais: 'São dois tubinhos, um saindo de cada rim.',
    finais: 'Têm músculo liso que empurra a urina por peristaltismo. Não confunda com a uretra, que leva a urina para fora.',
  },
  uretra: {
    nome: 'Uretra',
    sistema: 'urinario',
    fato: 'Leva a urina da bexiga para fora do corpo.',
    iniciais: 'É o último caminho do xixi.',
    finais: 'É um canal único. Os ureteres são dois e chegam à bexiga; a uretra sai dela.',
  },
  nefrons: {
    nome: 'Néfrons',
    sistema: 'urinario',
    fato: 'Os pequenos filtros dos rins.',
    iniciais: 'Cada rim tem cerca de um milhão de filtrinhos.',
    finais: 'No glomérulo acontece a filtração do sangue; nos túbulos, a reabsorção do que é útil. O que sobra vira urina.',
  },
  // Sentidos
  olhos: {
    nome: 'Olhos',
    sistema: 'sensorial',
    fato: 'Percebem a luz e as cores e mandam as imagens para o cérebro.',
    iniciais: 'Os olhos são os órgãos da visão. A luz entra pela pupila, a bolinha preta no meio, e o cérebro forma a imagem. As pálpebras e os cílios protegem os olhos.',
    finais: 'A luz atravessa a córnea, a pupila e o cristalino e forma uma imagem invertida na retina. Cones percebem cores e bastonetes funcionam com pouca luz. O nervo óptico leva os impulsos até o encéfalo, que interpreta a imagem.',
  },
  orelhas: {
    nome: 'Orelhas',
    sistema: 'sensorial',
    fato: 'Captam os sons e ajudam no equilíbrio.',
    iniciais: 'A orelha de fora junta os sons e leva para dentro da cabeça, onde o tímpano vibra. Lá dentro, a orelha também ajuda o corpo a se equilibrar.',
    finais: 'Orelha externa (pavilhão e canal auditivo), média (tímpano e ossículos: martelo, bigorna e estribo) e interna (cóclea, que transforma vibração em impulso nervoso, e canais semicirculares, do equilíbrio).',
  },
  olfato: {
    nome: 'Olfato',
    sistema: 'sensorial',
    fato: 'No alto do nariz ficam as células que sentem os cheiros.',
    iniciais: 'No alto do nariz existem células que sentem cheiros. Elas avisam o cérebro se o cheiro é bom, ruim ou perigoso, como o de fumaça.',
    finais: 'O epitélio olfatório, no teto da cavidade nasal, tem receptores químicos que reconhecem moléculas do ar. O nervo olfatório leva os impulsos ao encéfalo. O olfato forma boa parte do sabor dos alimentos.',
  },
  lingua: {
    nome: 'Língua',
    sistema: 'sensorial',
    fato: 'Tem papilas que sentem os sabores.',
    iniciais: 'A língua sente os sabores: doce, salgado, azedo, amargo e umami, o gostinho de caldo de carne. Ela também ajuda a mastigar, engolir e falar.',
    finais: 'Os botões gustativos ficam nas papilas da língua e percebem cinco sabores básicos: doce, salgado, ácido (azedo), amargo e umami. Todas as regiões da língua percebem todos os sabores: o antigo "mapa da língua" está errado.',
  },
  // Endócrino
  hipofise: {
    nome: 'Hipófise',
    sistema: 'endocrino',
    fato: 'Glândula do tamanho de uma ervilha que comanda outras glândulas.',
    iniciais: 'Fica na base do encéfalo, ligada ao hipotálamo. Produz o hormônio do crescimento e hormônios que estimulam a tireoide, as suprarrenais e as gônadas. Também libera o hormônio antidiurético, que faz os rins economizarem água.',
    finais: 'Fica na base do encéfalo, ligada ao hipotálamo. Produz o hormônio do crescimento e hormônios que estimulam a tireoide, as suprarrenais e as gônadas. Também libera o hormônio antidiurético, que faz os rins economizarem água.',
  },
  tireoide: {
    nome: 'Tireoide',
    sistema: 'endocrino',
    fato: 'Tem formato de borboleta, na frente do pescoço.',
    iniciais: 'Produz os hormônios T3 e T4, que regulam o metabolismo: a velocidade com que as células usam energia. Precisa de iodo para fabricar esses hormônios.',
    finais: 'Produz os hormônios T3 e T4, que regulam o metabolismo: a velocidade com que as células usam energia. Precisa de iodo para fabricar esses hormônios.',
  },
  suprarrenais: {
    nome: 'Suprarrenais',
    sistema: 'endocrino',
    fato: 'Ficam em cima dos rins, como chapeuzinhos.',
    iniciais: 'Produzem a adrenalina, que prepara o corpo para situações de perigo ou estresse, e o cortisol, que ajuda a controlar a glicose e as inflamações.',
    finais: 'Produzem a adrenalina, que prepara o corpo para situações de perigo ou estresse, e o cortisol, que ajuda a controlar a glicose e as inflamações.',
  },
  // Reprodutor
  ovarios: {
    nome: 'Ovários',
    sistema: 'reprodutor',
    fato: 'Guardam os óvulos e produzem estrogênio e progesterona.',
    iniciais: 'São duas glândulas nas laterais do útero. A partir da puberdade, em geral liberam um óvulo por ciclo e produzem os hormônios estrogênio e progesterona. Por isso fazem parte também do sistema endócrino.',
    finais: 'São duas glândulas nas laterais do útero. A partir da puberdade, em geral liberam um óvulo por ciclo e produzem os hormônios estrogênio e progesterona. Por isso fazem parte também do sistema endócrino.',
  },
  tubas_uterinas: {
    nome: 'Tubas uterinas',
    sistema: 'reprodutor',
    fato: 'Levam o óvulo do ovário até o útero.',
    iniciais: 'São dois tubos que ligam a região dos ovários ao útero. É nelas que normalmente acontece a fecundação.',
    finais: 'São dois tubos que ligam a região dos ovários ao útero. É nelas que normalmente acontece a fecundação.',
  },
  utero: {
    nome: 'Útero',
    sistema: 'reprodutor',
    fato: 'Órgão muscular onde o bebê se desenvolve na gravidez.',
    iniciais: 'É oco e tem paredes de músculo. Sua camada interna, o endométrio, se prepara a cada ciclo para receber o embrião. Se não há gravidez, ela descama na menstruação. No parto, os músculos do útero se contraem.',
    finais: 'É oco e tem paredes de músculo. Sua camada interna, o endométrio, se prepara a cada ciclo para receber o embrião. Se não há gravidez, ela descama na menstruação. No parto, os músculos do útero se contraem.',
  },
  vagina: {
    nome: 'Vagina',
    sistema: 'reprodutor',
    fato: 'Canal que liga o útero ao lado de fora do corpo.',
    iniciais: 'Canal muscular e elástico que liga o útero ao meio externo. Por ela sai a menstruação, e é por ela que o bebê passa no parto normal.',
    finais: 'Canal muscular e elástico que liga o útero ao meio externo. Por ela sai a menstruação, e é por ela que o bebê passa no parto normal.',
  },
  testiculos: {
    nome: 'Testículos',
    sistema: 'reprodutor',
    fato: 'Produzem os espermatozoides e a testosterona.',
    iniciais: 'Ficam dentro do escroto, fora do abdome, porque os espermatozoides se formam melhor numa temperatura um pouco mais baixa que a do corpo. Produzem também a testosterona, por isso fazem parte do sistema endócrino.',
    finais: 'Ficam dentro do escroto, fora do abdome, porque os espermatozoides se formam melhor numa temperatura um pouco mais baixa que a do corpo. Produzem também a testosterona, por isso fazem parte do sistema endócrino.',
  },
  ductos_deferentes: {
    nome: 'Ductos deferentes',
    sistema: 'reprodutor',
    fato: 'Levam os espermatozoides dos testículos até a uretra.',
    iniciais: 'São dois tubos que transportam os espermatozoides. No caminho, recebem as secreções das glândulas seminais e da próstata, formando o sêmen.',
    finais: 'São dois tubos que transportam os espermatozoides. No caminho, recebem as secreções das glândulas seminais e da próstata, formando o sêmen.',
  },
  prostata: {
    nome: 'Próstata',
    sistema: 'reprodutor',
    fato: 'Glândula abaixo da bexiga que produz parte do sêmen.',
    iniciais: 'Produz um líquido que nutre e protege os espermatozoides. A uretra passa por dentro dela.',
    finais: 'Produz um líquido que nutre e protege os espermatozoides. A uretra passa por dentro dela.',
  },
  penis: {
    nome: 'Pênis',
    sistema: 'reprodutor',
    fato: 'Por ele passa a uretra, que leva a urina e o sêmen para fora.',
    iniciais: 'Órgão externo do sistema masculino. A uretra, que passa por dentro dele, serve aos sistemas urinário e reprodutor, mas nunca aos dois ao mesmo tempo.',
    finais: 'Órgão externo do sistema masculino. A uretra, que passa por dentro dele, serve aos sistemas urinário e reprodutor, mas nunca aos dois ao mesmo tempo.',
  },
  gametas: {
    nome: 'Gametas',
    sistema: 'reprodutor',
    fato: 'Óvulo e espermatozoide: cada um leva metade das informações genéticas.',
    iniciais: 'Os gametas têm 23 cromossomos. O óvulo é grande, redondo e não se move sozinho. O espermatozoide é pequeno e nada com o flagelo. Da união dos dois surge o zigoto, com 46 cromossomos.',
    finais: 'Os gametas têm 23 cromossomos. O óvulo é grande, redondo e não se move sozinho. O espermatozoide é pequeno e nada com o flagelo. Da união dos dois surge o zigoto, com 46 cromossomos.',
  },
};
