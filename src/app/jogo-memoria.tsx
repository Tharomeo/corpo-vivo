import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Balao, FimDeJogo, Placar, TopoJogo } from '../components/jogos/Moldura';
import { Orgao2D } from '../components/jogos/Orgao2D';
import { NOME_PECA, PARES_MEMORIA, type Peca2D } from '../data/jogos';
import { cores, sombra } from '../theme';
import { embaralhar } from '../utils/embaralhar';

// Jogo da memória: cada órgão faz par com a frase do que ele faz.

const COR = '#2EC4B6';
const PARES = 6;

type Carta = { chave: string; par: Peca2D; tipo: 'orgao' | 'funcao'; texto: string };

function novoBaralho(): Carta[] {
  const pares = embaralhar(PARES_MEMORIA).slice(0, PARES);
  const cartas = pares.flatMap((p) => [
    { chave: `${p.peca}-o`, par: p.peca, tipo: 'orgao' as const, texto: NOME_PECA[p.peca] },
    { chave: `${p.peca}-f`, par: p.peca, tipo: 'funcao' as const, texto: p.funcao },
  ]);
  return embaralhar(cartas);
}

function CartaView({
  carta,
  aberta,
  achada,
  largura,
  onPress,
}: {
  carta: Carta;
  aberta: boolean;
  achada: boolean;
  largura: number;
  onPress: () => void;
}) {
  // Virar: encolhe na horizontal, troca a face e volta
  const [giro] = useState(() => new Animated.Value(aberta ? 1 : 0));
  const [face, setFace] = useState(aberta);
  useEffect(() => {
    Animated.timing(giro, { toValue: aberta ? 1 : 0, duration: 260, useNativeDriver: true }).start();
    const t = setTimeout(() => setFace(aberta), 130);
    return () => clearTimeout(t);
  }, [aberta, giro]);
  const escalaX = giro.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.02, 1] });
  const altura = largura * 1.25;

  return (
    <Pressable onPress={onPress} disabled={aberta || achada}>
      <Animated.View
        style={[
          styles.carta,
          { width: largura, height: altura, transform: [{ scaleX: escalaX }] },
          face ? (achada ? styles.cartaAchada : styles.cartaAberta) : styles.cartaFechada,
        ]}
      >
        {!face && <Text style={styles.verso}>?</Text>}
        {face && carta.tipo === 'orgao' && (
          <>
            <Orgao2D peca={carta.par} w={largura * 0.62} h={largura * 0.55} />
            <Text style={styles.nome} numberOfLines={2}>
              {carta.texto}
            </Text>
          </>
        )}
        {face && carta.tipo === 'funcao' && <Text style={styles.funcao}>{carta.texto}</Text>}
      </Animated.View>
    </Pressable>
  );
}

export default function Memoria() {
  const { width } = useWindowDimensions();
  const largura = Math.min((Math.min(width, 420) - 32 - 2 * 10) / 3, 120);

  const [rodada, setRodada] = useState(0);
  const [cartas, setCartas] = useState<Carta[]>(novoBaralho);
  const [abertas, setAbertas] = useState<number[]>([]);
  const [achados, setAchados] = useState<Peca2D[]>([]);
  const [jogadas, setJogadas] = useState(0);
  const [balao, setBalao] = useState<{ texto: string; n: number } | null>(null);

  // Duas cartas abertas: confere o par
  useEffect(() => {
    if (abertas.length < 2) return;
    const [a, b] = abertas;
    const certo = cartas[a].par === cartas[b].par;
    const t = setTimeout(
      () => {
        if (certo) {
          const par = PARES_MEMORIA.find((p) => p.peca === cartas[a].par);
          setAchados((x) => [...x, cartas[a].par]);
          setBalao((x) => ({ texto: `✨ ${NOME_PECA[cartas[a].par]}: ${par?.funcao.toLowerCase()}!`, n: (x?.n ?? 0) + 1 }));
        }
        setAbertas([]);
      },
      certo ? 350 : 1000,
    );
    return () => clearTimeout(t);
  }, [abertas, cartas]);

  const abrir = (i: number) => {
    if (abertas.length >= 2) return;
    if (abertas.length === 1) setJogadas((j) => j + 1);
    setAbertas((x) => [...x, i]);
  };

  const recomeçar = () => {
    setCartas(novoBaralho());
    setAbertas([]);
    setAchados([]);
    setJogadas(0);
    setBalao(null);
    setRodada((r) => r + 1);
  };

  if (achados.length === PARES) {
    const estrelas = jogadas <= PARES + 2 ? 3 : jogadas <= PARES * 2 ? 2 : 1;
    return (
      <FimDeJogo
        key={`fim-${rodada}`}
        estrelas={estrelas}
        titulo="Todos os pares!"
        texto={`Você achou os ${PARES} pares em ${jogadas} jogadas.`}
        onDeNovo={recomeçar}
      />
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <TopoJogo titulo="Jogo da memória" cor={COR} direita={<Placar texto={`${achados.length}/${PARES}`} cor={COR} />} />
      <Text style={styles.instrucao}>Ache o par de cada órgão com o que ele faz</Text>
      <View style={[styles.grade, { width: largura * 3 + 20 }]}>
        {cartas.map((c, i) => (
          <CartaView
            key={`${rodada}-${c.chave}`}
            carta={c}
            aberta={abertas.includes(i) || achados.includes(c.par)}
            achada={achados.includes(c.par)}
            largura={largura}
            onPress={() => abrir(i)}
          />
        ))}
      </View>
      <View style={styles.balaoArea}>{balao && <Balao key={balao.n} texto={balao.texto} tipo="acerto" />}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  instrucao: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: cores.textoSuave, marginBottom: 12 },
  grade: { alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  carta: { borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 8, ...sombra },
  cartaFechada: { backgroundColor: COR },
  cartaAberta: { backgroundColor: cores.branco, borderWidth: 3, borderColor: COR },
  cartaAchada: { backgroundColor: '#DDF6F3', borderWidth: 3, borderColor: COR },
  verso: { fontSize: 40, fontWeight: '900', color: cores.branco },
  nome: { fontSize: 13, fontWeight: '900', color: cores.texto, textAlign: 'center', marginTop: 4 },
  funcao: { fontSize: 13.5, fontWeight: '800', color: cores.texto, textAlign: 'center', lineHeight: 18 },
  balaoArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, minHeight: 70 },
});
