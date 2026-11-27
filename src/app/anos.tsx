import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Nivel } from '../data/sistemas';
import { PRODUTOS, reais } from '../lib/assinatura';
import { temAcesso, useConta } from '../lib/conta';
import { cores, sombra } from '../theme';

type Etapa = {
  id: Nivel | 'medio';
  titulo: string;
  anos: string;
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
    emoji: '🧍',
    cor: '#FF5D8F',
    corClara: '#FFE4EC',
  },
  {
    id: 'finais',
    titulo: 'Anos Finais',
    anos: '6º ao 9º ano',
    emoji: '🔬',
    cor: '#7B5CFA',
    corClara: '#ECE6FF',
  },
  {
    id: 'medio',
    titulo: 'Ensino Médio',
    anos: '1ª à 3ª série',
    emoji: '🧬',
    cor: '#2EC4B6',
    corClara: '#DDF6F3',
    bloqueada: true,
  },
];

export default function EscolhaDaEtapa() {
  const { perfil } = useConta();
  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.cabecalho}>
        <Text style={styles.ola} numberOfLines={1}>
          Olá, {perfil?.apelido ?? 'estudante'}! 👋
        </Text>
        <Pressable onPress={() => router.push('/conta')} hitSlop={8} style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.8 }]}>
          <Text style={styles.avatarTexto}>{(perfil?.apelido ?? '?').charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>
      <Text style={styles.titulo}>O que você quer estudar?</Text>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {ETAPAS.map((e) => {
          // Anos Finais: pago. Sem acesso, o cartão leva para a assinatura.
          const aPagar = e.id === 'finais' && !temAcesso(perfil, 'finais');
          return (
          <Pressable
            key={e.id}
            disabled={e.bloqueada}
            onPress={() =>
              aPagar ? router.push({ pathname: '/assinar', params: { produto: 'finais' } }) : router.push({ pathname: '/corpo', params: { nivel: e.id } })
            }
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
              {aPagar && <Text style={[styles.preco, { color: e.cor }]}>🔒 {reais(PRODUTOS.finais.mensal)} por mês</Text>}
            </View>
            {e.bloqueada ? (
              <Text style={styles.cadeado}>🔒</Text>
            ) : (
              <View style={[styles.seta, { backgroundColor: e.cor }]}>
                <Text style={styles.setaTexto}>›</Text>
              </View>
            )}
          </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingTop: 12 },
  ola: { flex: 1, fontSize: 16, fontWeight: '800', color: cores.textoSuave },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.roxo, alignItems: 'center', justifyContent: 'center', ...sombra },
  avatarTexto: { color: cores.branco, fontSize: 19, fontWeight: '900' },
  titulo: { fontSize: 28, fontWeight: '900', color: cores.texto, paddingHorizontal: 22, paddingTop: 6, paddingBottom: 4 },
  lista: { padding: 20, paddingBottom: 48, gap: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 28, padding: 18, ...sombra },
  cardBloqueado: { shadowOpacity: 0, elevation: 0, opacity: 0.85 },
  emojiBox: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 34 },
  anos: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  cardTitulo: { fontSize: 20, fontWeight: '900', color: cores.texto, marginTop: 1 },
  cadeado: { fontSize: 22 },
  preco: { fontSize: 13, fontWeight: '900', marginTop: 3 },
  seta: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  setaTexto: { color: cores.branco, fontSize: 26, fontWeight: '800', lineHeight: 28, marginTop: -2 },
});
