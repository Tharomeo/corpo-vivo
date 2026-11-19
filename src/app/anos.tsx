import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Nivel } from '../data/sistemas';
import { cores, sombra } from '../theme';

type Etapa = {
  id: Nivel | 'medio' | 'medicina';
  titulo: string;
  anos: string;
  descricao: string;
  emoji: string;
  cor: string;
  corClara: string;
  bloqueada?: boolean;
};

const ETAPAS: Etapa[] = [
  {
    id: 'iniciais',
    titulo: 'Anos Iniciais',
    anos: '1º ao 5º ano',
    descricao: 'O corpo em camadas: pele, músculos, ossos e órgãos',
    emoji: '🧍',
    cor: '#FF5D8F',
    corClara: '#FFE4EC',
  },
  {
    id: 'finais',
    titulo: 'Anos Finais',
    anos: '6º ao 9º ano',
    descricao: 'Mais detalhes, zoom até as células e o jogo das ervilhas',
    emoji: '🔬',
    cor: '#7B5CFA',
    corClara: '#ECE6FF',
  },
  {
    id: 'medio',
    titulo: 'Ensino Médio',
    anos: '1ª à 3ª série',
    descricao: 'Premium · em breve',
    emoji: '🧬',
    cor: '#2EC4B6',
    corClara: '#DDF6F3',
    bloqueada: true,
  },
  {
    id: 'medicina',
    titulo: 'Medicina',
    anos: 'Graduação',
    descricao: 'Premium · em breve',
    emoji: '🩺',
    cor: '#3A86FF',
    corClara: '#E1ECFF',
    bloqueada: true,
  },
];

export default function EscolhaDaEtapa() {
  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <Text style={styles.titulo}>O que você quer estudar?</Text>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {ETAPAS.map((e) => (
          <Pressable
            key={e.id}
            disabled={e.bloqueada}
            onPress={() => router.push({ pathname: '/corpo', params: { nivel: e.id } })}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: e.bloqueada ? e.corClara : cores.branco },
              e.bloqueada && styles.cardBloqueado,
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <View style={[styles.emojiBox, { backgroundColor: e.bloqueada ? cores.branco : e.corClara }]}>
              <Text style={styles.emoji}>{e.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.anos, { color: e.cor }]}>{e.anos}</Text>
              <Text style={styles.cardTitulo}>{e.titulo}</Text>
              <Text style={styles.descricao}>{e.descricao}</Text>
            </View>
            {e.bloqueada ? (
              <Text style={styles.cadeado}>🔒</Text>
            ) : (
              <View style={[styles.seta, { backgroundColor: e.cor }]}>
                <Text style={styles.setaTexto}>›</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  titulo: { fontSize: 28, fontWeight: '900', color: cores.texto, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 4 },
  lista: { padding: 20, paddingBottom: 48, gap: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 28, padding: 18, ...sombra },
  cardBloqueado: { shadowOpacity: 0, elevation: 0, opacity: 0.85 },
  emojiBox: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 34 },
  anos: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  cardTitulo: { fontSize: 20, fontWeight: '900', color: cores.texto, marginTop: 1 },
  descricao: { fontSize: 14, color: cores.textoSuave, marginTop: 3, lineHeight: 19 },
  cadeado: { fontSize: 22 },
  seta: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  setaTexto: { color: cores.branco, fontSize: 26, fontWeight: '800', lineHeight: 28, marginTop: -2 },
});
