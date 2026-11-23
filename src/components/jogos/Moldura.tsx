import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Tela de fim de jogo com estrelas
export function FimDeJogo({
  estrelas,
  titulo,
  texto,
  proximo,
  onDeNovo,
}: {
  estrelas: number;
  titulo: string;
  texto: string;
  proximo?: { texto: string; onPress: () => void };
  onDeNovo: () => void;
}) {
  const [pulo] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulo, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulo, { toValue: 0, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
  }, [pulo]);

  return (
    <SafeAreaView style={styles.fimTela}>
      <View style={styles.fimCentro}>
        <Animated.Text style={[styles.fimEmoji, { transform: [{ translateY: pulo.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }] }]}>
          🎉
        </Animated.Text>
        <Text style={styles.fimTitulo}>{titulo}</Text>
        <View style={styles.estrelas}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={[styles.estrela, { color: i < estrelas ? '#FFC93C' : '#E3DFF2' }]}>
              ★
            </Text>
          ))}
        </View>
        <Text style={styles.fimTexto}>{texto}</Text>
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
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}>
            <Text style={styles.linkTexto}>Outros jogos</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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
  fimCentro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  fimEmoji: { fontSize: 80 },
  fimTitulo: { fontSize: 30, fontWeight: '900', color: cores.texto, marginTop: 8, textAlign: 'center' },
  estrelas: { flexDirection: 'row', gap: 6, marginTop: 6 },
  estrela: { fontSize: 54, lineHeight: 60 },
  fimTexto: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 8, lineHeight: 23, maxWidth: 320 },
  botoes: { alignSelf: 'stretch', gap: 12, marginTop: 28 },
  botao: { borderRadius: 999, paddingVertical: 17, alignItems: 'center', ...sombra },
  botaoClaro: { backgroundColor: cores.branco },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  apertado: { transform: [{ scale: 0.97 }] },
  link: { alignItems: 'center', paddingVertical: 10 },
  linkTexto: { fontSize: 15, fontWeight: '800', color: cores.textoSuave },
});
