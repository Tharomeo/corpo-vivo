import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopoJogo } from '../components/jogos/Moldura';
import { opcoesDeApelido } from '../lib/apelido';
import { useConta } from '../lib/conta';
import { APELIDO_MAX, validarApelido } from '../lib/filtroApelido';
import { cores, sombra } from '../theme';

// Escolha (ou troca) do apelido, com checagem de apelido repetido

type Checagem = { apelido: string; livre: boolean | null };

export default function Apelido() {
  const { editar } = useLocalSearchParams<{ editar?: string }>();
  const editando = editar === '1';
  const conta = useConta();
  const [texto, setTexto] = useState(editando ? (conta.perfil?.apelido ?? '') : '');
  const [checagem, setChecagem] = useState<Checagem | null>(null);
  const [sugestoes, setSugestoes] = useState(() => opcoesDeApelido(3, APELIDO_MAX));
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  const limpo = texto.trim();
  const erro = limpo ? validarApelido(limpo) : null;
  const igualAoAtual = editando && conta.perfil?.apelido.toLowerCase() === limpo.toLowerCase();

  // Confere no servidor meio segundo depois que a pessoa para de digitar
  useEffect(() => {
    if (!limpo || erro || igualAoAtual || conta.modoTeste) return;
    let ativo = true;
    const t = setTimeout(async () => {
      const livre = await conta.apelidoDisponivel(limpo);
      if (ativo) setChecagem({ apelido: limpo, livre });
    }, 500);
    return () => {
      ativo = false;
      clearTimeout(t);
    };
  }, [limpo, erro, igualAoAtual, conta]);

  const conferido = checagem?.apelido === limpo ? checagem.livre : undefined;
  let estado: 'vazio' | 'erro' | 'checando' | 'livre' | 'ocupado' | 'atual' | 'semConferir' = 'vazio';
  if (!limpo) estado = 'vazio';
  else if (erro) estado = 'erro';
  else if (igualAoAtual) estado = 'atual';
  else if (conta.modoTeste) estado = 'semConferir';
  else if (conferido === undefined) estado = 'checando';
  else if (conferido === null) estado = 'semConferir';
  else estado = conferido ? 'livre' : 'ocupado';

  const podeSalvar = estado === 'livre' || estado === 'semConferir';

  const salvar = async () => {
    if (!podeSalvar || salvando) return;
    setSalvando(true);
    setErroSalvar(null);
    const e = await conta.salvarApelido(limpo);
    setSalvando(false);
    if (e) return setErroSalvar(e);
    if (editando) router.back();
    else router.replace('/anos');
  };

  const mensagem = {
    vazio: { texto: `De ${3} a ${APELIDO_MAX} caracteres: letras, números e _`, cor: cores.textoSuave },
    erro: { texto: `❌ ${erro}`, cor: '#E0446F' },
    checando: { texto: 'Conferindo se está livre…', cor: cores.textoSuave },
    livre: { texto: '✅ Apelido disponível!', cor: '#1FB5A6' },
    ocupado: { texto: '❌ Alguém já usa esse apelido. Tente outro.', cor: '#E0446F' },
    atual: { texto: 'Esse já é o seu apelido.', cor: cores.textoSuave },
    semConferir: {
      texto: conta.modoTeste ? '🧪 Modo de teste: não dá para conferir repetidos sem o servidor.' : '⚠️ Não deu para conferir agora. Ao salvar, conferimos de novo.',
      cor: '#C99400',
    },
  }[estado];

  return (
    <SafeAreaView style={styles.tela}>
      {editando && <TopoJogo titulo="Trocar apelido" cor={cores.texto} />}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          {!editando && (
            <>
              <View style={styles.icone}>
                <Text style={styles.iconeTexto}>🏷️</Text>
              </View>
              <Text style={styles.titulo}>Escolha seu apelido</Text>
              <Text style={styles.sub}>É assim que você aparece no ranking dos jogos. Não use seu nome completo.</Text>
            </>
          )}

          <Text style={styles.rotulo}>Apelido</Text>
          <View style={[styles.campoCaixa, estado === 'livre' && { borderColor: '#2EC4B6' }, (estado === 'erro' || estado === 'ocupado') && { borderColor: '#F0466E' }]}>
            <TextInput
              value={texto}
              onChangeText={(t) => setTexto(t.slice(0, APELIDO_MAX + 5))}
              placeholder="Ex.: Neurônio Veloz"
              placeholderTextColor="#B3ADC9"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={APELIDO_MAX + 5}
              returnKeyType="done"
              onSubmitEditing={salvar}
              style={styles.campo}
            />
            {estado === 'checando' && <ActivityIndicator color={cores.roxo} />}
          </View>
          <Text style={[styles.mensagem, { color: mensagem.cor }]}>{mensagem.texto}</Text>

          <Text style={styles.rotulo}>Sem ideia? Toque numa sugestão</Text>
          <View style={styles.sugestoes}>
            {sugestoes.map((s) => (
              <Pressable key={s} onPress={() => setTexto(s)} style={({ pressed }) => [styles.sugestao, pressed && { opacity: 0.7 }]}>
                <Text style={styles.sugestaoTexto}>{s}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setSugestoes(opcoesDeApelido(3, APELIDO_MAX))} style={({ pressed }) => [styles.sugestao, styles.sortear, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.sugestaoTexto, { color: cores.branco }]}>🎲 Outras</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={salvar}
            disabled={!podeSalvar || salvando}
            style={({ pressed }) => [styles.botao, !podeSalvar && styles.desligado, pressed && { transform: [{ scale: 0.97 }] }]}
          >
            {salvando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.botaoTexto}>{editando ? 'Salvar novo apelido' : 'Começar'}</Text>}
          </Pressable>
          {erroSalvar && <Text style={styles.erro}>{erroSalvar}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  icone: { alignSelf: 'center', width: 86, height: 86, borderRadius: 30, backgroundColor: '#FFE4EC', alignItems: 'center', justifyContent: 'center' },
  iconeTexto: { fontSize: 44 },
  titulo: { fontSize: 28, fontWeight: '900', color: cores.texto, textAlign: 'center', marginTop: 16 },
  sub: { fontSize: 15.5, color: cores.textoSuave, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  rotulo: { fontSize: 14, fontWeight: '900', color: cores.texto, marginTop: 22, marginBottom: 8 },
  campoCaixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E3DBFF',
    paddingHorizontal: 16,
  },
  campo: { flex: 1, paddingVertical: 14, fontSize: 19, fontWeight: '800', color: cores.texto, outlineWidth: 0 },
  mensagem: { fontSize: 13.5, fontWeight: '800', marginTop: 8 },
  sugestoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sugestao: { borderRadius: 999, backgroundColor: cores.branco, borderWidth: 1.5, borderColor: '#E3DBFF', paddingVertical: 8, paddingHorizontal: 12 },
  sortear: { backgroundColor: cores.roxo, borderColor: cores.roxo },
  sugestaoTexto: { fontSize: 14, fontWeight: '800', color: cores.texto },
  botao: { backgroundColor: cores.roxo, borderRadius: 999, paddingVertical: 17, alignItems: 'center', marginTop: 28, ...sombra },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  desligado: { opacity: 0.4 },
  erro: { marginTop: 14, color: '#E0446F', fontWeight: '800', fontSize: 14.5, textAlign: 'center' },
});
