// Katmanlar: itilen sayfalar, alttan paneller, onay penceresi / alttan menü, bildirim balonu, alt bar
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { EASE, mix } from './theme';
import { closeAction, closeSheet, pop, removeRoute, removeSheet, setTab, useC, useFrame, useStore, type ActionS, type Route, type SheetR, type ToastS } from './store';
import { Btn, Icon, T } from './ui';
import { BAND, SCREENS, SHEETS } from './registry';

const ease = Easing.bezier(...EASE);
const NO_SWIPE = ['login', 'signup', 'paymentDone', 'requestAccepted', 'requestRejected', 'cancelled'];

/* ---------- itilen sayfa ---------- */
function StackLayer({ r, above }: { r: Route; above?: SharedValue<number> }) {
  const C = useC();
  const { W, top } = useFrame();
  const Scr = SCREENS[r.id];
  const prog = r.prog, key = r.key;
  useEffect(() => { prog.value = withTiming(1, { duration: 440, easing: ease }); }, []);
  useEffect(() => {
    if (r.closing) prog.value = withTiming(0, { duration: 360, easing: ease }, f => { if (f) runOnJS(removeRoute)(key); });
  }, [r.closing]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - prog.value) * W - (above ? above.value : 0) * 0.28 * W }] }));
  const dim = useAnimatedStyle(() => ({ opacity: (above ? above.value : 0) * 0.12 }));
  const edge = Gesture.Pan()
    .enabled(!NO_SWIPE.includes(r.id) && !r.closing)
    .activeOffsetX(12)
    .failOffsetY([-14, 14])
    .onUpdate(e => { prog.value = Math.max(0, Math.min(1, 1 - e.translationX / W)); })
    .onEnd(e => {
      if (e.translationX > W * 0.35 || e.velocityX > 500) runOnJS(pop)();
      else prog.value = withTiming(1, { duration: 260, easing: ease });
    });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: C.page, boxShadow: '-14px 0px 36px rgba(18,24,38,0.18)' }, st]}>
      {Scr ? <Scr p={r.p} /> : null}
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000' }, dim]} />
      <GestureDetector gesture={edge}>
        <View style={{ position: 'absolute', left: 0, top: top + 70, bottom: 0, width: 18 }} />
      </GestureDetector>
    </Animated.View>
  );
}

export function Stack() {
  const stack = useStore(s => s.stack);
  return <>{stack.map((r, i) => <StackLayer key={r.key} r={r} above={stack[i + 1]?.prog} />)}</>;
}

// Sekme kökü: üstüne sayfa itilince sola kayar ve hafif kararır
export function RootShift({ children }: { children: React.ReactNode }) {
  const first = useStore(s => s.stack[0]);
  const { W } = useFrame();
  const p = first?.prog;
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -(p ? p.value : 0) * 0.28 * W }] }));
  const dim = useAnimatedStyle(() => ({ opacity: (p ? p.value : 0) * 0.12 }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, st]}>
      {children}
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000' }, dim]} />
    </Animated.View>
  );
}
// Sekme değişiminde içerik hafifçe kayarak belirir
export function TabFade({ tab, children }: { tab: number; children: React.ReactNode }) {
  const v = useSharedValue(1), dir = useSharedValue(1), prev = useRef(tab);
  useEffect(() => {
    if (prev.current === tab) return;
    dir.value = tab > prev.current ? 1 : -1;
    prev.current = tab;
    v.value = 0;
    v.value = withTiming(1, { duration: 260, easing: Easing.bezier(0.25, 0.8, 0.25, 1) });
  }, [tab]);
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateX: (1 - v.value) * 14 * dir.value }] }));
  return <Animated.View style={[{ flex: 1 }, st]}>{children}</Animated.View>;
}

/* ---------- alt bar ---------- */
export function TabBar() {
  const C = useC();
  const { tbh, framed, W } = useFrame();
  const tab = useStore(s => s.tab);
  const emp = useStore(s => s.emp);
  const nReq = useStore(s => (s.reqs.b ? 1 : 0) + (s.reqs.a ? 1 : 0));
  const first = useStore(s => s.stack[0]);
  const p = first?.prog;
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: (p ? p.value : 0) * tbh * 1.12 }] }));
  const TABS: [string, string][] = [['calendar', 'Takvim'], ['users', 'Kişiler'], ['bell', 'Bildirimler'], ['user', 'Hesabım']];
  // Açık temada vurgu renginden türeyen buğulu lekeler
  const g = C.dark ? [C.tint, C.tint, C.tintSoft] : [mix(C.accent, '#FFFFFF', 0.19), mix(C.accent, '#F4EDFF', 0.15), mix(C.accent, '#FFFFFF', 0.09)];
  const go = C.dark ? [0.9, 0.75, 0.8] : [1, 1, 1];
  const baseC = C.dark ? C.card : mix(C.accent, '#FFFFFF', 0.04);
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, height: tbh, borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden', boxShadow: '0px -6px 24px rgba(20,30,80,0.08), 0px -1px 0px rgba(20,30,80,0.05)' }, st]}>
      <BlurView intensity={40} tint={C.dark ? 'dark' : 'light'} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Svg width={W} height={tbh} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Defs>
          <RadialGradient id="g1" cx="10%" cy="115%" rx="80%" ry="170%" gradientUnits="objectBoundingBox">
            <Stop offset="0" stopColor={g[0]} stopOpacity={go[0]} /><Stop offset="0.7" stopColor={g[0]} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g2" cx="65%" cy="125%" rx="90%" ry="170%" gradientUnits="objectBoundingBox">
            <Stop offset="0" stopColor={g[1]} stopOpacity={go[1]} /><Stop offset="0.7" stopColor={g[1]} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g3" cx="100%" cy="10%" rx="70%" ry="140%" gradientUnits="objectBoundingBox">
            <Stop offset="0" stopColor={g[2]} stopOpacity={go[2]} /><Stop offset="0.7" stopColor={g[2]} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={baseC} fillOpacity={C.dark ? 0.82 : 0.86} />
        <Rect width="100%" height="100%" fill="url(#g3)" />
        <Rect width="100%" height="100%" fill="url(#g2)" />
        <Rect width="100%" height="100%" fill="url(#g1)" />
      </Svg>
      <View style={{ flexDirection: 'row', height: 66 }}>
        {TABS.map((t, i) => {
          const on = i === tab;
          return (
            <Pressable key={i} onPress={() => setTab(i)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Icon n={t[0]} s={22} c={on ? C.accent : C.muted} />
              {i === 2 && !emp && nReq ? (
                <View style={{ position: 'absolute', top: 7, left: '50%', marginLeft: 3, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 999, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.card }}>
                  <T s={10} w={800} c={C.onAccent} style={{ lineHeight: 12 }}>{nReq}</T>
                </View>
              ) : null}
              <T s={11} w={700} c={on ? C.ink : C.muted}>{t[1]}</T>
            </Pressable>
          );
        })}
      </View>
      {framed ? <View style={{ position: 'absolute', left: '50%', bottom: 8, width: 134, marginLeft: -67, height: 5, borderRadius: 3, backgroundColor: C.ink, opacity: 0.9 }} /> : null}
    </Animated.View>
  );
}

/* ---------- web önizlemesinde durum çubuğu (9:41 + pil) ---------- */
export function useLightStatus() {
  const C = useC();
  return useStore(s => {
    if (C.dark) return true;
    if (s.sheets.some(x => !x.closing) || s.action) return true;
    const live = s.stack.filter(x => !x.closing);
    const t = live[live.length - 1];
    return t ? BAND.includes(t.id) : true;
  });
}
export function FakeStatus() {
  const C = useC();
  const { framed } = useFrame();
  const light = useLightStatus();
  if (!framed) return null;
  const col = light ? '#FFFFFF' : C.ink;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 }}>
      <T s={15} w={800} c={col}>9:41</T>
      <Svg width={26} height={12} viewBox="0 0 26 12">
        <Rect x={0.5} y={0.5} width={22} height={11} rx={3} fill="none" stroke={col} opacity={0.5} />
        <Rect x={2.5} y={2.5} width={16} height={7} rx={1.5} fill={col} />
        <Rect x={24} y={4} width={1.5} height={4} rx={0.75} fill={col} opacity={0.5} />
      </Svg>
    </View>
  );
}

/* ---------- alttan panel ---------- */
function SheetLayer({ s, depth, above }: { s: SheetR; depth: number; above: boolean }) {
  const C = useC();
  const { H, top } = useFrame();
  const full = H + top;
  const mt = top + (depth > 0 ? 26 : 10);
  const h = full - mt;
  const v = useSharedValue(s.swap ? 1 : 0), u = useSharedValue(0);
  const Sh = SHEETS[s.id];
  const skey = s.key;
  useEffect(() => { v.value = withTiming(1, { duration: 480, easing: ease }); }, []);
  useEffect(() => {
    if (s.closing) v.value = withTiming(0, { duration: 320, easing: Easing.bezier(0.4, 0, 0.9, 0.6) }, f => { if (f) runOnJS(removeSheet)(skey); });
  }, [s.closing]);
  // Üstüne başka panel açılınca geri çekilir
  useEffect(() => { u.value = withTiming(above ? 1 : 0, { duration: above ? 480 : 380, easing: ease }); }, [above]);
  const scrim = useAnimatedStyle(() => ({ opacity: v.value }));
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - v.value) * h - u.value * 6 }, { scale: 1 - u.value * 0.07 }], borderBottomLeftRadius: u.value * 24, borderBottomRightRadius: u.value * 24 }));
  const dim = useAnimatedStyle(() => ({ opacity: u.value * 0.12 }));
  return (
    <>
      <Animated.View pointerEvents={s.closing ? 'none' : 'auto'} style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: depth > 0 ? 'rgba(18,24,38,0.2)' : C.scrim }, scrim]}>
        <Pressable style={{ flex: 1 }} onPress={closeSheet} accessibilityLabel="Kapat" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: mt, height: h, backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }, st]}>
        <View style={{ height: 13 }}><View style={{ alignSelf: 'center', marginTop: 8, width: 36, height: 5, borderRadius: 999, backgroundColor: C.divider }} /></View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {Sh ? <Sh p={s.p} /> : null}
        </KeyboardAvoidingView>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#000' }, dim]} />
      </Animated.View>
    </>
  );
}
export function Sheets() {
  const sheets = useStore(s => s.sheets);
  const live = sheets.filter(x => !x.closing);
  return (
    <>
      {sheets.map((s, i) => {
        const li = live.indexOf(s);
        return <SheetLayer key={s.key} s={s} depth={sheets.slice(0, i).filter(x => !x.closing || x === s).length} above={li >= 0 && li < live.length - 1} />;
      })}
    </>
  );
}

/* ---------- onay penceresi (.dlg) ve alttan menü (.ass) ---------- */
export function ActionLayer() {
  const C = useC();
  const { bottom } = useFrame();
  const action = useStore(s => s.action);
  const [shown, setShown] = useState<ActionS | null>(null);
  const v = useSharedValue(0);
  useEffect(() => {
    if (action) { setShown(action); v.value = withTiming(1, { duration: action.kind === 'dlg' ? 320 : 400, easing: action.kind === 'dlg' ? Easing.bezier(0.2, 1.25, 0.4, 1) : ease }); }
    else v.value = withTiming(0, { duration: 200 }, f => { if (f) runOnJS(setShown)(null); });
  }, [action]);
  const scrim = useAnimatedStyle(() => ({ opacity: Math.min(1, v.value) }));
  const dlg = useAnimatedStyle(() => ({ opacity: Math.min(1, v.value), transform: [{ scale: 0.9 + v.value * 0.1 }] }));
  const ass = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - v.value) * 340 }] }));
  if (!shown) return null;
  const run = (fn?: () => void) => { closeAction(); fn && setTimeout(fn, 0); };
  return (
    <View pointerEvents={action ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: C.scrim }, scrim]}>
        <Pressable style={{ flex: 1 }} onPress={closeAction} accessibilityLabel="Vazgeç" />
      </Animated.View>
      {shown.kind === 'dlg' ? (
        <View pointerEvents="box-none" style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
          <Animated.View accessibilityRole="alert" style={[{ backgroundColor: C.card, borderRadius: 20, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20, gap: 8, boxShadow: C.shToast }, dlg]}>
            <T s={20} w={800} lh={1.25}>{shown.title}</T>
            <T s={15} lh={1.5} c={C.muted}>{shown.msg}</T>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <Btn flex k="g" t="Vazgeç" onPress={closeAction} />
              {shown.rows[0].danger ? <Btn flex k="x" t={shown.rows[0].label} onPress={() => run(shown.rows[0].onPress)} /> : <Btn flex k="g" t={shown.rows[0].label} onPress={() => run(shown.rows[0].onPress)} style={{ backgroundColor: C.sdark, borderColor: C.sdark }} left={null} />}
            </View>
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={[{ position: 'absolute', left: 8, right: 8, bottom: Math.max(28, bottom + 8), gap: 8 }, ass]}>
          <View style={{ backgroundColor: C.card, borderRadius: 16, overflow: 'hidden' }}>
            <T s={13} w={700} c={C.muted} style={{ paddingVertical: 14, paddingHorizontal: 16, textAlign: 'center' }}>{shown.title}</T>
            {shown.rows.map((r, i) => (
              <Pressable key={i} onPress={() => run(r.onPress)} accessibilityRole="menuitem" style={({ pressed }) => [{ height: 56, borderTopWidth: 1, borderTopColor: C.divider, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, pressed && { backgroundColor: C.page }]}>
                {r.icon ? <Icon n={r.icon} s={18} c={r.danger ? C.danger : C.ink} /> : null}
                <T s={17} w={700} c={r.danger ? C.danger : r.check != null ? C.accent : C.ink}>{r.label}</T>
                {r.check ? <Icon n="check" s={18} sw={2.6} c={C.accent} /> : null}
              </Pressable>
            ))}
          </View>
          <Pressable onPress={closeAction} accessibilityRole="button" style={({ pressed }) => [{ backgroundColor: C.card, borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.92 }]}>
            <T s={17} w={800}>Vazgeç</T>
          </Pressable>
        </Animated.View>
      )}
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
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    setVis(true);
    v.value = withTiming(1, { duration: 380, easing: Easing.bezier(0.2, 1.3, 0.4, 1) });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { v.value = withTiming(0, { duration: 220 }); setVis(false); }, toast.undo ? 2800 : 1800);
  }, [toast]);
  const st = useAnimatedStyle(() => ({ opacity: Math.min(1, v.value), transform: [{ translateY: (1 - v.value) * 20 }] }));
  if (!shown) return null;
  return (
    <Animated.View pointerEvents={vis && shown.undo ? 'box-none' : 'none'} style={[{ position: 'absolute', left: 0, right: 0, bottom: 110, alignItems: 'center' }, st]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.sdark, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, boxShadow: C.shToast, maxWidth: '92%' }}>
        <T s={14} w={700} c={C.onDark} numberOfLines={1}>{shown.msg}</T>
        {shown.undo ? <Pressable hitSlop={10} onPress={() => { shown.onUndo?.(); v.value = withTiming(0, { duration: 200 }); setVis(false); }}><T s={14} w={800} c="#9DB0FF">{shown.undo}</T></Pressable> : null}
      </View>
    </Animated.View>
  );
}
