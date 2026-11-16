// Katmanlar: itilen ekranlar, alttan paneller, onay/menü pencereleri, bildirim balonu, alt bar
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { EASE } from './theme';
import { closeAction, closeSheet, pop, removeRoute, removeSheet, set, setTab, useC, useFrame, useStore, type ActionS, type Route, type SheetR, type ToastS } from './store';
import { Bell, HL, Icon, T } from './ui';
import { SCREENS, SHEETS } from './registry';

const ease = Easing.bezier(...EASE);
const NO_SWIPE = ['login', 'signup', 'paymentDone', 'requestAccepted', 'requestRejected', 'cancelled'];

/* ---------- itilen ekran ---------- */
function StackLayer({ r, above }: { r: Route; above?: SharedValue<number> }) {
  const C = useC();
  const { W, top } = useFrame();
  const Scr = SCREENS[r.id];
  const prog = r.prog, key = r.key;
  useEffect(() => { prog.value = withTiming(1, { duration: 380, easing: ease }); }, []);
  useEffect(() => {
    if (r.closing) prog.value = withTiming(0, { duration: 380, easing: ease }, f => { if (f) runOnJS(removeRoute)(key); });
  }, [r.closing]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - prog.value) * W - (above ? above.value : 0) * 0.28 * W }] }));
  const edge = Gesture.Pan()
    .enabled(!NO_SWIPE.includes(r.id) && !r.closing)
    .activeOffsetX(12)
    .failOffsetY([-14, 14])
      .onUpdate(e => { prog.value = Math.max(0, Math.min(1, 1 - e.translationX / W)); })
    .onEnd(e => {
      if (e.translationX > W * 0.35 || e.velocityX > 500) runOnJS(pop)();
      else prog.value = withTiming(1, { duration: 260, easing: ease });
    });
  const lesson = r.id === 'lesson';
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: C.bg, boxShadow: '-12px 0px 30px rgba(0,0,0,0.10)' }, st]}>
      <View style={{ flex: 1, paddingTop: lesson ? 0 : top }}>{Scr ? <Scr p={r.p} /> : null}</View>
      <GestureDetector gesture={edge}>
        <View style={{ position: 'absolute', left: 0, top: top + 56, bottom: 0, width: 18 }} />
      </GestureDetector>
    </Animated.View>
  );
}

export function Stack() {
  const stack = useStore(s => s.stack);
  return (
    <>
      {stack.map((r, i) => <StackLayer key={r.key} r={r} above={stack[i + 1]?.prog} />)}
    </>
  );
}

// Sekme kökü: üstüne ekran itilince sola hafif kayar
export function RootShift({ children }: { children: React.ReactNode }) {
  const first = useStore(s => s.stack[0]);
  const { W } = useFrame();
  const p = first?.prog;
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -(p ? p.value : 0) * 0.28 * W }] }));
  return <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, st]}>{children}</Animated.View>;
}

/* ---------- alt bar ---------- */
export function TabBar() {
  const C = useC();
  const { tbh, framed, W } = useFrame();
  const tab = useStore(s => s.tab);
  const emp = useStore(s => s.emp);
  const first = useStore(s => s.stack[0]);
  const p = first?.prog;
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: (p ? p.value : 0) * tbh * 1.1 }] }));
  const TABS: [string, string][] = [['calendar_today', 'Takvim'], ['group', 'Kişiler'], ['', 'Bildirimler'], ['account_circle', 'Hesabım']];
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, height: tbh, borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden', boxShadow: C.dark ? '0px -1px 0px rgba(255,255,255,0.08)' : '0px -6px 24px rgba(20,30,80,0.08), 0px -1px 0px rgba(20,30,80,0.05)' }, st]}>
      <BlurView intensity={40} tint={C.dark ? 'dark' : 'light'} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      {C.dark ? (
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26,28,38,0.78)' }} />
      ) : (
        <Svg width={W} height={tbh} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Defs>
            <RadialGradient id="g1" cx="10%" cy="115%" rx="80%" ry="170%" gradientUnits="objectBoundingBox">
              <Stop offset="0" stopColor="rgb(196,206,255)" stopOpacity={0.9} />
              <Stop offset="0.7" stopColor="rgb(196,206,255)" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="g2" cx="65%" cy="125%" rx="90%" ry="170%" gradientUnits="objectBoundingBox">
              <Stop offset="0" stopColor="rgb(222,196,250)" stopOpacity={0.95} />
              <Stop offset="0.7" stopColor="rgb(222,196,250)" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="g3" cx="100%" cy="10%" rx="70%" ry="140%" gradientUnits="objectBoundingBox">
              <Stop offset="0" stopColor="rgb(220,226,255)" stopOpacity={0.8} />
              <Stop offset="0.7" stopColor="rgb(220,226,255)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="rgba(244,245,255,0.85)" />
          <Rect width="100%" height="100%" fill="url(#g3)" />
          <Rect width="100%" height="100%" fill="url(#g2)" />
          <Rect width="100%" height="100%" fill="url(#g1)" />
          <Rect width="100%" height="100%" fill="rgba(246,248,255,0.45)" />
        </Svg>
      )}
      <View style={{ flexDirection: 'row', paddingTop: 10 }}>
        {TABS.map((t, i) => {
          const col = i === tab ? C.a : C.tab;
          return (
            <Pressable key={i} onPress={() => setTab(i)} accessibilityRole="tab" accessibilityState={{ selected: i === tab }} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ height: 28, justifyContent: 'center', alignItems: 'center' }}>
                {t[0] ? <Icon n={t[0]} s={26} c={col} /> : <Bell s={27} c={col} />}
              </View>
              {i === 2 && !emp ? (
                <View style={{ position: 'absolute', top: -3, left: '50%', marginLeft: 4, minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 99, backgroundColor: C.a, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.barS }}>
                  <T s={10} w={700} c={C.on} style={{ lineHeight: 12 }}>2</T>
                </View>
              ) : null}
              <T s={10.5} w={i === tab ? 700 : 600} c={col} style={{ marginTop: 2 }}>{t[1]}</T>
            </Pressable>
          );
        })}
      </View>
      {framed ? <View style={{ position: 'absolute', left: '50%', bottom: 8, width: 134, marginLeft: -67, height: 5, borderRadius: 3, backgroundColor: C.t }} /> : null}
    </Animated.View>
  );
}

/* ---------- web önizlemesinde sahte durum çubuğu ---------- */
export function FakeStatus() {
  const C = useC();
  const { framed } = useFrame();
  const onBlue = useStore(s => { const t = s.stack[s.stack.length - 1]; return !!t && !t.closing && t.id === 'lesson'; });
  if (!framed) return null;
  const col = onBlue ? '#fff' : C.t;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 44 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, paddingRight: 30, paddingLeft: 34 }}>
        <T s={15} w={700} c={col}>9:41</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon n="signal_cellular_alt" s={17} c={col} />
          <Icon n="wifi" s={17} c={col} />
          <View style={{ width: 24, height: 12, borderRadius: 4, borderWidth: 1.2, borderColor: col, padding: 1.5 }}>
            <View style={{ width: '70%', height: '100%', borderRadius: 2, backgroundColor: col }} />
          </View>
        </View>
      </View>
      <View style={{ position: 'absolute', left: '50%', top: 10, width: 110, height: 30, marginLeft: -55, borderRadius: 20, backgroundColor: '#000' }} />
    </View>
  );
}

/* ---------- alttan panel ---------- */
function SheetLayer({ s }: { s: SheetR }) {
  const C = useC();
  const { H, top } = useFrame();
  const full = H + top;
  const h = Math.round(full * 0.93);
  const v = useSharedValue(0);
  const Sh = SHEETS[s.id];
  const skey = s.key;
  useEffect(() => { v.value = withTiming(1, { duration: 400, easing: ease }); }, []);
  useEffect(() => {
    if (s.closing) v.value = withTiming(0, { duration: 240, easing: Easing.bezier(0.4, 0, 1, 1) }, f => { if (f) runOnJS(removeSheet)(skey); });
  }, [s.closing]);
  const scrim = useAnimatedStyle(() => ({ opacity: v.value }));
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - v.value) * h }] }));
  return (
    <>
      <Animated.View pointerEvents={s.closing ? 'none' : 'auto'} style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: C.scrim }, scrim]}>
        <Pressable style={{ flex: 1 }} onPress={closeSheet} accessibilityLabel="Kapat" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, backgroundColor: C.sheet, borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden', boxShadow: '0px -10px 40px rgba(0,0,0,0.18)' }, st]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, paddingTop: 14 }}>
          {Sh ? <Sh p={s.p} /> : null}
        </KeyboardAvoidingView>
        <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: 6, width: 36, height: 5, marginLeft: -18, borderRadius: 3, backgroundColor: C.fill2 }} />
      </Animated.View>
    </>
  );
}
export function Sheets() {
  const sheets = useStore(s => s.sheets);
  return (
    <>
      {sheets.map(s => <SheetLayer key={s.key} s={s} />)}
    </>
  );
}

/* ---------- onay / menü / seçim penceresi ---------- */
export function ActionLayer() {
  const C = useC();
  const { bottom } = useFrame();
  const action = useStore(s => s.action);
  const [shown, setShown] = useState<ActionS | null>(null);
  const v = useSharedValue(0);
  useEffect(() => {
    if (action) { setShown(action); v.value = withTiming(1, { duration: 320, easing: ease }); }
    else v.value = withTiming(0, { duration: 220 }, f => { if (f) runOnJS(setShown)(null); });
  }, [action]);
  const scrim = useAnimatedStyle(() => ({ opacity: v.value }));
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 40 }] }));
  if (!shown) return null;
  const run = (fn?: () => void) => { closeAction(); fn && setTimeout(fn, 0); };
  return (
    <View pointerEvents={action ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: C.scrim }, scrim]}>
        <Pressable style={{ flex: 1 }} onPress={closeAction} accessibilityLabel="Vazgeç" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 8, right: 8, bottom: Math.max(14, bottom) }, st]}>
        <View style={{ backgroundColor: C.sheet, borderRadius: 16, overflow: 'hidden' }}>
          {shown.msg ? (
            <View style={{ paddingTop: 16, paddingHorizontal: 18, paddingBottom: 14 }}>
              <T s={14} w={600} c={C.t2} style={{ textAlign: 'center' }}>{shown.title}</T>
              <T s={13} c={C.t2} lh={1.45} style={{ textAlign: 'center', marginTop: 4 }}>{shown.msg}</T>
            </View>
          ) : (
            <T s={13.5} w={600} c={C.t2} style={{ textAlign: 'center', paddingTop: 14, paddingHorizontal: 18, paddingBottom: 12 }}>{shown.title}</T>
          )}
          {shown.rows.map((r, i) => (
            <Pressable key={i} onPress={() => run(r.onPress)} accessibilityRole="button" style={({ pressed }) => [{ borderTopWidth: HL, borderTopColor: C.sep, padding: r.big ? 16 : 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: r.icon ? 10 : 8 }, pressed && { backgroundColor: C.fill }]}>
              {r.icon ? <Icon n={r.icon} s={21} c={r.danger ? C.red : C.a} /> : null}
              <T s={r.big ? 18 : 17} w={r.check ? 600 : 500} c={r.danger ? C.red : C.a}>{r.label}</T>
              {r.check ? <Icon n="check" s={19} f={0} c={C.a} /> : null}
            </Pressable>
          ))}
        </View>
        <Pressable onPress={closeAction} accessibilityRole="button" style={({ pressed }) => [{ marginTop: 8, backgroundColor: C.sheet, borderRadius: 16, padding: 16, alignItems: 'center' }, pressed && { opacity: 0.9 }]}>
          <T s={shown.msg ? 18 : 17} w={700} c={C.a}>Vazgeç</T>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/* ---------- bildirim balonu ---------- */
export function Toast() {
  const C = useC();
  const toast = useStore(s => s.toast);
  const [shown, setShown] = useState<ToastS | null>(null);
  const v = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    v.value = withTiming(1, { duration: 300, easing: ease });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { v.value = withTiming(0, { duration: 200 }); }, 2600);
  }, [toast]);
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 20 }] }));
  if (!shown) return null;
  return (
    <Animated.View pointerEvents="box-none" style={[{ position: 'absolute', left: 0, right: 0, bottom: 108, alignItems: 'center' }, st]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.toast, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 99, boxShadow: '0px 8px 24px rgba(0,0,0,0.2)' }}>
        <T s={14} w={600} c="#fff" numberOfLines={1}>{shown.msg}</T>
        {shown.undo ? (
          <Pressable hitSlop={10} onPress={() => { shown.onUndo?.(); set({ toast: { key: Date.now(), msg: 'Geri alındı' } }); }}>
            <T s={14} w={600} c="#9DB0FF">{shown.undo}</T>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
