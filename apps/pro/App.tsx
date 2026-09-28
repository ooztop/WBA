import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DesignSystemScreen } from './src/DesignSystemScreen';
import { useProFonts } from './src/theme';

export default function App() {
  const fontsReady = useProFonts();
  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <DesignSystemScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
