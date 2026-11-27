-- Validação das partidas no servidor + privacidade (LGPD).
--
-- 1. O app não grava mais direto na tabela jogadas. Ele chama registrar_jogada(), que confere
--    se a partida é possível (acertos do jogo, tempo mínimo, sem partidas sobrepostas)
--    e calcula os pontos no servidor. Os pontos enviados pelo app são ignorados.
-- 2. Perfis guardam a faixa de idade, o consentimento do responsável (menores de 12 anos),
--    a versão da política aceita e se a pessoa quer aparecer no ranking.
-- 3. apagar_minha_conta(): a própria pessoa apaga a conta e tudo o que é dela.

-- ================= Regras de cada jogo =================
create table if not exists public.regras_jogo (
  jogo text not null,
  nivel text not null check (nivel in ('iniciais', 'finais')),
  acertos int not null check (acertos > 0),   -- acertos de uma partida completa
  ideal_seg int not null check (ideal_seg > 0), -- tempo ideal (bônus de agilidade)
  min_ms_por_acerto int not null,               -- mais rápido que isso não é humano
  primary key (jogo, nivel)
);

alter table public.regras_jogo enable row level security;
revoke all on public.regras_jogo from anon, authenticated;

insert into public.regras_jogo (jogo, nivel, acertos, ideal_seg, min_ms_por_acerto) values
  ('monte-1', 'iniciais', 4, 24, 1200),
  ('monte-2', 'iniciais', 8, 48, 1200),
  ('monte-3', 'iniciais', 8, 48, 1200),
  ('caca', 'iniciais', 8, 72, 1200),
  ('caca', 'finais', 8, 96, 1200),
  ('viagem-comida', 'iniciais', 5, 20, 500),
  ('viagem-ar', 'iniciais', 5, 20, 500),
  ('viagem-agua', 'iniciais', 6, 24, 500),
  ('memoria', 'iniciais', 6, 48, 1000),
  ('mendel', 'finais', 6, 120, 2500),
  ('sistemas', 'finais', 8, 120, 1500),
  ('prato', 'finais', 20, 120, 700)
on conflict (jogo, nivel) do update
  set acertos = excluded.acertos, ideal_seg = excluded.ideal_seg, min_ms_por_acerto = excluded.min_ms_por_acerto;

-- ================= Perfis: idade, consentimento e ranking =================
alter table public.perfis add column if not exists faixa_etaria text
  check (faixa_etaria in ('menor12', '12a17', 'adulto'));
alter table public.perfis add column if not exists consentimento_responsavel boolean not null default false;
alter table public.perfis add column if not exists consentimento_em timestamptz;
alter table public.perfis add column if not exists politica_versao text;
alter table public.perfis add column if not exists politica_aceita_em timestamptz;
alter table public.perfis add column if not exists mostrar_no_ranking boolean not null default true;

-- Menor de 12 anos só com autorização do responsável
alter table public.perfis drop constraint if exists perfis_consentimento_menor;
alter table public.perfis add constraint perfis_consentimento_menor
  check (faixa_etaria is distinct from 'menor12' or consentimento_responsavel);

-- Datas do consentimento e do aceite ficam com o servidor
create or replace function public.perfis_antes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.consentimento_responsavel and (tg_op = 'INSERT' or not old.consentimento_responsavel) then
    new.consentimento_em := now();
  end if;
  if new.politica_versao is not null and (tg_op = 'INSERT' or new.politica_versao is distinct from old.politica_versao) then
    new.politica_aceita_em := now();
  end if;
  return new;
end;
$$;
revoke execute on function public.perfis_antes() from public, anon, authenticated;

drop trigger if exists perfis_antes on public.perfis;
create trigger perfis_antes before insert or update on public.perfis
for each row execute function public.perfis_antes();

grant insert (id, apelido, faixa_etaria, consentimento_responsavel, politica_versao, mostrar_no_ranking) on public.perfis to authenticated;
grant update (apelido, faixa_etaria, consentimento_responsavel, politica_versao, mostrar_no_ranking) on public.perfis to authenticated;

-- ================= Ranking: só quem quer aparecer =================
create or replace view public.ranking as
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
where p.mostrar_no_ranking
group by j.jogo, j.nivel, j.jogador_id, p.apelido;

revoke all on public.ranking from anon;
grant select on public.ranking to authenticated;

-- ================= Registrar partida (com validação) =================
-- O app não insere mais direto: só pela função abaixo
revoke insert on public.jogadas from authenticated;
drop policy if exists "enviar minha partida" on public.jogadas;

create or replace function public.registrar_jogada(p_jogo text, p_nivel text, p_acertos int, p_erros int, p_tempo_ms int)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  eu uuid := auth.uid();
  r public.regras_jogo;
  ultima timestamptz;
  hoje int;
  pts int;
  posicao int;
  media int;
  aparece boolean;
begin
  if eu is null then
    raise exception 'Entre na sua conta para enviar a partida' using errcode = '28000';
  end if;

  select mostrar_no_ranking into aparece from public.perfis where id = eu;
  if not found then
    raise exception 'Crie seu apelido antes de jogar' using errcode = 'P0001';
  end if;

  select * into r from public.regras_jogo where jogo = p_jogo and nivel = p_nivel;
  if not found then
    raise exception 'Jogo desconhecido' using errcode = 'P0001';
  end if;

  -- A partida precisa estar completa e ser humanamente possível
  if p_acertos is distinct from r.acertos
     or p_erros is null or p_erros < 0 or p_erros > 200
     or p_tempo_ms is null or p_tempo_ms > 3600000
     or p_tempo_ms < r.acertos * r.min_ms_por_acerto then
    raise exception 'Partida inválida' using errcode = 'P0001';
  end if;

  -- Uma partida não pode ter começado antes de a anterior terminar
  select max(criado_em) into ultima from public.jogadas where jogador_id = eu;
  if ultima is not null and now() - make_interval(secs => p_tempo_ms / 1000.0) < ultima - interval '3 seconds' then
    raise exception 'Partidas rápidas demais' using errcode = 'P0001';
  end if;

  select count(*) into hoje from public.jogadas where jogador_id = eu and criado_em > now() - interval '1 day';
  if hoje >= 300 then
    raise exception 'Limite de partidas por dia' using errcode = 'P0001';
  end if;

  -- Mesma fórmula do app (src/lib/pontos.ts)
  pts := greatest(0,
    r.acertos * 100
    + greatest(0, round((r.ideal_seg - p_tempo_ms / 1000.0) * 10))::int
    - p_erros * 40);
  pts := least(pts, 5000);

  insert into public.jogadas (jogador_id, jogo, nivel, pontos, acertos, erros, tempo_ms)
  values (eu, p_jogo, p_nivel, pts, p_acertos, p_erros, greatest(p_tempo_ms, 1000));

  select round(avg(pontos))::int into media from public.jogadas where jogo = p_jogo and nivel = p_nivel;

  if aparece then
    select count(*) + 1 into posicao from public.ranking
    where jogo = p_jogo and nivel = p_nivel and melhor > pts;
  end if;

  return json_build_object('pontos', pts, 'posicao', posicao, 'media', media);
end;
$$;

revoke all on function public.registrar_jogada(text, text, int, int, int) from public, anon;
grant execute on function public.registrar_jogada(text, text, int, int, int) to authenticated;

-- ================= Apagar a própria conta =================
-- Apaga o usuário; perfis, partidas e anotações saem junto (on delete cascade)
create or replace function public.apagar_minha_conta()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta' using errcode = '28000';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;
