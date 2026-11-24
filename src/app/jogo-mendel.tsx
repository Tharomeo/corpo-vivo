import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ervilha } from '../components/jogos/Ervilha';
import { Balao, FimDeJogo, Placar, TopoJogo } from '../components/jogos/Moldura';
import { escreverGenotipo, fenotipo, gametas, punnett, TRACOS, type Genotipo, type Traco } from '../data/jogosFinais';
import { pontosParciais } from '../lib/pontos';
import { cores, sombra } from '../theme';
import { embaralhar } from '../utils/embaralhar';

// Ervilhas de Mendel (9º ano): dominante e recessivo, quadro de Punnett e proporções.
// As rodadas vão do mais fácil ao mais difícil: fenótipo → quadro → proporção, duas vezes.

const COR = '#1E9C90';
const COR_CLARA = '#DDF6F3';
const ORDEM = ['fenotipo', 'punnett', 'proporcao', 'fenotipo', 'punnett', 'proporcao'] as const;

type Pergunta =
  | { tipo: 'fenotipo'; traco: Traco; g: Genotipo; inverso: boolean }
  | { tipo: 'punnett'; traco: Traco; g1: Genotipo; g2: Genotipo }
  | { tipo: 'proporcao'; traco: Traco; g1: Genotipo; g2: Genotipo; alvoDominante: boolean };

// Cruzamentos com pelo menos um pai que tem os dois fatores diferentes (ou o clássico VV × vv)
const CRUZAMENTOS: [Genotipo, Genotipo][] = [
  [1, 1],
  [1, 0],
  [2, 0],
  [2, 1],
];

const sortear = <T,>(lista: readonly T[]) => lista[Math.floor(Math.random() * lista.length)];

function novaPergunta(tipo: (typeof ORDEM)[number], usados: string[]): Pergunta {
  // Evita repetir a mesma característica em rodadas seguidas
  const traco = sortear(TRACOS.filter((t) => t.id !== usados[usados.length - 1]));
  if (tipo === 'fenotipo') {
    const inverso = Math.random() < 0.4;
    return { tipo, traco, g: inverso ? 0 : sortear([2, 1, 0] as Genotipo[]), inverso };
  }
  const par = embaralhar(sortear(CRUZAMENTOS));
  if (tipo === 'punnett') return { tipo, traco, g1: par[0], g2: par[1] };
  return { tipo, traco, g1: par[0], g2: par[1], alvoDominante: Math.random() < 0.5 };
}

type Opcao = { texto: string; certo: boolean; dominante?: boolean };

function opcoesDe(p: Pergunta): Opcao[] {
  if (p.tipo === 'fenotipo') {
    if (p.inverso) return ([2, 1, 0] as Genotipo[]).map((g) => ({ texto: escreverGenotipo(p.traco, g), certo: g === 0 }));
    return [
      { texto: p.traco.dominante, certo: p.g > 0, dominante: true },
      { texto: p.traco.recessivo, certo: p.g === 0, dominante: false },
    ];
  }
  if (p.tipo === 'proporcao') {
    const n = contar(p);
    return [0, 1, 2, 3, 4].map((k) => ({ texto: String(k), certo: k === n }));
  }
  return [];
}

function contar(p: Extract<Pergunta, { tipo: 'proporcao' }>) {
  return punnett(p.g1, p.g2).filter((g) => (g > 0) === p.alvoDominante).length;
}

function explicacao(p: Pergunta) {
  const t = p.traco;
  const M = t.letra;
  const m = t.letra.toLowerCase();
  if (p.tipo === 'fenotipo') {
    return `${M} é dominante: basta um ${M} para ser ${t.dominante}. ${cap(t.recessivo)} só aparece em ${m}${m}.`;
  }
  if (p.tipo === 'punnett') {
    return 'Cada pai passa um fator (uma letra) para o filho. Por isso cada quadradinho tem uma letra de cada pai.';
  }
  const n = contar(p);
  const f = p.alvoDominante ? t.dominante : t.recessivo;
  return `${n} de 4: no quadro de Punnett, ${n} ${n === 1 ? 'quadradinho tem' : 'quadradinhos têm'} ${f}.`;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Mendel() {
  const [partida, setPartida] = useState(0);
  const [perguntas, setPerguntas] = useState<Pergunta[]>(gerarPartida);
  const [i, setI] = useState(0);
  const [erros, setErros] = useState(0);
  const [errosRodada, setErrosRodada] = useState(0);
  const [erradas, setErradas] = useState<string[]>([]);
  const [respondido, setRespondido] = useState(false);
  const [celulas, setCelulas] = useState<(Genotipo | null)[]>([null, null, null, null]);
  const [celulasErradas, setCelulasErradas] = useState<number[]>([]);
  const [inicio, setInicio] = useState(() => Date.now());
  const [fim, setFim] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'acerto' | 'dica'; n: number } | null>(null);

  const p = perguntas[i];
  const acertos = i + (respondido ? 1 : 0);

  const avisar = (texto: string, tipo: 'acerto' | 'dica') => setAviso((a) => ({ texto, tipo, n: (a?.n ?? 0) + 1 }));

  const errar = (texto: string) => {
    setErros((e) => e + 1);
    setErrosRodada((e) => e + 1);
    avisar(texto, 'dica');
  };

  const acertar = () => {
    setRespondido(true);
    avisar(`✨ ${explicacao(p)}`, 'acerto');
  };

  const escolher = (o: Opcao) => {
    if (respondido || erradas.includes(o.texto)) return;
    if (o.certo) acertar();
    else {
      setErradas((x) => [...x, o.texto]);
      errar(p.tipo === 'proporcao' && errosRodada >= 1 ? 'Olhe o quadro de Punnett abaixo e conte.' : 'Ainda não. Lembre: a letra maiúscula manda.');
    }
  };

  const girarCelula = (k: number) => {
    if (respondido) return;
    // Ciclo: ? → VV → Vv → vv → VV ...
    setCelulas((c) => c.map((v, j) => (j === k ? (v === null ? 2 : v === 2 ? 1 : v === 1 ? 0 : 2) : v)));
    setCelulasErradas((x) => x.filter((j) => j !== k));
  };

  const conferirQuadro = () => {
    if (p.tipo !== 'punnett') return;
    const certo = punnett(p.g1, p.g2);
    const errados = celulas.map((v, k) => (v === certo[k] ? -1 : k)).filter((k) => k >= 0);
    if (errados.length === 0) acertar();
    else {
      setCelulasErradas(errados);
      errar(`${errados.length === 1 ? '1 quadradinho está errado' : `${errados.length} quadradinhos estão errados`}. Junte a letra de cima com a da esquerda.`);
    }
  };

  const proxima = () => {
    if (i === perguntas.length - 1) {
      setFim(Date.now());
      return;
    }
    setI(i + 1);
    setRespondido(false);
    setErradas([]);
    setErrosRodada(0);
    setCelulas([null, null, null, null]);
    setCelulasErradas([]);
    setAviso(null);
  };

  const recomeçar = () => {
    setPerguntas(gerarPartida());
    setPartida((n) => n + 1);
    setI(0);
    setErros(0);
    setErrosRodada(0);
    setErradas([]);
    setRespondido(false);
    setCelulas([null, null, null, null]);
    setCelulasErradas([]);
    setAviso(null);
    setFim(null);
    setInicio(Date.now());
  };

  if (fim !== null) {
    return (
      <FimDeJogo
        key={`fim-${partida}`}
        modo="mendel"
        nivel="finais"
        resultado={{ acertos: perguntas.length, erros, tempoMs: fim - inicio, tempoIdealSeg: perguntas.length * 20 }}
        titulo="Geneticista nota 10!"
        texto="Você cruzou ervilhas como o Mendel e descobriu como os fatores passam dos pais para os filhos."
        onDeNovo={recomeçar}
      />
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <TopoJogo titulo="Ervilhas de Mendel" cor={COR} direita={<Placar texto={`⭐ ${pontosParciais(acertos, erros)}`} cor={COR} />} />
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.progresso}>
          {perguntas.map((_, k) => (
            <View key={k} style={[styles.ponto, k < acertos && { backgroundColor: COR }, k === i && !respondido && styles.pontoAtual]} />
          ))}
        </View>

        <View style={styles.legenda}>
          <Text style={styles.legendaTexto}>
            🔠 {p.traco.letra} = dominante · {p.traco.letra.toLowerCase()} = recessivo
          </Text>
        </View>

        <View style={styles.cartao}>
          {p.tipo === 'fenotipo' && <Fenotipo p={p} />}
          {(p.tipo === 'punnett' || p.tipo === 'proporcao') && <Cruzamento traco={p.traco} g1={p.g1} g2={p.g2} />}

          <Text style={styles.pergunta}>{enunciado(p)}</Text>

          {p.tipo === 'punnett' || (p.tipo === 'proporcao' && errosRodada >= 2) ? (
            <Quadro
              traco={p.traco}
              g1={p.g1}
              g2={p.g2}
              valores={p.tipo === 'punnett' ? celulas : punnett(p.g1, p.g2)}
              erradas={celulasErradas}
              mostrarFenotipo={respondido || p.tipo === 'proporcao'}
              onToque={p.tipo === 'punnett' ? girarCelula : undefined}
            />
          ) : null}

          {p.tipo !== 'punnett' && (
            <View style={styles.opcoes}>
              {opcoesDe(p).map((o) => {
                const errada = erradas.includes(o.texto);
                const certa = respondido && o.certo;
                return (
                  <Pressable
                    key={o.texto}
                    onPress={() => escolher(o)}
                    style={({ pressed }) => [
                      styles.opcao,
                      p.tipo === 'proporcao' && styles.opcaoNumero,
                      errada && styles.opcaoErrada,
                      certa && styles.opcaoCerta,
                      pressed && !respondido && styles.apertado,
                    ]}
                  >
                    {o.dominante !== undefined && <Ervilha traco={p.traco.id} dominante={o.dominante} tam={34} />}
                    <Text style={[styles.opcaoTexto, errada && { color: '#B0AACB' }]} selectable={false}>
                      {o.texto}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {p.tipo === 'punnett' && !respondido && (
            <Pressable
              onPress={conferirQuadro}
              disabled={celulas.includes(null)}
              style={({ pressed }) => [styles.botao, celulas.includes(null) && styles.botaoDesligado, pressed && styles.apertado]}
            >
              <Text style={styles.botaoTexto}>{celulas.includes(null) ? 'Toque nos quadradinhos' : 'Conferir'}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.balaoArea}>{aviso && <Balao key={aviso.n} texto={aviso.texto} tipo={aviso.tipo} />}</View>

        {respondido && (
          <Pressable onPress={proxima} style={({ pressed }) => [styles.botao, pressed && styles.apertado]}>
            <Text style={styles.botaoTexto}>{i === perguntas.length - 1 ? 'Ver resultado' : 'Próxima'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function gerarPartida(): Pergunta[] {
  const lista: Pergunta[] = [];
  for (const tipo of ORDEM) lista.push(novaPergunta(tipo, lista.map((q) => q.traco.id)));
  return lista;
}

function enunciado(p: Pergunta) {
  const t = p.traco;
  if (p.tipo === 'fenotipo') {
    return p.inverso
      ? `Uma planta tem ${t.titulo} ${t.recessivo}. Qual é o genótipo dela?`
      : `Uma planta ${escreverGenotipo(t, p.g)}. Como é a ${t.titulo}?`;
  }
  if (p.tipo === 'punnett') return 'Complete o quadro de Punnett: quais filhos esse cruzamento pode ter?';
  return `De cada 4 filhos desse cruzamento, quantos devem ter ${t.titulo} ${p.alvoDominante ? t.dominante : t.recessivo}?`;
}

function Fenotipo({ p }: { p: Extract<Pergunta, { tipo: 'fenotipo' }> }) {
  return (
    <View style={styles.cruz}>
      {p.inverso ? (
        <Ervilha traco={p.traco.id} dominante={false} tam={60} />
      ) : (
        <View style={styles.genotipoGrande}>
          <Text style={styles.genotipoGrandeTexto}>{escreverGenotipo(p.traco, p.g)}</Text>
        </View>
      )}
    </View>
  );
}

function Cruzamento({ traco, g1, g2 }: { traco: Traco; g1: Genotipo; g2: Genotipo }) {
  return (
    <View style={styles.cruz}>
      <Pai traco={traco} g={g1} />
      <Text style={styles.vezes}>×</Text>
      <Pai traco={traco} g={g2} />
    </View>
  );
}

function Pai({ traco, g }: { traco: Traco; g: Genotipo }) {
  return (
    <View style={styles.pai}>
      <Ervilha traco={traco.id} dominante={g > 0} tam={46} />
      <Text style={styles.paiGenotipo}>{escreverGenotipo(traco, g)}</Text>
      <Text style={styles.paiFenotipo}>{fenotipo(traco, g)}</Text>
    </View>
  );
}

function Quadro({
  traco,
  g1,
  g2,
  valores,
  erradas,
  mostrarFenotipo,
  onToque,
}: {
  traco: Traco;
  g1: Genotipo;
  g2: Genotipo;
  valores: (Genotipo | null)[];
  erradas: number[];
  mostrarFenotipo: boolean;
  onToque?: (k: number) => void;
}) {
  const letra = (d: 0 | 1) => (d ? traco.letra : traco.letra.toLowerCase());
  const topo = gametas(g1);
  const lado = gametas(g2);
  return (
    <View style={styles.quadro}>
      <View style={styles.linha}>
        <View style={styles.canto} />
        {topo.map((d, k) => (
          <Text key={k} style={styles.gameta}>
            {letra(d)}
          </Text>
        ))}
      </View>
      {lado.map((d, r) => (
        <View key={r} style={styles.linha}>
          <Text style={[styles.gameta, styles.gametaLado]}>{letra(d)}</Text>
          {topo.map((_, c) => {
            const k = r * 2 + c;
            const v = valores[k];
            return (
              <Pressable
                key={c}
                onPress={onToque ? () => onToque(k) : undefined}
                disabled={!onToque}
                style={[styles.celula, erradas.includes(k) && styles.celulaErrada, v !== null && mostrarFenotipo && styles.celulaFeita]}
              >
                {v === null ? (
                  <Text style={styles.celulaVazia}>?</Text>
                ) : (
                  <>
                    {mostrarFenotipo && <Ervilha traco={traco.id} dominante={v > 0} tam={22} />}
                    <Text style={styles.celulaTexto} selectable={false}>
                      {escreverGenotipo(traco, v)}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingHorizontal: 16, paddingBottom: 24 },
  progresso: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  ponto: { width: 12, height: 12, borderRadius: 6, backgroundColor: cores.cinza },
  pontoAtual: { backgroundColor: cores.branco, borderWidth: 3, borderColor: COR },
  legenda: { alignSelf: 'center', backgroundColor: COR_CLARA, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 12 },
  legendaTexto: { fontSize: 13, fontWeight: '800', color: COR },
  cartao: { backgroundColor: cores.branco, borderRadius: 24, padding: 18, gap: 14, ...sombra },
  cruz: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 },
  vezes: { fontSize: 30, fontWeight: '900', color: cores.textoSuave },
  pai: { alignItems: 'center', gap: 4, minWidth: 80 },
  paiGenotipo: { fontSize: 22, fontWeight: '900', color: cores.texto, letterSpacing: 1 },
  paiFenotipo: { fontSize: 13, fontWeight: '700', color: cores.textoSuave },
  genotipoGrande: { backgroundColor: COR_CLARA, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 26 },
  genotipoGrandeTexto: { fontSize: 40, fontWeight: '900', color: COR, letterSpacing: 2 },
  pergunta: { fontSize: 17, fontWeight: '800', color: cores.texto, textAlign: 'center', lineHeight: 23 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 120,
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: cores.cinza,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: cores.branco,
  },
  opcaoNumero: { minWidth: 54, paddingHorizontal: 12 },
  opcaoErrada: { borderColor: '#F4C7D3', backgroundColor: '#FFF2F5' },
  opcaoCerta: { borderColor: COR, backgroundColor: COR_CLARA },
  opcaoTexto: { fontSize: 19, fontWeight: '900', color: cores.texto },
  quadro: { alignSelf: 'center', gap: 6 },
  linha: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  canto: { width: 34 },
  gameta: { width: 78, textAlign: 'center', fontSize: 22, fontWeight: '900', color: COR },
  gametaLado: { width: 34 },
  celula: {
    width: 78,
    height: 70,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: cores.cinza,
    backgroundColor: '#FBFAFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  celulaFeita: { borderColor: COR, backgroundColor: COR_CLARA },
  celulaErrada: { borderColor: '#F0466E', backgroundColor: '#FFF2F5' },
  celulaVazia: { fontSize: 24, fontWeight: '900', color: '#C9C4E0' },
  celulaTexto: { fontSize: 19, fontWeight: '900', color: cores.texto, letterSpacing: 1 },
  botao: { marginTop: 4, backgroundColor: COR, borderRadius: 999, paddingVertical: 16, alignItems: 'center', ...sombra },
  botaoDesligado: { backgroundColor: '#A9D9D3' },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  apertado: { transform: [{ scale: 0.97 }] },
  balaoArea: { minHeight: 80, justifyContent: 'center', paddingVertical: 12 },
});
