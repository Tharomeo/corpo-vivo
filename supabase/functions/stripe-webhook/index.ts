// Recebe os avisos da Stripe e libera o acesso. Publicada SEM verificação de login (verify_jwt = false):
// quem prova que o aviso é da Stripe é a assinatura do cabeçalho stripe-signature.
import Stripe from 'npm:stripe@17.7.0';
import { admin, stripe } from '../_shared/comum.ts';

const cripto = Stripe.createSubtleCryptoProvider();
const DIA = 24 * 60 * 60;

async function conceder(meta: Record<string, string> | null | undefined, dias: number | null, ate: number | null, valor: number | null, ref: string) {
  if (!meta?.perfil_id || !meta.produto) throw new Error(`Sem metadados em ${ref}`);
  const { error } = await admin.rpc('conceder_acesso', {
    p_perfil: meta.perfil_id,
    p_produto: meta.produto,
    p_periodo: meta.periodo ?? (dias ? 'anual' : 'mensal'),
    p_dias: dias,
    p_ate: ate ? new Date(ate * 1000).toISOString() : null,
    p_valor: valor,
    p_ref: ref,
  });
  if (error) throw new Error(error.message);
}

Deno.serve(async (req) => {
  const assinatura = req.headers.get('stripe-signature');
  const corpo = await req.text();
  let evento: Stripe.Event;
  try {
    evento = await stripe.webhooks.constructEventAsync(corpo, assinatura ?? '', Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '', undefined, cripto);
  } catch {
    return new Response('assinatura inválida', { status: 400 });
  }

  // A Stripe pode mandar o mesmo aviso mais de uma vez
  const { error: repetido } = await admin.from('eventos_stripe').insert({ id: evento.id, tipo: evento.type });
  if (repetido) return new Response(repetido.code === '23505' ? 'já processado' : 'erro', { status: repetido.code === '23505' ? 200 : 500 });

  try {
    switch (evento.type) {
      // Plano anual: pagamento único. No Pix, o "pago" pode chegar depois (async_payment_succeeded).
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const s = evento.data.object as Stripe.Checkout.Session;
        if (s.mode === 'payment' && s.payment_status === 'paid') {
          await conceder(s.metadata, 365, null, s.amount_total, s.id);
        }
        break;
      }
      // Plano mensal: cada fatura paga libera até o fim do mês pago (+2 dias de folga para a renovação)
      case 'invoice.paid': {
        const f = evento.data.object as Stripe.Invoice & {
          parent?: { subscription_details?: { metadata?: Record<string, string> } };
        };
        const meta = f.parent?.subscription_details?.metadata ?? f.subscription_details?.metadata;
        const fim = f.lines.data[0]?.period?.end;
        if (meta?.perfil_id && fim) await conceder(meta, null, fim + 2 * DIA, f.amount_paid, f.id);
        break;
      }
    }
  } catch (e) {
    console.error('stripe-webhook', evento.type, e);
    // Libera o evento para a Stripe tentar de novo
    await admin.from('eventos_stripe').delete().eq('id', evento.id);
    return new Response('erro', { status: 500 });
  }
  return new Response('ok', { status: 200 });
});
