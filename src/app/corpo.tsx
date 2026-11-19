import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyView } from '../components/BodyView';
import type { BodyViewHandle, SceneMessage } from '../components/bodyViewTypes';
import { InfoCard } from '../components/InfoCard';
import type { Nivel } from '../data/sistemas';
import { ORGAOS } from '../data/sistemas';
import { cores, sombra } from '../theme';

type Camada = 'pele' | 'musculos' | 'ossos';

const CAMADAS: { id: Camada; nome: string; cor: string }[] = [
  { id: 'pele', nome: 'Pele', cor: '#F6C6A5' },
  { id: 'musculos', nome: 'Músculos', cor: '#F0607A' },
  { id: 'ossos', nome: 'Ossos e órgãos', cor: '#FFD23F' },
];

export default function Corpo() {
  const params = useLocalSearchParams<{ nivel?: string; foco?: string }>();
  // "foco" vem da revisão do Me testar: abre direto o cartão daquela parte
  const foco = params.foco && ORGAOS[params.foco] ? params.foco : null;
  const camadaInicial: Camada = !foco
    ? 'pele'
    : ORGAOS[foco].sistema === 'tegumentar'
      ? 'pele'
      : ORGAOS[foco].sistema === 'muscular'
        ? 'musculos'
        : 'ossos';
  const nivel: Nivel = params.nivel === 'finais' ? 'finais' : 'iniciais';
  // Itens do menu do topo. O jogo das ervilhas (genética) é dos Anos Finais.
  const menu = [
    { id: 'prova', nome: 'Me testar', emoji: '📝', cor: '#FF5D8F' },
    ...(nivel === 'finais' ? [{ id: 'jogo', nome: 'Jogo', emoji: '🫛', cor: '#2EC4B6' }] : []),
  ] as const;
  const insets = useSafeAreaInsets();

  const scene = useRef<BodyViewHandle>(null);
  const [camada, setCamada] = useState<Camada>(camadaInicial);
  const [selecionado, setSelecionado] = useState<string | null>(foco);
  const [status, setStatus] = useState<'carregando' | 'pronto' | 'erro'>('carregando');

  const trocarCamada = (c: Camada) => {
    setCamada(c);
    setSelecionado(null);
    scene.current?.run(`setLayer('${c}'); highlight(null);`);
  };

  const fecharCard = () => {
    setSelecionado(null);
    scene.current?.run('highlight(null);');
  };

  const onMessage = useCallback(
    (msg: SceneMessage) => {
      if (msg.type === 'ready') {
        setStatus('pronto');
        scene.current?.run(`setLayer('${camada}');`);
        if (selecionado) scene.current?.run(`highlight('${ORGAOS[selecionado].sistema}');`);
      } else if (msg.type === 'error') {
        setStatus('erro');
      } else if (msg.type === 'tap') {
        if (msg.organ && ORGAOS[msg.organ]) {
          setSelecionado(msg.organ);
          scene.current?.run(`highlight('${ORGAOS[msg.organ].sistema}');`);
        } else {
          fecharCard();
        }
      }
    },
    [camada, selecionado],
  );

  return (
    <View style={styles.tela}>
      <BodyView ref={scene} onMessage={onMessage} />

      {/* Topo */}
      <View style={[styles.topo, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.botaoRedondo}>
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <View style={styles.menu}>
          {menu.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => router.push({ pathname: m.id === 'prova' ? '/prova' : '/jogo', params: { nivel } })}
              style={({ pressed }) => [styles.menuItem, pressed && { transform: [{ scale: 0.95 }] }]}
            >
              <View style={[styles.menuEmoji, { backgroundColor: m.cor }]}>
                <Text style={styles.menuEmojiTexto}>{m.emoji}</Text>
              </View>
              <Text style={styles.menuTexto}>{m.nome}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => scene.current?.run('resetView();')} hitSlop={12} style={styles.botaoRedondo}>
          <Text style={styles.resetTexto}>⟲</Text>
        </Pressable>
      </View>

      {status === 'erro' && (
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>Não consegui carregar o 3D. Confira a internet e abra a tela de novo.</Text>
        </View>
      )}

      {/* Rodapé: dica + camadas */}
      {!selecionado && (
        <View style={[styles.rodape, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.dica}>Arraste para girar · pince para zoom · toque numa parte</Text>
          <View style={styles.camadas}>
            {CAMADAS.map((c) => {
              const ativa = camada === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => trocarCamada(c.id)}
                  style={[styles.camada, ativa && { backgroundColor: cores.texto }]}
                >
                  <View style={[styles.camadaPonto, { backgroundColor: c.cor }]} />
                  <Text style={[styles.camadaTexto, ativa && { color: cores.branco }]} numberOfLines={1}>
                    {c.nome}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {selecionado && <InfoCard organ={selecionado} nivel={nivel} onClose={fecharCard} bottomInset={insets.bottom} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#EAF4FF' },
  topo: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  botaoRedondo: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  voltarTexto: { fontSize: 30, lineHeight: 32, color: cores.texto, fontWeight: '700', marginTop: -3 },
  resetTexto: { fontSize: 22, color: cores.texto, fontWeight: '700' },
  menu: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: cores.branco, borderRadius: 999, paddingVertical: 6, paddingLeft: 6, paddingRight: 14, ...sombra },
  menuEmoji: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  menuEmojiTexto: { fontSize: 16 },
  menuTexto: { fontSize: 14, fontWeight: '800', color: cores.texto },
  aviso: { position: 'absolute', top: '45%', left: 24, right: 24, backgroundColor: cores.branco, borderRadius: 20, padding: 18, ...sombra },
  avisoTexto: { textAlign: 'center', color: cores.texto, fontWeight: '700', fontSize: 15 },
  rodape: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, alignItems: 'center' },
  dica: { fontSize: 12.5, fontWeight: '700', color: cores.textoSuave, marginBottom: 10 },
  camadas: { flexDirection: 'row', backgroundColor: cores.branco, borderRadius: 999, padding: 6, gap: 4, ...sombra },
  camada: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 999 },
  camadaPonto: { width: 12, height: 12, borderRadius: 6 },
  camadaTexto: { fontSize: 14, fontWeight: '800', color: cores.texto },
});
