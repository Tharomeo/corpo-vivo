import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyView } from '../components/BodyView';
import type { BodyViewHandle, SceneMessage } from '../components/bodyViewTypes';
import { CELULAS, ORGANELAS, type OrganelaId } from '../data/celula';
import { SISTEMAS, type SistemaId } from '../data/sistemas';
import { CELL_HTML } from '../three/cellScene';
import { cores, sombra } from '../theme';

// Zoom na célula: a célula típica de um sistema, com as organelas para tocar.

export default function Celula() {
  const params = useLocalSearchParams<{ sistema?: string }>();
  const sistema: SistemaId = params.sistema && params.sistema in SISTEMAS ? (params.sistema as SistemaId) : 'nervoso';
  const s = SISTEMAS[sistema];
  const tipo = CELULAS[sistema];
  const insets = useSafeAreaInsets();
  const scene = useRef<BodyViewHandle>(null);
  const [status, setStatus] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
  const [sel, setSel] = useState<OrganelaId | null>(null);

  const escolher = (id: OrganelaId | null) => {
    setSel(id);
    scene.current?.run(id ? `destacar('${id}');` : 'destacar(null);');
  };

  const onMessage = useCallback(
    (msg: SceneMessage) => {
      if (msg.type === 'ready') {
        setStatus('pronto');
        scene.current?.run(`montarCelula('${tipo.forma}', '${tipo.organelas.join(',')}');`);
      } else if (msg.type === 'error') {
        setStatus('erro');
      } else if (msg.type === 'tap') {
        const id = msg.organ && msg.organ in ORGANELAS ? (msg.organ as OrganelaId) : null;
        setSel(id);
        scene.current?.run(id ? `destacar('${id}');` : 'destacar(null);');
      }
    },
    [tipo],
  );

  const o = sel ? ORGANELAS[sel] : null;

  return (
    <View style={styles.tela}>
      <View style={styles.cena}>
        <BodyView ref={scene} html={CELL_HTML} titulo="Célula 3D" onMessage={onMessage} />
        <View style={[styles.topo, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.redondo}>
            <Text style={styles.voltarTexto}>‹</Text>
          </Pressable>
          <View style={[styles.titulo, { borderColor: s.cor }]}>
            <Text style={[styles.tituloRotulo, { color: s.cor }]}>🔬 Zoom na célula</Text>
            <Text style={styles.tituloNome} numberOfLines={1}>
              {tipo.nome}
            </Text>
          </View>
          <Pressable onPress={() => escolher(null)} hitSlop={12} style={styles.redondo}>
            <Text style={styles.resetTexto}>⟲</Text>
          </Pressable>
        </View>
        {status === 'erro' && <Text style={styles.erro}>Não consegui carregar o 3D. Confira a internet.</Text>}
      </View>

      <View style={[styles.painel, { paddingBottom: insets.bottom + 12 }]}>
        <ScrollView contentContainerStyle={styles.painelConteudo} showsVerticalScrollIndicator={false}>
          {o ? (
            <View style={[styles.organela, { borderColor: o.cor }]}>
              <Text style={[styles.organelaNome, { color: o.cor }]}>{o.nome}</Text>
              <Text style={styles.texto}>{o.funcao}</Text>
              <Text style={styles.comparacao}>🏭 {o.comparacao}</Text>
            </View>
          ) : (
            <View style={[styles.especial, { backgroundColor: s.corClara }]}>
              <Text style={[styles.especialTitulo, { color: s.cor }]}>
                {s.emoji} {s.nome}
              </Text>
              <Text style={styles.texto}>{tipo.especial}</Text>
            </View>
          )}

          <Text style={styles.dica}>Toque na célula ou numa organela:</Text>
          <View style={styles.chips}>
            {tipo.organelas.map((id) => {
              const org = ORGANELAS[id];
              const ativo = sel === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => escolher(ativo ? null : id)}
                  style={[styles.chip, { borderColor: org.cor }, ativo && { backgroundColor: org.cor }]}
                >
                  <View style={[styles.chipPonto, { backgroundColor: ativo ? cores.branco : org.cor }]} />
                  <Text style={[styles.chipTexto, ativo && { color: cores.branco }]}>{org.nome}</Text>
                </Pressable>
              );
            })}
          </View>
          {sel && (
            <Pressable onPress={() => escolher(null)} style={styles.voltarCelula}>
              <Text style={[styles.voltarCelulaTexto, { color: s.cor }]}>‹ Sobre o {tipo.nome.toLowerCase()}</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cena: { flex: 1 },
  topo: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  redondo: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  voltarTexto: { fontSize: 30, lineHeight: 32, color: cores.texto, fontWeight: '700', marginTop: -3 },
  resetTexto: { fontSize: 22, color: cores.texto, fontWeight: '800' },
  titulo: { flex: 1, backgroundColor: cores.branco, borderRadius: 18, borderWidth: 2, paddingVertical: 6, paddingHorizontal: 14, ...sombra },
  tituloRotulo: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  tituloNome: { fontSize: 17, fontWeight: '900', color: cores.texto },
  erro: { position: 'absolute', bottom: 20, left: 20, right: 20, textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#C0284F' },
  painel: { maxHeight: '48%', backgroundColor: cores.branco, borderTopLeftRadius: 28, borderTopRightRadius: 28, ...sombra },
  painelConteudo: { padding: 18, gap: 10 },
  especial: { borderRadius: 18, padding: 14, gap: 6 },
  especialTitulo: { fontSize: 15, fontWeight: '900' },
  organela: { borderLeftWidth: 5, borderRadius: 6, paddingLeft: 12, gap: 6 },
  organelaNome: { fontSize: 20, fontWeight: '900' },
  texto: { fontSize: 15, lineHeight: 22, color: cores.texto },
  comparacao: { fontSize: 14, lineHeight: 20, color: cores.textoSuave, fontWeight: '700' },
  dica: { fontSize: 13, fontWeight: '800', color: cores.textoSuave, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 },
  chipPonto: { width: 10, height: 10, borderRadius: 5 },
  chipTexto: { fontSize: 13, fontWeight: '800', color: cores.texto },
  voltarCelula: { paddingVertical: 6 },
  voltarCelulaTexto: { fontSize: 14, fontWeight: '900' },
});
