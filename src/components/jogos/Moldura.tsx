import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Nivel } from '../../data/sistemas';
import { calcularPontos, type ModoId, type Resultado } from '../../lib/pontos';
import { lerPartidas, registrarPartida, type ResultadoEnvio } from '../../lib/placar';
import { cores, sombra } from '../../theme';

// Topo comum dos jogos: voltar, título e um contador à direita
export function TopoJogo({ titulo, cor, direita }: { titulo: string; cor: string; direita?: ReactNode }) {
  return (
    <View style={styles.topo}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltar}>
        <Text style={styles.voltarTexto}>‹</Text>
      </Pressable>
      <Text style={[styles.titulo, { color: cor }]} numberOfLines={1}>
        {titulo}
      </Text>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{direita}</View>
    </View>
  );
}

export function Placar({ texto, cor }: { texto: string; cor: string }) {
  return (
    <View style={[styles.placar, { borderColor: cor }]}>
      <Text style={[styles.placarTexto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

// Balão que aparece por um instante (acerto, dica)
export function Balao({ texto, tipo }: { texto: string | null; tipo: 'acerto' | 'dica' }) {
  const [a] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!texto) return;
    a.setValue(0);
    Animated.spring(a, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, [texto, a]);
  if (!texto) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.balao,
        { backgroundColor: tipo === 'acerto' ? '#DDF6F3' : '#FFF1DE', borderColor: tipo === 'acerto' ? '#2EC4B6' : '#FF9F1C' },
        { opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] },
      ]}
    >
      <Text style={styles.balaoTexto}>{texto}</Text>
    </Animated.View>
  );
}

// Tela de fim de jogo: pontuação detalhada, recorde, posição e média mundial
export function FimDeJogo({
  modo,
  nivel,
  resultado,
  titulo,
  texto,
  proximo,
  onDeNovo,
}: {
  modo: ModoId;
  nivel: Nivel;
  resultado: Resultado;
  titulo: string;
  texto: string;
  proximo?: { texto: string; onPress: () => void };
  onDeNovo: () => void;
}) {
  const d = calcularPontos(resultado);
  const [pulo] = useState(() => new Animated.Value(0));
  const [contagem] = useState(() => new Animated.Value(0));
  const [mostrado, setMostrado] = useState(0);
  const [envio, setEnvio] = useState<ResultadoEnvio | null>(null);
  const [recordeAntes, setRecordeAntes] = useState<number | null>(null);
  const enviado = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulo, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulo, { toValue: 0, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
    // Pontos sobem de 0 até o total
    const id = contagem.addListener(({ value }) => setMostrado(Math.round(value)));
    Animated.timing(contagem, { toValue: d.total, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => contagem.removeListener(id);
  }, [pulo, contagem, d.total]);

  // Registra a partida uma vez só (guarda no celular e manda para o ranking)
  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    (async () => {
      const antes = (await lerPartidas()).filter((p) => p.jogo === modo && p.nivel === nivel);
      setRecordeAntes(antes.length ? Math.max(...antes.map((p) => p.pontos)) : null);
      const r = await registrarPartida({
        jogo: modo,
        nivel,
        pontos: d.total,
        acertos: resultado.acertos,
        erros: resultado.erros,
        tempo_ms: Math.max(1000, Math.round(resultado.tempoMs)),
      });
      setEnvio(r);
    })();
  }, [modo, nivel, d.total, resultado]);

  const novoRecorde = recordeAntes !== null && d.total > recordeAntes;

  return (
    <SafeAreaView style={styles.fimTela}>
      <ScrollView contentContainerStyle={styles.fimCentro} showsVerticalScrollIndicator={false}>
        <Animated.Text style={[styles.fimEmoji, { transform: [{ translateY: pulo.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }] }]}>
          {novoRecorde ? '🏆' : '🎉'}
        </Animated.Text>
        <Text style={styles.fimTitulo}>{titulo}</Text>
        <Text style={styles.fimTexto}>{texto}</Text>

        <View style={styles.pontosCaixa}>
          <Text style={styles.pontosNumero}>{mostrado}</Text>
          <Text style={styles.pontosRotulo}>pontos</Text>
          {novoRecorde && <Text style={styles.recorde}>Novo recorde!</Text>}
        </View>

        <View style={styles.detalhe}>
          <LinhaDetalhe emoji="✅" nome={`Acertos (${resultado.acertos})`} valor={`+${d.acertos}`} cor="#1FB5A6" />
          <LinhaDetalhe emoji="⚡" nome={`Agilidade (${d.segundos}s)`} valor={`+${d.agilidade}`} cor="#E8A400" />
          <LinhaDetalhe emoji="❌" nome={`Erros (${resultado.erros})`} valor={d.erros ? `−${d.erros}` : '0'} cor="#F0466E" />
        </View>

        <View style={styles.mundo}>
          {!envio && <Text style={styles.mundoTexto}>Enviando para o ranking…</Text>}
          {envio?.online && (
            <>
              {envio.posicao !== null && <Text style={styles.mundoDestaque}>🌍 Você está em {envio.posicao}º lugar no mundo!</Text>}
              {envio.mediaMundial !== null && <Text style={styles.mundoTexto}>Média mundial deste jogo: {envio.mediaMundial} pontos</Text>}
            </>
          )}
          {envio && !envio.online && (
            <Text style={styles.mundoTexto}>
              {recordeAntes !== null ? `Seu recorde neste jogo: ${Math.max(recordeAntes, d.total)} pontos` : 'Primeira partida neste jogo!'}
            </Text>
          )}
        </View>

        <View style={styles.botoes}>
          {proximo && (
            <Pressable onPress={proximo.onPress} style={({ pressed }) => [styles.botao, { backgroundColor: cores.roxo }, pressed && styles.apertado]}>
              <Text style={styles.botaoTexto}>{proximo.texto}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={onDeNovo}
            style={({ pressed }) => [styles.botao, proximo ? styles.botaoClaro : { backgroundColor: cores.roxo }, pressed && styles.apertado]}
          >
            <Text style={[styles.botaoTexto, proximo && { color: cores.texto }]}>Jogar de novo</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: '/ranking', params: { nivel, modo } })}
            style={({ pressed }) => [styles.botao, styles.botaoClaro, pressed && styles.apertado]}
          >
            <Text style={[styles.botaoTexto, { color: cores.texto }]}>🏆 Ver ranking</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}>
            <Text style={styles.linkTexto}>Outros jogos</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinhaDetalhe({ emoji, nome, valor, cor }: { emoji: string; nome: string; valor: string; cor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaNome}>
        {emoji} {nome}
      </Text>
      <Text style={[styles.linhaValor, { color: cor }]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  voltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  voltarTexto: { fontSize: 30, lineHeight: 32, color: cores.texto, fontWeight: '700', marginTop: -3 },
  titulo: { flex: 1, fontSize: 21, fontWeight: '900' },
  placar: { borderWidth: 2, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12, backgroundColor: cores.branco },
  placarTexto: { fontSize: 14, fontWeight: '900' },
  balao: { alignSelf: 'center', borderWidth: 2, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, maxWidth: 340, ...sombra },
  balaoTexto: { fontSize: 16, fontWeight: '800', color: cores.texto, textAlign: 'center', lineHeight: 22 },
  fimTela: { flex: 1, backgroundColor: cores.fundo },
  fimCentro: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  fimEmoji: { fontSize: 64 },
  fimTitulo: { fontSize: 28, fontWeight: '900', color: cores.texto, marginTop: 4, textAlign: 'center' },
  fimTexto: { fontSize: 15, color: cores.textoSuave, textAlign: 'center', marginTop: 4, lineHeight: 21, maxWidth: 320 },
  pontosCaixa: { alignItems: 'center', marginTop: 16 },
  pontosNumero: { fontSize: 64, fontWeight: '900', color: cores.roxo, lineHeight: 70 },
  pontosRotulo: { fontSize: 15, fontWeight: '800', color: cores.textoSuave, marginTop: -4 },
  recorde: { marginTop: 6, fontSize: 14, fontWeight: '900', color: '#E8A400', backgroundColor: '#FFF4D1', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, overflow: 'hidden' },
  detalhe: { alignSelf: 'stretch', backgroundColor: cores.branco, borderRadius: 20, padding: 14, marginTop: 16, gap: 8, ...sombra },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linhaNome: { fontSize: 15, fontWeight: '700', color: cores.texto },
  linhaValor: { fontSize: 16, fontWeight: '900' },
  mundo: { marginTop: 14, alignItems: 'center', gap: 4 },
  mundoDestaque: { fontSize: 16, fontWeight: '900', color: cores.texto, textAlign: 'center' },
  mundoTexto: { fontSize: 14, fontWeight: '700', color: cores.textoSuave, textAlign: 'center' },
  botoes: { alignSelf: 'stretch', gap: 10, marginTop: 20 },
  botao: { borderRadius: 999, paddingVertical: 17, alignItems: 'center', ...sombra },
  botaoClaro: { backgroundColor: cores.branco },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  apertado: { transform: [{ scale: 0.97 }] },
  link: { alignItems: 'center', paddingVertical: 10 },
  linkTexto: { fontSize: 15, fontWeight: '800', color: cores.textoSuave },
});
