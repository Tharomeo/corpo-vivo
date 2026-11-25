import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { EXTRAS } from '../data/partes';
import { ORGAOS, PARTE_ORGAO, SISTEMAS, type Nivel, type SistemaId } from '../data/sistemas';
import { cores, sombra } from '../theme';

// Dois cartões:
// - SistemaCard: visão geral do sistema (abre ao tocar no boneco)
// - ParteCard: uma parte específica (abre pelas tags, com zoom), com botão para voltar ao sistema

type Bordas = { topInset: number; bottomInset: number };

export type CardAtual =
  | { tipo: 'sistema'; sistema: SistemaId; tocado: string | null }
  | { tipo: 'parte'; orgao: string; sistema: SistemaId };

// ---------- Moldura comum: animação, cabeçalho, expandir até o topo ----------
function Moldura({
  chave,
  cor,
  corClara,
  emoji,
  rotulo,
  titulo,
  voltar,
  onClose,
  topInset,
  bottomInset,
  children,
}: Bordas & {
  chave: string;
  cor: string;
  corClara: string;
  emoji: string;
  rotulo: string;
  titulo: string;
  voltar?: { texto: string; onPress: () => void };
  onClose: () => void;
  children: (recolher: () => void) => ReactNode;
}) {
  const { height } = useWindowDimensions();
  const [subir] = useState(() => new Animated.Value(0));
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    subir.setValue(0);
    Animated.spring(subir, { toValue: 1, useNativeDriver: true, friction: 8, tension: 70 }).start();
  }, [chave, subir]);

  const translateY = subir.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });
  // Expandido: ocupa a tela toda, até logo abaixo da barra de status
  const alturaMax = expandido ? height - topInset : height * 0.58;

  return (
    <Animated.View
      style={[
        styles.card,
        // Expandido usa altura fixa para chegar ao topo mesmo com pouco conteúdo
        expandido ? { height: alturaMax } : { maxHeight: alturaMax },
        { paddingBottom: bottomInset + 12, transform: [{ translateY }] },
        expandido && { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
      ]}
    >
      <View style={[styles.faixa, { backgroundColor: corClara }]}>
        <Pressable onPress={() => setExpandido((e) => !e)} hitSlop={8} style={styles.alcaArea}>
          <View style={styles.alca} />
        </Pressable>

        {voltar && (
          <Pressable
            onPress={voltar.onPress}
            style={({ pressed }) => [styles.voltar, { borderColor: cor }, pressed && { transform: [{ scale: 0.96 }] }]}
          >
            <Text style={[styles.voltarTexto, { color: cor }]}>‹ {voltar.texto}</Text>
          </Pressable>
        )}

        <Pressable onPress={() => setExpandido((e) => !e)} style={styles.faixaLinha}>
          <View style={styles.emojiBox}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rotulo, { color: cor }]}>{rotulo}</Text>
            <Text style={styles.titulo}>{titulo}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={styles.fechar}>
            <Text style={styles.fecharTexto}>✕</Text>
          </Pressable>
        </Pressable>
        <Pressable onPress={() => setExpandido((e) => !e)} hitSlop={6}>
          <Text style={[styles.expandir, { color: cor }]}>{expandido ? 'Toque para diminuir ▾' : 'Toque para ver tudo ▴'}</Text>
        </Pressable>
      </View>

      <ScrollView key={chave} style={styles.corpo} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {children(() => setExpandido(false))}
      </ScrollView>
    </Animated.View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.subtitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function Lista({ itens, cor }: { itens: string[]; cor: string }) {
  return (
    <>
      {itens.map((s, i) => (
        <View key={i} style={styles.item}>
          <View style={[styles.ponto, { backgroundColor: cor }]} />
          <Text style={styles.itemTexto}>{s}</Text>
        </View>
      ))}
    </>
  );
}

function Tags({ sistema, atual, onParte }: { sistema: SistemaId; atual?: string; onParte: (orgaoId: string) => void }) {
  const s = SISTEMAS[sistema];
  return (
    <View style={styles.partes}>
      {s.partes.map((p) => {
        const alvo = PARTE_ORGAO[p];
        const ativa = alvo === atual;
        return (
          <Pressable
            key={p}
            disabled={!alvo || ativa}
            onPress={() => alvo && onParte(alvo)}
            style={({ pressed }) => [
              styles.parte,
              { borderColor: s.cor, backgroundColor: ativa ? s.cor : s.corClara },
              pressed && { transform: [{ scale: 0.94 }] },
            ]}
          >
            <Text style={[styles.parteTexto, { color: ativa ? cores.branco : s.cor }]}>{p}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Abre a anotação deste sistema ou parte (a mesma de antes, se já existir)
function BotaoAnotar({ tema, nivel, cor, corClara }: { tema: string; nivel: Nivel; cor: string; corClara: string }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/anotacao', params: { tema, nivel } })}
      style={({ pressed }) => [styles.anotar, { borderColor: cor, backgroundColor: corClara }, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      <Text style={[styles.anotarTexto, { color: cor }]}>📒 Anotar no caderno</Text>
    </Pressable>
  );
}

// ---------- Cartão do sistema ----------
export function SistemaCard({
  sistema,
  tocado,
  nivel,
  onParte,
  onClose,
  sexo,
  ...bordas
}: Bordas & {
  sistema: SistemaId;
  tocado: string | null;
  nivel: Nivel;
  onParte: (orgaoId: string) => void;
  onClose: () => void;
  sexo?: { atual: 'f' | 'm'; trocar: (s: 'f' | 'm') => void }; // só no sistema reprodutor
}) {
  const s = SISTEMAS[sistema];
  const c = s[nivel];
  const orgaoTocado = tocado ? ORGAOS[tocado] : null;

  return (
    <Moldura
      chave={`sistema-${sistema}`}
      cor={s.cor}
      corClara={s.corClara}
      emoji={s.emoji}
      rotulo="Visão geral"
      titulo={s.nome}
      onClose={onClose}
      {...bordas}
    >
      {(recolher) => (
        <>
          {orgaoTocado && tocado && (
            <Pressable
              onPress={() => {
                recolher();
                onParte(tocado);
              }}
              style={({ pressed }) => [styles.tocado, { backgroundColor: s.corClara, borderColor: s.cor }, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.tocadoRotulo, { color: s.cor }]}>Você tocou em</Text>
                <Text style={styles.tocadoNome}>{orgaoTocado.nome}</Text>
              </View>
              <Text style={[styles.tocadoSeta, { color: s.cor }]}>Ver parte ›</Text>
            </Pressable>
          )}

          {sexo && (
            <View style={[styles.sexo, { backgroundColor: s.corClara }]}>
              {(['f', 'm'] as const).map((x) => (
                <Pressable
                  key={x}
                  onPress={() => sexo.trocar(x)}
                  style={[styles.sexoBotao, sexo.atual === x && { backgroundColor: s.cor }]}
                >
                  <Text style={[styles.sexoTexto, { color: sexo.atual === x ? cores.branco : s.cor }]}>{x === 'f' ? 'Feminino' : 'Masculino'}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Text style={styles.texto}>{c.resumo}</Text>
          <BotaoAnotar tema={sistema} nivel={nivel} cor={s.cor} corClara={s.corClara} />
          {nivel === 'finais' && (
            <Pressable
              onPress={() => router.push({ pathname: '/celula', params: { sistema, nivel } })}
              style={({ pressed }) => [styles.chip, { backgroundColor: s.cor }, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <Text style={[styles.chipTexto, { color: cores.branco }]}>🔬 Zoom na célula: {s.celula} ›</Text>
            </Pressable>
          )}

          <Secao titulo="Partes">
            <Text style={styles.dica}>Toque numa parte para ver de perto</Text>
            <Tags
              sistema={sistema}
              onParte={(id) => {
                recolher();
                onParte(id);
              }}
            />
          </Secao>

          <Secao titulo="Como funciona">
            {c.comoFunciona.map((passo, i) => (
              <View key={i} style={styles.passo}>
                <View style={[styles.passoNumero, { backgroundColor: s.cor }]}>
                  <Text style={styles.passoNumeroTexto}>{i + 1}</Text>
                </View>
                <Text style={styles.itemTexto}>{passo}</Text>
              </View>
            ))}
          </Secao>

          <Secao titulo="Saiba mais">
            <Lista itens={c.saibaMais} cor={s.cor} />
          </Secao>

          <Secao titulo="Cuide bem 💚">
            <Lista itens={c.saude} cor="#2EC4B6" />
          </Secao>

        </>
      )}
    </Moldura>
  );
}

// ---------- Cartão da parte ----------
export function ParteCard({
  orgao,
  sistema,
  nivel,
  onParte,
  onVoltar,
  onClose,
  ...bordas
}: Bordas & {
  orgao: string;
  sistema: SistemaId; // sistema do cartão anterior (para onde o "voltar" leva)
  nivel: Nivel;
  onParte: (orgaoId: string) => void;
  onVoltar: () => void;
  onClose: () => void;
}) {
  const o = ORGAOS[orgao];
  if (!o) return null;
  const s = SISTEMAS[o.sistema];
  const voltarPara = SISTEMAS[sistema];
  const extra = EXTRAS[orgao];

  return (
    <Moldura
      chave={`parte-${orgao}`}
      cor={s.cor}
      corClara={s.corClara}
      emoji={s.emoji}
      rotulo={s.nome}
      titulo={o.nome}
      voltar={{ texto: `Voltar para ${voltarPara.nome} ${voltarPara.emoji}`, onPress: onVoltar }}
      onClose={onClose}
      {...bordas}
    >
      {(recolher) => (
        <>
          <View style={[styles.fato, { borderColor: s.cor }]}>
            <Text style={styles.fatoTexto}>{o.fato}</Text>
          </View>
          <BotaoAnotar tema={orgao} nivel={nivel} cor={s.cor} corClara={s.corClara} />

          <Secao titulo="O que faz">
            <Text style={styles.texto}>{o[nivel]}</Text>
          </Secao>

          {extra && (
            <>
              <Secao titulo="Onde fica 📍">
                <Text style={styles.texto}>{extra.onde}</Text>
              </Secao>
              <View style={[styles.curiosidade, { backgroundColor: s.corClara }]}>
                <Text style={[styles.curiosidadeTitulo, { color: s.cor }]}>💡 Curiosidade</Text>
                <Text style={styles.curiosidadeTexto}>{extra.curiosidade}</Text>
              </View>
            </>
          )}

          <Secao titulo={`Outras partes: ${voltarPara.nome}`}>
            <Tags
              sistema={sistema}
              atual={orgao}
              onParte={(id) => {
                recolher();
                onParte(id);
              }}
            />
          </Secao>
        </>
      )}
    </Moldura>
  );
}

const styles = StyleSheet.create({
  sexo: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 12, gap: 4 },
  sexoBotao: { flex: 1, borderRadius: 999, paddingVertical: 9, alignItems: 'center' },
  sexoTexto: { fontSize: 14, fontWeight: '900' },
  anotar: { alignSelf: 'flex-start', borderWidth: 2, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, marginTop: 10 },
  anotarTexto: { fontSize: 14, fontWeight: '900' },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.branco,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    ...sombra,
  },
  faixa: { paddingHorizontal: 18, paddingBottom: 10 },
  alcaArea: { alignSelf: 'stretch', alignItems: 'center', paddingTop: 8, paddingBottom: 10 },
  alca: { width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(43,35,80,0.18)' },
  voltar: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: cores.branco,
  },
  voltarTexto: { fontSize: 13, fontWeight: '900' },
  faixaLinha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emojiBox: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.branco },
  emoji: { fontSize: 28 },
  rotulo: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  titulo: { fontSize: 24, fontWeight: '900', color: cores.texto, marginTop: 1 },
  fechar: { width: 36, height: 36, borderRadius: 18, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center' },
  fecharTexto: { fontSize: 16, color: cores.textoSuave, fontWeight: '800' },
  expandir: { fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  // flexShrink: sem isso a lista passa do limite do cartão e o fim fica cortado
  corpo: { flexShrink: 1, paddingHorizontal: 20, paddingTop: 16 },
  tocado: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 18, padding: 12, marginBottom: 14 },
  tocadoRotulo: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  tocadoNome: { fontSize: 17, fontWeight: '900', color: cores.texto },
  tocadoSeta: { fontSize: 14, fontWeight: '900' },
  fato: { borderLeftWidth: 4, paddingLeft: 12 },
  fatoTexto: { fontSize: 17, fontWeight: '800', color: cores.texto, lineHeight: 24 },
  secao: { marginTop: 18 },
  subtitulo: { fontSize: 16, fontWeight: '900', color: cores.texto, marginBottom: 8 },
  dica: { fontSize: 12.5, fontWeight: '700', color: cores.textoSuave, marginBottom: 8, marginTop: -2 },
  texto: { fontSize: 15.5, color: cores.textoSuave, lineHeight: 23 },
  passo: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  passoNumero: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  passoNumeroTexto: { color: cores.branco, fontSize: 13, fontWeight: '900' },
  partes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  parte: { borderRadius: 999, borderWidth: 1.5, paddingVertical: 6, paddingHorizontal: 12 },
  parteTexto: { fontSize: 13, fontWeight: '800' },
  item: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  ponto: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
  itemTexto: { flex: 1, fontSize: 15, color: cores.textoSuave, lineHeight: 22 },
  curiosidade: { borderRadius: 18, padding: 14, marginTop: 18 },
  curiosidadeTitulo: { fontSize: 14, fontWeight: '900', marginBottom: 4 },
  curiosidadeTexto: { fontSize: 15, color: cores.texto, lineHeight: 22 },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginTop: 8 },
  chipTexto: { fontSize: 13, fontWeight: '800' },
});
