import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ORGAOS, PARTE_ORGAO, SISTEMAS, type Nivel } from '../data/sistemas';
import { cores, sombra } from '../theme';

type Props = {
  organ: string;
  nivel: Nivel;
  onClose: () => void;
  onFocarParte: (orgaoId: string) => void;
  bottomInset: number;
};

export function InfoCard({ organ, nivel, onClose, onFocarParte, bottomInset }: Props) {
  const orgao = ORGAOS[organ];
  const sistema = orgao ? SISTEMAS[orgao.sistema] : null;
  const [subir] = useState(() => new Animated.Value(0));
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    subir.setValue(0);
    Animated.spring(subir, { toValue: 1, useNativeDriver: true, friction: 8, tension: 70 }).start();
  }, [organ, subir]);

  if (!orgao || !sistema) return null;

  const c = sistema[nivel];
  const translateY = subir.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    <Animated.View
      style={[styles.card, { maxHeight: expandido ? '90%' : '58%', paddingBottom: bottomInset + 12, transform: [{ translateY }] }]}
    >
      <Pressable onPress={() => setExpandido((e) => !e)} style={[styles.faixa, { backgroundColor: sistema.corClara }]}>
        <View style={styles.alca} />
        <View style={styles.faixaLinha}>
          <View style={styles.emojiBox}>
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
        <Text style={[styles.expandir, { color: sistema.cor }]}>{expandido ? 'Toque para diminuir ▾' : 'Toque para ver tudo ▴'}</Text>
      </Pressable>

      <ScrollView style={styles.corpo} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.fato, { borderColor: sistema.cor }]}>
          <Text style={styles.fatoTexto}>{orgao.fato}</Text>
          <Text style={styles.orgaoTexto}>{orgao[nivel]}</Text>
        </View>

        <Secao titulo={`Sobre: ${sistema.nome}`}>
          <Text style={styles.texto}>{c.resumo}</Text>
        </Secao>

        <Secao titulo="Como funciona">
          {c.comoFunciona.map((passo, i) => (
            <View key={i} style={styles.passo}>
              <View style={[styles.passoNumero, { backgroundColor: sistema.cor }]}>
                <Text style={styles.passoNumeroTexto}>{i + 1}</Text>
              </View>
              <Text style={styles.itemTexto}>{passo}</Text>
            </View>
          ))}
        </Secao>

        <Secao titulo="Partes">
          <Text style={styles.dicaPartes}>Toque numa parte para ver no corpo</Text>
          <View style={styles.partes}>
            {sistema.partes.map((p) => {
              const alvo = PARTE_ORGAO[p];
              if (!alvo) {
                return (
                  <View key={p} style={[styles.parte, { backgroundColor: sistema.corClara }]}>
                    <Text style={[styles.parteTexto, { color: sistema.cor }]}>{p}</Text>
                  </View>
                );
              }
              return (
                <Pressable
                  key={p}
                  onPress={() => {
                    setExpandido(false);
                    onFocarParte(alvo);
                  }}
                  style={({ pressed }) => [
                    styles.parte,
                    styles.parteClicavel,
                    { borderColor: sistema.cor, backgroundColor: sistema.corClara },
                    pressed && { transform: [{ scale: 0.94 }] },
                  ]}
                >
                  <Text style={[styles.parteTexto, { color: sistema.cor }]}>{p}</Text>
                </Pressable>
              );
            })}
          </View>
        </Secao>

        <Secao titulo="Saiba mais">
          {c.saibaMais.map((s, i) => (
            <View key={i} style={styles.item}>
              <View style={[styles.ponto, { backgroundColor: sistema.cor }]} />
              <Text style={styles.itemTexto}>{s}</Text>
            </View>
          ))}
        </Secao>

        <Secao titulo="Cuide bem 💚">
          {c.saude.map((s, i) => (
            <View key={i} style={styles.item}>
              <View style={[styles.ponto, { backgroundColor: '#2EC4B6' }]} />
              <Text style={styles.itemTexto}>{s}</Text>
            </View>
          ))}
        </Secao>

        {nivel === 'finais' && (
          <View style={[styles.chip, { backgroundColor: sistema.corClara }]}>
            <Text style={[styles.chipTexto, { color: sistema.cor }]}>🔬 Zoom na célula: {sistema.celula} · em breve</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.subtitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.branco,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    ...sombra,
  },
  faixa: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 },
  alca: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(43,35,80,0.18)', marginBottom: 10 },
  faixaLinha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emojiBox: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.branco },
  emoji: { fontSize: 28 },
  sistemaNome: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  orgaoNome: { fontSize: 24, fontWeight: '900', color: cores.texto, marginTop: 1 },
  fechar: { width: 36, height: 36, borderRadius: 18, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center' },
  fecharTexto: { fontSize: 16, color: cores.textoSuave, fontWeight: '800' },
  expandir: { fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  // flexShrink: sem isso a lista passa do limite do cartão e o fim fica cortado
  corpo: { flexShrink: 1, paddingHorizontal: 20, paddingTop: 16 },
  fato: { borderLeftWidth: 4, paddingLeft: 12, marginBottom: 4 },
  fatoTexto: { fontSize: 16.5, fontWeight: '800', color: cores.texto, lineHeight: 23 },
  orgaoTexto: { fontSize: 15, color: cores.textoSuave, lineHeight: 22, marginTop: 4 },
  secao: { marginTop: 18 },
  subtitulo: { fontSize: 16, fontWeight: '900', color: cores.texto, marginBottom: 8 },
  texto: { fontSize: 15.5, color: cores.textoSuave, lineHeight: 23 },
  passo: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  passoNumero: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  passoNumeroTexto: { color: cores.branco, fontSize: 13, fontWeight: '900' },
  partes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  parte: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  parteTexto: { fontSize: 13, fontWeight: '800' },
  parteClicavel: { borderWidth: 1.5 },
  dicaPartes: { fontSize: 12.5, fontWeight: '700', color: cores.textoSuave, marginBottom: 8, marginTop: -2 },
  item: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  ponto: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
  itemTexto: { flex: 1, fontSize: 15, color: cores.textoSuave, lineHeight: 22 },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginTop: 14 },
  chipTexto: { fontSize: 13, fontWeight: '800' },
});
