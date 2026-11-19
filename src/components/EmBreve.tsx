import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, sombra } from '../theme';

type Props = { emoji: string; titulo: string; texto: string; cor: string; corClara: string };

// Tela provisória para as seções que ainda vão ser construídas
export function EmBreve({ emoji, titulo, texto, cor, corClara }: Props) {
  return (
    <SafeAreaView style={styles.tela}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltar}>
        <Text style={styles.voltarTexto}>‹</Text>
      </Pressable>
      <View style={styles.centro}>
        <View style={[styles.emojiBox, { backgroundColor: corClara }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.texto}>{texto}</Text>
        <View style={[styles.chip, { backgroundColor: corClara }]}>
          <Text style={[styles.chipTexto, { color: cor }]}>Em construção</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  voltar: { margin: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  voltarTexto: { fontSize: 30, lineHeight: 32, color: cores.texto, fontWeight: '700', marginTop: -3 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: -80 },
  emojiBox: { width: 110, height: 110, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emoji: { fontSize: 56 },
  titulo: { fontSize: 28, fontWeight: '900', color: cores.texto, textAlign: 'center' },
  texto: { fontSize: 16, color: cores.textoSuave, textAlign: 'center', marginTop: 10, lineHeight: 23, maxWidth: 300 },
  chip: { marginTop: 22, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  chipTexto: { fontSize: 14, fontWeight: '800' },
});
