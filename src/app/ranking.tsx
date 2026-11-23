import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopoJogo } from '../components/jogos/Moldura';
import type { Nivel } from '../data/sistemas';
import { useConta } from '../lib/conta';
import { buscarMedia, buscarRanking, lerPartidas, rankingLocal, rankingMundialAtivo, type LinhaRanking, type Partida } from '../lib/placar';
import { MODOS, type ModoId } from '../lib/pontos';
import { cores, sombra } from '../theme';

const MEDALHAS = ['🥇', '🥈', '🥉'];

export default function Ranking() {
  const params = useLocalSearchParams<{ nivel?: string; modo?: string }>();
  const nivel: Nivel = params.nivel === 'finais' ? 'finais' : 'iniciais';
  const modos = MODOS.filter((m) => m.niveis.includes(nivel));
  const inicial = modos.find((m) => m.id === params.modo)?.id ?? modos[0].id;

  const [modo, setModo] = useState<ModoId>(inicial);
  const { usuario, perfil } = useConta();
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [linhas, setLinhas] = useState<LinhaRanking[] | null>(null);
  const [media, setMedia] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Rola a fileira de jogos até o jogo escolhido
  const fileira = useRef<ScrollViewInstance>(null);
  const posicoes = useRef<Record<string, number>>({});
  const rolarPara = (id: string) => {
    const x = posicoes.current[id];
    if (x !== undefined) fileira.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
  };

  useEffect(() => {
    lerPartidas().then(setPartidas);
  }, []);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      const [r, m] = await Promise.all([buscarRanking(modo, nivel), buscarMedia(modo, nivel)]);
      if (!ativo) return;
      setLinhas(r);
      setMedia(m);
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [modo, nivel]);

  // Suas partidas neste jogo (do celular)
  const minhas = useMemo(() => partidas.filter((p) => p.jogo === modo && p.nivel === nivel), [partidas, modo, nivel]);
  const meuMelhor = minhas.length ? Math.max(...minhas.map((p) => p.pontos)) : null;
  const minhaMedia = minhas.length ? Math.round(minhas.reduce((s, p) => s + p.pontos, 0) / minhas.length) : null;

  const lista = linhas ?? rankingLocal(partidas, modo, nivel, usuario?.id ?? 'local', perfil?.apelido ?? 'Você');
  const online = linhas !== null;
  const nomeModo = MODOS.find((m) => m.id === modo);

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <TopoJogo titulo="🏆 Ranking" cor={cores.texto} />

      <ScrollView ref={fileira} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0 }}>
        {modos.map((m) => (
          <Pressable
            key={m.id}
            onLayout={(e) => {
              posicoes.current[m.id] = e.nativeEvent.layout.x;
              if (m.id === inicial) rolarPara(m.id);
            }}
            onPress={() => {
              setModo(m.id);
              rolarPara(m.id);
            }}
            style={[styles.chip, modo === m.id && styles.chipAtivo]}
          >
            <Text style={[styles.chipTexto, modo === m.id && { color: cores.branco }]}>
              {m.emoji} {m.nome}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {!rankingMundialAtivo && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>🌍 O ranking mundial ainda não está ligado. Por enquanto aparecem só as partidas deste celular.</Text>
          </View>
        )}

        <View style={styles.resumo}>
          <View style={[styles.resumoCard, { backgroundColor: '#ECE6FF' }]}>
            <Text style={styles.resumoRotulo}>Média mundial</Text>
            <Text style={styles.resumoValor}>{media ?? '—'}</Text>
            <Text style={styles.resumoSub}>pontos</Text>
          </View>
          <View style={[styles.resumoCard, { backgroundColor: '#FFF4D1' }]}>
            <Text style={styles.resumoRotulo}>Seu recorde</Text>
            <Text style={styles.resumoValor}>{meuMelhor ?? '—'}</Text>
            <Text style={styles.resumoSub}>{minhaMedia !== null ? `média ${minhaMedia} · ${minhas.length} ${minhas.length === 1 ? 'partida' : 'partidas'}` : 'jogue para pontuar'}</Text>
          </View>
        </View>

        <Text style={styles.secao}>
          {online ? 'Melhores do mundo' : 'Neste celular'} · {nomeModo?.nome}
        </Text>

        {carregando && rankingMundialAtivo ? (
          <ActivityIndicator color={cores.roxo} style={{ marginTop: 24 }} />
        ) : lista.length === 0 ? (
          <Text style={styles.vazio}>Ninguém jogou ainda. Seja o primeiro! 🚀</Text>
        ) : (
          lista.map((l, i) => {
            const eu = l.jogador_id === usuario?.id;
            return (
              <View key={l.jogador_id} style={[styles.linha, eu && styles.linhaEu]}>
                <Text style={styles.posicao}>{MEDALHAS[i] ?? `${i + 1}º`}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome} numberOfLines={1}>
                    {l.apelido}
                    {eu ? ' (você)' : ''}
                  </Text>
                  <Text style={styles.detalhe}>
                    média {l.media} · {l.partidas} {l.partidas === 1 ? 'partida' : 'partidas'}
                  </Text>
                </View>
                <Text style={styles.pontos}>{l.melhor}</Text>
              </View>
            );
          })
        )}

        <View style={styles.regra}>
          <Text style={styles.regraTitulo}>Como os pontos funcionam</Text>
          <Text style={styles.regraTexto}>✅ Cada acerto vale 100 pontos</Text>
          <Text style={styles.regraTexto}>⚡ Terminar rápido dá bônus de agilidade</Text>
          <Text style={styles.regraTexto}>❌ Cada erro tira 40 pontos</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  chip: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: cores.branco, borderWidth: 1.5, borderColor: '#E3DBFF' },
  chipAtivo: { backgroundColor: cores.roxo, borderColor: cores.roxo },
  chipTexto: { fontSize: 13.5, fontWeight: '800', color: cores.texto },
  conteudo: { padding: 16, paddingBottom: 48, gap: 10 },
  aviso: { backgroundColor: '#E3F7FF', borderRadius: 18, padding: 12 },
  avisoTexto: { fontSize: 13.5, fontWeight: '700', color: cores.texto, lineHeight: 19 },
  resumo: { flexDirection: 'row', gap: 10 },
  resumoCard: { flex: 1, borderRadius: 22, padding: 14, alignItems: 'center' },
  resumoRotulo: { fontSize: 12, fontWeight: '800', color: cores.textoSuave, textTransform: 'uppercase', letterSpacing: 0.5 },
  resumoValor: { fontSize: 34, fontWeight: '900', color: cores.texto, marginTop: 2 },
  resumoSub: { fontSize: 12, fontWeight: '700', color: cores.textoSuave, textAlign: 'center' },
  secao: { fontSize: 16, fontWeight: '900', color: cores.texto, marginTop: 8 },
  vazio: { fontSize: 15, fontWeight: '700', color: cores.textoSuave, textAlign: 'center', marginTop: 20 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.branco, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, ...sombra },
  linhaEu: { borderWidth: 2.5, borderColor: cores.roxo },
  posicao: { width: 36, fontSize: 20, fontWeight: '900', color: cores.textoSuave, textAlign: 'center' },
  nome: { fontSize: 16, fontWeight: '900', color: cores.texto },
  detalhe: { fontSize: 12, fontWeight: '700', color: cores.textoSuave },
  pontos: { fontSize: 20, fontWeight: '900', color: cores.roxo },
  regra: { backgroundColor: cores.branco, borderRadius: 20, padding: 14, marginTop: 10, gap: 4 },
  regraTitulo: { fontSize: 15, fontWeight: '900', color: cores.texto, marginBottom: 2 },
  regraTexto: { fontSize: 14, color: cores.textoSuave, fontWeight: '600' },
});
