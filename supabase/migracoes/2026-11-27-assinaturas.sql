-- Assinaturas (Stripe): acesso pago por etapa, com data de validade.
--   Anos Finais: R$ 15/mês ou anual. Ensino Médio: R$ 35/mês ou anual (inclui os Anos Finais).
-- Quem muda o acesso é só o servidor (Edge Function stripe-webhook, com a chave de serviço).
-- O app só lê as datas do próprio perfil.

alter table public.perfis add column if not exists acesso_finais_ate timestamptz;
alter table public.perfis add column if not exists acesso_medio_ate timestamptz;
alter table public.perfis add column if not exists stripe_cliente_id text unique;

-- Nenhuma dessas colunas pode ser escrita pelo app (os grants de insert/update são por coluna
-- e não incluem estas). Reforço: tira qualquer permissão de escrita da tabela inteira.
revoke insert, update on public.perfis from anon, authenticated;
grant insert (id, apelido, faixa_etaria, consentimento_responsavel, politica_versao, mostrar_no_ranking) on public.perfis to authenticated;
grant update (apelido, faixa_etaria, consentimento_responsavel, politica_versao, mostrar_no_ranking) on public.perfis to authenticated;

-- Eventos da Stripe já processados (a Stripe pode reenviar o mesmo aviso)
create table if not exists public.eventos_stripe (
  id text primary key,
  tipo text not null,
  recebido_em timestamptz not null default now()
);
alter table public.eventos_stripe enable row level security;
revoke all on public.eventos_stripe from anon, authenticated;

-- Histórico de pagamentos, para conferir e responder dúvidas das famílias
create table if not exists public.pagamentos (
  id bigint generated always as identity primary key,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  produto text not null check (produto in ('finais', 'medio')),
  periodo text not null check (periodo in ('mensal', 'anual')),
  valor_centavos int,
  stripe_ref text,
  acesso_ate timestamptz not null,
  criado_em timestamptz not null default now()
);
create index if not exists pagamentos_perfil on public.pagamentos (perfil_id, criado_em desc);
alter table public.pagamentos enable row level security;
revoke all on public.pagamentos from anon, authenticated;
grant select on public.pagamentos to authenticated;
drop policy if exists "ver meus pagamentos" on public.pagamentos;
create policy "ver meus pagamentos" on public.pagamentos for select to authenticated using (perfil_id = auth.uid());

-- Estende o acesso de uma etapa (usada só pelo webhook, com a chave de serviço).
--   p_dias: soma dias a partir do fim do acesso atual (ou de agora). Usado no plano anual.
--   p_ate:  acesso vale até essa data (fim do mês pago da assinatura mensal).
create or replace function public.conceder_acesso(p_perfil uuid, p_produto text, p_periodo text, p_dias int, p_ate timestamptz, p_valor int, p_ref text)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  atual timestamptz;
  novo timestamptz;
begin
  if p_produto not in ('finais', 'medio') then
    raise exception 'Produto desconhecido';
  end if;
  select case when p_produto = 'finais' then acesso_finais_ate else acesso_medio_ate end into atual
  from public.perfis where id = p_perfil for update;
  if not found then
    raise exception 'Perfil não encontrado';
  end if;
  atual := greatest(coalesce(atual, now()), now());
  novo := case when p_dias is not null then atual + make_interval(days => p_dias) else greatest(atual, p_ate) end;
  if p_produto = 'finais' then
    update public.perfis set acesso_finais_ate = novo where id = p_perfil;
  else
    update public.perfis set acesso_medio_ate = novo where id = p_perfil;
  end if;
  insert into public.pagamentos (perfil_id, produto, periodo, valor_centavos, stripe_ref, acesso_ate)
  values (p_perfil, p_produto, p_periodo, p_valor, p_ref, novo);
  return novo;
end;
$$;

revoke all on function public.conceder_acesso(uuid, text, text, int, timestamptz, int, text) from public, anon, authenticated;
grant execute on function public.conceder_acesso(uuid, text, text, int, timestamptz, int, text) to service_role;
