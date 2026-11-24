import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Balao, FimDeJogo, Placar, TopoJogo } from '../components/jogos/Moldura';
import { SITUACOES, type Situacao } from '../data/jogosFinais';
import { SISTEMAS, type SistemaId } from '../data/sistemas';
import { pontosParciais } from '../lib/pontos';
import { cores, sombra } from '../theme';
import { embaralhar } from '../utils/embaralhar';

// Sistemas em equipe: cada situação é feita por uma dupla de sistemas. Escolha os dois.

const COR = '#E8820C';
const COR_CLARA = '#FFF1DE';
const RODADAS = 8;
const TAMANHO_DUPLA = 2;
const ORDEM_SISTEMAS = Object.keys(SISTEMAS) as SistemaId[];

const nomeCurto = (s: SistemaId) => {
  const n = SISTEMAS[s].nome.replace('Sistema ', '');
  return n.charAt(0).toUpperCase() + n.slice(1);
};

export default function SistemasEmEquipe() {
  const [partida, setPartida] = useState(0);
  const [situacoes, setSituacoes] = useState<Situacao[]>(() => embaralhar(SITUACOES).slice(0, RODADAS));
  const [i, setI] = useState(0);
  const [marcados, setMarcados] = useState<SistemaId[]>([]);
  const [respondido, setRespondido] = useState(false);
  const [erros, setErros] = useState(0);
  const [sobrando, setSobrando] = useState<SistemaId[]>([]);
  const [inicio, setInicio] = useState(() => Date.now());
  const [fim, setFim] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'acerto' | 'dica'; n: number } | null>(null);

  const s = situacoes[i];
  const acertos = i + (respondido ? 1 : 0);

  const marcar = (id: SistemaId) => {
    if (respondido) return;
    if (!marcados.includes(id) && marcados.length >= TAMANHO_DUPLA) {
      setAviso((a) => ({ texto: 'Só dois sistemas! Desmarque um para trocar.', tipo: 'dica', n: (a?.n ?? 0) + 1 }));
      return;
    }
    setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
    setSobrando((x) => x.filter((y) => y !== id));
  };

  const conferir = () => {
    const sobra = marcados.filter((m) => !s.dupla.includes(m));
    if (sobra.length === 0) {
      setRespondido(true);
      setAviso((a) => ({ texto: `✨ ${s.explicacao}`, tipo: 'acerto', n: (a?.n ?? 0) + 1 }));
      return;
    }
    setErros((e) => e + 1);
    setSobrando(sobra);
    const texto = sobra.length === 2 ? 'Nenhum dos dois faz parte da dupla. Tente de novo!' : `${nomeCurto(sobra[0])} não faz parte da dupla. Um você acertou!`;
    setAviso((a) => ({ texto, tipo: 'dica', n: (a?.n ?? 0) + 1 }));
  };

  const proxima = () => {
    if (i === situacoes.length - 1) {
      setFim(Date.now());
      return;
    }
    setI(i + 1);
    setMarcados([]);
    setRespondido(false);
    setSobrando([]);
    setAviso(null);
  };

  const recomeçar = () => {
    setSituacoes(embaralhar(SITUACOES).slice(0, RODADAS));
    setPartida((n) => n + 1);
    setI(0);
    setMarcados([]);
    setRespondido(false);
    setErros(0);
    setSobrando([]);
    setAviso(null);
    setFim(null);
    setInicio(Date.now());
  };

  if (fim !== null) {
    return (
      <FimDeJogo
        key={`fim-${partida}`}
        modo="sistemas"
        nivel="finais"
        resultado={{ acertos: situacoes.length, erros, tempoMs: fim - inicio, tempoIdealSeg: situacoes.length * 15 }}
        titulo="Equipe completa!"
        texto="Nenhum sistema trabalha sozinho: o corpo funciona como um time."
        onDeNovo={recomeçar}
      />
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <TopoJogo titulo="Sistemas em equipe" cor={COR} direita={<Placar texto={`⭐ ${pontosParciais(acertos, erros)}`} cor={COR} />} />
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={styles.contador}>
          Situação {i + 1} de {situacoes.length}
        </Text>
        <View style={styles.situacao}>
          <Text style={styles.situacaoEmoji}>{s.emoji}</Text>
          <Text style={styles.situacaoTexto}>{s.texto}</Text>
        </View>
        <Text style={styles.instrucao}>Qual dupla de sistemas faz isso? Escolha 2.</Text>

        <View style={styles.grade}>
          {ORDEM_SISTEMAS.map((id) => {
            const sis = SISTEMAS[id];
            const ligado = marcados.includes(id);
            const errado = sobrando.includes(id);
            const principal = respondido && s.dupla.includes(id);
            return (
              <Pressable
                key={id}
                onPress={() => marcar(id)}
                style={({ pressed }) => [
                  styles.sistema,
                  ligado && { borderColor: sis.cor, backgroundColor: sis.corClara },
                  errado && styles.sistemaErrado,
                  respondido && !principal && !ligado && styles.sistemaApagado,
                  pressed && !respondido && styles.apertado,
                ]}
              >
                <Text style={styles.sistemaEmoji}>{sis.emoji}</Text>
                <Text style={[styles.sistemaNome, ligado && { color: sis.cor }]} numberOfLines={2} selectable={false}>
                  {nomeCurto(id)}
                </Text>
                {ligado && <Text style={[styles.check, { backgroundColor: errado ? '#F0466E' : sis.cor }]}>{errado ? '✕' : '✓'}</Text>}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.balaoArea}>{aviso && <Balao key={aviso.n} texto={aviso.texto} tipo={aviso.tipo} />}</View>

        {respondido ? (
          <Pressable onPress={proxima} style={({ pressed }) => [styles.botao, pressed && styles.apertado]}>
            <Text style={styles.botaoTexto}>{i === situacoes.length - 1 ? 'Ver resultado' : 'Próxima'}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={conferir}
            disabled={marcados.length < TAMANHO_DUPLA}
            style={({ pressed }) => [styles.botao, marcados.length < TAMANHO_DUPLA && styles.botaoDesligado, pressed && styles.apertado]}
          >
            <Text style={styles.botaoTexto}>{marcados.length < TAMANHO_DUPLA ? `Escolha ${TAMANHO_DUPLA - marcados.length} ${marcados.length === 1 ? 'sistema' : 'sistemas'}` : 'Conferir dupla'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingHorizontal: 16, paddingBottom: 24 },
  contador: { textAlign: 'center', fontSize: 13, fontWeight: '800', color: cores.textoSuave, marginBottom: 8 },
  situacao: { backgroundColor: COR_CLARA, borderRadius: 24, padding: 18, alignItems: 'center', gap: 6, borderWidth: 3, borderColor: '#FFD9A8' },
  situacaoEmoji: { fontSize: 48 },
  situacaoTexto: { fontSize: 20, fontWeight: '900', color: cores.texto, textAlign: 'center', lineHeight: 26 },
  instrucao: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: cores.textoSuave, marginVertical: 12 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  sistema: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.branco,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: cores.cinza,
    paddingVertical: 12,
    paddingHorizontal: 12,
    ...sombra,
    shadowOpacity: 0.06,
  },
  sistemaErrado: { borderColor: '#F0466E', backgroundColor: '#FFF2F5' },
  sistemaApagado: { opacity: 0.45 },
  sistemaEmoji: { fontSize: 24 },
  sistemaNome: { flex: 1, fontSize: 15, fontWeight: '800', color: cores.texto },
  check: { width: 22, height: 22, borderRadius: 11, color: cores.branco, fontSize: 13, fontWeight: '900', textAlign: 'center', lineHeight: 22, overflow: 'hidden' },
  balaoArea: { minHeight: 80, justifyContent: 'center', paddingVertical: 12 },
  botao: { backgroundColor: COR, borderRadius: 999, paddingVertical: 16, alignItems: 'center', ...sombra },
  botaoDesligado: { backgroundColor: '#F2C48E' },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  apertado: { transform: [{ scale: 0.97 }] },
});
