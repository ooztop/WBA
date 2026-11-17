import React, { useEffect, useRef } from 'react';
import { BackHandler, Platform, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { closeAction, closeSheet, FrameCtx, get, pop, set, setTab, useC, useStore, type FrameT } from './src/store';
import { ActionLayer, FakeStatus, PickerLayer, RootShift, Sheets, Stack, TabBar, Toast, useLightStatus } from './src/layers';
import { AddMenu, Calendar } from './src/Calendar';
import { RootTab } from './src/tabs';
import { boot } from './src/data/actions';

function Shell() {
  const C = useC();
  const tab = useStore(s => s.tab);
  const light = useLightStatus();
  const seen = useRef(new Set<number>());
  seen.current.add(tab);
  useEffect(() => {
    // Android geri tuşu: önce pencere, sonra menü, panel, sayfa, en son Takvim sekmesi
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      const s = get();
      if (s.action) { closeAction(); return true; }
      if (s.menu) { set({ menu: false }); return true; }
      if (s.sheets.some(x => !x.closing)) { closeSheet(); return true; }
      if (s.stack.some(x => !x.closing)) { pop(); return true; }
      if (s.tab !== 0) { setTab(0); return true; }
      return false;
    });
    return () => h.remove();
  }, []);
  return (
    <View style={[{ flex: 1, backgroundColor: C.page, overflow: 'hidden' }, Platform.OS === 'web' ? ({ userSelect: 'none' } as any) : null]}>
      <StatusBar style={light ? 'light' : 'dark'} />
      <RootShift>
        {/* Sekmeler animasyonsuz ve anında değişir; bir kez açılan sekme bellekte kalır (yeniden kurulmaz) */}
        <View style={{ flex: 1, display: tab === 0 ? 'flex' : 'none' }}><Calendar /></View>
        {[1, 2, 3].map(i => (seen.current.has(i) ? <View key={i} style={{ flex: 1, display: tab === i ? 'flex' : 'none' }}><RootTab tab={i} /></View> : null))}
      </RootShift>
      <TabBar />
      <Stack />
      <AddMenu />
      <Sheets />
      <PickerLayer />
      <ActionLayer />
      <FakeStatus />
      <Toast />
    </View>
  );
}

function Frame() {
  const { width, height } = useWindowDimensions();
  const ins = useSafeAreaInsets();
  // Geniş tarayıcıda telefon çerçevesi içinde göster (prototipteki 390×844)
  const framed = Platform.OS === 'web' && width > 520;
  const W = framed ? 390 : width;
  const full = framed ? Math.min(844, height - 32) : height;
  const top = framed ? 44 : Math.max(ins.top, Platform.OS === 'web' ? 12 : 20);
  const fr: FrameT = { W, H: full - top, top, bottom: framed ? 0 : ins.bottom, tbh: 66 + (framed ? 18 : Math.max(ins.bottom - 8, 10)), framed };
  if (!framed) return <FrameCtx.Provider value={fr}><Shell /></FrameCtx.Provider>;
  return (
    <View style={{ flex: 1, backgroundColor: '#E2E4EA', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: W, height: full, borderRadius: 44, overflow: 'hidden', boxShadow: '0px 0px 0px 1px #D5D9E2, 0px 24px 48px rgba(18,24,38,0.14)' }}>
        <FrameCtx.Provider value={fr}><Shell /></FrameCtx.Provider>
      </View>
    </View>
  );
}

export default function App() {
  const [ok] = useFonts({ Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold });
  const [ready, setReady] = React.useState(false);
  // Açılış yüklemesi hata verse de ekran açılır (boş önbellekle); reddedilen söz işlenmemiş kalmaz
  useEffect(() => { boot().catch(() => {}).finally(() => setReady(true)); }, []);
  if (!ok || !ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Frame />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
