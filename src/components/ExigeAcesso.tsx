import { Redirect, useLocalSearchParams } from 'expo-router';
import type { ComponentType } from 'react';
import type { Nivel } from '../data/sistemas';
import { temAcesso, useConta } from '../lib/conta';

// Protege uma tela dos Anos Finais: sem acesso pago, manda para a assinatura.
// nivelFixo: para telas que são sempre dos Anos Finais (ex.: Ervilhas de Mendel).
export function comAcesso<P extends object>(Tela: ComponentType<P>, nivelFixo?: Nivel) {
  function Protegida(props: P) {
    const params = useLocalSearchParams<{ nivel?: string }>();
    const nivel: Nivel = nivelFixo ?? (params.nivel === 'finais' ? 'finais' : 'iniciais');
    const { perfil, carregando } = useConta();
    if (nivel !== 'iniciais' && !carregando && !temAcesso(perfil, nivel)) {
      return <Redirect href={{ pathname: '/assinar', params: { produto: 'finais' } }} />;
    }
    return <Tela {...props} />;
  }
  return Protegida;
}
