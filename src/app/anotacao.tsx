import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Nivel } from '../data/sistemas';
import {
  anotacaoDoTema,
  apagarAnotacao,
  atualizarAnotacao,
  buscarAnotacao,
  criarAnotacao,
  infoTema,
  LIMITE_TEXTO,
  LIMITE_TITULO,
} from '../lib/anotacoes';
import { cores, sombra } from '../theme';

// Uma anotação. Salva sozinha enquanto a pessoa escreve.
// Abrir com ?id= edita uma anotação; com ?tema= abre a anotação daquele sistema ou parte (ou cria).

const COR = '#E8A400';
const ESPERA_SALVAR_MS = 800;

type Estado = 'carregando' | 'pronto' | 'erro';
type Salvo = null | 'salvando' | 'salvo' | 'erro';

export default function AnotacaoTela() {
  const params = useLocalSearchParams<{ id?: string; tema?: string; nivel?: string }>();
  const nivel: Nivel = params.nivel === 'finais' ? 'finais' : 'iniciais';

  const [estado, setEstado] = useState<Estado>('carregando');
  const [tema, setTema] = useState<string | null>(params.tema && infoTema(params.tema) ? params.tema : null);
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [alterado, setAlterado] = useState(false);
  const [salvo, setSalvo] = useState<Salvo>(null);
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  // Refs usadas só dentro de callbacks e efeitos (nunca no render)
  const idRef = useRef<string | null>(params.id ?? null);
  const fila = useRef<Promise<void>>(Promise.resolve());
  const ultimo = useRef({ titulo: '', texto: '', pendente: false });
  const temaRef = useRef(tema);

  // Carrega a anotação (ou a do tema, ou começa uma nova)
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        let a = params.id ? await buscarAnotacao(params.id) : null;
        if (!a && params.tema) a = await anotacaoDoTema(params.tema);
        if (!ativo) return;
        if (a) {
          idRef.current = a.id;
          setTitulo(a.titulo);
          setTexto(a.texto);
          setTema(a.tema);
          temaRef.current = a.tema;
        } else if (params.tema) {
          setTitulo(infoTema(params.tema)?.nome ?? '');
        }
        setEstado('pronto');
      } catch {
        if (ativo) setEstado('erro');
      }
    })();
    return () => {
      ativo = false;
    };
  }, [params.id, params.tema]);

  // Salva em fila, para nunca criar a mesma anotação duas vezes
  const salvar = useCallback(
    (t: string, x: string) => {
      fila.current = fila.current.then(async () => {
        try {
          if (!idRef.current) {
            // Anotação nova em branco não vira nada
            if (!x.trim() && (!t.trim() || t === infoTema(temaRef.current)?.nome)) return;
            setSalvo('salvando');
            const nova = await criarAnotacao({ titulo: t, texto: x, tema: temaRef.current, nivel });
            idRef.current = nova.id;
          } else {
            setSalvo('salvando');
            await atualizarAnotacao(idRef.current, { titulo: t, texto: x });
          }
          setSalvo('salvo');
        } catch {
          setSalvo('erro');
        }
      });
      return fila.current;
    },
    [nivel],
  );

  // Salva um pouco depois de parar de digitar
  useEffect(() => {
    ultimo.current = { titulo, texto, pendente: alterado };
    if (!alterado) return;
    const t = setTimeout(() => {
      ultimo.current.pendente = false;
      setAlterado(false);
      salvar(titulo, texto);
    }, ESPERA_SALVAR_MS);
    return () => clearTimeout(t);
  }, [titulo, texto, alterado, salvar]);

  // Saiu da tela com algo por salvar (ex.: botão voltar do Android): salva mesmo assim
  useEffect(
    () => () => {
      if (ultimo.current.pendente) salvar(ultimo.current.titulo, ultimo.current.texto);
    },
    [salvar],
  );

  const voltar = async () => {
    if (ultimo.current.pendente) {
      ultimo.current.pendente = false;
      await salvar(titulo, texto);
    } else {
      await fila.current;
    }
    router.back();
  };

  const apagar = async () => {
    if (!confirmarApagar) {
      setConfirmarApagar(true);
      return;
    }
    ultimo.current.pendente = false;
    await fila.current;
    if (idRef.current) {
      try {
        await apagarAnotacao(idRef.current);
      } catch {
        setSalvo('erro');
        setConfirmarApagar(false);
        return;
      }
    }
    router.back();
  };

  const t = infoTema(tema);
  const textoSalvo = salvo === 'salvando' || alterado ? 'Salvando…' : salvo === 'salvo' ? '✓ Salvo' : salvo === 'erro' ? '⚠️ Não salvou. Confira a internet.' : '';

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
      <View style={styles.topo}>
        <Pressable onPress={voltar} hitSlop={12} style={styles.voltar}>
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <Text style={[styles.status, salvo === 'erro' && { color: '#C0284F' }]} numberOfLines={1}>
          {textoSalvo}
        </Text>
        <Pressable onPress={apagar} onBlur={() => setConfirmarApagar(false)} hitSlop={8} style={[styles.apagar, confirmarApagar && styles.apagarConfirma]}>
          <Text style={[styles.apagarTexto, confirmarApagar && { color: cores.branco }]}>{confirmarApagar ? 'Apagar mesmo?' : '🗑️'}</Text>
        </Pressable>
      </View>

      {estado === 'carregando' && <ActivityIndicator color={COR} style={{ marginTop: 40 }} />}
      {estado === 'erro' && <Text style={styles.erro}>Não consegui abrir a anotação. Confira a internet e tente de novo.</Text>}

      {estado === 'pronto' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            {t && (
              <Pressable
                disabled={!t.orgao}
                onPress={() => t.orgao && router.push({ pathname: '/corpo', params: { nivel, foco: t.orgao } })}
                style={[styles.tema, { backgroundColor: t.corClara }]}
              >
                <Text style={[styles.temaTexto, { color: t.cor }]}>
                  {t.emoji} {t.nome}
                  {t.orgao ? '  ·  ver no corpo ›' : ''}
                </Text>
              </Pressable>
            )}

            <View style={styles.folha}>
              <TextInput
                value={titulo}
                onChangeText={(v) => {
                  setTitulo(v);
                  setAlterado(true);
                }}
                placeholder="Título"
                placeholderTextColor="#C9C4E0"
                maxLength={LIMITE_TITULO}
                style={styles.titulo}
                returnKeyType="next"
              />
              <TextInput
                value={texto}
                onChangeText={(v) => {
                  setTexto(v);
                  setAlterado(true);
                }}
                placeholder="Escreva aqui o que você aprendeu, uma dúvida ou um resumo…"
                placeholderTextColor="#C9C4E0"
                maxLength={LIMITE_TEXTO}
                multiline
                textAlignVertical="top"
                autoFocus={!params.id && !params.tema}
                style={styles.texto}
              />
              {texto.length > LIMITE_TEXTO - 300 && (
                <Text style={styles.contador}>
                  {texto.length}/{LIMITE_TEXTO}
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  voltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', ...sombra },
  voltarTexto: { fontSize: 30, lineHeight: 32, color: cores.texto, fontWeight: '700', marginTop: -3 },
  status: { flex: 1, fontSize: 13, fontWeight: '800', color: cores.textoSuave },
  apagar: { height: 44, minWidth: 44, borderRadius: 22, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, ...sombra },
  apagarConfirma: { backgroundColor: '#F0466E' },
  apagarTexto: { fontSize: 16, fontWeight: '900', color: cores.texto },
  erro: { margin: 24, fontSize: 15, fontWeight: '700', color: '#C0284F', textAlign: 'center' },
  conteudo: { paddingHorizontal: 16, paddingBottom: 32, gap: 12, flexGrow: 1 },
  tema: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  temaTexto: { fontSize: 14, fontWeight: '900' },
  folha: {
    flexGrow: 1,
    minHeight: 360,
    backgroundColor: cores.branco,
    borderRadius: 22,
    padding: 18,
    borderLeftWidth: 6,
    borderLeftColor: '#FFC93C',
    ...sombra,
    shadowOpacity: 0.08,
  },
  titulo: { fontSize: 22, fontWeight: '900', color: cores.texto, paddingVertical: 4, outlineStyle: 'none' } as object,
  texto: { flex: 1, minHeight: 300, fontSize: 16, lineHeight: 24, color: cores.texto, marginTop: 8, outlineStyle: 'none' } as object,
  contador: { alignSelf: 'flex-end', fontSize: 12, fontWeight: '700', color: cores.textoSuave },
});
