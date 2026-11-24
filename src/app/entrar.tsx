import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { destinoInicial, useConta } from '../lib/conta';
import { problemaConfiguracao } from '../lib/supabase';
import { cores, sombra } from '../theme';

// Entrar ou criar conta: e-mail -> código de 6 números (sem senha)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ESPERA_REENVIO = 60;

export default function Entrar() {
  const conta = useConta();
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  const [email, setEmail] = useState('');
  const [aceite, setAceite] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(0);

  // Contagem para poder pedir outro código
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((e) => e - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const emailOk = EMAIL.test(email.trim());

  const pedirCodigo = async () => {
    if (!emailOk || !aceite || enviando) return;
    setEnviando(true);
    setErro(null);
    const e = await conta.enviarCodigo(email);
    setEnviando(false);
    if (e) return setErro(e);
    setEtapa('codigo');
    setCodigo('');
    setEspera(ESPERA_REENVIO);
  };

  const confirmar = async () => {
    if (codigo.trim().length < 6 || enviando) return;
    setEnviando(true);
    setErro(null);
    const e = await conta.confirmarCodigo(email, codigo);
    setEnviando(false);
    if (e) return setErro(e);
  };

  // Depois de confirmar, a conta muda e a pessoa segue para o apelido ou para o app
  useEffect(() => {
    if (conta.usuario) router.replace(destinoInicial(conta));
  }, [conta]);

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <View style={styles.icone}>
            <Text style={styles.iconeTexto}>{etapa === 'email' ? '👋' : '📬'}</Text>
          </View>
          <Text style={styles.titulo}>{etapa === 'email' ? 'Entre na sua conta' : 'Confira seu e-mail'}</Text>
          <Text style={styles.sub}>
            {etapa === 'email'
              ? 'Digite seu e-mail. Se ainda não tiver conta, ela é criada na hora.'
              : `Enviamos um código para ${email.trim().toLowerCase()}. Digite abaixo.`}
          </Text>

          {problemaConfiguracao && (
            <View style={[styles.aviso, { backgroundColor: '#FFE4EC' }]}>
              <Text style={styles.avisoTexto}>⚠️ {problemaConfiguracao}</Text>
            </View>
          )}
          {conta.modoTeste && (
            <View style={styles.aviso}>
              <Text style={styles.avisoTexto}>
                🧪 Modo de teste: o servidor ainda não está ligado, então nenhum e-mail é enviado. Use qualquer código de 6 números.
              </Text>
            </View>
          )}

          {etapa === 'email' ? (
            <>
              <Text style={styles.rotulo}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor="#B3ADC9"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={pedirCodigo}
                style={styles.campo}
              />

              <Pressable onPress={() => setAceite((a) => !a)} style={styles.aceite} hitSlop={6}>
                <View style={[styles.caixinha, aceite && styles.caixinhaMarcada]}>{aceite && <Text style={styles.check}>✓</Text>}</View>
                <Text style={styles.aceiteTexto}>
                  Tenho 18 anos ou mais, ou estou usando com a autorização do meu responsável, e aceito os termos de uso.
                </Text>
              </Pressable>

              <Pressable
                onPress={pedirCodigo}
                disabled={!emailOk || !aceite || enviando}
                style={({ pressed }) => [styles.botao, (!emailOk || !aceite) && styles.desligado, pressed && styles.apertado]}
              >
                {enviando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.botaoTexto}>Receber código</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.rotulo}>Código</Text>
              <TextInput
                value={codigo}
                onChangeText={(t) => setCodigo(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="000000"
                placeholderTextColor="#D0CBE2"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={confirmar}
                style={[styles.campo, styles.campoCodigo]}
              />

              <Pressable
                onPress={confirmar}
                disabled={codigo.length < 6 || enviando}
                style={({ pressed }) => [styles.botao, codigo.length < 6 && styles.desligado, pressed && styles.apertado]}
              >
                {enviando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.botaoTexto}>Entrar</Text>}
              </Pressable>

              <View style={styles.links}>
                <Pressable onPress={pedirCodigo} disabled={espera > 0}>
                  <Text style={[styles.link, espera > 0 && { color: cores.textoSuave }]}>
                    {espera > 0 ? `Reenviar código em ${espera}s` : 'Reenviar código'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setEtapa('email');
                    setErro(null);
                  }}
                >
                  <Text style={styles.link}>Trocar e-mail</Text>
                </Pressable>
              </View>
            </>
          )}

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <View style={styles.premium}>
            <Text style={styles.premiumTexto}>🚀 Em breve: Ensino Médio e Ensino Superior</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  icone: { alignSelf: 'center', width: 86, height: 86, borderRadius: 30, backgroundColor: '#ECE6FF', alignItems: 'center', justifyContent: 'center' },
  iconeTexto: { fontSize: 44 },
  titulo: { fontSize: 28, fontWeight: '900', color: cores.texto, textAlign: 'center', marginTop: 16 },
  sub: { fontSize: 15.5, color: cores.textoSuave, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  aviso: { backgroundColor: '#FFF4D1', borderRadius: 18, padding: 12, marginTop: 16 },
  avisoTexto: { fontSize: 13.5, fontWeight: '700', color: cores.texto, lineHeight: 19 },
  rotulo: { fontSize: 14, fontWeight: '900', color: cores.texto, marginTop: 22, marginBottom: 6 },
  campo: {
    backgroundColor: cores.branco,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E3DBFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    fontWeight: '700',
    color: cores.texto,
    outlineWidth: 0,
  },
  campoCodigo: { fontSize: 30, letterSpacing: 10, textAlign: 'center', fontWeight: '900' },
  aceite: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 16 },
  caixinha: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: cores.roxo, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  caixinhaMarcada: { backgroundColor: cores.roxo },
  check: { color: cores.branco, fontWeight: '900', fontSize: 15 },
  aceiteTexto: { flex: 1, fontSize: 13.5, color: cores.textoSuave, lineHeight: 19, fontWeight: '600' },
  botao: { backgroundColor: cores.roxo, borderRadius: 999, paddingVertical: 17, alignItems: 'center', marginTop: 20, ...sombra },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  desligado: { opacity: 0.4 },
  apertado: { transform: [{ scale: 0.97 }] },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  link: { fontSize: 14.5, fontWeight: '900', color: cores.roxo },
  erro: { marginTop: 14, color: '#E0446F', fontWeight: '800', fontSize: 14.5, textAlign: 'center' },
  premium: { marginTop: 28, borderRadius: 18, borderWidth: 1.5, borderColor: '#E3DBFF', borderStyle: 'dashed', padding: 12 },
  premiumTexto: { fontSize: 13, fontWeight: '700', color: cores.textoSuave, textAlign: 'center', lineHeight: 18 },
});
