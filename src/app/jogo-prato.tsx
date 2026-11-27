import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Balao, FimDeJogo, Placar, TopoJogo } from '../components/jogos/Moldura';
import { ALIMENTOS, GRUPOS, type Alimento, type GrupoId } from '../data/jogosFinais';
import { pontosParciais } from '../lib/pontos';
import { cores, sombra } from '../theme';
import { embaralhar } from '../utils/embaralhar';
import { comAcesso } from '../components/ExigeAcesso';

// Prato equilibrado: escolha um alimento e coloque na parte certa do prato.
// Metade do prato é de reguladores (2 vagas), um quarto de energéticos e um quarto de construtores.
// Ultraprocessados não entram no prato do dia a dia.

const COR = '#2BA84A';
const PRATOS = 5;
const POR_PRATO = Object.values(GRUPOS).reduce((s, g) => s + g.vagas, 0);
const REFEICOES = ['🍽️ Almoço', '🌙 Jantar', '🍽️ Almoço de domingo', '🌙 Jantar rápido', '🍽️ Almoço da escola'];

const doGrupo = (g: Alimento['grupo'], n: number) => embaralhar(ALIMENTOS.filter((a) => a.grupo === g)).slice(0, n);

function novasOpcoes(): Alimento[] {
  return embaralhar([...doGrupo('reguladores', 3), ...doGrupo('energeticos', 2), ...doGrupo('construtores', 2), ...doGrupo('ultra', 2)]);
}

type Prato = Record<GrupoId, Alimento[]>;
const pratoVazio = (): Prato => ({ reguladores: [], energeticos: [], construtores: [] });

function PratoEquilibrado() {
  const { width } = useWindowDimensions();
  const tam = Math.min(width - 48, 300);

  const [partida, setPartida] = useState(0);
  const [n, setN] = useState(0);
  const [opcoes, setOpcoes] = useState<Alimento[]>(novasOpcoes);
  const [usados, setUsados] = useState<string[]>([]);
  const [prato, setPrato] = useState<Prato>(pratoVazio);
  const [escolhido, setEscolhido] = useState<Alimento | null>(null);
  const [colocados, setColocados] = useState(0);
  const [erros, setErros] = useState(0);
  const [inicio, setInicio] = useState(() => Date.now());
  const [fim, setFim] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'acerto' | 'dica'; k: number } | null>(null);

  const completo = (Object.keys(GRUPOS) as GrupoId[]).every((g) => prato[g].length >= GRUPOS[g].vagas);
  const avisar = (texto: string, tipo: 'acerto' | 'dica') => setAviso((a) => ({ texto, tipo, k: (a?.k ?? 0) + 1 }));

  const tocarAlimento = (a: Alimento) => {
    if (completo || usados.includes(a.nome)) return;
    setEscolhido((e) => (e?.nome === a.nome ? null : a));
  };

  const tocarParte = (g: GrupoId) => {
    if (completo) return;
    if (!escolhido) {
      avisar('Primeiro escolha um alimento lá embaixo.', 'dica');
      return;
    }
    const a = escolhido;
    if (a.grupo === 'ultra') {
      setErros((e) => e + 1);
      setUsados((u) => [...u, a.nome]);
      setEscolhido(null);
      avisar(`${a.emoji} ${a.nome} é ultraprocessado. Fica para um dia especial, não para o prato do dia a dia.`, 'dica');
      return;
    }
    if (a.grupo !== g) {
      setErros((e) => e + 1);
      avisar(`${a.emoji} ${a.nome} é ${GRUPOS[a.grupo].singular}: ${GRUPOS[a.grupo].descricao.split(':')[1].trim()}.`, 'dica');
      return;
    }
    if (prato[g].length >= GRUPOS[g].vagas) {
      avisar(`A parte dos ${GRUPOS[g].nome.toLowerCase()} já está completa. Escolha outro alimento.`, 'dica');
      setEscolhido(null);
      return;
    }
    const novo = { ...prato, [g]: [...prato[g], a] };
    setPrato(novo);
    setUsados((u) => [...u, a.nome]);
    setEscolhido(null);
    setColocados((c) => c + 1);
    const pronto = (Object.keys(GRUPOS) as GrupoId[]).every((k) => novo[k].length >= GRUPOS[k].vagas);
    avisar(pronto ? '🎉 Prato completo e colorido! Assim o corpo recebe energia, proteínas e vitaminas.' : `✨ Isso! ${a.nome} é ${GRUPOS[g].singular}.`, 'acerto');
  };

  const proximo = () => {
    if (n === PRATOS - 1) {
      setFim(Date.now());
      return;
    }
    setN(n + 1);
    setOpcoes(novasOpcoes());
    setUsados([]);
    setPrato(pratoVazio());
    setEscolhido(null);
    setAviso(null);
  };

  const recomeçar = () => {
    setPartida((p) => p + 1);
    setN(0);
    setOpcoes(novasOpcoes());
    setUsados([]);
    setPrato(pratoVazio());
    setEscolhido(null);
    setColocados(0);
    setErros(0);
    setAviso(null);
    setFim(null);
    setInicio(Date.now());
  };

  if (fim !== null) {
    return (
      <FimDeJogo
        key={`fim-${partida}`}
        modo="prato"
        nivel="finais"
        resultado={{ acertos: PRATOS * POR_PRATO, erros, tempoMs: fim - inicio, tempoIdealSeg: PRATOS * POR_PRATO * 6 }}
        titulo="Chef do corpo!"
        texto={`Você montou ${PRATOS} pratos equilibrados, com comida de verdade.`}
        onDeNovo={recomeçar}
      />
    );
  }

  const parte = (g: GrupoId, estilo: object) => {
    const info = GRUPOS[g];
    const cheio = prato[g].length >= info.vagas;
    const alvo = escolhido && !cheio;
    return (
      <Pressable
        onPress={() => tocarParte(g)}
        style={({ pressed }) => [styles.parte, estilo, { backgroundColor: info.corClara }, alvo && styles.parteAlvo, pressed && { opacity: 0.8 }]}
      >
        <Text style={[styles.parteNome, { color: info.cor }]} selectable={false}>
          {info.nome}
        </Text>
        <View style={styles.parteItens}>
          {prato[g].map((a) => (
            <Text key={a.nome} style={styles.parteEmoji}>
              {a.emoji}
            </Text>
          ))}
          {Array.from({ length: info.vagas - prato[g].length }).map((_, k) => (
            <View key={k} style={[styles.vaga, { borderColor: info.cor }]} />
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <TopoJogo titulo="Prato equilibrado" cor={COR} direita={<Placar texto={`⭐ ${pontosParciais(colocados, erros)}`} cor={COR} />} />
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={styles.contador}>
          {REFEICOES[n]} · prato {n + 1} de {PRATOS}
        </Text>

        <View style={[styles.prato, { width: tam + 20, height: tam + 20, borderRadius: (tam + 20) / 2 }]}>
          <View style={[styles.pratoDentro, { width: tam, height: tam, borderRadius: tam / 2 }]}>
            {parte('reguladores', { flex: 1, borderRightWidth: 3, paddingLeft: 14 })}
            <View style={{ flex: 1 }}>
              {parte('energeticos', { flex: 1, borderBottomWidth: 3, paddingTop: 26, paddingRight: 14 })}
              {parte('construtores', { flex: 1, paddingBottom: 26, paddingRight: 14 })}
            </View>
          </View>
        </View>

        <Text style={styles.instrucao}>
          {completo ? 'Prato pronto!' : escolhido ? `Onde vai ${escolhido.emoji} ${escolhido.nome}? Toque na parte do prato.` : 'Escolha um alimento e depois a parte do prato'}
        </Text>

        <View style={styles.balaoArea}>{aviso && <Balao key={aviso.k} texto={aviso.texto} tipo={aviso.tipo} />}</View>

        {completo ? (
          <Pressable onPress={proximo} style={({ pressed }) => [styles.botao, pressed && styles.apertado]}>
            <Text style={styles.botaoTexto}>{n === PRATOS - 1 ? 'Ver resultado' : 'Próximo prato'}</Text>
          </Pressable>
        ) : (
          <View style={styles.alimentos}>
            {opcoes.map((a) => {
              const usado = usados.includes(a.nome);
              const sel = escolhido?.nome === a.nome;
              return (
                <Pressable
                  key={a.nome}
                  onPress={() => tocarAlimento(a)}
                  disabled={usado}
                  style={({ pressed }) => [styles.alimento, sel && styles.alimentoSel, usado && styles.alimentoUsado, pressed && styles.apertado]}
                >
                  <Text style={styles.alimentoEmoji}>{a.emoji}</Text>
                  <Text style={styles.alimentoNome} numberOfLines={2} selectable={false}>
                    {a.nome}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.legenda}>
          {(Object.keys(GRUPOS) as GrupoId[]).map((g) => (
            <Text key={g} style={styles.legendaTexto}>
              <Text style={{ color: GRUPOS[g].cor, fontWeight: '900' }}>{GRUPOS[g].nome}:</Text> {GRUPOS[g].descricao.split(':')[0]}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingHorizontal: 16, paddingBottom: 24, alignItems: 'stretch' },
  contador: { textAlign: 'center', fontSize: 14, fontWeight: '800', color: cores.textoSuave, marginBottom: 10 },
  prato: { alignSelf: 'center', backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  pratoDentro: { flexDirection: 'row', overflow: 'hidden', borderWidth: 3, borderColor: '#EDE9F7' },
  parte: { alignItems: 'center', justifyContent: 'center', borderColor: cores.branco, padding: 6, gap: 4 },
  parteAlvo: { borderColor: '#FFC93C' },
  parteNome: { fontSize: 13, fontWeight: '900' },
  parteItens: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 },
  parteEmoji: { fontSize: 34 },
  vaga: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', opacity: 0.5 },
  instrucao: { textAlign: 'center', fontSize: 15, fontWeight: '800', color: cores.texto, marginTop: 14 },
  balaoArea: { minHeight: 76, justifyContent: 'center', paddingVertical: 10 },
  alimentos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  alimento: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: cores.cinza,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  alimentoSel: { borderColor: '#FFC93C', backgroundColor: '#FFF8E1', transform: [{ scale: 1.04 }] },
  alimentoUsado: { opacity: 0.3 },
  alimentoEmoji: { fontSize: 32 },
  alimentoNome: { fontSize: 12.5, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  botao: { backgroundColor: COR, borderRadius: 999, paddingVertical: 16, alignItems: 'center', ...sombra },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  apertado: { transform: [{ scale: 0.97 }] },
  legenda: { marginTop: 18, gap: 4 },
  legendaTexto: { fontSize: 12.5, color: cores.textoSuave, lineHeight: 17 },
});

export default comAcesso(PratoEquilibrado, 'finais');
