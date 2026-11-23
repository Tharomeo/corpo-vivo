import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Balao, FimDeJogo, Placar, TopoJogo } from '../components/jogos/Moldura';
import { Orgao2D } from '../components/jogos/Orgao2D';
import { ENCAIXES, FASES_MONTE } from '../data/jogos';
import { pontosParciais, type ModoId } from '../lib/pontos';
import { cores } from '../theme';
import { embaralhar } from '../utils/embaralhar';

// Monte o corpo: arrastar cada órgão até o lugar certo na silhueta.
// Tudo é desenhado num corpo de 100 x 100 unidades (u = largura / 100).

const COR = '#FF5D8F';
const ALTURA_CORPO = 100;

type Ponto = { x: number; y: number };

function Silhueta({ u }: { u: number }) {
  const pele = {
    backgroundColor: '#FFE3D1',
    borderColor: '#F6C6A5',
    borderWidth: 2,
  };
  const r = (x: number, y: number, w: number, h: number, raio: number) => ({
    position: 'absolute' as const,
    left: x * u,
    top: y * u,
    width: w * u,
    height: h * u,
    borderRadius: raio * u,
    ...pele,
  });
  return (
    <>
      <View style={r(19, 29, 10, 46, 5)} />
      <View style={r(71, 29, 10, 46, 5)} />
      <View style={r(34, 74, 14, 30, 7)} />
      <View style={r(52, 74, 14, 30, 7)} />
      <View style={r(30, 26, 40, 57, 13)} />
      <View style={r(45, 20, 10, 9, 3)} />
      <View style={r(39, 1, 22, 21, 11)} />
    </>
  );
}

// Peça que dá para arrastar
function Peca({ id, inicio, u, onSolta }: { id: string; inicio: Ponto; u: number; onSolta: (id: string, ok: boolean) => void }) {
  const e = ENCAIXES[id];
  const w = e.w * u;
  const h = e.h * u;
  const caixaW = Math.max(w, 56);
  const caixaH = Math.max(h, 56);
  const [pos] = useState(() => new Animated.ValueXY(inicio));
  const [arrastando, setArrastando] = useState(false);
  // Recriado só quando o pai muda (nunca no meio de um arraste)
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => setArrastando(true),
        onPanResponderMove: (_, g) => pos.setValue({ x: inicio.x + g.dx, y: inicio.y + g.dy }),
        onPanResponderRelease: (_, g) => {
          setArrastando(false);
          const cx = inicio.x + g.dx + caixaW / 2;
          const cy = inicio.y + g.dy + caixaH / 2;
          const ok = Math.hypot(cx - e.x * u, cy - e.y * u) < 11 * u;
          if (ok) {
            Animated.spring(pos, {
              toValue: { x: e.x * u - caixaW / 2, y: e.y * u - caixaH / 2 },
              useNativeDriver: false,
              friction: 7,
            }).start(() => onSolta(id, true));
          } else {
            Animated.spring(pos, {
              toValue: inicio,
              useNativeDriver: false,
              friction: 6,
            }).start();
            onSolta(id, false);
          }
        },
      }),
    [pos, inicio, e, u, caixaW, caixaH, id, onSolta],
  );

  return (
    <Animated.View
      {...pan.panHandlers}
      style={[
        styles.peca,
        {
          width: caixaW,
          height: caixaH,
          zIndex: arrastando ? 20 : 5,
          transform: [...pos.getTranslateTransform(), { scale: arrastando ? 1.15 : 1 }],
        },
      ]}
    >
      <Orgao2D peca={e.peca} w={w} h={h} />
    </Animated.View>
  );
}

// Órgão já encaixado: aparece com um pulinho
function Encaixado({ id, u }: { id: string; u: number }) {
  const e = ENCAIXES[id];
  const [s] = useState(() => new Animated.Value(0.6));
  useEffect(() => {
    Animated.spring(s, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 120,
    }).start();
  }, [s]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: (e.x - e.w / 2) * u,
        top: (e.y - e.h / 2) * u,
        zIndex: id === 'coracao' ? 3 : 2,
        transform: [{ scale: s }],
      }}
    >
      <Orgao2D peca={e.peca} w={e.w * u} h={e.h * u} />
    </Animated.View>
  );
}

export default function MonteOCorpo() {
  const { width } = useWindowDimensions();
  const W = Math.min(width - 32, 360);
  const u = W / 100;

  const [fase, setFase] = useState(0);
  const [rodada, setRodada] = useState(0);
  const [colocadas, setColocadas] = useState<string[]>([]);
  const [erros, setErros] = useState(0);
  // Tempo da fase: começa ao abrir e para no último encaixe
  const [inicio, setInicio] = useState(() => Date.now());
  const [tempoMs, setTempoMs] = useState(0);
  const [balao, setBalao] = useState<{
    texto: string;
    tipo: 'acerto' | 'dica';
    n: number;
  } | null>(null);
  const [fim, setFim] = useState(false);
  const f = FASES_MONTE[fase];

  // Ordem das peças na bandeja muda a cada rodada
  const ordem = useMemo(() => embaralhar(f.pecas), [f, rodada]); // eslint-disable-line react-hooks/exhaustive-deps

  const colunas = 4;
  const celW = W / colunas;
  const celH = 70;
  const topoBandeja = ALTURA_CORPO * u + 16;
  const linhas = Math.ceil(ordem.length / colunas);
  // Posições iniciais na bandeja, memorizadas pelo mesmo motivo
  const inicios = useMemo(
    () =>
      ordem.map((id, i): Ponto => {
        const e = ENCAIXES[id];
        const caixaW = Math.max(e.w * u, 56);
        const caixaH = Math.max(e.h * u, 56);
        return { x: (i % colunas) * celW + (celW - caixaW) / 2, y: topoBandeja + Math.floor(i / colunas) * celH + (celH - caixaH) / 2 };
      }),
    [ordem, u, celW, topoBandeja],
  );

  const recomeçar = (novaFase = fase) => {
    setFase(novaFase);
    setColocadas([]);
    setErros(0);
    setBalao(null);
    setFim(false);
    setRodada((r) => r + 1);
    setInicio(Date.now());
  };

  // Todas no lugar: espera o último pulinho e mostra o fim
  const completo = colocadas.length === f.pecas.length;
  useEffect(() => {
    if (!completo) return;
    const fimEm = Date.now();
    const t = setTimeout(() => {
      setTempoMs(fimEm - inicio);
      setFim(true);
    }, 1100);
    return () => clearTimeout(t);
  }, [completo, inicio]);

  // Estável (sem dependências) para a peça não recriar o arraste no meio do gesto
  const onSolta = useCallback((id: string, ok: boolean) => {
    const e = ENCAIXES[id];
    if (ok) {
      setColocadas((c) => [...c, id]);
      setBalao((b) => ({
        texto: `✨ ${e.fato}`,
        tipo: 'acerto',
        n: (b?.n ?? 0) + 1,
      }));
    } else {
      setErros((x) => x + 1);
      setBalao((b) => ({
        texto: `Quase! ${e.dica}`,
        tipo: 'dica',
        n: (b?.n ?? 0) + 1,
      }));
    }
  }, []);

  if (fim) {
    const ultima = fase === FASES_MONTE.length - 1;
    return (
      <FimDeJogo
        key={`fim-${rodada}`}
        modo={`monte-${fase + 1}` as ModoId}
        nivel="iniciais"
        resultado={{ acertos: f.pecas.length, erros, tempoMs, tempoIdealSeg: f.pecas.length * 6 }}
        titulo={ultima ? 'Corpo completo!' : 'Fase completa!'}
        texto={
          erros === 0 ? 'Você acertou tudo de primeira!' : `Você montou com ${erros} ${erros === 1 ? 'tentativa errada' : 'tentativas erradas'}.`
        }
        proximo={ultima ? undefined : { texto: 'Próxima fase ›', onPress: () => recomeçar(fase + 1) }}
        onDeNovo={() => recomeçar(fase)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <TopoJogo titulo="Monte o corpo" cor={COR} direita={<Placar texto={`⭐ ${pontosParciais(colocadas.length, erros)}`} cor={COR} />} />
      <Text style={styles.fase}>{f.titulo}</Text>
      <Text style={styles.instrucao}>Arraste cada órgão até o lugar dele no corpo</Text>

      <View style={[styles.area, { width: W, height: topoBandeja + linhas * celH }]}>
        <Silhueta u={u} />

        {/* Contornos dos lugares */}
        {f.mostrarContorno &&
          f.pecas
            .filter((id) => !colocadas.includes(id))
            .map((id) => {
              const e = ENCAIXES[id];
              return (
                <View
                  key={`c-${id}`}
                  style={[
                    styles.contorno,
                    {
                      left: (e.x - e.w / 2) * u,
                      top: (e.y - e.h / 2) * u,
                      width: e.w * u,
                      height: e.h * u,
                      borderRadius: Math.min(e.w, e.h) * u * 0.5,
                    },
                  ]}
                />
              );
            })}

        {colocadas.map((id) => (
          <Encaixado key={`ok-${rodada}-${id}`} id={id} u={u} />
        ))}

        <View style={[styles.bandeja, { top: topoBandeja - 8, height: linhas * celH + 8 }]} />
        {ordem.map((id, i) => (colocadas.includes(id) ? null : <Peca key={`${rodada}-${id}`} id={id} inicio={inicios[i]} u={u} onSolta={onSolta} />))}
      </View>

      <View style={styles.balaoArea}>{balao && <Balao key={balao.n} texto={balao.texto} tipo={balao.tipo} />}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  fase: { textAlign: 'center', fontSize: 15, fontWeight: '900', color: COR },
  instrucao: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: cores.textoSuave,
    marginTop: 2,
    marginBottom: 8,
  },
  area: { alignSelf: 'center' },
  contorno: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#B9B3D6',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  bandeja: {
    position: 'absolute',
    left: -8,
    right: -8,
    borderRadius: 24,
    backgroundColor: '#F1ECFF',
  },
  peca: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balaoArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    minHeight: 70,
  },
});
