-- Ranking mundial do Corpo Vivo
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma vez).

create table if not exists public.jogadas (
  id bigint generated always as identity primary key,
  jogo text not null check (jogo in ('monte-1','monte-2','monte-3','caca','viagem-comida','viagem-ar','viagem-agua','memoria')),
  nivel text not null check (nivel in ('iniciais','finais')),
  jogador_id uuid not null,
  -- Apelidos são gerados pelo app (Nome + Adjetivo + número); o formato limita o que pode ser gravado
  apelido text not null check (apelido ~ '^[A-Za-zÀ-ÿ]+ [A-Za-zÀ-ÿ]+ [0-9]{2}$'),
  pontos int not null check (pontos between 0 and 5000),
  acertos int not null check (acertos between 0 and 50),
  erros int not null check (erros between 0 and 200),
  tempo_ms int not null check (tempo_ms between 1000 and 3600000),
  criado_em timestamptz not null default now()
);

create index if not exists jogadas_jogo_nivel on public.jogadas (jogo, nivel);
create index if not exists jogadas_jogador on public.jogadas (jogador_id);

alter table public.jogadas enable row level security;

-- Qualquer pessoa com o app pode enviar uma partida e ler o ranking.
-- Não há update nem delete pelo app.
drop policy if exists "enviar partida" on public.jogadas;
create policy "enviar partida" on public.jogadas for insert to anon with check (true);
drop policy if exists "ler partidas" on public.jogadas;
create policy "ler partidas" on public.jogadas for select to anon using (true);

-- Melhor pontuação, média e número de partidas de cada jogador, por jogo
create or replace view public.ranking with (security_invoker = on) as
select
  jogo,
  nivel,
  jogador_id,
  (array_agg(apelido order by criado_em desc))[1] as apelido,
  max(pontos) as melhor,
  round(avg(pontos))::int as media,
  count(*)::int as partidas
from public.jogadas
group by jogo, nivel, jogador_id;

-- Média mundial de cada jogo
create or replace view public.media_jogo with (security_invoker = on) as
select jogo, nivel, round(avg(pontos))::int as media, count(*)::int as partidas
from public.jogadas
group by jogo, nivel;

grant select, insert on public.jogadas to anon;
grant select on public.ranking, public.media_jogo to anon;
