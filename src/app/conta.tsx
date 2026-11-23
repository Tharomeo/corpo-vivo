import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopoJogo } from '../components/jogos/Moldura';
import { useConta } from '../lib/conta';
import { cores, sombra } from '../theme';

// Minha conta: apelido, e-mail, plano e sair

export default function MinhaConta() {
  const { usuario, perfil, modoTeste, sair } = useConta();
  const inicial = (perfil?.apelido ?? '?').charAt(0).toUpperCase();
  const premium = perfil?.plano === 'premium';

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <TopoJogo titulo="Minha conta" cor={cores.texto} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.perfil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{inicial}</Text>
          </View>
          <Text style={styles.apelido}>{perfil?.apelido ?? 'Sem apelido'}</Text>
          <Text style={styles.email}>{modoTeste ? `🧪 modo de teste${usuario?.email ? ` · ${usuario.email}` : ''}` : usuario?.email}</Text>
          <Pressable
            onPress={() => router.push({ pathname: '/apelido', params: { editar: '1' } })}
            style={({ pressed }) => [styles.trocar, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.trocarTexto}>✏️ Trocar apelido</Text>
          </Pressable>
        </View>

        <Text style={styles.secao}>Seu plano</Text>
        <View style={[styles.plano, { backgroundColor: premium ? '#FFF4D1' : '#DDF6F3' }]}>
          <Text style={styles.planoNome}>{premium ? '⭐ Premium' : '🌱 Gratuito'}</Text>
          <Text style={styles.planoTexto}>
            {premium ? 'Tudo liberado: Fundamental, Ensino Médio e Medicina.' : 'Ensino Fundamental completo: corpo 3D, Me testar e jogos.'}
          </Text>
        </View>

        {!premium && (
          <View style={styles.assinar}>
            <Text style={styles.assinarTitulo}>⭐ Premium</Text>
            <Text style={styles.assinarTexto}>Libera o Ensino Médio e a Medicina.</Text>
            <View style={[styles.botao, styles.desligado]}>
              <Text style={styles.botaoTexto}>💳 Assinar com cartão · em breve</Text>
            </View>
          </View>
        )}

        <Pressable
          onPress={async () => {
            await sair();
            router.replace('/entrar');
          }}
          style={({ pressed }) => [styles.sair, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.sairTexto}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, paddingBottom: 48 },
  perfil: { alignItems: 'center', backgroundColor: cores.branco, borderRadius: 28, padding: 22, ...sombra },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: cores.roxo, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: cores.branco, fontSize: 38, fontWeight: '900' },
  apelido: { fontSize: 24, fontWeight: '900', color: cores.texto, marginTop: 12 },
  email: { fontSize: 14, fontWeight: '700', color: cores.textoSuave, marginTop: 2 },
  trocar: { marginTop: 14, borderRadius: 999, backgroundColor: '#ECE6FF', paddingVertical: 9, paddingHorizontal: 16 },
  trocarTexto: { fontSize: 14, fontWeight: '900', color: cores.roxo },
  secao: { fontSize: 17, fontWeight: '900', color: cores.texto, marginTop: 24, marginBottom: 10 },
  plano: { borderRadius: 22, padding: 16 },
  planoNome: { fontSize: 19, fontWeight: '900', color: cores.texto },
  planoTexto: { fontSize: 14.5, color: cores.textoSuave, marginTop: 4, lineHeight: 20 },
  assinar: { marginTop: 12, borderRadius: 22, padding: 16, borderWidth: 2, borderColor: '#FFC93C', backgroundColor: cores.branco },
  assinarTitulo: { fontSize: 18, fontWeight: '900', color: cores.texto },
  assinarTexto: { fontSize: 14.5, color: cores.textoSuave, marginTop: 2 },
  botao: { backgroundColor: cores.roxo, borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 14 },
  botaoTexto: { color: cores.branco, fontSize: 16, fontWeight: '900' },
  desligado: { opacity: 0.45 },
  sair: { marginTop: 28, alignItems: 'center', paddingVertical: 12 },
  sairTexto: { fontSize: 15, fontWeight: '900', color: '#E0446F' },
});
