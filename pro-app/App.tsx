import React, { useEffect } from 'react';
import { BackHandler, Platform, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { InstrumentSans_400Regular } from '@expo-google-fonts/instrument-sans/400Regular';
import { InstrumentSans_500Medium } from '@expo-google-fonts/instrument-sans/500Medium';
import { InstrumentSans_600SemiBold } from '@expo-google-fonts/instrument-sans/600SemiBold';
import { InstrumentSans_700Bold } from '@expo-google-fonts/instrument-sans/700Bold';
import { closeAction, closeSheet, FrameCtx, get, pop, setTab, useC, useStore, type FrameT } from './src/store';
import { ActionLayer, FakeStatus, RootShift, Sheets, Stack, TabBar, Toast } from './src/layers';
import { Calendar } from './src/Calendar';
import { RootTab } from './src/tabs';

function Shell() {
  const C = useC();
  const tab = useStore(s => s.tab);
  const onBlue = useStore(s => { const t = s.stack[s.stack.length - 1]; return !!t && !t.closing && t.id === 'lesson'; });
  useEffect(() => {
    // Android geri tuşu: önce pencere, sonra panel, sonra ekran, sonra Takvim sekmesi
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      const s = get();
      if (s.action) { closeAction(); return true; }
      if (s.sheets.some(x => !x.closing)) { closeSheet(); return true; }
      if (s.stack.some(x => !x.closing)) { pop(); return true; }
      if (s.tab !== 0) { setTab(0); return true; }
      return false;
    });
    return () => h.remove();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, overflow: 'hidden' }}>
      <StatusBar style={onBlue ? 'light' : C.dark ? 'light' : 'dark'} />
      <RootShift>
        <View style={{ flex: 1, display: tab === 0 ? 'flex' : 'none' }}><Calendar /></View>
        {tab !== 0 ? <RootTab tab={tab} /> : null}
      </RootShift>
      <TabBar />
      <Stack />
      <FakeStatus />
      <Sheets />
      <ActionLayer />
      <Toast />
    </View>
  );
}

function Frame() {
  const { width, height } = useWindowDimensions();
  const ins = useSafeAreaInsets();
  // Geniş tarayıcıda telefon çerçevesi içinde göster
  const framed = Platform.OS === 'web' && width > 520;
  const W = framed ? 390 : width;
  const full = framed ? Math.min(844, height - 44) : height;
  const top = framed ? 44 : Math.max(ins.top, Platform.OS === 'web' ? 12 : 20);
  const fr: FrameT = { W, H: full - top, top, bottom: framed ? 0 : ins.bottom, tbh: 52 + (framed ? 34 : Math.max(ins.bottom, 10)), framed };
  if (!framed) return <FrameCtx.Provider value={fr}><Shell /></FrameCtx.Provider>;
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ borderRadius: 56, padding: 10, backgroundColor: '#1B1B1D' }}>
        <View style={{ width: W, height: full, borderRadius: 46, overflow: 'hidden' }}>
          <FrameCtx.Provider value={fr}><Shell /></FrameCtx.Provider>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  const [ok] = useFonts({ InstrumentSans_400Regular, InstrumentSans_500Medium, InstrumentSans_600SemiBold, InstrumentSans_700Bold });
  if (!ok) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Frame />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
