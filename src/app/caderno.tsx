import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopoJogo } from '../components/jogos/Moldura';
import type { Nivel } from '../data/sistemas';
import { infoTema, listarAnotacoes, quando, type Anotacao } from '../lib/anotacoes';
import { useConta } from '../lib/conta';
import { cores, sombra } from '../theme';

// Caderno: lista das anotações da conta, da mais recente para a mais antiga.

const COR = '#E8A400';

export default function Caderno() {
  const params = useLocalSearchParams<{ nivel?: string }>();
  const nivel: Nivel = params.nivel === 'finais' ? 'finais' : 'iniciais';
  const { modoTeste } = useConta();
  const [lista, setLista] = useState<Anotacao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Recarrega sempre que a tela aparece (ex.: ao voltar de uma anotação)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      listarAnotacoes()
        .then((l) => {
          if (!ativo) return;
          setLista(l);
          setErro(null);
        })
        .catch((e: Error) => ativo && setErro(e.message));
      return () => {
        ativo = false;
      };
    }, []),
  );

  const abrir = (id?: string) => router.push({ pathname: '/anotacao', params: id ? { id, nivel } : { nivel } });

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <TopoJogo titulo="Meu caderno" cor={COR} />
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>{modoTeste ? 'Modo de teste: as anotações ficam só neste celular.' : 'Suas anotações ficam salvas na sua conta.'}</Text>

        <Pressable onPress={() => abrir()} style={({ pressed }) => [styles.nova, pressed && styles.apertado]}>
          <Text style={styles.novaMais}>＋</Text>
          <Text style={styles.novaTexto}>Nova anotação</Text>
        </Pressable>

        {erro && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>Não consegui abrir o caderno. Confira a internet.</Text>
            {__DEV__ && <Text style={styles.avisoDev}>{erro}</Text>}
          </View>
        )}

        {!lista && !erro && <ActivityIndicator color={COR} style={{ marginTop: 30 }} />}

        {lista?.length === 0 && (
          <View style={styles.vazio}>
            <Text style={styles.vazioEmoji}>📒</Text>
            <Text style={styles.vazioTitulo}>Seu caderno está vazio</Text>
            <Text style={styles.vazioTexto}>Escreva o que aprendeu, dúvidas para a prova ou resumos. Nos cartões do corpo também tem o botão 📒 Anotar.</Text>
          </View>
        )}

        {lista?.map((a) => {
          const t = infoTema(a.tema);
          return (
            <Pressable key={a.id} onPress={() => abrir(a.id)} style={({ pressed }) => [styles.card, pressed && styles.apertado]}>
              <View style={[styles.cardEmoji, { backgroundColor: t?.corClara ?? '#FFF4D1' }]}>
                <Text style={styles.cardEmojiTexto}>{t?.emoji ?? '📝'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitulo} numberOfLines={1}>
                  {a.titulo.trim() || 'Sem título'}
                </Text>
                {a.texto.trim() !== '' && (
                  <Text style={styles.cardTexto} numberOfLines={2}>
                    {a.texto.trim()}
                  </Text>
                )}
                <View style={styles.cardRodape}>
                  {t && <Text style={[styles.cardTema, { color: t.cor, backgroundColor: t.corClara }]}>{t.nome}</Text>}
                  <Text style={styles.cardData}>{quando(a.atualizado_em)}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  sub: { fontSize: 14, fontWeight: '700', color: cores.textoSuave },
  nova: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COR, borderRadius: 999, paddingVertical: 15, ...sombra },
  novaMais: { fontSize: 20, fontWeight: '900', color: cores.branco },
  novaTexto: { fontSize: 17, fontWeight: '900', color: cores.branco },
  aviso: { backgroundColor: '#FFF2F5', borderRadius: 16, padding: 14 },
  avisoTexto: { fontSize: 14, fontWeight: '800', color: '#C0284F' },
  avisoDev: { fontSize: 12, color: cores.textoSuave, marginTop: 4 },
  vazio: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20, gap: 6 },
  vazioEmoji: { fontSize: 56 },
  vazioTitulo: { fontSize: 19, fontWeight: '900', color: cores.texto },
  vazioTexto: { fontSize: 14, color: cores.textoSuave, textAlign: 'center', lineHeight: 20 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: cores.branco, borderRadius: 20, padding: 14, ...sombra, shadowOpacity: 0.08 },
  cardEmoji: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cardEmojiTexto: { fontSize: 24 },
  cardTitulo: { fontSize: 16, fontWeight: '900', color: cores.texto },
  cardTexto: { fontSize: 14, color: cores.textoSuave, lineHeight: 19, marginTop: 2 },
  cardRodape: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  cardTema: { fontSize: 12, fontWeight: '800', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9, overflow: 'hidden' },
  cardData: { fontSize: 12, fontWeight: '700', color: '#A9A3C4' },
  apertado: { transform: [{ scale: 0.98 }] },
});
