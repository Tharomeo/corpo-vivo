import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Balao, FimDeJogo, Placar, TopoJogo } from '../components/jogos/Moldura';
import { Orgao2D } from '../components/jogos/Orgao2D';
import { NOME_PECA, VIAGENS, type Peca2D } from '../data/jogos';
import { pontosParciais, type ModoId } from '../lib/pontos';
import { cores, sombra } from '../theme';
import { embaralhar } from '../utils/embaralhar';

// Viagens pelo corpo: tocar nas partes na ordem do caminho.

function Bloco({
  peca,
  passo,
  cor,
  corClara,
  viajante,
  aqui,
  errou,
  largura,
  onPress,
}: {
  peca: Peca2D;
  passo: number | null; // posição no caminho já percorrido
  cor: string;
  corClara: string;
  viajante: string;
  aqui: boolean;
  errou: number; // muda a cada erro neste bloco, para tremer
  largura: number;
  onPress: () => void;
}) {
  const [treme] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!errou) return;
    treme.setValue(0);
    Animated.sequence(
      [1, -1, 1, -1, 0].map((v) => Animated.timing(treme, { toValue: v, duration: 60, useNativeDriver: true })),
    ).start();
  }, [errou, treme]);

  return (
    <Pressable onPress={onPress} disabled={passo !== null}>
      <Animated.View
        style={[
          styles.bloco,
          { width: largura, backgroundColor: passo !== null ? corClara : cores.branco, borderColor: passo !== null ? cor : 'transparent' },
          { transform: [{ translateX: treme.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }] },
        ]}
      >
        {passo !== null && (
          <View style={[styles.numero, { backgroundColor: cor }]}>
            <Text style={styles.numeroTexto}>{passo + 1}</Text>
          </View>
        )}
        <Orgao2D peca={peca} w={largura * 0.55} h={largura * 0.5} />
        <Text style={styles.blocoNome} numberOfLines={2}>
          {NOME_PECA[peca]}
        </Text>
        {aqui && <Text style={styles.viajante}>{viajante}</Text>}
      </Animated.View>
    </Pressable>
  );
}

export default function Viagens() {
  const { width } = useWindowDimensions();
  const largura = Math.min((Math.min(width, 420) - 32 - 2 * 10) / 3, 120);

  const [indice, setIndice] = useState(0);
  const [rodada, setRodada] = useState(0);
  const [feitos, setFeitos] = useState(0); // quantos passos do caminho já foram tocados
  const [erros, setErros] = useState(0);
  const [inicio, setInicio] = useState(() => Date.now());
  const [tempoMs, setTempoMs] = useState(0);
  const [tremor, setTremor] = useState<Record<string, number>>({});
  const [balao, setBalao] = useState<{ texto: string; tipo: 'acerto' | 'dica'; n: number } | null>(null);
  const [fim, setFim] = useState(false);
  const v = VIAGENS[indice];

  const blocos = useMemo(() => embaralhar([...v.caminho.map((c) => c.peca), ...v.distracoes]), [v, rodada]); // eslint-disable-line react-hooks/exhaustive-deps
  const completo = feitos === v.caminho.length;

  useEffect(() => {
    if (!completo) return;
    const fimEm = Date.now();
    const t = setTimeout(() => {
      setTempoMs(fimEm - inicio);
      setFim(true);
    }, 1800);
    return () => clearTimeout(t);
  }, [completo, inicio]);

  const tocar = (peca: Peca2D) => {
    if (completo) return;
    const proximo = v.caminho[feitos];
    if (peca === proximo.peca) {
      const ultimo = feitos + 1 === v.caminho.length;
      setFeitos((f) => f + 1);
      setBalao((b) => ({ texto: ultimo ? `${proximo.fala} ${v.final}` : `${v.viajante} ${proximo.fala}`, tipo: 'acerto', n: (b?.n ?? 0) + 1 }));
    } else {
      setErros((e) => e + 1);
      setTremor((t) => ({ ...t, [peca]: (t[peca] ?? 0) + 1 }));
      setBalao((b) => ({ texto: `Ops! ${v.viajante} não passa por ${NOME_PECA[peca].toLowerCase()} agora. Tente outro!`, tipo: 'dica', n: (b?.n ?? 0) + 1 }));
    }
  };

  const comecar = (i: number) => {
    setIndice(i);
    setFeitos(0);
    setErros(0);
    setTremor({});
    setBalao(null);
    setFim(false);
    setRodada((r) => r + 1);
    setInicio(Date.now());
  };

  if (fim) {
    const ultima = indice === VIAGENS.length - 1;
    return (
      <FimDeJogo
        key={`fim-${rodada}`}
        modo={`viagem-${v.id}` as ModoId}
        nivel="iniciais"
        resultado={{ acertos: v.caminho.length, erros, tempoMs, tempoIdealSeg: v.caminho.length * 4 }}
        titulo="Chegou ao destino!"
        texto={v.final}
        proximo={ultima ? undefined : { texto: `Próxima: ${VIAGENS[indice + 1].titulo} ${VIAGENS[indice + 1].viajante}`, onPress: () => comecar(indice + 1) }}
        onDeNovo={() => comecar(indice)}
      />
    );
  }

  const posicao = (peca: Peca2D) => {
    const i = v.caminho.findIndex((c) => c.peca === peca);
    return i >= 0 && i < feitos ? i : null;
  };
  const atual = feitos > 0 ? v.caminho[feitos - 1].peca : null;

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <TopoJogo titulo={v.titulo} cor={v.cor} direita={<Placar texto={`⭐ ${pontosParciais(feitos, erros)}`} cor={v.cor} />} />

      {/* Trilha: mostra o viajante avançando */}
      <View style={[styles.trilha, { backgroundColor: v.corClara }]}>
        {v.caminho.map((c, i) => (
          <View key={c.peca + i} style={styles.trilhaItem}>
            <View style={[styles.trilhaPonto, { backgroundColor: i < feitos ? v.cor : cores.branco, borderColor: v.cor }]} />
            {i < v.caminho.length - 1 && <View style={[styles.trilhaLinha, { backgroundColor: i < feitos - 1 ? v.cor : '#E3DFF2' }]} />}
          </View>
        ))}
        <Text style={styles.trilhaViajante}>{completo ? '🏁' : v.viajante}</Text>
      </View>

      <Text style={styles.instrucao}>
        {feitos === 0 ? `Por onde ${v.viajante} entra no corpo?` : completo ? 'Caminho completo!' : `E depois de ${NOME_PECA[v.caminho[feitos - 1].peca].toLowerCase()}, para onde vai?`}
      </Text>

      <View style={[styles.grade, { width: largura * 3 + 20 }]}>
        {blocos.map((p) => (
          <Bloco
            key={`${rodada}-${p}`}
            peca={p}
            passo={posicao(p)}
            cor={v.cor}
            corClara={v.corClara}
            viajante={v.viajante}
            aqui={p === atual}
            errou={tremor[p] ?? 0}
            largura={largura}
            onPress={() => tocar(p)}
          />
        ))}
      </View>

      <View style={styles.balaoArea}>{balao && <Balao key={balao.n} texto={balao.texto} tipo={balao.tipo} />}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  trilha: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 10 },
  trilhaItem: { flexDirection: 'row', alignItems: 'center' },
  trilhaPonto: { width: 16, height: 16, borderRadius: 8, borderWidth: 2.5 },
  trilhaLinha: { width: 22, height: 4, borderRadius: 2 },
  trilhaViajante: { fontSize: 22, marginLeft: 10 },
  instrucao: { textAlign: 'center', fontSize: 16, fontWeight: '900', color: cores.texto, marginBottom: 12, paddingHorizontal: 20 },
  grade: { alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloco: { borderRadius: 20, borderWidth: 3, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 6, minHeight: 116, ...sombra },
  blocoNome: { fontSize: 13, fontWeight: '900', color: cores.texto, textAlign: 'center', marginTop: 4 },
  numero: { position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  numeroTexto: { color: cores.branco, fontSize: 12, fontWeight: '900' },
  viajante: { position: 'absolute', top: 2, right: 6, fontSize: 24 },
  balaoArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, minHeight: 80 },
});
