// Conta da pessoa: login por código no e-mail, perfil (apelido e plano) e sair.
// Sem servidor configurado, funciona em "modo de teste": tudo fica salvo no celular.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Nivel } from '../data/sistemas';
import { POLITICA_VERSAO, type FaixaEtaria } from './privacidade';
import { servidorConfigurado, supabase } from './supabase';

export type Plano = 'gratuito' | 'premium';
export type Perfil = {
  apelido: string;
  plano: Plano;
  faixaEtaria: FaixaEtaria | null;
  consentimentoResponsavel: boolean;
  mostrarNoRanking: boolean;
  politicaVersao: string | null;
  acessoFinaisAte: string | null; // até quando os Anos Finais estão pagos
  acessoMedioAte: string | null; // até quando o Ensino Médio está pago (inclui os Anos Finais)
};

// Escolhas da tela de idade e privacidade, guardadas até o apelido ser criado
export type Cadastro = { faixaEtaria: FaixaEtaria; consentimentoResponsavel: boolean; mostrarNoRanking: boolean };
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
  cadastro: Cadastro | null;
  salvarCadastro: (c: Cadastro) => Promise<string | null>;
  salvarRanking: (mostrar: boolean, consentimentoResponsavel?: boolean) => Promise<string | null>;
  apagarConta: () => Promise<string | null>;
  recarregarPerfil: () => Promise<void>;
  simularPagamento: (produto: 'finais' | 'medio', dias: number) => Promise<void>;
  sair: () => Promise<void>;
};

const COLUNAS_PERFIL = 'apelido, plano, faixa_etaria, consentimento_responsavel, mostrar_no_ranking, politica_versao, acesso_finais_ate, acesso_medio_ate';

type LinhaPerfil = {
  apelido: string;
  plano: Plano;
  faixa_etaria: FaixaEtaria | null;
  consentimento_responsavel: boolean;
  mostrar_no_ranking: boolean;
  politica_versao: string | null;
  acesso_finais_ate: string | null;
  acesso_medio_ate: string | null;
};

function lerPerfil(d: LinhaPerfil): Perfil {
  return {
    apelido: d.apelido,
    plano: d.plano,
    faixaEtaria: d.faixa_etaria,
    consentimentoResponsavel: d.consentimento_responsavel,
    mostrarNoRanking: d.mostrar_no_ranking,
    politicaVersao: d.politica_versao,
    acessoFinaisAte: d.acesso_finais_ate,
    acessoMedioAte: d.acesso_medio_ate,
  };
}

const vale = (ate: string | null | undefined) => !!ate && new Date(ate).getTime() > Date.now();

// A etapa está liberada? Anos Iniciais são grátis; o Ensino Médio inclui os Anos Finais.
export function temAcesso(p: Perfil | null, etapa: Nivel | 'medio') {
  if (etapa === 'iniciais') return true;
  if (!p) return false;
  if (etapa === 'finais') return vale(p.acessoFinaisAte) || vale(p.acessoMedioAte);
  return vale(p.acessoMedioAte);
}

// Perfil antigo, sem idade, ou com política desatualizada: pede de novo
export function precisaPrivacidade(p: Perfil | null) {
  return !!p && (!p.faixaEtaria || p.politicaVersao !== POLITICA_VERSAO);
}

const ContaContexto = createContext<Conta | null>(null);

const K_TESTE = 'corpovivo:conta-teste';

function traduzirErro(msg: string) {
  const m = msg.toLowerCase();
  let texto = 'Algo deu errado. Tente de novo.';
  if (m.includes('not authorized')) texto = 'Esse e-mail ainda não pode receber códigos: falta configurar o SMTP no Supabase.';
  else if (m.includes('error sending') || m.includes('smtp')) texto = 'O Supabase não conseguiu enviar o e-mail. Confira as configurações de SMTP.';
  else if (m.includes('signups not allowed') || m.includes('signup')) texto = 'Cadastro por e-mail está desligado no Supabase.';
  else if (m.includes('rate limit') || m.includes('security purposes')) texto = 'Muitas tentativas. Espere um minuto e tente de novo.';
  else if (m.includes('expired') || m.includes('token')) texto = 'Código inválido ou vencido. Confira o código ou peça outro.';
  else if (m.includes('invalid') && m.includes('email')) texto = 'Confira o e-mail digitado.';
  else if (m.includes('network') || m.includes('fetch')) texto = 'Sem conexão com a internet.';
  // Enquanto desenvolve, mostra também a mensagem original do Supabase
  return __DEV__ ? `${texto}\n(${msg})` : texto;
}

export function ContaProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cadastro, setCadastro] = useState<Cadastro | null>(null);

  const carregarPerfil = useCallback(async (id: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('perfis').select(COLUNAS_PERFIL).eq('id', id).maybeSingle();
    setPerfil(data ? lerPerfil(data as LinhaPerfil) : null);
  }, []);

  // Modo de teste: guarda o perfil no celular
  const gravarTeste = useCallback(
    async (novo: Perfil | null) => {
      setPerfil(novo);
      await AsyncStorage.setItem(K_TESTE, JSON.stringify({ usuario, perfil: novo }));
    },
    [usuario],
  );

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
      if (!perfil && !cadastro) return 'Responda primeiro a pergunta da idade.';
      const novo: Perfil = perfil
        ? { ...perfil, apelido }
        : {
            apelido,
            plano: 'gratuito',
            faixaEtaria: cadastro!.faixaEtaria,
            consentimentoResponsavel: cadastro!.consentimentoResponsavel,
            mostrarNoRanking: cadastro!.mostrarNoRanking,
            politicaVersao: POLITICA_VERSAO,
            acessoFinaisAte: null,
            acessoMedioAte: null,
          };
      if (!supabase) {
        await gravarTeste(novo);
        return null;
      }
      const { error } = perfil
        ? await supabase.from('perfis').update({ apelido }).eq('id', usuario.id)
        : await supabase.from('perfis').insert({
            id: usuario.id,
            apelido,
            faixa_etaria: novo.faixaEtaria,
            consentimento_responsavel: novo.consentimentoResponsavel,
            mostrar_no_ranking: novo.mostrarNoRanking,
            politica_versao: POLITICA_VERSAO,
          });
      if (error) return error.code === '23505' ? 'Esse apelido acabou de ser escolhido por outra pessoa.' : traduzirErro(error.message);
      setPerfil(novo);
      setCadastro(null);
      return null;
    },
    [usuario, perfil, cadastro, gravarTeste],
  );

  // Idade, autorização do responsável e ranking. Sem perfil ainda, guarda até o apelido.
  const salvarCadastro = useCallback(
    async (c: Cadastro) => {
      if (!usuario) return 'Entre na sua conta primeiro.';
      if (!perfil) {
        setCadastro(c);
        return null;
      }
      const novo: Perfil = { ...perfil, ...c, politicaVersao: POLITICA_VERSAO };
      if (!supabase) {
        await gravarTeste(novo);
        return null;
      }
      const { error } = await supabase
        .from('perfis')
        .update({
          faixa_etaria: c.faixaEtaria,
          consentimento_responsavel: c.consentimentoResponsavel,
          mostrar_no_ranking: c.mostrarNoRanking,
          politica_versao: POLITICA_VERSAO,
        })
        .eq('id', usuario.id);
      if (error) return traduzirErro(error.message);
      setPerfil(novo);
      return null;
    },
    [usuario, perfil, gravarTeste],
  );

  const salvarRanking = useCallback(
    async (mostrar: boolean, consentimentoResponsavel?: boolean) => {
      if (!usuario || !perfil) return 'Entre na sua conta primeiro.';
      const novo: Perfil = { ...perfil, mostrarNoRanking: mostrar, consentimentoResponsavel: consentimentoResponsavel ?? perfil.consentimentoResponsavel };
      if (!supabase) {
        await gravarTeste(novo);
        return null;
      }
      const { error } = await supabase
        .from('perfis')
        .update({ mostrar_no_ranking: mostrar, consentimento_responsavel: novo.consentimentoResponsavel })
        .eq('id', usuario.id);
      if (error) return traduzirErro(error.message);
      setPerfil(novo);
      return null;
    },
    [usuario, perfil, gravarTeste],
  );

  // Depois de pagar: busca de novo as datas de acesso
  const recarregarPerfil = useCallback(async () => {
    if (supabase && usuario) await carregarPerfil(usuario.id);
  }, [usuario, carregarPerfil]);

  // Modo de teste (sem servidor): finge um pagamento, só neste celular
  const simularPagamento = useCallback(
    async (produto: 'finais' | 'medio', dias: number) => {
      if (supabase || !perfil) return;
      const ate = new Date(Date.now() + dias * 86400000).toISOString();
      await gravarTeste(produto === 'finais' ? { ...perfil, acessoFinaisAte: ate } : { ...perfil, acessoMedioAte: ate });
    },
    [perfil, gravarTeste],
  );

  // Apaga a conta e tudo o que é dela (perfil, partidas e anotações)
  const apagarConta = useCallback(async () => {
    if (!supabase) {
      await AsyncStorage.multiRemove([K_TESTE, 'corpovivo:anotacoes', 'corpovivo:partidas']);
      setUsuario(null);
      setPerfil(null);
      return null;
    }
    const { error } = await supabase.rpc('apagar_minha_conta');
    if (error) return traduzirErro(error.message);
    await AsyncStorage.removeItem('corpovivo:partidas');
    await supabase.auth.signOut();
    setUsuario(null);
    setPerfil(null);
    return null;
  }, []);

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
      cadastro,
      salvarCadastro,
      salvarRanking,
      apagarConta,
      recarregarPerfil,
      simularPagamento,
      sair,
    }),
    [carregando, usuario, perfil, enviarCodigo, confirmarCodigo, apelidoDisponivel, salvarApelido, cadastro, salvarCadastro, salvarRanking, apagarConta, recarregarPerfil, simularPagamento, sair],
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
  if (!c.perfil || precisaPrivacidade(c.perfil)) return '/idade' as const;
  return '/anos' as const;
}
