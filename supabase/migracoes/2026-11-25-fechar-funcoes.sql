-- Fecha duas funções que o diagnóstico de segurança da Supabase apontou como expostas.
-- apelido_disponivel: só quem está logado consulta (é o único uso no app).
-- anotacoes_antes: função interna do gatilho do caderno, não precisa ser chamável pela API.

revoke execute on function public.apelido_disponivel(text) from anon;
revoke execute on function public.anotacoes_antes() from public, anon, authenticated;
