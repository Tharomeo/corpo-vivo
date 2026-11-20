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
  | 'urinario';

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
  celula: string; // célula do zoom (próxima etapa)
  iniciais: Conteudo;
  finais: Conteudo;
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
};

// Tags "Partes" do cartão que têm peça no modelo 3D: ao tocar, a câmera aproxima.
// Partes sem peça própria ficam de fora (a tag aparece sem lupa).
export const PARTE_ORGAO: Record<string, string> = {
  'Músculos esqueléticos': 'quadriceps',
  'Músculo liso': 'estomago',
  'Músculo cardíaco': 'coracao',
  Tendões: 'panturrilha',
  Crânio: 'cranio',
  'Coluna vertebral': 'coluna',
  Costelas: 'costelas',
  Esterno: 'esterno',
  Pelve: 'pelve',
  'Ossos dos membros': 'femur',
  Articulações: 'patela',
  Cartilagens: 'coluna',
  Encéfalo: 'encefalo',
  Cerebelo: 'cerebelo',
  'Medula espinal': 'medula',
  Nervos: 'nervos',
  Coração: 'coracao',
  Artérias: 'arterias',
  Traqueia: 'traqueia',
  Brônquios: 'traqueia',
  Pulmões: 'pulmoes',
  Alvéolos: 'pulmoes',
  Esôfago: 'esofago',
  Estômago: 'estomago',
  'Intestino delgado': 'intestino_delgado',
  'Intestino grosso': 'intestino_grosso',
  Fígado: 'figado',
  Rins: 'rins',
  Ureteres: 'rins',
  Bexiga: 'bexiga',
  Néfrons: 'rins',
};

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
};
