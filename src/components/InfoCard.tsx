import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ORGAOS, SISTEMAS, type Nivel } from '../data/sistemas';
import { cores, sombra } from '../theme';

type Props = { organ: string; nivel: Nivel; onClose: () => void; bottomInset: number };

export function InfoCard({ organ, nivel, onClose, bottomInset }: Props) {
  const orgao = ORGAOS[organ];
  const sistema = orgao ? SISTEMAS[orgao.sistema] : null;
  const [subir] = useState(() => new Animated.Value(0));

  useEffect(() => {
    subir.setValue(0);
    Animated.spring(subir, { toValue: 1, useNativeDriver: true, friction: 8, tension: 70 }).start();
  }, [organ, subir]);

  if (!orgao || !sistema) return null;

  const translateY = subir.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    <Animated.View style={[styles.card, { paddingBottom: bottomInset + 16, transform: [{ translateY }] }]}>
      <View style={[styles.faixa, { backgroundColor: sistema.corClara }]}>
        <View style={[styles.emojiBox, { backgroundColor: cores.branco }]}>
          <Text style={styles.emoji}>{sistema.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sistemaNome, { color: sistema.cor }]}>{sistema.nome}</Text>
          <Text style={styles.orgaoNome}>{orgao.nome}</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} style={styles.fechar}>
          <Text style={styles.fecharTexto}>✕</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.corpo} contentContainerStyle={{ paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.fato, { borderColor: sistema.cor }]}>
          <Text style={styles.fatoTexto}>{orgao.fato}</Text>
        </View>

        <Text style={styles.texto}>{nivel === 'iniciais' ? sistema.iniciais : sistema.finais}</Text>

        {nivel === 'finais' && (
          <>
            <Text style={styles.subtitulo}>Saiba mais</Text>
            {sistema.saibaMais.map((s, i) => (
              <View key={i} style={styles.item}>
                <View style={[styles.ponto, { backgroundColor: sistema.cor }]} />
                <Text style={styles.itemTexto}>{s}</Text>
              </View>
            ))}
            <View style={[styles.chip, { backgroundColor: sistema.corClara }]}>
              <Text style={[styles.chipTexto, { color: sistema.cor }]}>🔬 Zoom na célula: {sistema.celula} · em breve</Text>
            </View>
          </>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '58%',
    backgroundColor: cores.branco,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    ...sombra,
  },
  faixa: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  emojiBox: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 },
  sistemaNome: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  orgaoNome: { fontSize: 24, fontWeight: '900', color: cores.texto, marginTop: 1 },
  fechar: { width: 36, height: 36, borderRadius: 18, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center' },
  fecharTexto: { fontSize: 16, color: cores.textoSuave, fontWeight: '800' },
  corpo: { paddingHorizontal: 20, paddingTop: 16 },
  fato: { borderLeftWidth: 4, paddingLeft: 12, marginBottom: 14 },
  fatoTexto: { fontSize: 16, fontWeight: '700', color: cores.texto, lineHeight: 22 },
  texto: { fontSize: 15.5, color: cores.textoSuave, lineHeight: 23 },
  subtitulo: { fontSize: 16, fontWeight: '800', color: cores.texto, marginTop: 18, marginBottom: 8 },
  item: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  ponto: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
  itemTexto: { flex: 1, fontSize: 15, color: cores.textoSuave, lineHeight: 22 },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginTop: 10 },
  chipTexto: { fontSize: 13, fontWeight: '800' },
});
