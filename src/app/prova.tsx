import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { EscolhaTema } from '../components/prova/EscolhaTema';
import { Pergunta } from '../components/prova/Pergunta';
import { Resultado } from '../components/prova/Resultado';
import type { QuestaoNaTela, Resposta, Tema } from '../components/prova/tipos';
import { QUESTOES, type Questao } from '../data/questoes';
import { SISTEMAS, type Nivel, type SistemaId } from '../data/sistemas';
import { embaralhar } from '../utils/embaralhar';

function prepararRodada(banco: Questao[], tema: Tema, quantidade: number): QuestaoNaTela[] {
  const escolhidas = tema === 'tudo' ? embaralhar(banco).slice(0, quantidade) : embaralhar(banco.filter((q) => q.sistema === tema));
  return escolhidas.map((questao) => {
    const ordem = embaralhar([0, 1, 2, 3]);
    return { questao, opcoes: ordem.map((i) => questao.opcoes[i]), correta: ordem.indexOf(0) };
  });
}

export default function Prova() {
  const params = useLocalSearchParams<{ nivel?: string }>();
  const nivel: Nivel = params.nivel === 'finais' ? 'finais' : 'iniciais';
  const banco = useMemo(() => QUESTOES.filter((q) => q.nivel === nivel), [nivel]);

  const contagem = useMemo(() => {
    const c = { tudo: banco.length } as Record<Tema, number>;
    (Object.keys(SISTEMAS) as SistemaId[]).forEach((s) => (c[s] = banco.filter((q) => q.sistema === s).length));
    return c;
  }, [banco]);

  const [tema, setTema] = useState<Tema | null>(null);
  const [quantidade, setQuantidade] = useState(10);
  const [rodada, setRodada] = useState<QuestaoNaTela[]>([]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [terminou, setTerminou] = useState(false);

  const comecar = (t: Tema, qtd = quantidade) => {
    setTema(t);
    setQuantidade(qtd);
    setRodada(prepararRodada(banco, t, qtd));
    setIndice(0);
    setRespostas([]);
    setTerminou(false);
  };

  const voltarParaTemas = () => {
    setTema(null);
    setTerminou(false);
  };

  if (!tema) return <EscolhaTema nivel={nivel} contagem={contagem} onEscolher={comecar} />;

  if (terminou) {
    return (
      <Resultado
        respostas={respostas}
        nivel={nivel}
        onDeNovo={() => comecar(tema)}
        onOutroTema={voltarParaTemas}
        onVoltarCorpo={() => router.back()}
      />
    );
  }

  const item = rodada[indice];
  return (
    <Pergunta
      key={item.questao.id}
      item={item}
      numero={indice + 1}
      total={rodada.length}
      onResponder={(escolhida) => setRespostas((r) => [...r, { item, escolhida }])}
      onProxima={() => (indice + 1 < rodada.length ? setIndice(indice + 1) : setTerminou(true))}
      onSair={voltarParaTemas}
    />
  );
}
