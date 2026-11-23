// Conta da pessoa: login por código no e-mail, perfil (apelido e plano) e sair.
// Sem servidor configurado, funciona em "modo de teste": tudo fica salvo no celular.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { servidorConfigurado, supabase } from './supabase';

export type Plano = 'gratuito' | 'premium';
export type Perfil = { apelido: string; plano: Plano };
export type Usuario = { id: string; email: string | null };

type Conta = {
  carregando: boolean;
  modoTeste: boolean;
  usuario: Usuario | null;
  perfil: Perfil | null;
  enviarCodigo: (email: string) => Promise<string | null>; // devolve erro ou null
  confirmarCodigo: (email: string, codigo: string) => Promise<string | null>;
  apelidoDisponivel: (apelido: string) => Promise<boolean | null>; // null = não deu para conferir
  salvarApelido: (apelido: string) => Promise<string | null>;
  sair: () => Promise<void>;
};

const ContaContexto = createContext<Conta | null>(null);

const K_TESTE = 'corpovivo:conta-teste';

function traduzirErro(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes('rate limit') || m.includes('security purposes')) return 'Muitas tentativas. Espere um minuto e tente de novo.';
  if (m.includes('expired') || m.includes('invalid')) return 'Código inválido ou vencido. Confira o código ou peça outro.';
  if (m.includes('email')) return 'Confira o e-mail digitado.';
  if (m.includes('network') || m.includes('fetch')) return 'Sem conexão com a internet.';
  return 'Algo deu errado. Tente de novo.';
}

export function ContaProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  const carregarPerfil = useCallback(async (id: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('perfis').select('apelido, plano').eq('id', id).maybeSingle();
    setPerfil(data ? { apelido: data.apelido, plano: data.plano } : null);
  }, []);

  // Sessão salva ao abrir o app
  useEffect(() => {
    let ativo = true;
    (async () => {
      if (!supabase) {
        const bruto = await AsyncStorage.getItem(K_TESTE);
        if (ativo && bruto) {
          const salvo = JSON.parse(bruto) as { usuario: Usuario | null; perfil: Perfil | null };
          if (salvo.usuario) {
            setUsuario(salvo.usuario);
            setPerfil(salvo.perfil);
          }
        }
        if (ativo) setCarregando(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;
      if (u) {
        setUsuario({ id: u.id, email: u.email ?? null });
        await carregarPerfil(u.id);
      }
      if (ativo) setCarregando(false);
    })();

    const sub = supabase?.auth.onAuthStateChange((_evento, sessao) => {
      if (!sessao) {
        setUsuario(null);
        setPerfil(null);
      }
    });
    return () => {
      ativo = false;
      sub?.data.subscription.unsubscribe();
    };
  }, [carregarPerfil]);

  const enviarCodigo = useCallback(async (email: string) => {
    if (!supabase) return null; // modo de teste: finge que enviou
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
    return error ? traduzirErro(error.message) : null;
  }, []);

  const confirmarCodigo = useCallback(
    async (email: string, codigo: string) => {
      if (!supabase) {
        // Modo de teste: qualquer código de 6 números entra
        if (!/^\d{6,10}$/.test(codigo.trim())) return 'Digite o código de 6 números.';
        const u = { id: 'teste-local', email: email.trim().toLowerCase() };
        setUsuario(u);
        const bruto = await AsyncStorage.getItem(K_TESTE);
        const anterior = bruto ? (JSON.parse(bruto) as { perfil: Perfil | null }).perfil : null;
        setPerfil(anterior);
        await AsyncStorage.setItem(K_TESTE, JSON.stringify({ usuario: u, perfil: anterior }));
        return null;
      }
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: codigo.trim(), type: 'email' });
      if (error || !data.user) return traduzirErro(error?.message ?? 'invalid');
      setUsuario({ id: data.user.id, email: data.user.email ?? null });
      await carregarPerfil(data.user.id);
      return null;
    },
    [carregarPerfil],
  );

  const apelidoDisponivel = useCallback(async (apelido: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('apelido_disponivel', { p_apelido: apelido.trim() });
    return error ? null : Boolean(data);
  }, []);

  const salvarApelido = useCallback(
    async (bruto: string) => {
      const apelido = bruto.trim();
      if (!usuario) return 'Entre na sua conta primeiro.';
      if (!supabase) {
        const novo = { apelido, plano: perfil?.plano ?? ('gratuito' as Plano) };
        setPerfil(novo);
        await AsyncStorage.setItem(K_TESTE, JSON.stringify({ usuario, perfil: novo }));
        return null;
      }
      const { error } = perfil
        ? await supabase.from('perfis').update({ apelido }).eq('id', usuario.id)
        : await supabase.from('perfis').insert({ id: usuario.id, apelido });
      if (error) return error.code === '23505' ? 'Esse apelido acabou de ser escolhido por outra pessoa.' : traduzirErro(error.message);
      setPerfil({ apelido, plano: perfil?.plano ?? 'gratuito' });
      return null;
    },
    [usuario, perfil],
  );

  const sair = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    else {
      const bruto = await AsyncStorage.getItem(K_TESTE);
      const anterior = bruto ? (JSON.parse(bruto) as { perfil: Perfil | null }).perfil : null;
      await AsyncStorage.setItem(K_TESTE, JSON.stringify({ usuario: null, perfil: anterior }));
    }
    setUsuario(null);
    setPerfil(null);
  }, []);

  const valor = useMemo<Conta>(
    () => ({
      carregando,
      modoTeste: !servidorConfigurado,
      usuario,
      perfil,
      enviarCodigo,
      confirmarCodigo,
      apelidoDisponivel,
      salvarApelido,
      sair,
    }),
    [carregando, usuario, perfil, enviarCodigo, confirmarCodigo, apelidoDisponivel, salvarApelido, sair],
  );

  return <ContaContexto.Provider value={valor}>{children}</ContaContexto.Provider>;
}

export function useConta() {
  const c = useContext(ContaContexto);
  if (!c) throw new Error('useConta precisa estar dentro de ContaProvider');
  return c;
}

// Para onde mandar a pessoa depois da abertura
export function destinoInicial(c: Pick<Conta, 'usuario' | 'perfil'>) {
  if (!c.usuario) return '/entrar' as const;
  if (!c.perfil) return '/apelido' as const;
  return '/anos' as const;
}
