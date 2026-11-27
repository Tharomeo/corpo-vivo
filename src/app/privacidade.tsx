import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopoJogo } from '../components/jogos/Moldura';
import { POLITICA } from '../lib/privacidade';
import { cores, sombra } from '../theme';

// Política de privacidade (o mesmo texto de PRIVACIDADE.md)

export default function Privacidade() {
  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <TopoJogo titulo="Privacidade" cor={cores.roxo} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.intro}>Como o Corpo Vivo cuida dos seus dados, em linguagem simples.</Text>
        {POLITICA.map((s) => (
          <View key={s.titulo} style={styles.secao}>
            <Text style={styles.titulo}>{s.titulo}</Text>
            {s.paragrafos.map((p) => (
              <Text key={p} style={styles.texto}>
                {p}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 18, paddingBottom: 48, gap: 12 },
  intro: { fontSize: 15, fontWeight: '700', color: cores.textoSuave },
  secao: { backgroundColor: cores.branco, borderRadius: 20, padding: 16, gap: 8, ...sombra, shadowOpacity: 0.06 },
  titulo: { fontSize: 17, fontWeight: '900', color: cores.texto },
  texto: { fontSize: 15, lineHeight: 22, color: cores.texto },
});
