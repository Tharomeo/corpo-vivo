import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConta } from '../lib/conta';
import { FAIXAS, type FaixaEtaria } from '../lib/privacidade';
import { cores, sombra } from '../theme';

// Cadastro: idade, autorização do responsável (menores de 12 anos, LGPD art. 14) e aceite da política.
// As faixas aparecem lado a lado, sem dizer o que muda em cada uma, para ninguém ser induzido a mentir.

export default function Idade() {
  const conta = useConta();
  const jaTemPerfil = !!conta.perfil;
  const [faixa, setFaixa] = useState<FaixaEtaria | null>(conta.perfil?.faixaEtaria ?? null);
  const [etapa, setEtapa] = useState<'idade' | 'aceite'>('idade');
  const [aceitou, setAceitou] = useState(false);
  const [ranking, setRanking] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const crianca = faixa === 'menor12';

  const avancar = () => {
    if (!faixa) return;
    // Criança começa fora do ranking; quem decide é o responsável
    setRanking(faixa === 'menor12' ? false : (conta.perfil?.mostrarNoRanking ?? true));
    setAceitou(false);
    setEtapa('aceite');
  };

  const concluir = async () => {
    if (!faixa || !aceitou || salvando) return;
    setSalvando(true);
    setErro(null);
    const e = await conta.salvarCadastro({ faixaEtaria: faixa, consentimentoResponsavel: crianca, mostrarNoRanking: ranking });
    setSalvando(false);
    if (e) return setErro(e);
    router.replace(jaTemPerfil ? '/anos' : '/apelido');
  };

  if (etapa === 'idade') {
    return (
      <SafeAreaView style={styles.tela}>
        <ScrollView contentContainerStyle={styles.conteudo}>
          <View style={styles.icone}>
            <Text style={styles.iconeTexto}>🎂</Text>
          </View>
          <Text style={styles.titulo}>Quantos anos você tem?</Text>
          {jaTemPerfil && <Text style={styles.sub}>Atualizamos nossa política de privacidade. Leva só um minutinho.</Text>}
          <View style={styles.opcoes}>
            {FAIXAS.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => setFaixa(f.id)}
                style={({ pressed }) => [styles.opcao, faixa === f.id && styles.opcaoSel, pressed && styles.apertado]}
              >
                <Text style={styles.opcaoEmoji}>{f.emoji}</Text>
                <Text style={[styles.opcaoTexto, faixa === f.id && { color: cores.roxo }]}>{f.texto}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={avancar} disabled={!faixa} style={({ pressed }) => [styles.botao, !faixa && styles.desligado, pressed && styles.apertado]}>
            <Text style={styles.botaoTexto}>Continuar</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={[styles.icone, crianca && { backgroundColor: '#FFF4D1' }]}>
          <Text style={styles.iconeTexto}>{crianca ? '🧑‍🍼' : '🔒'}</Text>
        </View>
        <Text style={styles.titulo}>{crianca ? 'Chame um adulto responsável' : 'Sua privacidade'}</Text>
        <Text style={styles.sub}>
          {crianca
            ? 'Para quem tem menos de 12 anos, um dos pais ou responsável precisa autorizar. Responsável, leia abaixo:'
            : 'Antes de começar, veja o que o Corpo Vivo guarda sobre você:'}
        </Text>

        <View style={styles.caixa}>
          {[
            '📧 O e-mail, só para entrar com o código',
            '🏷️ Um apelido (nada de nome completo)',
            '🎮 Os pontos dos jogos e 📒 as anotações do caderno',
            '🚫 Sem anúncios, sem venda de dados, sem localização',
            '🗑️ Dá para apagar a conta a qualquer momento, em Minha conta',
          ].map((t) => (
            <Text key={t} style={styles.item}>
              {t}
            </Text>
          ))}
          {crianca && <Text style={styles.nota}>Recomendamos usar o e-mail do responsável na conta: é para ele que vai o código de acesso.</Text>}
          <Pressable onPress={() => router.push('/privacidade')} hitSlop={8}>
            <Text style={styles.link}>Ler a política de privacidade completa ›</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => setRanking(!ranking)} style={styles.linha}>
          <View style={[styles.chave, ranking && styles.chaveLigada]}>
            <View style={[styles.bolinha, ranking && styles.bolinhaLigada]} />
          </View>
          <Text style={styles.linhaTexto}>Mostrar {crianca ? 'o apelido da criança' : 'meu apelido'} no ranking mundial dos jogos</Text>
        </Pressable>

        <Pressable onPress={() => setAceitou(!aceitou)} style={styles.linha}>
          <View style={[styles.check, aceitou && styles.checkMarcado]}>{aceitou && <Text style={styles.checkV}>✓</Text>}</View>
          <Text style={styles.linhaTexto}>
            {crianca
              ? 'Sou mãe, pai ou responsável legal, li a política de privacidade e autorizo o uso do Corpo Vivo.'
              : 'Li e aceito a política de privacidade.'}
          </Text>
        </Pressable>

        <Pressable
          onPress={concluir}
          disabled={!aceitou || salvando}
          style={({ pressed }) => [styles.botao, !aceitou && styles.desligado, pressed && styles.apertado]}
        >
          {salvando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.botaoTexto}>{crianca ? 'Autorizar' : 'Aceitar e continuar'}</Text>}
        </Pressable>
        {erro && <Text style={styles.erro}>{erro}</Text>}
        <Pressable onPress={() => setEtapa('idade')} style={styles.voltar}>
          <Text style={styles.voltarTexto}>‹ Voltar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  icone: { alignSelf: 'center', width: 86, height: 86, borderRadius: 30, backgroundColor: '#ECE6FF', alignItems: 'center', justifyContent: 'center' },
  iconeTexto: { fontSize: 44 },
  titulo: { fontSize: 26, fontWeight: '900', color: cores.texto, textAlign: 'center', marginTop: 16 },
  sub: { fontSize: 15.5, color: cores.textoSuave, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  opcoes: { gap: 10, marginTop: 24 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: cores.branco, borderRadius: 20, borderWidth: 3, borderColor: '#E3DBFF', padding: 16, ...sombra, shadowOpacity: 0.06 },
  opcaoSel: { borderColor: cores.roxo, backgroundColor: '#F5F1FF' },
  opcaoEmoji: { fontSize: 30 },
  opcaoTexto: { fontSize: 18, fontWeight: '900', color: cores.texto },
  caixa: { backgroundColor: cores.branco, borderRadius: 22, padding: 18, gap: 10, marginTop: 20, ...sombra, shadowOpacity: 0.06 },
  item: { fontSize: 15, lineHeight: 21, color: cores.texto, fontWeight: '600' },
  nota: { fontSize: 14, lineHeight: 20, color: '#8A6A00', backgroundColor: '#FFF4D1', borderRadius: 12, padding: 10, fontWeight: '700' },
  link: { fontSize: 14.5, fontWeight: '900', color: cores.roxo },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  linhaTexto: { flex: 1, fontSize: 15, lineHeight: 21, color: cores.texto, fontWeight: '700' },
  chave: { width: 50, height: 30, borderRadius: 15, backgroundColor: '#D9D3EE', padding: 3 },
  chaveLigada: { backgroundColor: '#2EC4B6' },
  bolinha: { width: 24, height: 24, borderRadius: 12, backgroundColor: cores.branco },
  bolinhaLigada: { transform: [{ translateX: 20 }] },
  check: { width: 30, height: 30, borderRadius: 9, borderWidth: 3, borderColor: '#C9C1E8', backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center' },
  checkMarcado: { backgroundColor: cores.roxo, borderColor: cores.roxo },
  checkV: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  botao: { backgroundColor: cores.roxo, borderRadius: 999, paddingVertical: 17, alignItems: 'center', marginTop: 26, ...sombra },
  botaoTexto: { color: cores.branco, fontSize: 17, fontWeight: '900' },
  desligado: { opacity: 0.4 },
  apertado: { transform: [{ scale: 0.98 }] },
  erro: { marginTop: 14, color: '#E0446F', fontWeight: '800', fontSize: 14.5, textAlign: 'center' },
  voltar: { alignSelf: 'center', paddingVertical: 14 },
  voltarTexto: { fontSize: 15, fontWeight: '900', color: cores.textoSuave },
});
