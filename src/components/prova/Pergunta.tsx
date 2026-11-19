import { useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SISTEMAS } from '../../data/sistemas';
import { cores, sombra } from '../../theme';
import type { QuestaoNaTela } from './tipos';

const VERDE = '#1FB5A6';
const VERDE_CLARO = '#DDF6F3';
const VERMELHO = '#F0466E';
const VERMELHO_CLARO = '#FFE4EC';
const LETRAS = ['A', 'B', 'C', 'D'];

type Props = {
  item: QuestaoNaTela;
  numero: number; // começa em 1
  total: number;
  onResponder: (escolhida: number) => void;
  onProxima: () => void;
  onSair: () => void;
};

// A tela pai usa key={questao.id}, então cada pergunta nasce com o estado limpo.
export function Pergunta({ item, numero, total, onResponder, onProxima, onSair }: Props) {
  const insets = useSafeAreaInsets();
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [aparecer] = useState(() => new Animated.Value(0));
  const sistema = SISTEMAS[item.questao.sistema];
  const respondeu = escolhida !== null;
  const acertou = escolhida === item.correta;

  const escolher = (i: number) => {
    if (respondeu) return;
    setEscolhida(i);
    onResponder(i);
    Animated.spring(aparecer, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
  };

  const estiloOpcao = (i: number) => {
    if (!respondeu) return null;
    if (i === item.correta) return { backgroundColor: VERDE_CLARO, borderColor: VERDE };
    if (i === escolhida) return { backgroundColor: VERMELHO_CLARO, borderColor: VERMELHO };
    return { opacity: 0.45 };
  };

  const corLetra = (i: number) => {
    if (respondeu && i === item.correta) return VERDE;
    if (respondeu && i === escolhida) return VERMELHO;
    return sistema.cor;
  };

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      {/* Topo: sair + progresso */}
      <View style={styles.topo}>
        <Pressable onPress={onSair} hitSlop={12} style={styles.sair}>
          <Text style={styles.sairTexto}>✕</Text>
        </Pressable>
        <View style={styles.barra}>
          <View style={[styles.barraCheia, { width: `${((numero - (respondeu ? 0 : 1)) / total) * 100}%`, backgroundColor: sistema.cor }]} />
        </View>
        <Text style={styles.contador}>
          {numero}/{total}
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.conteudo, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.chip, { backgroundColor: sistema.corClara }]}>
          <Text style={[styles.chipTexto, { color: sistema.cor }]}>
            {sistema.emoji} {sistema.nome}
          </Text>
        </View>

        <Text style={styles.pergunta}>{item.questao.pergunta}</Text>

        <View style={styles.opcoes}>
          {item.opcoes.map((texto, i) => (
            <Pressable
              key={i}
              onPress={() => escolher(i)}
              disabled={respondeu}
              style={({ pressed }) => [styles.opcao, estiloOpcao(i), pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <View style={[styles.letra, { backgroundColor: corLetra(i) }]}>
                <Text style={styles.letraTexto}>
                  {respondeu && i === item.correta ? '✓' : respondeu && i === escolhida ? '✕' : LETRAS[i]}
                </Text>
              </View>
              <Text style={styles.opcaoTexto}>{texto}</Text>
            </Pressable>
          ))}
        </View>

        {respondeu && (
          <Animated.View
            style={[
              styles.explicacao,
              { backgroundColor: acertou ? VERDE_CLARO : VERMELHO_CLARO },
              { opacity: aparecer, transform: [{ translateY: aparecer.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
            ]}
          >
            <Text style={[styles.explicacaoTitulo, { color: acertou ? VERDE : VERMELHO }]}>
              {acertou ? 'Acertou! 🎉' : 'Quase! 💡'}
            </Text>
            <Text style={styles.explicacaoTexto}>{item.questao.explicacao}</Text>
          </Animated.View>
        )}
      </ScrollView>

      {respondeu && (
        <View style={[styles.rodape, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={onProxima}
            style={({ pressed }) => [styles.botao, { backgroundColor: acertou ? VERDE : cores.roxo }, pressed && { transform: [{ scale: 0.97 }] }]}
          >
            <Text style={styles.botaoTexto}>{numero === total ? 'Ver resultado' : 'Próxima'}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  sair: { width: 40, height: 40, borderRadius: 20, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  sairTexto: { fontSize: 16, fontWeight: '800', color: cores.textoSuave },
  barra: { flex: 1, height: 14, borderRadius: 7, backgroundColor: cores.cinza, overflow: 'hidden' },
  barraCheia: { height: '100%', borderRadius: 7 },
  contador: { fontSize: 15, fontWeight: '800', color: cores.textoSuave, minWidth: 40, textAlign: 'right' },
  conteudo: { padding: 20 },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, marginBottom: 14 },
  chipTexto: { fontSize: 14, fontWeight: '800' },
  pergunta: { fontSize: 24, fontWeight: '900', color: cores.texto, lineHeight: 31, marginBottom: 22 },
  opcoes: { gap: 12 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: cores.branco,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: 'transparent',
    padding: 14,
    ...sombra,
  },
  letra: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  letraTexto: { color: cores.branco, fontSize: 16, fontWeight: '900' },
  opcaoTexto: { flex: 1, fontSize: 16.5, fontWeight: '700', color: cores.texto, lineHeight: 22 },
  explicacao: { marginTop: 20, borderRadius: 20, padding: 18 },
  explicacaoTitulo: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  explicacaoTexto: { fontSize: 15.5, color: cores.texto, lineHeight: 22 },
  rodape: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: cores.fundo },
  botao: { borderRadius: 999, paddingVertical: 18, alignItems: 'center', ...sombra },
  botaoTexto: { color: cores.branco, fontSize: 18, fontWeight: '900' },
});
