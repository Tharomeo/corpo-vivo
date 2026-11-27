// Política de privacidade do Corpo Vivo (mostrada em /privacidade e em PRIVACIDADE.md).
// Ao mudar o texto de forma importante, troque POLITICA_VERSAO: o app pede o aceite de novo.

export const POLITICA_VERSAO = '2026-11-27';
export const CONTATO_PRIVACIDADE = 'corpovivobr@gmail.com';

export type FaixaEtaria = 'menor12' | '12a17' | 'adulto';

export const FAIXAS: { id: FaixaEtaria; texto: string; emoji: string }[] = [
  { id: 'menor12', texto: 'Menos de 12 anos', emoji: '🧒' },
  { id: '12a17', texto: 'De 12 a 17 anos', emoji: '🧑' },
  { id: 'adulto', texto: '18 anos ou mais', emoji: '🧑‍🦱' },
];

export type Secao = { titulo: string; paragrafos: string[] };

export const POLITICA: Secao[] = [
  {
    titulo: 'Quem cuida dos seus dados',
    paragrafos: [
      `O Corpo Vivo é um app de estudo do corpo humano criado por Thais Romeo, responsável pelo tratamento dos dados (controladora, nos termos da Lei Geral de Proteção de Dados, LGPD). Contato: ${CONTATO_PRIVACIDADE}.`,
    ],
  },
  {
    titulo: 'Quais dados guardamos',
    paragrafos: [
      'E-mail: para entrar na conta com um código, sem senha.',
      'Apelido: para aparecer no ranking. Não pedimos nome, foto, endereço, telefone, documento nem localização.',
      'Faixa de idade (menos de 12, de 12 a 17 ou 18 ou mais) e, para menores de 12 anos, o registro de que um responsável autorizou o uso, com data.',
      'Partidas dos jogos: jogo, pontos, acertos, erros e tempo.',
      'Anotações que você escreve no caderno.',
      'Data em que a política de privacidade foi aceita.',
      'Se houver assinatura: o plano, até quando o acesso vale e o histórico de pagamentos (valor e data). Os dados do cartão e do Pix ficam só com a Stripe; o Corpo Vivo nunca os recebe.',
    ],
  },
  {
    titulo: 'Para que usamos',
    paragrafos: [
      'Só para o app funcionar: entrar na conta, guardar seu caderno e seus pontos, montar o ranking dos jogos e liberar o conteúdo das assinaturas.',
      'Não vendemos dados, não mostramos anúncios e não usamos os dados para fazer perfil de comportamento.',
    ],
  },
  {
    titulo: 'Crianças e adolescentes',
    paragrafos: [
      'O app foi feito para estudantes, então tratamos os dados sempre pensando no melhor interesse de crianças e adolescentes.',
      'Para quem tem menos de 12 anos, a conta só é criada com a autorização de um dos pais ou de um responsável legal. Recomendamos que a conta use o e-mail do responsável, que recebe o código de acesso.',
      'O responsável escolhe se o apelido aparece no ranking mundial. Para menores de 12 anos, essa opção começa desligada.',
    ],
  },
  {
    titulo: 'Quem mais vê os dados',
    paragrafos: [
      'No ranking aparecem só o apelido e os pontos de quem escolheu aparecer. Ninguém vê seu e-mail, sua idade ou suas anotações.',
      'Os dados ficam guardados no Supabase, serviço de banco de dados e login, e os e-mails com o código são enviados pela Brevo. Os pagamentos são processados pela Stripe, que recebe o e-mail da conta para emitir os recibos. Esses serviços processam os dados só para isso e podem armazená-los em servidores fora do Brasil, com medidas de proteção.',
    ],
  },
  {
    titulo: 'Por quanto tempo',
    paragrafos: [
      'Enquanto a conta existir. Ao apagar a conta, o perfil, as partidas, as anotações e o histórico de pagamentos no app são apagados na hora. A Stripe guarda os registros dos pagamentos pelo tempo que a lei exige.',
    ],
  },
  {
    titulo: 'Seus direitos',
    paragrafos: [
      'Você ou seu responsável podem pedir para ver, corrigir ou apagar seus dados, e retirar a autorização a qualquer momento.',
      'No próprio app, em Minha conta, dá para trocar o apelido, sair do ranking e apagar a conta. Para os outros pedidos, escreva para o contato acima.',
    ],
  },
  {
    titulo: 'Segurança',
    paragrafos: [
      'O acesso é por código enviado ao e-mail. No banco, cada conta só consegue ler e alterar os próprios dados, e os pontos são conferidos pelo servidor.',
      'O código do app é aberto e pode ser conferido no GitHub.',
    ],
  },
  {
    titulo: 'Mudanças nesta política',
    paragrafos: [`Se esta política mudar, o app avisa e pede o aceite de novo. Versão de ${POLITICA_VERSAO.split('-').reverse().join('/')}.`],
  },
];
