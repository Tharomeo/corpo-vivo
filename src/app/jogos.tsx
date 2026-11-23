import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopoJogo } from '../components/jogos/Moldura';
import { JOGOS } from '../data/jogos';
import type { Nivel } from '../data/sistemas';
import { cores, sombra } from '../theme';

export default function Jogos() {
  const params = useLocalSearchParams<{ nivel?: string }>();
  const nivel: Nivel = params.nivel === 'finais' ? 'finais' : 'iniciais';

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <TopoJogo titulo="Jogos" cor={cores.texto} />
      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>{nivel === 'iniciais' ? 'Anos Iniciais' : 'Anos Finais'} · aprenda brincando</Text>
        {JOGOS[nivel].map((j) => (
          <Pressable
            key={j.rota}
            onPress={() => router.push({ pathname: j.rota as '/jogo-monte', params: { nivel } })}
            style={({ pressed }) => [styles.card, { backgroundColor: j.corClara }, pressed && { transform: [{ scale: 0.97 }] }]}
          >
            <View style={[styles.emojiBox, { backgroundColor: cores.branco }]}>
              <Text style={styles.emoji}>{j.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{j.titulo}</Text>
              <Text style={styles.descricao}>{j.descricao}</Text>
              {j.emBreve && <Text style={[styles.breve, { color: j.cor }]}>Em construção</Text>}
            </View>
            <View style={[styles.play, { backgroundColor: j.cor }]}>
              <Text style={styles.playTexto}>▶</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: 20, paddingTop: 4, paddingBottom: 48, gap: 14 },
  sub: { fontSize: 14, fontWeight: '700', color: cores.textoSuave, marginBottom: 4 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 26, padding: 16, ...sombra },
  emojiBox: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 36 },
  titulo: { fontSize: 19, fontWeight: '900', color: cores.texto },
  descricao: { fontSize: 14, color: cores.textoSuave, marginTop: 2, lineHeight: 19 },
  breve: { fontSize: 12, fontWeight: '900', marginTop: 4 },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  playTexto: { color: cores.branco, fontSize: 16, fontWeight: '900', marginLeft: 2 },
});
