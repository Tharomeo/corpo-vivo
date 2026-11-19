import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ORGAOS, SISTEMAS, type Nivel } from '../../data/sistemas';
import { cores, sombra } from '../../theme';
import type { Resposta } from './tipos';

type Props = {
  respostas: Resposta[];
  nivel: Nivel;
  onDeNovo: () => void;
  onOutroTema: () => void;
  onVoltarCorpo: () => void;
};

function avaliacao(pct: number) {
  if (pct >= 0.9) return { emoji: '🏆', titulo: 'Mandou muito bem!', cor: '#FFC93C', estrelas: 3 };
  if (pct >= 0.7) return { emoji: '🎉', titulo: 'Muito bom!', cor: '#2EC4B6', estrelas: 2 };
  if (pct >= 0.5) return { emoji: '💪', titulo: 'Está no caminho!', cor: '#3A86FF', estrelas: 1 };
  return { emoji: '📚', titulo: 'Bora revisar e tentar de novo', cor: '#FF5D8F', estrelas: 0 };
}

export function Resultado({ respostas, nivel, onDeNovo, onOutroTema, onVoltarCorpo }: Props) {
  const insets = useSafeAreaInsets();
  const total = respostas.length;
  const acertos = respostas.filter((r) => r.escolhida === r.item.correta).length;
  const erros = respostas.filter((r) => r.escolhida !== r.item.correta);
  const a = avaliacao(total ? acertos / total : 0);

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.conteudo, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.placar, { backgroundColor: a.cor }]}>
          <Text style={styles.emoji}>{a.emoji}</Text>
          <Text style={styles.titulo}>{a.titulo}</Text>
          <Text style={styles.nota}>
            {acertos} de {total}
          </Text>
          <View style={styles.estrelas}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={[styles.estrela, { color: i < a.estrelas ? cores.branco : 'rgba(43,35,80,0.18)' }]}>
                ★
              </Text>
            ))}
          </View>
        </View>

        {erros.length > 0 && (
          <>
            <Text style={styles.secao}>Para revisar</Text>
            {erros.map((r) => {
              const s = SISTEMAS[r.item.questao.sistema];
              return (
                <View key={r.item.questao.id} style={styles.revisao}>
                  <Text style={[styles.revisaoSistema, { color: s.cor }]}>
                    {s.emoji} {s.nome}
                  </Text>
                  <Text style={styles.revisaoPergunta}>{r.item.questao.pergunta}</Text>
                  <Text style={styles.revisaoCerta}>✓ {r.item.opcoes[r.item.correta]}</Text>
                  <Text style={styles.revisaoTexto}>{r.item.questao.explicacao}</Text>
                  <Pressable
                    onPress={() => router.push({ pathname: '/corpo', params: { nivel, foco: r.item.questao.orgao } })}
                    style={({ pressed }) => [styles.verCorpo, { backgroundColor: s.corClara }, pressed && styles.apertado]}
                  >
                    <Text style={[styles.verCorpoTexto, { color: s.cor }]}>
                      📖 Estudar: {ORGAOS[r.item.questao.orgao]?.nome ?? s.nome}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </>
        )}

        <View style={styles.botoes}>
          <Pressable onPress={onDeNovo} style={({ pressed }) => [styles.botao, { backgroundColor: cores.roxo }, pressed && styles.apertado]}>
            <Text style={styles.botaoTexto}>Tentar de novo</Text>
          </Pressable>
          <Pressable onPress={onOutroTema} style={({ pressed }) => [styles.botao, styles.botaoClaro, pressed && styles.apertado]}>
            <Text style={[styles.botaoTexto, { color: cores.texto }]}>Escolher outro tema</Text>
          </Pressable>
          <Pressable onPress={onVoltarCorpo} style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}>
            <Text style={styles.linkTexto}>Voltar para o corpo</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, gap: 12 },
  placar: { borderRadius: 32, paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center', ...sombra },
  emoji: { fontSize: 72 },
  titulo: { fontSize: 22, fontWeight: '900', color: cores.texto, marginTop: 8, textAlign: 'center' },
  nota: { fontSize: 44, fontWeight: '900', color: cores.texto, marginTop: 4 },
  estrelas: { flexDirection: 'row', gap: 8, marginTop: 6 },
  estrela: { fontSize: 40, lineHeight: 44 },
  secao: { fontSize: 20, fontWeight: '900', color: cores.texto, marginTop: 14 },
  revisao: { backgroundColor: cores.branco, borderRadius: 22, padding: 16, ...sombra },
  revisaoSistema: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  revisaoPergunta: { fontSize: 16, fontWeight: '800', color: cores.texto, lineHeight: 22 },
  revisaoCerta: { fontSize: 15, fontWeight: '800', color: '#1FB5A6', marginTop: 8 },
  revisaoTexto: { fontSize: 14.5, color: cores.textoSuave, lineHeight: 21, marginTop: 4 },
  verCorpo: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14, marginTop: 12 },
  verCorpoTexto: { fontSize: 14, fontWeight: '900' },
  botoes: { gap: 12, marginTop: 16 },
  botao: { borderRadius: 999, paddingVertical: 17, alignItems: 'center', ...sombra },
  botaoClaro: { backgroundColor: cores.branco },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  apertado: { transform: [{ scale: 0.97 }] },
  link: { alignItems: 'center', paddingVertical: 10 },
  linkTexto: { fontSize: 15, fontWeight: '800', color: cores.textoSuave },
});
