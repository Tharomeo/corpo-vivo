-- Corpo Vivo: contas, apelidos e ranking
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma vez).
-- Login por e-mail com código: veja o README (precisa ajustar o modelo de e-mail).

-- ================= Perfis =================
-- Um perfil por conta. O plano só muda pelo servidor (pagamento), nunca pelo app.
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  apelido text not null check (
    char_length(apelido) between 3 and 20
    and apelido ~ '^[A-Za-zÀ-ÿ0-9_]+( [A-Za-zÀ-ÿ0-9_]+)*$'
  ),
  plano text not null default 'gratuito' check (plano in ('gratuito', 'premium')),
  criado_em timestamptz not null default now()
);

-- Apelido único sem diferenciar maiúsculas e minúsculas
create unique index if not exists perfis_apelido_unico on public.perfis (lower(apelido));

alter table public.perfis enable row level security;

drop policy if exists "ver meu perfil" on public.perfis;
create policy "ver meu perfil" on public.perfis for select to authenticated using (id = auth.uid());
drop policy if exists "criar meu perfil" on public.perfis;
create policy "criar meu perfil" on public.perfis for insert to authenticated with check (id = auth.uid() and plano = 'gratuito');
drop policy if exists "trocar meu apelido" on public.perfis;
create policy "trocar meu apelido" on public.perfis for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- O app só pode gravar id e apelido; o plano fica com o servidor
revoke all on public.perfis from anon, authenticated;
grant select on public.perfis to authenticated;
grant insert (id, apelido) on public.perfis to authenticated;
grant update (apelido) on public.perfis to authenticated;

-- Checa se o apelido está livre (sem expor os perfis dos outros)
create or replace function public.apelido_disponivel(p_apelido text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.perfis
    where lower(apelido) = lower(trim(p_apelido))
      and id is distinct from auth.uid()
  );
$$;
revoke all on function public.apelido_disponivel(text) from public;
grant execute on function public.apelido_disponivel(text) to authenticated;

-- ================= Partidas =================
create table if not exists public.jogadas (
  id bigint generated always as identity primary key,
  jogador_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  jogo text not null check (jogo in ('monte-1','monte-2','monte-3','caca','viagem-comida','viagem-ar','viagem-agua','memoria')),
  nivel text not null check (nivel in ('iniciais','finais')),
  pontos int not null check (pontos between 0 and 5000),
  acertos int not null check (acertos between 0 and 50),
  erros int not null check (erros between 0 and 200),
  tempo_ms int not null check (tempo_ms between 1000 and 3600000),
  criado_em timestamptz not null default now()
);

create index if not exists jogadas_jogo_nivel on public.jogadas (jogo, nivel);
create index if not exists jogadas_jogador on public.jogadas (jogador_id);

alter table public.jogadas enable row level security;

drop policy if exists "enviar minha partida" on public.jogadas;
create policy "enviar minha partida" on public.jogadas for insert to authenticated with check (jogador_id = auth.uid());
drop policy if exists "ver minhas partidas" on public.jogadas;
create policy "ver minhas partidas" on public.jogadas for select to authenticated using (jogador_id = auth.uid());

revoke all on public.jogadas from anon, authenticated;
grant select, insert on public.jogadas to authenticated;

-- ================= Ranking =================
-- Views sem security_invoker: mostram só apelido e pontos de todos, sem expor e-mail nem plano.
drop view if exists public.ranking;
create view public.ranking as
select
  j.jogo,
  j.nivel,
  j.jogador_id,
  p.apelido,
  max(j.pontos) as melhor,
  round(avg(j.pontos))::int as media,
  count(*)::int as partidas
from public.jogadas j
join public.perfis p on p.id = j.jogador_id
group by j.jogo, j.nivel, j.jogador_id, p.apelido;

drop view if exists public.media_jogo;
create view public.media_jogo as
select jogo, nivel, round(avg(pontos))::int as media, count(*)::int as partidas
from public.jogadas
group by jogo, nivel;

revoke all on public.ranking, public.media_jogo from anon;
grant select on public.ranking, public.media_jogo to authenticated;
