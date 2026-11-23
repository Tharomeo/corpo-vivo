import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { opcoesDeApelido } from '../../lib/apelido';
import { salvarApelido, type Jogador } from '../../lib/placar';
import { cores, sombra } from '../../theme';

// Escolha do apelido do ranking: o app sugere nomes e a pessoa escolhe um (ou sorteia de novo)
export function EscolhaApelido({
  visivel,
  atual,
  onEscolhido,
  onFechar,
}: {
  visivel: boolean;
  atual: string | null;
  onEscolhido: (j: Jogador) => void;
  onFechar?: () => void;
}) {
  const [opcoes, setOpcoes] = useState(() => opcoesDeApelido(4));
  const [escolhido, setEscolhido] = useState<string | null>(null);

  const confirmar = async () => {
    if (!escolhido) return;
    const j = await salvarApelido(escolhido);
    onEscolhido(j);
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={styles.titulo}>Escolha seu apelido</Text>
          <Text style={styles.texto}>É com ele que você aparece no ranking mundial.</Text>
          {atual && <Text style={styles.atual}>Agora: {atual}</Text>}

          <View style={styles.opcoes}>
            {opcoes.map((o) => (
              <Pressable
                key={o}
                onPress={() => setEscolhido(o)}
                style={({ pressed }) => [styles.opcao, escolhido === o && styles.opcaoAtiva, pressed && { transform: [{ scale: 0.97 }] }]}
              >
                <Text style={[styles.opcaoTexto, escolhido === o && { color: cores.branco }]}>{o}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => {
              setOpcoes(opcoesDeApelido(4));
              setEscolhido(null);
            }}
            style={({ pressed }) => [styles.sortear, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.sortearTexto}>🎲 Sortear outros</Text>
          </Pressable>

          <Pressable
            disabled={!escolhido}
            onPress={confirmar}
            style={({ pressed }) => [styles.botao, !escolhido && { opacity: 0.4 }, pressed && { transform: [{ scale: 0.97 }] }]}
          >
            <Text style={styles.botaoTexto}>Usar este apelido</Text>
          </Pressable>
          {onFechar && atual && (
            <Pressable onPress={onFechar} style={styles.cancelar}>
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(43,35,80,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  caixa: { width: '100%', maxWidth: 380, backgroundColor: cores.fundo, borderRadius: 30, padding: 22, alignItems: 'center', ...sombra },
  emoji: { fontSize: 48 },
  titulo: { fontSize: 24, fontWeight: '900', color: cores.texto, marginTop: 4 },
  texto: { fontSize: 14.5, color: cores.textoSuave, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  atual: { fontSize: 13, fontWeight: '800', color: cores.roxo, marginTop: 6 },
  opcoes: { alignSelf: 'stretch', gap: 10, marginTop: 16 },
  opcao: { borderRadius: 18, borderWidth: 2, borderColor: '#E3DBFF', backgroundColor: cores.branco, paddingVertical: 13, alignItems: 'center' },
  opcaoAtiva: { backgroundColor: cores.roxo, borderColor: cores.roxo },
  opcaoTexto: { fontSize: 17, fontWeight: '900', color: cores.texto },
  sortear: { paddingVertical: 12 },
  sortearTexto: { fontSize: 15, fontWeight: '900', color: cores.roxo },
  botao: { alignSelf: 'stretch', backgroundColor: cores.roxo, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  cancelar: { paddingTop: 12 },
  cancelarTexto: { fontSize: 14, fontWeight: '800', color: cores.textoSuave },
});
