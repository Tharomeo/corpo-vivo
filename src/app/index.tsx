import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { destinoInicial, useConta } from '../lib/conta';
import { cores, sombra } from '../theme';

// Bolhas decorativas do fundo
const BOLHAS = [
  { size: 220, top: -60, left: -70, color: '#FFD6E3' },
  { size: 160, top: 120, right: -50, color: '#D9F4F1' },
  { size: 120, bottom: 170, left: -30, color: '#FFEBC2' },
  { size: 200, bottom: -70, right: -60, color: '#E3DBFF' },
];

const ICONES = [
  { e: '🧠', bg: '#F1E8FF' },
  { e: '❤️', bg: '#FFE6EA' },
  { e: '🫁', bg: '#E3F7FF' },
  { e: '🦴', bg: '#FFF7E3' },
];

const DURACAO = 4000;

export default function Inicio() {
  const [progresso] = useState(() => new Animated.Value(0));

  const conta = useConta();
  const [tempoAcabou, setTempoAcabou] = useState(false);

  // Tela de abertura: enche a barrinha enquanto confere se já existe login
  useEffect(() => {
    Animated.timing(progresso, { toValue: 1, duration: DURACAO, easing: Easing.inOut(Easing.quad), useNativeDriver: false }).start();
    const t = setTimeout(() => setTempoAcabou(true), DURACAO);
    return () => clearTimeout(t);
  }, [progresso]);

  // Sem login vai para Entrar; sem apelido vai para Apelido; senão, escolha da etapa
  useEffect(() => {
    if (tempoAcabou && !conta.carregando) router.replace(destinoInicial(conta));
  }, [tempoAcabou, conta]);

  const largura = progresso.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.tela}>
      {BOLHAS.map((b, i) => (
        <View
          key={i}
          style={[styles.bolha, { width: b.size, height: b.size, borderRadius: b.size / 2, backgroundColor: b.color, top: b.top, left: b.left, right: b.right, bottom: b.bottom }]}
        />
      ))}
      <SafeAreaView style={styles.conteudo}>
        <View style={styles.icones}>
          {ICONES.map((i, k) => (
            <View key={k} style={[styles.icone, { backgroundColor: i.bg, transform: [{ rotate: `${k % 2 ? 8 : -8}deg` }] }]}>
              <Text style={styles.iconeTexto}>{i.e}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.titulo}>
          Corpo <Text style={{ color: cores.rosa }}>Vivo</Text>
        </Text>
        <Text style={styles.subtitulo}>Explore o corpo humano por dentro, camada por camada.</Text>

        <View style={styles.barra}>
          <Animated.View style={[styles.barraCheia, { width: largura }]} />
        </View>

        <Text style={styles.rodape}>Ensino Fundamental gratuito</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, overflow: 'hidden' },
  bolha: { position: 'absolute' },
  conteudo: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  icones: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  icone: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...sombra },
  iconeTexto: { fontSize: 30 },
  titulo: { fontSize: 46, fontWeight: '900', color: cores.texto, letterSpacing: -1 },
  subtitulo: { fontSize: 17, color: cores.textoSuave, textAlign: 'center', marginTop: 10, lineHeight: 24, maxWidth: 300 },
  barra: { marginTop: 48, width: 180, height: 10, borderRadius: 5, backgroundColor: cores.cinza, overflow: 'hidden' },
  barraCheia: { height: '100%', borderRadius: 5, backgroundColor: cores.roxo },
  rodape: { marginTop: 18, color: cores.textoSuave, fontSize: 13, fontWeight: '600' },
});
