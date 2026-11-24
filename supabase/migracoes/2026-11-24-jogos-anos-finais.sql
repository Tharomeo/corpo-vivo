-- Libera novos jogos no ranking (Ervilhas de Mendel, Sistemas em equipe, Prato equilibrado).
-- Antes, a tabela só aceitava uma lista fixa de jogos. Agora aceita qualquer id simples
-- (letras minúsculas, números e hífen), então jogos futuros não precisam de nova migração.
-- Rode uma vez no SQL Editor do Supabase.

alter table public.jogadas drop constraint if exists jogadas_jogo_check;
alter table public.jogadas add constraint jogadas_jogo_check check (jogo ~ '^[a-z0-9-]{2,30}$');
