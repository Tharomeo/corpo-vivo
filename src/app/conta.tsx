import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopoJogo } from '../components/jogos/Moldura';
import { gerenciarAssinatura, PRODUTOS, reais } from '../lib/assinatura';
import { useConta } from '../lib/conta';
import { cores, sombra } from '../theme';

// Minha conta: apelido, e-mail, plano, privacidade (ranking e apagar conta) e sair

export default function MinhaConta() {
  const { usuario, perfil, modoTeste, sair, salvarRanking, apagarConta, recarregarPerfil } = useConta();
  const [confirmar, setConfirmar] = useState<null | 'ranking' | 'apagar'>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const crianca = perfil?.faixaEtaria === 'menor12';
  const noRanking = perfil?.mostrarNoRanking ?? true;

  const trocarRanking = async () => {
    // Criança só entra no ranking com o responsável confirmando
    if (!noRanking && crianca && confirmar !== 'ranking') return setConfirmar('ranking');
    setOcupado(true);
    setErro(null);
    const e = await salvarRanking(!noRanking);
    setOcupado(false);
    setConfirmar(null);
    if (e) setErro(e);
  };

  const apagar = async () => {
    if (confirmar !== 'apagar') return setConfirmar('apagar');
    setOcupado(true);
    setErro(null);
    const e = await apagarConta();
    setOcupado(false);
    if (e) {
      setConfirmar(null);
      return setErro(e);
    }
    router.replace('/entrar');
  };
  const inicial = (perfil?.apelido ?? '?').charAt(0).toUpperCase();
  const finaisAte = perfil?.acessoFinaisAte && new Date(perfil.acessoFinaisAte) > new Date() ? perfil.acessoFinaisAte : null;
  const medioAte = perfil?.acessoMedioAte && new Date(perfil.acessoMedioAte) > new Date() ? perfil.acessoMedioAte : null;
  const pago = !!(finaisAte || medioAte);
  const dataBR = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

  // Volta do portal da Stripe: atualiza as datas
  useFocusEffect(
    useCallback(() => {
      recarregarPerfil();
    }, [recarregarPerfil]),
  );

  const gerenciar = async () => {
    setErro(null);
    setOcupado(true);
    const e = await gerenciarAssinatura();
    setOcupado(false);
    if (e) setErro(e);
  };

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <TopoJogo titulo="Minha conta" cor={cores.texto} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.perfil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{inicial}</Text>
          </View>
          <Text style={styles.apelido}>{perfil?.apelido ?? 'Sem apelido'}</Text>
          <Text style={styles.email}>{modoTeste ? `🧪 modo de teste${usuario?.email ? ` · ${usuario.email}` : ''}` : usuario?.email}</Text>
          <Pressable
            onPress={() => router.push({ pathname: '/apelido', params: { editar: '1' } })}
            style={({ pressed }) => [styles.trocar, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.trocarTexto}>✏️ Trocar apelido</Text>
          </Pressable>
        </View>

        <Text style={styles.secao}>Seu plano</Text>
        <View style={[styles.plano, { backgroundColor: pago ? '#FFF4D1' : '#DDF6F3' }]}>
          <Text style={styles.planoNome}>{pago ? '⭐ Assinante' : '🌱 Gratuito'}</Text>
          <Text style={styles.planoTexto}>
            {medioAte
              ? `Ensino Médio e Anos Finais liberados até ${dataBR(medioAte)}.`
              : finaisAte
                ? `Anos Finais liberados até ${dataBR(finaisAte)}.`
                : 'Anos Iniciais completos e grátis: corpo 3D, Me testar, jogos e caderno.'}
          </Text>
          {pago && !modoTeste && (
            <Pressable onPress={gerenciar} disabled={ocupado} style={styles.gerenciar}>
              <Text style={styles.gerenciarTexto}>Gerenciar assinatura, faturas e cancelamento ›</Text>
            </Pressable>
          )}
        </View>

        {!finaisAte && !medioAte && (
          <View style={styles.assinar}>
            <Text style={styles.assinarTitulo}>
              {PRODUTOS.finais.emoji} {PRODUTOS.finais.nome}
            </Text>
            <Text style={styles.assinarTexto}>
              {reais(PRODUTOS.finais.mensal)} por mês ou {reais(PRODUTOS.finais.anual)} por ano. Ensino Médio em breve.
            </Text>
            <Pressable onPress={() => router.push({ pathname: '/assinar', params: { produto: 'finais' } })} style={({ pressed }) => [styles.botao, pressed && { opacity: 0.85 }]}>
              <Text style={styles.botaoTexto}>Ver planos</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.secao}>Privacidade</Text>
        <View style={styles.privacidade}>
          <Pressable onPress={trocarRanking} disabled={ocupado} style={styles.linha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.linhaTitulo}>Aparecer no ranking mundial</Text>
              <Text style={styles.linhaSub}>{noRanking ? 'Seu apelido e seus pontos aparecem para todos.' : 'Seus pontos ficam só para você.'}</Text>
            </View>
            <View style={[styles.chave, noRanking && styles.chaveLigada]}>
              <View style={[styles.bolinha, noRanking && styles.bolinhaLigada]} />
            </View>
          </Pressable>
          {confirmar === 'ranking' && (
            <View style={styles.confirma}>
              <Text style={styles.confirmaTexto}>🧑‍🍼 Responsável: você autoriza mostrar o apelido da criança no ranking mundial?</Text>
              <View style={styles.confirmaBotoes}>
                <Pressable onPress={() => setConfirmar(null)} style={[styles.miniBotao, { backgroundColor: '#EEEAF8' }]}>
                  <Text style={[styles.miniTexto, { color: cores.texto }]}>Não</Text>
                </Pressable>
                <Pressable onPress={trocarRanking} style={[styles.miniBotao, { backgroundColor: cores.roxo }]}>
                  <Text style={styles.miniTexto}>Sim, autorizo</Text>
                </Pressable>
              </View>
            </View>
          )}
          <Pressable onPress={() => router.push('/privacidade')} style={styles.linha}>
            <Text style={[styles.linhaTitulo, { flex: 1 }]}>Política de privacidade</Text>
            <Text style={styles.seta}>›</Text>
          </Pressable>
          <Pressable onPress={apagar} disabled={ocupado} style={styles.linha}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.linhaTitulo, { color: '#E0446F' }]}>{confirmar === 'apagar' ? 'Toque de novo para apagar tudo' : 'Apagar minha conta'}</Text>
              <Text style={styles.linhaSub}>
                {confirmar === 'apagar' ? 'Apaga o apelido, os pontos e o caderno. Não dá para desfazer.' : 'Apaga a conta e todos os seus dados.'}
              </Text>
            </View>
            {ocupado && confirmar === 'apagar' && <ActivityIndicator color="#E0446F" />}
          </Pressable>
          {confirmar === 'apagar' && (
            <Pressable onPress={() => setConfirmar(null)} style={styles.cancelar}>
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </Pressable>
          )}
        </View>
        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Pressable
          onPress={async () => {
            await sair();
            router.replace('/entrar');
          }}
          style={({ pressed }) => [styles.sair, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.sairTexto}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, paddingBottom: 48 },
  perfil: { alignItems: 'center', backgroundColor: cores.branco, borderRadius: 28, padding: 22, ...sombra },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: cores.roxo, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: cores.branco, fontSize: 38, fontWeight: '900' },
  apelido: { fontSize: 24, fontWeight: '900', color: cores.texto, marginTop: 12 },
  email: { fontSize: 14, fontWeight: '700', color: cores.textoSuave, marginTop: 2 },
  trocar: { marginTop: 14, borderRadius: 999, backgroundColor: '#ECE6FF', paddingVertical: 9, paddingHorizontal: 16 },
  trocarTexto: { fontSize: 14, fontWeight: '900', color: cores.roxo },
  secao: { fontSize: 17, fontWeight: '900', color: cores.texto, marginTop: 24, marginBottom: 10 },
  plano: { borderRadius: 22, padding: 16 },
  gerenciar: { marginTop: 10, paddingVertical: 6 },
  gerenciarTexto: { fontSize: 14, fontWeight: '900', color: cores.roxo },
  planoNome: { fontSize: 19, fontWeight: '900', color: cores.texto },
  planoTexto: { fontSize: 14.5, color: cores.textoSuave, marginTop: 4, lineHeight: 20 },
  assinar: { marginTop: 12, borderRadius: 22, padding: 16, borderWidth: 2, borderColor: '#FFC93C', backgroundColor: cores.branco },
  assinarTitulo: { fontSize: 18, fontWeight: '900', color: cores.texto },
  assinarTexto: { fontSize: 14.5, color: cores.textoSuave, marginTop: 2 },
  botao: { backgroundColor: cores.roxo, borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 14 },
  botaoTexto: { color: cores.branco, fontSize: 16, fontWeight: '900' },
  desligado: { opacity: 0.45 },
  privacidade: { backgroundColor: cores.branco, borderRadius: 22, paddingHorizontal: 16, ...sombra, shadowOpacity: 0.06 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0ECFA' },
  linhaTitulo: { fontSize: 15.5, fontWeight: '900', color: cores.texto },
  linhaSub: { fontSize: 13, color: cores.textoSuave, marginTop: 2, lineHeight: 18 },
  seta: { fontSize: 22, color: cores.textoSuave, fontWeight: '700' },
  chave: { width: 50, height: 30, borderRadius: 15, backgroundColor: '#D9D3EE', padding: 3 },
  chaveLigada: { backgroundColor: '#2EC4B6' },
  bolinha: { width: 24, height: 24, borderRadius: 12, backgroundColor: cores.branco },
  bolinhaLigada: { transform: [{ translateX: 20 }] },
  confirma: { backgroundColor: '#FFF4D1', borderRadius: 16, padding: 12, gap: 10, marginTop: 10 },
  confirmaTexto: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: cores.texto },
  confirmaBotoes: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  miniBotao: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  miniTexto: { fontSize: 14, fontWeight: '900', color: cores.branco },
  cancelar: { alignSelf: 'flex-start', paddingVertical: 10 },
  cancelarTexto: { fontSize: 14, fontWeight: '900', color: cores.textoSuave },
  erro: { marginTop: 10, color: '#E0446F', fontWeight: '800', fontSize: 14, textAlign: 'center' },
  sair: { marginTop: 28, alignItems: 'center', paddingVertical: 12 },
  sairTexto: { fontSize: 15, fontWeight: '900', color: '#E0446F' },
});
