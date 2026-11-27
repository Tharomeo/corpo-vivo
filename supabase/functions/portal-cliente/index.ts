// Abre o portal da Stripe, onde a pessoa vê as faturas, troca o cartão e cancela a assinatura mensal.
import { admin, appUrl, cors, json, stripe, usuarioDaRequisicao } from '../_shared/comum.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const usuario = await usuarioDaRequisicao(req);
    if (!usuario) return json({ erro: 'Entre na sua conta.' }, 401);
    const { data } = await admin.from('perfis').select('stripe_cliente_id').eq('id', usuario.id).maybeSingle();
    if (!data?.stripe_cliente_id) return json({ erro: 'Você ainda não tem assinatura.' }, 404);
    const sessao = await stripe.billingPortal.sessions.create({ customer: data.stripe_cliente_id, return_url: `${appUrl()}/conta` });
    return json({ url: sessao.url });
  } catch (e) {
    console.error('portal-cliente', e);
    return json({ erro: 'Não consegui abrir a assinatura. Tente de novo.' }, 500);
  }
});
