import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyView } from '../components/BodyView';
import type { BodyViewHandle, SceneMessage } from '../components/bodyViewTypes';
import { ParteCard, SistemaCard, type CardAtual } from '../components/InfoCard';
import type { Nivel, SistemaId } from '../data/sistemas';
import { camadaDoSistema, ORGAOS } from '../data/sistemas';
import { cores, sombra } from '../theme';

type Camada = 'pele' | 'musculos' | 'ossos';

const CAMADAS: { id: Camada; nome: string; cor: string }[] = [
  { id: 'pele', nome: 'Pele', cor: '#F6C6A5' },
  { id: 'musculos', nome: 'Músculos', cor: '#F0607A' },
  { id: 'ossos', nome: 'Ossos e órgãos', cor: '#FFD23F' },
];

export default function Corpo() {
  const params = useLocalSearchParams<{ nivel?: string; foco?: string }>();
  // "foco" vem da revisão do Me testar: abre direto o cartão daquela parte, com zoom
  const foco = params.foco && ORGAOS[params.foco] ? params.foco : null;
  const camadaInicial: Camada = foco ? camadaDoSistema(ORGAOS[foco].sistema) : 'pele';
  const nivel: Nivel = params.nivel === 'finais' ? 'finais' : 'iniciais';
  // Itens do menu do topo
  const menu = [
    { id: 'prova', nome: 'Me testar', emoji: '📝', cor: '#FF5D8F' },
    { id: 'jogos', nome: 'Jogos', emoji: '🎮', cor: '#2EC4B6' },
  ] as const;
  const insets = useSafeAreaInsets();

  const scene = useRef<BodyViewHandle>(null);
  const [camada, setCamada] = useState<Camada>(camadaInicial);
  const [card, setCard] = useState<CardAtual | null>(foco ? { tipo: 'parte', orgao: foco, sistema: ORGAOS[foco].sistema } : null);
  const [status, setStatus] = useState<'carregando' | 'pronto' | 'erro'>('carregando');

  const run = (js: string) => scene.current?.run(js);

  const trocarCamada = (c: Camada) => {
    setCamada(c);
    setCard(null);
    run(`setLayer('${c}'); highlight(null);`);
  };

  // Com um cartão aberto, a imagem 3D sobe para o que está em foco aparecer acima dele
  const temCard = card !== null;
  useEffect(() => {
    if (status === 'pronto') scene.current?.run(`setBottomInset(${temCard ? 0.55 : 0});`);
  }, [temCard, status]);

  // Visão geral de um sistema: destaca e enquadra o sistema inteiro
  const abrirSistema = (sistema: SistemaId, tocado: string | null) => {
    const c = camadaDoSistema(sistema);
    setCamada(c);
    setCard({ tipo: 'sistema', sistema, tocado });
    run(`setLayer('${c}'); highlight('${sistema}'); focusSystem('${sistema}');`);
  };

  // Parte específica: troca a camada se precisar, aproxima e abre o cartão da parte.
  // "sistema" é o sistema de onde a pessoa veio, para o botão de voltar.
  const abrirParte = (orgaoId: string, sistema: SistemaId) => {
    const destino = ORGAOS[orgaoId];
    if (!destino) return;
    const c = camadaDoSistema(destino.sistema);
    setCamada(c);
    setCard({ tipo: 'parte', orgao: orgaoId, sistema });
    run(`setLayer('${c}'); highlight('${sistema}'); focusOrgan('${orgaoId}');`);
  };

  const fecharCard = () => {
    setCard(null);
    run('highlight(null); resetView();');
  };

  const onMessage = useCallback(
    (msg: SceneMessage) => {
      if (msg.type === 'ready') {
        setStatus('pronto');
        scene.current?.run(`setLayer('${camada}');`);
        if (card?.tipo === 'parte') scene.current?.run(`highlight('${card.sistema}'); focusOrgan('${card.orgao}');`);
      } else if (msg.type === 'error') {
        setStatus('erro');
      } else if (msg.type === 'tap') {
        if (msg.organ && ORGAOS[msg.organ]) {
          // Tocar no boneco abre a visão geral do sistema daquela parte
          const sistema = ORGAOS[msg.organ].sistema;
          setCard({ tipo: 'sistema', sistema, tocado: msg.organ });
          scene.current?.run(`highlight('${sistema}'); focusSystem('${sistema}');`);
        } else {
          setCard(null);
          scene.current?.run('highlight(null); resetView();');
        }
      }
    },
    [camada, card],
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
              onPress={() => router.push({ pathname: m.id === 'prova' ? '/prova' : '/jogos', params: { nivel } })}
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
      {!card && (
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

      {card?.tipo === 'sistema' && (
        <SistemaCard
          sistema={card.sistema}
          tocado={card.tocado}
          nivel={nivel}
          onParte={(id) => abrirParte(id, card.sistema)}
          onClose={fecharCard}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      )}
      {card?.tipo === 'parte' && (
        <ParteCard
          orgao={card.orgao}
          sistema={card.sistema}
          nivel={nivel}
          onParte={(id) => abrirParte(id, card.sistema)}
          onVoltar={() => abrirSistema(card.sistema, null)}
          onClose={fecharCard}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      )}
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
