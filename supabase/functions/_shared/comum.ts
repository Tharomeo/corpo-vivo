// Código comum das funções de pagamento (Supabase Edge Functions, Deno).
// Segredos (configurados no painel da Supabase, nunca no app nem no GitHub):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//   STRIPE_PRECO_FINAIS_MENSAL, STRIPE_PRECO_FINAIS_ANUAL, STRIPE_PRECO_MEDIO_MENSAL, STRIPE_PRECO_MEDIO_ANUAL,
//   APP_URL (endereço da versão web), VENDA_MEDIO_ATIVA ('true' quando o Ensino Médio tiver conteúdo)
// SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY a Supabase já fornece.
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

export type Produto = 'finais' | 'medio';
export type Periodo = 'mensal' | 'anual';

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});

export const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

export function preco(produto: Produto, periodo: Periodo) {
  return Deno.env.get(`STRIPE_PRECO_${produto.toUpperCase()}_${periodo.toUpperCase()}`) ?? '';
}

export function appUrl() {
  return (Deno.env.get('APP_URL') ?? '').replace(/\/$/, '');
}

// Quem está chamando (pelo token de login enviado pelo app)
export async function usuarioDaRequisicao(req: Request) {
  const auth = req.headers.get('Authorization') ?? '';
  const cliente = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data } = await cliente.auth.getUser();
  return data.user;
}

// Cliente da Stripe ligado ao perfil (cria na primeira compra)
export async function clienteStripe(perfilId: string, email: string | undefined) {
  const { data: perfil } = await admin.from('perfis').select('stripe_cliente_id').eq('id', perfilId).maybeSingle();
  if (!perfil) return null;
  if (perfil.stripe_cliente_id) return perfil.stripe_cliente_id as string;
  const c = await stripe.customers.create({ email, metadata: { perfil_id: perfilId } });
  await admin.from('perfis').update({ stripe_cliente_id: c.id }).eq('id', perfilId);
  return c.id;
}
