import { Stack } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContaProvider } from '../lib/conta';
import { cores } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ContaProvider>
        <StatusBar style="dark" />
        {/* Esconde a barra de navegação do Android; ela volta deslizando a borda de baixo */}
        <NavigationBar hidden />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo }, animation: 'slide_from_right' }} />
      </ContaProvider>
    </SafeAreaProvider>
  );
}
