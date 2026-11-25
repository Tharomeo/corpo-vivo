-- Caderno de anotações: cada anotação pertence a uma conta, e só a dona vê, edita e apaga.
-- Rode uma vez no SQL Editor do Supabase.

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
