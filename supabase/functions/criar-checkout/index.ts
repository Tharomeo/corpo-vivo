// Cria a página de pagamento da Stripe (Checkout) para a pessoa logada.
// Mensal: assinatura no cartão, renova sozinha. Anual: pagamento único (cartão ou Pix), vale 12 meses.
import { appUrl, clienteStripe, cors, json, preco, stripe, usuarioDaRequisicao, type Periodo, type Produto } from '../_shared/comum.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const usuario = await usuarioDaRequisicao(req);
    if (!usuario) return json({ erro: 'Entre na sua conta para assinar.' }, 401);

    const { produto, periodo } = (await req.json()) as { produto: Produto; periodo: Periodo };
    if (!['finais', 'medio'].includes(produto) || !['mensal', 'anual'].includes(periodo)) {
      return json({ erro: 'Plano inválido.' }, 400);
    }
    if (produto === 'medio' && Deno.env.get('VENDA_MEDIO_ATIVA') !== 'true') {
      return json({ erro: 'O Ensino Médio ainda está em construção.' }, 400);
    }
    const idPreco = preco(produto, periodo);
    if (!idPreco) return json({ erro: 'Pagamento ainda não configurado.' }, 503);

    const cliente = await clienteStripe(usuario.id, usuario.email);
    if (!cliente) return json({ erro: 'Crie seu apelido antes de assinar.' }, 400);

    // Evita duas assinaturas mensais do mesmo plano
    if (periodo === 'mensal') {
      const ativas = await stripe.subscriptions.list({ customer: cliente, status: 'active', limit: 20 });
      if (ativas.data.some((a) => a.metadata.produto === produto)) {
        return json({ erro: 'Você já tem essa assinatura. Para mudar, use "Gerenciar assinatura" em Minha conta.' }, 409);
      }
    }

    const meta = { perfil_id: usuario.id, produto, periodo };
    const volta = `${appUrl()}/assinar?produto=${produto}`;
    const sessao = await stripe.checkout.sessions.create({
      mode: periodo === 'mensal' ? 'subscription' : 'payment',
      customer: cliente,
      client_reference_id: usuario.id,
      line_items: [{ price: idPreco, quantity: 1 }],
      metadata: meta,
      ...(periodo === 'mensal' ? { subscription_data: { metadata: meta } } : { payment_intent_data: { metadata: meta } }),
      locale: 'pt-BR',
      success_url: `${volta}&status=ok`,
      cancel_url: `${volta}&status=cancelado`,
    });
    return json({ url: sessao.url });
  } catch (e) {
    console.error('criar-checkout', e);
    return json({ erro: 'Não consegui abrir o pagamento. Tente de novo.' }, 500);
  }
});
