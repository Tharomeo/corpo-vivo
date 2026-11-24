import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyView } from '../components/BodyView';
import type { BodyViewHandle, SceneMessage } from '../components/bodyViewTypes';
import { Balao, FimDeJogo, Placar } from '../components/jogos/Moldura';
import { ALVOS_CACA, type Alvo3D } from '../data/jogos';
import { pontosParciais } from '../lib/pontos';
import { ORGAOS, SISTEMAS, type Nivel } from '../data/sistemas';
import { cores, sombra } from '../theme';
import { embaralhar } from '../utils/embaralhar';

// Caça ao órgão: o app pede uma parte e a pessoa toca nela no boneco 3D.

const RODADAS = 8;
const COR = '#7B5CFA';

export default function CacaAoOrgao() {
  const params = useLocalSearchParams<{ nivel?: string }>();
  const nivel: Nivel = params.nivel === 'finais' ? 'finais' : 'iniciais';
  const insets = useSafeAreaInsets();
  const scene = useRef<BodyViewHandle>(null);

  const [jogo, setJogo] = useState(0);
  const [alvos, setAlvos] = useState<Alvo3D[]>(() => embaralhar(ALVOS_CACA[nivel]).slice(0, RODADAS));
  const [rodada, setRodada] = useState(0);
  const [erros, setErros] = useState(0);
  const [errosNaRodada, setErrosNaRodada] = useState(0);
  const [inicio, setInicio] = useState(() => Date.now());
  const [ultimoAcerto, setUltimoAcerto] = useState(0);
  const [balao, setBalao] = useState<{ texto: string; tipo: 'acerto' | 'dica'; n: number } | null>(null);
  const [pronto, setPronto] = useState(false);
  const [acertou, setAcertou] = useState(false);
  const alvo = alvos[rodada];
  const fim = rodada >= alvos.length;

  // Prepara o boneco para cada rodada: camada certa e câmera de frente
  useEffect(() => {
    if (!pronto || !alvo) return;
    scene.current?.run(`setLayer('${alvo.camada}'); highlight(null); resetView();`);
  }, [pronto, alvo]);

  // Depois de acertar, espera um pouco e vai para a próxima
  useEffect(() => {
    if (!acertou) return;
    const t = setTimeout(() => {
      setAcertou(false);
      setErrosNaRodada(0);
      setRodada((r) => r + 1);
    }, 1400);
    return () => clearTimeout(t);
  }, [acertou]);

  const onMessage = useCallback(
    (msg: SceneMessage) => {
      if (msg.type === 'ready') {
        setPronto(true);
        setInicio(Date.now());
        if (alvo) scene.current?.run(`setLayer('${alvo.camada}'); highlight(null); resetView();`);
      }
      if (msg.type !== 'tap' || !msg.organ || !alvo || acertou) return;
      if (msg.organ === alvo.orgao) {
        setAcertou(true);
        setUltimoAcerto(Date.now());
        scene.current?.run(`highlight('${ORGAOS[alvo.orgao].sistema}'); focusOrgan('${alvo.orgao}');`);
        setBalao((b) => ({ texto: `Isso! Você achou ${alvo.nome}! ${alvo.emoji}`, tipo: 'acerto', n: (b?.n ?? 0) + 1 }));
      } else {
        const tocado = ORGAOS[msg.organ]?.nome ?? 'outra parte';
        const n = errosNaRodada + 1;
        setErros((e) => e + 1);
        setErrosNaRodada(n);
        // Depois de 2 erros, acende o sistema certo como pista
        if (n >= 2) {
          const sis = ORGAOS[alvo.orgao].sistema;
          scene.current?.run(`highlight('${sis}');`);
          setBalao((b) => ({ texto: `Esse é: ${tocado}. Dica: procure nas partes acesas (${SISTEMAS[sis].nome.toLowerCase()}).`, tipo: 'dica', n: (b?.n ?? 0) + 1 }));
        } else {
          setBalao((b) => ({ texto: `Esse é: ${tocado}. Tente de novo!`, tipo: 'dica', n: (b?.n ?? 0) + 1 }));
        }
      }
    },
    [alvo, acertou, errosNaRodada],
  );

  const recomeçar = () => {
    setAlvos(embaralhar(ALVOS_CACA[nivel]).slice(0, RODADAS));
    setRodada(0);
    setErros(0);
    setErrosNaRodada(0);
    setBalao(null);
    setAcertou(false);
    setJogo((j) => j + 1);
  };

  if (fim) {
    return (
      <FimDeJogo
        key={`fim-${jogo}`}
        modo="caca"
        nivel={nivel}
        resultado={{ acertos: RODADAS, erros, tempoMs: ultimoAcerto - inicio, tempoIdealSeg: RODADAS * (nivel === 'finais' ? 12 : 9) }}
        titulo="Caça completa!"
        texto={erros === 0 ? `Você achou as ${RODADAS} partes sem errar!` : `Você achou as ${RODADAS} partes com ${erros} ${erros === 1 ? 'erro' : 'erros'}.`}
        onDeNovo={recomeçar}
      />
    );
  }

  return (
    <View style={styles.tela}>
      <BodyView key={jogo} ref={scene} onMessage={onMessage} />

      <View style={[styles.topo, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltar}>
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <View style={styles.pedido}>
          <Text style={styles.pedidoRotulo}>
            Encontre {rodada + 1}/{alvos.length}
          </Text>
          <Text style={styles.pedidoTexto} numberOfLines={2}>
            {alvo.nome} {alvo.emoji}
          </Text>
        </View>
        <Placar texto={`⭐ ${pontosParciais(rodada + (acertou ? 1 : 0), erros)}`} cor={COR} />
      </View>
      {/* Volta a câmera ao corpo inteiro depois de dar muito zoom */}
      <View style={[styles.reset, { top: insets.top + 104 }]} pointerEvents="box-none">
        <Pressable onPress={() => scene.current?.run('resetView();')} hitSlop={10} style={styles.voltar}>
          <Text style={styles.resetTexto}>⟲</Text>
        </Pressable>
      </View>

      <View style={[styles.rodape, { paddingBottom: insets.bottom + 16 }]} pointerEvents="none">
        {balao ? (
          <Balao key={balao.n} texto={balao.texto} tipo={balao.tipo} />
        ) : (
          <Text style={styles.dica}>Gire o boneco e toque na parte certa</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#EAF4FF' },
  topo: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  voltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  voltarTexto: { fontSize: 30, lineHeight: 32, color: cores.texto, fontWeight: '700', marginTop: -3 },
  reset: { position: 'absolute', right: 16 },
  resetTexto: { fontSize: 22, color: cores.texto, fontWeight: '700' },
  pedido: { flex: 1, backgroundColor: COR, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 16, ...sombra },
  pedidoRotulo: { color: cores.branco, fontSize: 12, fontWeight: '800', opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.5 },
  pedidoTexto: { color: cores.branco, fontSize: 22, fontWeight: '900', marginTop: 1 },
  rodape: { position: 'absolute', left: 16, right: 16, bottom: 0, alignItems: 'center' },
  dica: { fontSize: 14, fontWeight: '800', color: cores.textoSuave, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
});
