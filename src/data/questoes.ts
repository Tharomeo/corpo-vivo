// Banco de questões do Fundamental (aberto).
// A primeira opção de cada questão é a correta; o app embaralha na hora de mostrar.

import type { Nivel, SistemaId } from './sistemas';

export type Questao = {
  id: string;
  nivel: Nivel;
  sistema: SistemaId;
  pergunta: string;
  opcoes: [string, string, string, string]; // [correta, errada, errada, errada]
  explicacao: string;
};

type Bruta = Omit<Questao, 'id' | 'nivel' | 'sistema'>;

const INICIAIS: Record<SistemaId, Bruta[]> = {
  tegumentar: [
    { pergunta: 'Qual é o maior órgão do corpo humano?', opcoes: ['Pele', 'Fígado', 'Coração', 'Cérebro'], explicacao: 'A pele cobre o corpo inteiro, por isso é o maior órgão.' },
    { pergunta: 'Para que serve o suor?', opcoes: ['Refrescar o corpo', 'Deixar a pele colorida', 'Fazer o cabelo crescer', 'Proteger os ossos'], explicacao: 'Quando o suor evapora, leva o calor embora e o corpo esfria.' },
    { pergunta: 'Com qual sentido a pele nos ajuda?', opcoes: ['Tato', 'Visão', 'Audição', 'Olfato'], explicacao: 'É pela pele que sentimos o toque, o calor, o frio e a dor.' },
  ],
  muscular: [
    { pergunta: 'Como os músculos fazem o corpo se mexer?', opcoes: ['Contraem e puxam os ossos', 'Empurram o sangue para fora', 'Produzem o ar que respiramos', 'Guardam a comida'], explicacao: 'O músculo encurta (contrai) e puxa o osso onde está preso.' },
    { pergunta: 'Mais ou menos quantos músculos o corpo humano tem?', opcoes: ['Mais de 600', 'Cerca de 20', 'Exatamente 206', 'Só 50'], explicacao: 'São mais de 600 músculos. O número 206 é o de ossos.' },
    { pergunta: 'Qual músculo dobra o cotovelo?', opcoes: ['Bíceps', 'Panturrilha', 'Glúteo', 'Abdominal'], explicacao: 'O bíceps fica na frente do braço e dobra o cotovelo.' },
  ],
  esqueletico: [
    { pergunta: 'Quantos ossos tem um adulto?', opcoes: ['206', '100', '500', '50'], explicacao: 'Um adulto tem 206 ossos. O bebê nasce com mais, e alguns se juntam com o crescimento.' },
    { pergunta: 'Qual osso protege o cérebro?', opcoes: ['Crânio', 'Fêmur', 'Costela', 'Patela'], explicacao: 'O crânio é uma caixa de ossos em volta do cérebro.' },
    { pergunta: 'Qual é o maior osso do corpo?', opcoes: ['Fêmur', 'Crânio', 'Úmero', 'Costela'], explicacao: 'O fêmur fica na coxa e é o maior e mais forte osso do corpo.' },
  ],
  nervoso: [
    { pergunta: 'Qual órgão é o centro de comando do corpo?', opcoes: ['Cérebro', 'Estômago', 'Rim', 'Pulmão'], explicacao: 'O cérebro pensa, lembra, sente e manda ordens para o corpo todo.' },
    { pergunta: 'O que leva as mensagens do cérebro para o corpo?', opcoes: ['Nervos', 'Ossos', 'Veias', 'Músculos'], explicacao: 'Os nervos funcionam como cabos que levam e trazem mensagens.' },
    { pergunta: 'Qual parte do esqueleto protege a medula espinal?', opcoes: ['Coluna vertebral', 'Crânio', 'Fêmur', 'Costelas'], explicacao: 'A medula espinal passa por dentro das vértebras da coluna.' },
  ],
  circulatorio: [
    { pergunta: 'Qual órgão bombeia o sangue?', opcoes: ['Coração', 'Pulmão', 'Estômago', 'Fígado'], explicacao: 'O coração é uma bomba que empurra o sangue pelo corpo.' },
    { pergunta: 'O que o sangue leva para todo o corpo?', opcoes: ['Oxigênio e nutrientes', 'Ar e água do mar', 'Pedacinhos de osso', 'Pensamentos'], explicacao: 'O sangue entrega oxigênio e alimento para cada parte do corpo.' },
    { pergunta: 'Como se chamam os tubinhos por onde o sangue passa?', opcoes: ['Vasos sanguíneos', 'Nervos', 'Brônquios', 'Tendões'], explicacao: 'Artérias, veias e capilares são os vasos sanguíneos.' },
  ],
  respiratorio: [
    { pergunta: 'Qual gás o corpo pega do ar quando respiramos?', opcoes: ['Oxigênio', 'Gás carbônico', 'Fumaça', 'Vapor'], explicacao: 'O oxigênio entra pelos pulmões e vai para o sangue.' },
    { pergunta: 'Por qual tubo o ar desce até os pulmões?', opcoes: ['Traqueia', 'Esôfago', 'Intestino', 'Aorta'], explicacao: 'A traqueia leva o ar. O esôfago leva a comida.' },
    { pergunta: 'Qual gás soltamos quando o ar sai?', opcoes: ['Gás carbônico', 'Oxigênio puro', 'Gás de cozinha', 'Hélio'], explicacao: 'O corpo devolve o gás carbônico quando soltamos o ar.' },
  ],
  digestorio: [
    { pergunta: 'Onde começa a digestão?', opcoes: ['Na boca', 'No estômago', 'No intestino', 'No fígado'], explicacao: 'Na boca os dentes cortam e amassam a comida, e a saliva começa a digerir.' },
    { pergunta: 'Qual é o caminho da comida?', opcoes: ['Boca, esôfago, estômago e intestinos', 'Boca, pulmões e coração', 'Estômago, boca e intestinos', 'Nariz, traqueia e estômago'], explicacao: 'A comida desce pelo esôfago, é misturada no estômago e segue para os intestinos.' },
    { pergunta: 'Por que devemos lavar as mãos antes de comer?', opcoes: ['Para evitar microrganismos que causam doenças', 'Para a comida ficar mais doce', 'Para crescer mais rápido', 'Para digerir mais rápido'], explicacao: 'As mãos carregam microrganismos que podem entrar no corpo junto com a comida.' },
  ],
  urinario: [
    { pergunta: 'Quais órgãos filtram o sangue?', opcoes: ['Rins', 'Pulmões', 'Ossos', 'Olhos'], explicacao: 'Os rins limpam o sangue e transformam o que sobra em urina.' },
    { pergunta: 'Onde a urina fica guardada?', opcoes: ['Bexiga', 'Estômago', 'Coração', 'Pulmão'], explicacao: 'A bexiga guarda a urina até a hora de ir ao banheiro.' },
    { pergunta: 'O que ajuda os rins a trabalhar bem?', opcoes: ['Beber água', 'Comer muito sal', 'Dormir pouco', 'Segurar o xixi'], explicacao: 'Com água suficiente os rins filtram melhor e evitam pedras nos rins.' },
  ],
};

const FINAIS: Record<SistemaId, Bruta[]> = {
  tegumentar: [
    { pergunta: 'Qual é a camada mais externa da pele?', opcoes: ['Epiderme', 'Derme', 'Hipoderme', 'Mucosa'], explicacao: 'A epiderme fica por fora e se renova o tempo todo. A derme fica logo abaixo.' },
    { pergunta: 'Qual pigmento dá cor à pele e ajuda a proteger da radiação solar?', opcoes: ['Melanina', 'Hemoglobina', 'Clorofila', 'Queratina'], explicacao: 'A melanina é produzida pelos melanócitos e absorve parte da radiação ultravioleta.' },
    { pergunta: 'Em qual camada da pele ficam vasos sanguíneos e glândulas de suor?', opcoes: ['Derme', 'Epiderme', 'Unhas', 'Pelos'], explicacao: 'A derme tem vasos, terminações nervosas e glândulas. A epiderme não tem vasos sanguíneos.' },
  ],
  muscular: [
    { pergunta: 'Qual tipo de músculo forma o coração?', opcoes: ['Cardíaco', 'Liso', 'Esquelético', 'Tendíneo'], explicacao: 'O músculo cardíaco contrai sozinho e sem parar, a vida inteira.' },
    { pergunta: 'O músculo liso, como o do estômago, é:', opcoes: ['Involuntário', 'Voluntário', 'Feito de osso', 'Preso aos ossos dos braços'], explicacao: 'Ele contrai sem que a gente controle, empurrando o alimento pelo tubo digestório.' },
    { pergunta: 'Por que músculos como bíceps e tríceps trabalham em par?', opcoes: ['Porque músculos só conseguem puxar', 'Porque cada um tem metade da força', 'Porque um descansa enquanto o outro dorme', 'Porque um produz sangue para o outro'], explicacao: 'Um puxa para dobrar, o outro puxa para esticar. Nenhum músculo empurra.' },
  ],
  esqueletico: [
    { pergunta: 'Onde são produzidas as células do sangue?', opcoes: ['Na medula óssea vermelha', 'No estômago', 'Na pele', 'Nos pulmões'], explicacao: 'A medula óssea vermelha, dentro de alguns ossos, produz hemácias, leucócitos e plaquetas.' },
    { pergunta: 'Qual mineral fica armazenado nos ossos e os deixa resistentes?', opcoes: ['Cálcio', 'Ferro', 'Sódio', 'Iodo'], explicacao: 'Os ossos guardam cálcio. Vitamina D e exercício ajudam a mantê-los fortes.' },
    { pergunta: 'Como se chama o ponto onde dois ossos se encontram e permitem movimento?', opcoes: ['Articulação', 'Tendão', 'Medula', 'Alvéolo'], explicacao: 'Joelho, cotovelo e ombro são articulações. O tendão liga músculo a osso.' },
  ],
  nervoso: [
    { pergunta: 'Qual célula do sistema nervoso transmite impulsos elétricos?', opcoes: ['Neurônio', 'Hemácia', 'Osteócito', 'Célula do alvéolo'], explicacao: 'O neurônio é a unidade básica do sistema nervoso.' },
    { pergunta: 'O sistema nervoso central é formado por:', opcoes: ['Encéfalo e medula espinal', 'Nervos dos braços e das pernas', 'Coração e vasos', 'Pulmões e traqueia'], explicacao: 'Os nervos que saem dele formam o sistema nervoso periférico.' },
    { pergunta: 'Tirar a mão rápido de algo quente é um exemplo de:', opcoes: ['Ato reflexo', 'Memória', 'Digestão', 'Respiração'], explicacao: 'No reflexo a resposta sai da medula espinal, antes mesmo de o encéfalo perceber a dor.' },
    { pergunta: 'Como o álcool afeta o sistema nervoso?', opcoes: ['Altera a comunicação entre neurônios e deixa os reflexos mais lentos', 'Aumenta a quantidade de ossos', 'Faz os pulmões crescerem', 'Não tem nenhum efeito'], explicacao: 'Álcool e outras drogas mudam a comunicação entre neurônios e afetam atenção, memória e coordenação.' },
  ],
  circulatorio: [
    { pergunta: 'Quais vasos levam o sangue para fora do coração?', opcoes: ['Artérias', 'Veias', 'Brônquios', 'Ureteres'], explicacao: 'Artérias saem do coração. Veias trazem o sangue de volta para ele.' },
    { pergunta: 'Qual componente do sangue transporta o oxigênio?', opcoes: ['Hemácias', 'Plaquetas', 'Leucócitos', 'Plasma'], explicacao: 'As hemácias têm hemoglobina, que se liga ao oxigênio.' },
    { pergunta: 'Como as vacinas protegem o corpo?', opcoes: ['Ensinam os leucócitos a reconhecer o microrganismo', 'Matam todas as bactérias do corpo', 'Aumentam o número de hemácias', 'Fazem o coração bater mais rápido'], explicacao: 'Com a vacina, o sistema de defesa aprende a reagir antes de a doença aparecer.' },
    { pergunta: 'Quantas cavidades tem o coração humano?', opcoes: ['4', '2', '3', '1'], explicacao: 'São dois átrios em cima e dois ventrículos embaixo.' },
  ],
  respiratorio: [
    { pergunta: 'Onde acontece a troca gasosa?', opcoes: ['Nos alvéolos', 'Na traqueia', 'Na laringe', 'Nas fossas nasais'], explicacao: 'Nos alvéolos o oxigênio passa para o sangue e o gás carbônico sai.' },
    { pergunta: 'Qual músculo abaixo dos pulmões ajuda na respiração?', opcoes: ['Diafragma', 'Bíceps', 'Deltoide', 'Glúteo'], explicacao: 'Quando o diafragma contrai e desce, o ar entra nos pulmões.' },
    { pergunta: 'Por que o cigarro prejudica a respiração?', opcoes: ['Danifica os alvéolos e reduz a troca de gases', 'Faz o pulmão produzir mais oxigênio', 'Aumenta o tamanho da traqueia', 'Não afeta os pulmões'], explicacao: 'As substâncias do cigarro destroem alvéolos e o ar passa a ser aproveitado pior.' },
  ],
  digestorio: [
    { pergunta: 'Onde a maior parte dos nutrientes é absorvida?', opcoes: ['Intestino delgado', 'Intestino grosso', 'Esôfago', 'Boca'], explicacao: 'O intestino delgado é longo e cheio de dobras, o que aumenta a área de absorção.' },
    { pergunta: 'Qual é a principal função do intestino grosso?', opcoes: ['Absorver água e formar as fezes', 'Produzir bile', 'Digerir proteínas', 'Bombear sangue'], explicacao: 'O que não foi absorvido chega ao intestino grosso, que retira a água e forma as fezes.' },
    { pergunta: 'Qual órgão produz a bile, que ajuda a digerir gorduras?', opcoes: ['Fígado', 'Rim', 'Pulmão', 'Bexiga'], explicacao: 'O fígado produz a bile, que fica guardada na vesícula biliar.' },
    { pergunta: 'A digestão química acontece graças a:', opcoes: ['Enzimas', 'Ossos', 'Alvéolos', 'Plaquetas'], explicacao: 'Enzimas quebram os alimentos em partes pequenas o bastante para serem absorvidas.' },
  ],
  urinario: [
    { pergunta: 'Como se chamam as unidades de filtração do rim?', opcoes: ['Néfrons', 'Neurônios', 'Alvéolos', 'Vilosidades'], explicacao: 'Cada rim tem cerca de um milhão de néfrons.' },
    { pergunta: 'Por qual canal a urina vai do rim até a bexiga?', opcoes: ['Ureter', 'Uretra', 'Esôfago', 'Aorta'], explicacao: 'O ureter liga rim e bexiga. A uretra leva a urina da bexiga para fora.' },
    { pergunta: 'Além de eliminar resíduos, o sistema urinário:', opcoes: ['Mantém o equilíbrio de água e sais no corpo', 'Produz a bile', 'Faz a troca gasosa', 'Contrai os músculos'], explicacao: 'Os rins ajustam quanta água e quanto sal ficam no corpo.' },
  ],
};

function montar(nivel: Nivel, banco: Record<SistemaId, Bruta[]>): Questao[] {
  return (Object.keys(banco) as SistemaId[]).flatMap((sistema) =>
    banco[sistema].map((q, i) => ({ ...q, id: `${nivel}-${sistema}-${i + 1}`, nivel, sistema })),
  );
}

export const QUESTOES: Questao[] = [...montar('iniciais', INICIAIS), ...montar('finais', FINAIS)];
