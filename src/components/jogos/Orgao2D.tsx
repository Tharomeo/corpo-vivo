import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { Peca2D } from '../../data/jogos';

// Órgãos desenhados com formas simples e carinhas, para os jogos dos Anos Iniciais.
// Alguns usam emoji, que já é bem reconhecível.

const EMOJI: Partial<Record<Peca2D, string>> = {
  cerebro: '🧠',
  coracao: '🫀',
  pulmoes: '🫁',
  boca: '👄',
  nariz: '👃',
  sangue: '🩸',
  ossos: '🦴',
  pele: '🖐️',
  musculo: '💪',
  olho: '👁️',
  orelha: '👂',
  lingua: '👅',
};

function Carinha({ tam }: { tam: number }) {
  const olho = Math.max(3, tam * 0.1);
  return (
    <View style={[StyleSheet.absoluteFill, styles.centro]} pointerEvents="none">
      <View style={{ flexDirection: 'row', gap: olho * 1.4, marginBottom: olho * 0.5 }}>
        <View style={{ width: olho, height: olho, borderRadius: olho, backgroundColor: '#2B2350' }} />
        <View style={{ width: olho, height: olho, borderRadius: olho, backgroundColor: '#2B2350' }} />
      </View>
      <View
        style={{
          width: olho * 2.4,
          height: olho * 1.2,
          borderBottomLeftRadius: olho * 1.2,
          borderBottomRightRadius: olho * 1.2,
          borderWidth: Math.max(1.5, olho * 0.35),
          borderTopWidth: 0,
          borderColor: '#2B2350',
        }}
      />
    </View>
  );
}

export function Orgao2D({ peca, w, h }: { peca: Peca2D; w: number; h: number }) {
  const emoji = EMOJI[peca];
  const tam = Math.min(w, h);
  if (emoji) {
    return (
      <View style={[styles.centro, { width: w, height: h }]}>
        <Text selectable={false} style={{ fontSize: tam * 0.82, lineHeight: tam * 1.05, textAlign: 'center' }}>
          {emoji}
        </Text>
      </View>
    );
  }

  let forma: ViewStyle;
  let extra: ReactNode = null;
  switch (peca) {
    case 'estomago':
      forma = {
        width: w * 0.95,
        height: h * 0.8,
        backgroundColor: '#FF9F1C',
        borderTopLeftRadius: h * 0.6,
        borderTopRightRadius: h * 0.25,
        borderBottomLeftRadius: h * 0.5,
        borderBottomRightRadius: h * 0.6,
        transform: [{ rotate: '-18deg' }],
      };
      break;
    case 'figado':
      forma = {
        width: w,
        height: h * 0.8,
        backgroundColor: '#C8643C',
        borderTopLeftRadius: h * 0.7,
        borderTopRightRadius: h * 0.3,
        borderBottomLeftRadius: h * 0.3,
        borderBottomRightRadius: h * 0.9,
      };
      break;
    case 'intestinos':
    case 'intestino_delgado': {
      // Novelo: anéis um dentro do outro
      const cor = '#FFB347';
      forma = { width: tam, height: tam, borderRadius: tam, backgroundColor: cor, borderWidth: tam * 0.08, borderColor: '#E8820C' };
      extra = (
        <View style={[StyleSheet.absoluteFill, styles.centro]} pointerEvents="none">
          <View style={{ width: tam * 0.62, height: tam * 0.62, borderRadius: tam, borderWidth: tam * 0.07, borderColor: '#E8820C' }} />
        </View>
      );
      break;
    }
    case 'intestino_grosso':
      // Ferradura: moldura com a parte de baixo aberta
      forma = {
        width: tam,
        height: tam * 0.9,
        borderWidth: tam * 0.2,
        borderBottomWidth: 0,
        borderColor: '#E8820C',
        borderTopLeftRadius: tam * 0.35,
        borderTopRightRadius: tam * 0.35,
      };
      break;
    case 'rins': {
      const feijao: ViewStyle = {
        width: w * 0.3,
        height: h * 0.95,
        backgroundColor: '#E07A5F',
        borderRadius: w,
      };
      return (
        <View style={[styles.centro, { width: w, height: h, flexDirection: 'row', justifyContent: 'space-between' }]}>
          <View style={[feijao, { transform: [{ rotate: '12deg' }] }]} />
          <View style={[feijao, { transform: [{ rotate: '-12deg' }] }]} />
        </View>
      );
    }
    case 'bexiga':
      forma = { width: tam, height: tam, borderRadius: tam, backgroundColor: '#FFD23F' };
      break;
    case 'esofago':
      forma = { width: w * 0.32, height: h, borderRadius: w, backgroundColor: '#FF9F1C' };
      break;
    case 'traqueia':
      forma = { width: w * 0.32, height: h, borderRadius: w, backgroundColor: '#4CC9F0' };
      extra = (
        <View style={[StyleSheet.absoluteFill, styles.centro, { gap: h * 0.12 }]} pointerEvents="none">
          {[0, 1, 2, 3].map((k) => (
            <View key={k} style={{ width: w * 0.32, height: Math.max(2, h * 0.05), backgroundColor: '#1E9FCB' }} />
          ))}
        </View>
      );
      return (
        <View style={[styles.centro, { width: w, height: h }]}>
          <View style={forma} />
          {extra}
        </View>
      );
    case 'bronquios':
      return (
        <View style={[styles.centro, { width: w, height: h }]}>
          <View style={{ width: w * 0.16, height: h * 0.5, backgroundColor: '#1E9FCB', borderRadius: w, marginBottom: -h * 0.06 }} />
          <View style={{ flexDirection: 'row', gap: w * 0.12 }}>
            <View style={{ width: w * 0.14, height: h * 0.5, backgroundColor: '#1E9FCB', borderRadius: w, transform: [{ rotate: '35deg' }] }} />
            <View style={{ width: w * 0.14, height: h * 0.5, backgroundColor: '#1E9FCB', borderRadius: w, transform: [{ rotate: '-35deg' }] }} />
          </View>
        </View>
      );
    default:
      forma = { width: tam, height: tam, borderRadius: tam, backgroundColor: '#ccc' };
  }

  const comCara = peca !== 'intestino_grosso' && peca !== 'esofago';
  return (
    <View style={[styles.centro, { width: w, height: h }]}>
      <View style={forma} />
      {extra}
      {comCara && <Carinha tam={tam} />}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center' },
});
