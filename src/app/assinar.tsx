import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopoJogo } from '../components/jogos/Moldura';
import { assinar, PRODUTOS, reais, VENDA_MEDIO_ATIVA, type Periodo, type Produto } from '../lib/assinatura';
import { temAcesso, useConta } from '../lib/conta';
import { cores, sombra } from '../theme';

// Assinar uma etapa paga. O pagamento acontece na página da Stripe; na volta, o app confere o acesso.

const dataBR = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '');

export default function Assinar() {
  const params = useLocalSearchParams<{ produto?: string; status?: string }>();
  const produto: Produto = params.produto === 'medio' ? 'medio' : 'finais';
  const p = PRODUTOS[produto];
  const conta = useConta();
  const liberado = temAcesso(conta.perfil, produto);
  const [periodo, setPeriodo] = useState<Periodo>('mensal');
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [conferindo, setConferindo] = useState(params.status === 'ok');
  const aVenda = produto === 'finais' || VENDA_MEDIO_ATIVA;

  // Ao voltar para a tela, busca o acesso de novo
  useFocusEffect(
    useCallback(() => {
      conta.recarregarPerfil();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Voltou do pagamento: a Stripe avisa o servidor em alguns segundos (no Pix pode demorar mais)
  useEffect(() => {
    if (!conferindo || liberado) return;
    let vezes = 0;
    const t = setInterval(() => {
      vezes += 1;
      conta.recarregarPerfil();
      if (vezes >= 10) {
        clearInterval(t);
        setConferindo(false);
      }
    }, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conferindo, liberado]);

  const pagar = async () => {
    setErro(null);
    if (conta.modoTeste) {
      await conta.simularPagamento(produto, periodo === 'mensal' ? 32 : 365);
      return;
    }
    setAbrindo(true);
    const e = await assinar(produto, periodo);
    setAbrindo(false);
    if (e) setErro(e);
  };

  const ate = produto === 'finais' ? conta.perfil?.acessoFinaisAte ?? conta.perfil?.acessoMedioAte ?? null : conta.perfil?.acessoMedioAte ?? null;

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <TopoJogo titulo="Assinatura" cor={p.cor} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={[styles.cabeca, { backgroundColor: p.corClara }]}>
          <Text style={styles.emoji}>{p.emoji}</Text>
          <Text style={[styles.nome, { color: p.cor }]}>{p.nome}</Text>
          <Text style={styles.descricao}>{p.descricao}</Text>
        </View>

        {liberado ? (
          <View style={styles.ok}>
            <Text style={styles.okTitulo}>✅ Liberado!</Text>
            <Text style={styles.okTexto}>Seu acesso vale até {dataBR(ate)}.</Text>
            <Pressable
              onPress={() => router.replace({ pathname: '/corpo', params: { nivel: 'finais' } })}
              style={({ pressed }) => [styles.botao, { backgroundColor: p.cor }, pressed && styles.apertado]}
            >
              <Text style={styles.botaoTexto}>Começar a estudar</Text>
            </Pressable>
          </View>
        ) : !aVenda ? (
          <View style={styles.ok}>
            <Text style={styles.okTitulo}>🚧 Em construção</Text>
            <Text style={styles.okTexto}>O {p.nome} ainda está sendo preparado. Assim que ficar pronto, ele aparece aqui.</Text>
          </View>
        ) : conferindo ? (
          <View style={styles.ok}>
            <ActivityIndicator color={p.cor} size="large" />
            <Text style={styles.okTexto}>Conferindo o pagamento… No Pix, a confirmação pode levar alguns minutos.</Text>
          </View>
        ) : (
          <>
            {params.status === 'cancelado' && <Text style={styles.aviso}>O pagamento não foi concluído. Pode tentar de novo quando quiser.</Text>}
            {params.status === 'ok' && <Text style={styles.aviso}>Ainda não recebemos a confirmação. Se pagou no Pix, volte aqui em alguns minutos.</Text>}

            {(['mensal', 'anual'] as const).map((per) => {
              const sel = periodo === per;
              return (
                <Pressable key={per} onPress={() => setPeriodo(per)} style={[styles.plano, sel && { borderColor: p.cor, backgroundColor: p.corClara }]}>
                  <View style={[styles.radio, sel && { borderColor: p.cor }]}>{sel && <View style={[styles.radioDentro, { backgroundColor: p.cor }]} />}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planoNome}>
                      {per === 'mensal' ? 'Mensal' : 'Anual'}
                      {per === 'anual' && <Text style={[styles.selo, { color: p.cor }]}>  2 meses grátis</Text>}
                    </Text>
                    <Text style={styles.planoSub}>{per === 'mensal' ? 'Cartão de crédito. Renova todo mês; cancele quando quiser.' : `Cartão ou Pix, pagamento único. Vale 12 meses (${reais(p.anual / 12)} por mês).`}</Text>
                  </View>
                  <Text style={styles.preco}>
                    {reais(per === 'mensal' ? p.mensal : p.anual)}
                    <Text style={styles.precoPor}>{per === 'mensal' ? '/mês' : '/ano'}</Text>
                  </Text>
                </Pressable>
              );
            })}

            <Pressable onPress={pagar} disabled={abrindo} style={({ pressed }) => [styles.botao, { backgroundColor: p.cor }, pressed && styles.apertado]}>
              {abrindo ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.botaoTexto}>{conta.modoTeste ? '🧪 Simular pagamento (modo de teste)' : 'Ir para o pagamento'}</Text>}
            </Pressable>
            {erro && <Text style={styles.erro}>{erro}</Text>}

            <View style={styles.infos}>
              <Text style={styles.info}>🧑‍🍼 Se você é menor de idade, peça para um adulto responsável fazer o pagamento.</Text>
              <Text style={styles.info}>🔒 O pagamento é feito na página segura da Stripe. O Corpo Vivo não vê os dados do cartão.</Text>
              <Text style={styles.info}>↩️ Arrependeu? Em até 7 dias após a compra, devolvemos o valor: escreva para corpovivobr@gmail.com.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 18, paddingBottom: 40, gap: 14 },
  cabeca: { borderRadius: 26, padding: 20, alignItems: 'center', gap: 6 },
  emoji: { fontSize: 46 },
  nome: { fontSize: 24, fontWeight: '900' },
  descricao: { fontSize: 15, lineHeight: 21, color: cores.texto, textAlign: 'center' },
  aviso: { fontSize: 14, fontWeight: '800', color: '#8A6A00', backgroundColor: '#FFF4D1', borderRadius: 14, padding: 12 },
  plano: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.branco, borderRadius: 22, borderWidth: 3, borderColor: '#E3DBFF', padding: 16, ...sombra, shadowOpacity: 0.06 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: '#C9C1E8', alignItems: 'center', justifyContent: 'center' },
  radioDentro: { width: 12, height: 12, borderRadius: 6 },
  planoNome: { fontSize: 17, fontWeight: '900', color: cores.texto },
  selo: { fontSize: 13, fontWeight: '900' },
  planoSub: { fontSize: 13, lineHeight: 18, color: cores.textoSuave, marginTop: 2 },
  preco: { fontSize: 19, fontWeight: '900', color: cores.texto },
  precoPor: { fontSize: 13, fontWeight: '700', color: cores.textoSuave },
  botao: { borderRadius: 999, paddingVertical: 17, alignItems: 'center', ...sombra },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  apertado: { transform: [{ scale: 0.98 }] },
  erro: { color: '#E0446F', fontWeight: '800', fontSize: 14.5, textAlign: 'center' },
  infos: { gap: 8, marginTop: 4 },
  info: { fontSize: 13.5, lineHeight: 19, color: cores.textoSuave, fontWeight: '600' },
  ok: { backgroundColor: cores.branco, borderRadius: 22, padding: 20, gap: 12, alignItems: 'center', ...sombra, shadowOpacity: 0.06 },
  okTitulo: { fontSize: 22, fontWeight: '900', color: cores.texto },
  okTexto: { fontSize: 15, lineHeight: 21, color: cores.textoSuave, textAlign: 'center' },
});
