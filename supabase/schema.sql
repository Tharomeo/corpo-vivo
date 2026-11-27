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
revoke execute on function public.apelido_disponivel(text) from anon;
grant execute on function public.apelido_disponivel(text) to authenticated;

-- ================= Partidas =================
create table if not exists public.jogadas (
  id bigint generated always as identity primary key,
  jogador_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  jogo text not null constraint jogadas_jogo_check check (jogo ~ '^[a-z0-9-]{2,30}$'),
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

-- ================= Caderno de anotações =================
create table if not exists public.anotacoes (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null default '' check (char_length(titulo) <= 80),
  texto text not null default '' check (char_length(texto) <= 5000),
  -- Sistema ou parte do corpo a que a anotação se refere (ex.: 'coracao', 'nervoso'), ou nenhum
  tema text check (tema is null or tema ~ '^[a-z0-9_]{2,40}$'),
  nivel text not null check (nivel in ('iniciais', 'finais')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists anotacoes_dono on public.anotacoes (dono_id, atualizado_em desc);

alter table public.anotacoes enable row level security;

drop policy if exists "ver minhas anotacoes" on public.anotacoes;
create policy "ver minhas anotacoes" on public.anotacoes for select to authenticated using (dono_id = auth.uid());
drop policy if exists "criar minha anotacao" on public.anotacoes;
create policy "criar minha anotacao" on public.anotacoes for insert to authenticated with check (dono_id = auth.uid());
drop policy if exists "editar minha anotacao" on public.anotacoes;
create policy "editar minha anotacao" on public.anotacoes for update to authenticated using (dono_id = auth.uid()) with check (dono_id = auth.uid());
drop policy if exists "apagar minha anotacao" on public.anotacoes;
create policy "apagar minha anotacao" on public.anotacoes for delete to authenticated using (dono_id = auth.uid());

-- O app só escreve o conteúdo; dono e datas ficam com o banco
revoke all on public.anotacoes from anon, authenticated;
grant select, delete on public.anotacoes to authenticated;
grant insert (titulo, texto, tema, nivel) on public.anotacoes to authenticated;
grant update (titulo, texto, tema) on public.anotacoes to authenticated;

-- Atualiza a data de edição e limita a 500 anotações por conta
create or replace function public.anotacoes_antes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from public.anotacoes where dono_id = new.dono_id) >= 500 then
      raise exception 'Limite de 500 anotações por conta';
    end if;
  else
    new.atualizado_em := now();
  end if;
  return new;
end;
$$;

drop trigger if exists anotacoes_antes on public.anotacoes;
create trigger anotacoes_antes before insert or update on public.anotacoes
for each row execute function public.anotacoes_antes();

-- Função interna do gatilho: não precisa ser chamável pela API
revoke execute on function public.anotacoes_antes() from public, anon, authenticated;

-- ================= Validação das partidas e privacidade =================
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

-- ================= Assinaturas =================
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
