import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SISTEMAS, type Nivel, type SistemaId } from '../../data/sistemas';
import { cores, sombra } from '../../theme';
import type { Tema } from './tipos';

type Props = { nivel: Nivel; contagem: Record<Tema, number>; onEscolher: (t: Tema) => void };

export function EscolhaTema({ nivel, contagem, onEscolher }: Props) {
  const sistemas = Object.keys(SISTEMAS) as SistemaId[];

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltar}>
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <View>
          <Text style={styles.titulo}>Me testar</Text>
          <Text style={styles.subtitulo}>{nivel === 'iniciais' ? 'Anos Iniciais' : 'Anos Finais'} · escolha um tema</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => onEscolher('tudo')}
          style={({ pressed }) => [styles.tudo, pressed && { transform: [{ scale: 0.97 }] }]}
        >
          <Text style={styles.tudoEmoji}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tudoTitulo}>Corpo inteiro</Text>
            <Text style={styles.tudoTexto}>{contagem.tudo} perguntas misturadas</Text>
          </View>
          <Text style={styles.tudoSeta}>›</Text>
        </Pressable>

        <View style={styles.grade}>
          {sistemas.map((id) => {
            const s = SISTEMAS[id];
            return (
              <Pressable
                key={id}
                onPress={() => onEscolher(id)}
                style={({ pressed }) => [styles.tema, { backgroundColor: s.corClara }, pressed && { transform: [{ scale: 0.95 }] }]}
              >
                <View style={styles.temaEmojiBox}>
                  <Text style={styles.temaEmoji}>{s.emoji}</Text>
                </View>
                <Text style={styles.temaNome} numberOfLines={2}>
                  {s.nome}
                </Text>
                <Text style={[styles.temaQtd, { color: s.cor }]}>{contagem[id]} perguntas</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  voltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  voltarTexto: { fontSize: 30, lineHeight: 32, color: cores.texto, fontWeight: '700', marginTop: -3 },
  titulo: { fontSize: 26, fontWeight: '900', color: cores.texto },
  subtitulo: { fontSize: 14, fontWeight: '600', color: cores.textoSuave },
  lista: { padding: 20, paddingBottom: 48, gap: 16 },
  tudo: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: cores.roxo, borderRadius: 26, padding: 20, ...sombra },
  tudoEmoji: { fontSize: 40 },
  tudoTitulo: { fontSize: 20, fontWeight: '900', color: cores.branco },
  tudoTexto: { fontSize: 14, fontWeight: '600', color: cores.branco, opacity: 0.85, marginTop: 2 },
  tudoSeta: { fontSize: 34, color: cores.branco, fontWeight: '800' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tema: { width: '48%', flexGrow: 1, borderRadius: 24, padding: 16, minHeight: 130 },
  temaEmojiBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  temaEmoji: { fontSize: 26 },
  temaNome: { fontSize: 16, fontWeight: '800', color: cores.texto },
  temaQtd: { fontSize: 13, fontWeight: '800', marginTop: 4 },
});
