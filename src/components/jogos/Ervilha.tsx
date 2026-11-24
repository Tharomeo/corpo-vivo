import { StyleSheet, View } from 'react-native';
import type { TracoId } from '../../data/jogosFinais';

// Desenho simples de cada característica da ervilha (semente, flor ou planta)
export function Ervilha({ traco, dominante, tam = 44 }: { traco: TracoId; dominante: boolean; tam?: number }) {
  if (traco === 'cor') {
    return <View style={[styles.semente, { width: tam, height: tam, borderRadius: tam / 2, backgroundColor: dominante ? '#F7C933' : '#7BC74D' }]} />;
  }
  if (traco === 'forma') {
    return (
      <View
        style={[
          styles.semente,
          { width: tam, height: tam, borderRadius: tam / 2, backgroundColor: '#B5D96B' },
          !dominante && { borderStyle: 'dashed', borderWidth: 4, borderColor: '#6E8F2E', width: tam * 0.92, height: tam * 0.86 },
        ]}
      />
    );
  }
  if (traco === 'flor') {
    const p = tam * 0.42;
    const cor = dominante ? '#9B5DE5' : '#FFFFFF';
    const pos = [
      { left: tam / 2 - p / 2, top: 0 },
      { left: tam - p, top: tam * 0.32 },
      { left: tam * 0.72 - p / 2, top: tam - p },
      { left: tam * 0.28 - p / 2, top: tam - p },
      { left: 0, top: tam * 0.32 },
    ];
    return (
      <View style={{ width: tam, height: tam }}>
        {pos.map((s, i) => (
          <View key={i} style={[styles.petala, s, { width: p, height: p, borderRadius: p / 2, backgroundColor: cor }]} />
        ))}
        <View style={[styles.miolo, { width: p * 0.8, height: p * 0.8, borderRadius: p, left: tam / 2 - p * 0.4, top: tam / 2 - p * 0.4 }]} />
      </View>
    );
  }
  // Altura: caule com folhas, alto ou baixo
  const h = dominante ? tam * 1.15 : tam * 0.55;
  return (
    <View style={{ width: tam, height: tam * 1.15, justifyContent: 'flex-end', alignItems: 'center' }}>
      <View style={{ width: 6, height: h, backgroundColor: '#3E9B3A', borderRadius: 3 }} />
      <View style={[styles.folha, { bottom: h * 0.45, left: tam / 2 - 16 }]} />
      <View style={[styles.folha, { bottom: h * 0.25, left: tam / 2 + 2, transform: [{ rotate: '35deg' }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  semente: { borderWidth: 2, borderColor: 'rgba(0,0,0,0.12)' },
  petala: { position: 'absolute', borderWidth: 1.5, borderColor: '#C9B8E8' },
  miolo: { position: 'absolute', backgroundColor: '#FFC93C' },
  folha: { position: 'absolute', width: 14, height: 8, borderRadius: 8, backgroundColor: '#5BBF4F', transform: [{ rotate: '-35deg' }] },
});
