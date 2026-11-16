// Takvim sekmesi: Gün ↔ Hafta ↔ Ay tek bir P değeriyle (0..2) birbirine dönüşür.
// Prototipteki build()/draw(p) mantığının Reanimated karşılığı.
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { addD, D1, DL, DN, lessons, MN, mon, MS, NOW_H, p2, same, TODAY, wd, type Lesson } from './data';
import { openSheet, push, set, useC, useFrame, useStore } from './store';
import type { Colors, TyKey } from './theme';
import { Btn, HL, Icon, T } from './ui';

const MT = 118, RH = 70, LH = 38;
const OQ = Easing.out(Easing.poly(4));

function cl(x: number, a = 0, b = 1) { 'worklet'; return Math.max(a, Math.min(b, x)); }
function lp(a: number, b: number, t: number) { 'worklet'; return a + (b - a) * t; }
// i. gün sütununun merkezi
function cxOf(p: number, W: number, i: number) {
  'worklet';
  const e = cl(p), q = cl(p - 1);
  const L = q > 0 ? lp(56, 0, q) : lp(18, 56, e), R = q > 0 ? lp(14, 0, q) : lp(18, 14, e);
  return L + ((W - L - R) / 7) * (i + 0.5);
}
function yOf(t: number, e: number, ts: number, HW: number) { 'worklet'; return (t - lp(7, 8, e)) * lp(48, HW, e) + 6 - ts * (1 - e); }

type Geo = { P: SharedValue<number>; TS: SharedValue<number>; W: number; HW: number };

/* ---------- ay ızgarası yerleşimi ---------- */
function layout(F: Date, W: number) {
  const MCW = W / 7;
  let y = 0;
  const months: { y: number; m0: Date; lx: number }[] = [];
  const rows: { y: number; from: Date; to: Date }[] = [];
  const cells: { d: Date; x: number; y: number; r: number }[] = [];
  for (let mi = -2; mi <= 4; mi++) {
    const m0 = new Date(F.getFullYear(), F.getMonth() + mi, 1), off = wd(m0);
    const nd = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate(), nr = Math.ceil((off + nd) / 7);
    months.push({ y, m0, lx: MCW * (off + 0.5) - 15 });
    y += LH;
    for (let r = 0; r < nr; r++) {
      const a = r === 0 ? off : 0, b = Math.min(6, off + nd - 1 - r * 7);
      const dt = (i: number) => new Date(m0.getFullYear(), m0.getMonth(), r * 7 + i - off + 1);
      for (let i = a; i <= b; i++) cells.push({ d: dt(i), x: MCW * (i + 0.5) - 20, y: y + 8, r: rows.length });
      rows.push({ y, from: dt(a), to: dt(b) });
      y += RH;
    }
  }
  const rowF = Math.max(0, rows.findIndex(o => (F >= o.from && F <= o.to) || same(F, o.from) || same(F, o.to)));
  return { months, rows, cells, total: y, rowF, S0: months[2].y + LH - 6 };
}

function Num({ C, d, sel }: { C: Colors; d: Date; sel: boolean }) {
  const tod = same(d, TODAY), we = wd(d) > 4;
  return (
    <View style={{ width: 34, height: 34, alignSelf: 'center', borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? C.t : tod ? C.a : 'transparent' }}>
      <T s={17} w={sel || tod ? 700 : 500} c={sel ? C.bg : tod ? C.on : we ? C.t3 : C.t}>{d.getDate()}</T>
    </View>
  );
}
const Dots = ({ C, types }: { C: Colors; types: TyKey[] }) => (
  <View style={{ flexDirection: 'row', gap: 3, justifyContent: 'center', marginTop: 6, height: 6 }}>
    {types.map(t => <View key={t} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.ty[t][1] }} />)}
  </View>
);
const typesOf = (ls: Lesson[]) => [...new Set(ls.map(l => l[2]))].slice(0, 3);

/* ---------- hareketli parçalar ---------- */
function Hour({ h, g, C, a0, a1, hide }: { h: number; g: Geo; C: Colors; a0: number; a1: number; hide: boolean }) {
  const { P, TS, HW } = g;
  const lab = useAnimatedStyle(() => {
    const e = cl(P.value), nv = lp(a0, a1, e);
    return { transform: [{ translateY: yOf(h, e, TS.value, HW) - 7 }], opacity: (h < 8 || h > 20 ? 1 - e : 1) * (Math.abs(h - NOW_H) < 0.5 && nv > 0.5 ? 0 : 1) };
  });
  const line = useAnimatedStyle(() => { const e = cl(P.value); return { transform: [{ translateY: yOf(h, e, TS.value, HW) }], opacity: 1 - e }; });
  if (hide) return null;
  return (
    <>
      <Animated.View style={[{ position: 'absolute', left: 14, top: 0 }, lab]}><T s={10.5} w={600} c={C.t3}>{p2(h)}:00</T></Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 56, right: 18, top: 0, height: HL, backgroundColor: C.sep }, line]} />
    </>
  );
}

function Block({ l, di, det, g, C, name, onPress }: { l: Lesson; di: number; det: boolean; g: Geo; C: Colors; name: string; onPress: () => void }) {
  const { P, TS, W, HW } = g;
  const Ty = C.ty[l[2]];
  const st = useAnimatedStyle(() => {
    const p = P.value, e = cl(p);
    const hh = lp(48, HW, e), cx = cxOf(p, W, di);
    const top = yOf(l[0], e, TS.value, HW) + 1, height = (l[1] / 60) * hh - 3;
    if (det) return { left: lp(62, cx - 6, e), width: lp(W - 18 - 62, 12, e), top, height, borderRadius: lp(10, 6, e), opacity: 1 };
    return { left: cx - 6, width: 12, top, height, borderRadius: 6, opacity: cl(e * 1.6 - 0.3) };
  });
  const fill = useAnimatedStyle(() => ({ opacity: cl(P.value) }));
  const txt = useAnimatedStyle(() => ({ opacity: cl(1 - cl(P.value) * 3) }));
  const bar = useAnimatedStyle(() => ({ opacity: cl(1 - cl(P.value) * 2) }));
  if (!det) return <Animated.View pointerEvents="none" style={[{ position: 'absolute', backgroundColor: Ty[1] }, st]} />;
  return (
    <Animated.View style={[{ position: 'absolute', backgroundColor: Ty[0], overflow: 'hidden' }, st]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${name} dersi`} style={{ flex: 1 }}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: Ty[1] }, bar]} />
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: Ty[1] }, fill]} />
        <Animated.View style={[{ position: 'absolute', left: 13, right: 10, top: 7 }, txt]}>
          <T s={14} w={700} c={Ty[2]} numberOfLines={1}>{name}</T>
          {l[1] >= 60 ? <T s={12} c={Ty[2]} style={{ opacity: 0.75, marginTop: 2 }} numberOfLines={1}>{p2(Math.floor(l[0]))}:{p2(Math.round((l[0] % 1) * 60))} · {Ty[4]}</T> : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function StripCell({ i, d, g, C, sel, types, inRow, yRowF, onPress }: { i: number; d: Date; g: Geo; C: Colors; sel: boolean; types: TyKey[]; inRow: boolean; yRowF: number; onPress: () => void }) {
  const { P, W } = g;
  const st = useAnimatedStyle(() => {
    const p = P.value, q = cl(p - 1);
    return { transform: [{ translateX: cxOf(p, W, i) - 20 }, { translateY: lp(118, yRowF, q) }], opacity: q >= 1 ? 0 : inRow ? 1 : 1 - q };
  });
  const dots = useAnimatedStyle(() => ({ opacity: cl(P.value - 1) }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 40 }, st]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${d.getDate()} ${MN[d.getMonth()]}`}>
        <Num C={C} d={d} sel={sel} />
        <Animated.View style={dots}><Dots C={C} types={types} /></Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function DayLab({ i, g, C }: { i: number; g: Geo; C: Colors }) {
  const { P, W } = g;
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: cxOf(P.value, W, i) - 20 }] }));
  const a = useAnimatedStyle(() => ({ opacity: P.value - 1 > 0.5 ? 0 : 1 }));
  const b = useAnimatedStyle(() => ({ opacity: P.value - 1 > 0.5 ? 1 : 0 }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 98, width: 40, alignItems: 'center' }, st]}>
      <Animated.View style={a}><T s={11} w={600} c={C.t3}>{DN[i]}</T></Animated.View>
      <Animated.View style={[{ position: 'absolute' }, b]}><T s={11} w={600} c={C.t3}>{D1[i]}</T></Animated.View>
    </Animated.View>
  );
}

function VLine({ i, g, col, VLH }: { i: number; g: Geo; col: string; VLH: number }) {
  const { P, W } = g;
  const st = useAnimatedStyle(() => {
    const p = P.value, e = cl(p), q = cl(p - 1);
    return { transform: [{ translateX: cxOf(p, W, i) - 0.75 }], height: e * (1 - q) * VLH, opacity: Math.min(1, e * 1.5) * (1 - q) };
  });
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 158, width: 1.5, borderRadius: 1, backgroundColor: col }, st]} />;
}

function Title({ i, g, DX, TIO, t, sub, C }: { i: number; g: Geo; DX: SharedValue<number>; TIO: SharedValue<number>; t: string; sub: string; C: Colors }) {
  const { P } = g;
  const st = useAnimatedStyle(() => ({ opacity: cl(1 - Math.abs(P.value - i) * 2) * TIO.value, transform: [{ translateY: (P.value - i) * -6 }, { translateX: DX.value * 0.25 }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 18, top: 33 }, st]}>
      <T s={28} w={700} ls={-0.03} lh={1.15} numberOfLines={1}>{t}</T>
      <T s={14} c={C.t2} style={{ marginTop: 2 }} numberOfLines={1}>{sub}</T>
    </Animated.View>
  );
}

/* ---------- ay ızgarası ---------- */
const MonthGrid = React.memo(function MonthGrid({ C, lay, F, W, P, S, yRowF, dots, onPick }: { C: Colors; lay: ReturnType<typeof layout>; F: Date; W: number; P: SharedValue<number>; S: SharedValue<number>; yRowF: number; dots: (d: Date) => TyKey[]; onPick: (d: Date) => void }) {
  const MCW = W / 7;
  const ml = useAnimatedStyle(() => {
    const q = cl(P.value - 1), yF = lp(118, yRowF, q);
    return { transform: [{ translateY: -S.value + (1 - q) * (yF - yRowF) }], opacity: q >= 1 ? 1 : q };
  });
  const rf = useAnimatedStyle(() => ({ opacity: P.value - 1 >= 1 ? 1 : 0 }));
  const cell = (c: (typeof lay.cells)[number], k: number) => (
    <Pressable key={k} onPress={() => onPick(c.d)} accessibilityRole="button" accessibilityLabel={`${c.d.getDate()} ${MN[c.d.getMonth()]}`} style={{ position: 'absolute', left: c.x, top: c.y, width: 40 }}>
      <Num C={C} d={c.d} sel={same(c.d, F)} />
      <Dots C={C} types={dots(c.d)} />
    </Pressable>
  );
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: W, height: lay.total }, ml]}>
      {lay.months.map((m, i) => <T key={i} s={19} w={700} ls={-0.01} style={{ position: 'absolute', left: m.lx, top: m.y + 10 }}>{MS[m.m0.getMonth()]}</T>)}
      {lay.rows.map((r, i) => <View key={i} style={{ position: 'absolute', left: wd(r.from) * MCW, width: (wd(r.to) - wd(r.from) + 1) * MCW, top: r.y, height: HL, backgroundColor: C.sep }} />)}
      {lay.cells.filter(c => c.r !== lay.rowF).map(cell)}
      <Animated.View pointerEvents="box-none" style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, rf]}>{lay.cells.filter(c => c.r === lay.rowF).map(cell)}</Animated.View>
    </Animated.View>
  );
});

/* ---------- takvim ---------- */
export function Calendar() {
  const C = useC();
  const { W, H, top, tbh } = useFrame();
  const F = useStore(s => s.F), emp = useStore(s => s.emp), extra = useStore(s => s.extra), cancelled = useStore(s => s.cancelled), people = useStore(s => s.people);
  const P = useSharedValue(0), TS = useSharedValue(72), S = useSharedValue(0), DX = useSharedValue(0), TIO = useSharedValue(1), MV = useSharedValue(0);
  const [mode, setMode] = useState(0);
  const [menu, setMenu] = useState(false);
  const [tmIdx, setTmIdx] = useState(2);

  const HW = Math.max(26, (H - tbh - 60 - 168 - 46) / 12), VLH = 12 * HW + 32;
  const TSmax = 768 - (H - 168 - tbh) + 28;
  const g: Geo = useMemo(() => ({ P, TS, W, HW }), [W, HW]);
  const L = (d: Date) => lessons(d, emp, extra, cancelled);
  const lay = useMemo(() => layout(F, W), [+F, W]);
  const week = useMemo(() => { const ws = mon(F); return [...Array(7)].map((_, i) => addD(ws, i)); }, [+F]);
  const yRowF = MT + lay.rows[lay.rowF].y - lay.S0 + 8;
  const Smax = lay.total - (H - tbh + 2 - 118) + 40;
  const rowOf = lay.rows[lay.rowF];
  const inRow = (d: Date) => (d >= rowOf.from && d <= rowOf.to) || same(d, rowOf.from) || same(d, rowOf.to);
  const dots = React.useCallback((d: Date) => typesOf(lessons(d, emp, extra, cancelled)), [emp, extra, cancelled]);

  const ref = useRef({ mode: '' as '' | 'S' | 'TS' | 'P' | 'X', P0: 0, TS0: 0, S0d: 0, inTL: false, dragAt: 0, slide: 0 }).current;
  const guard = (fn: () => void) => () => { if (Date.now() - ref.dragAt > 300) fn(); };

  useLayoutEffect(() => {
    if (P.value < 1.5) S.value = lay.S0;
    if (ref.slide) {
      DX.value = ref.slide * W;
      DX.value = withTiming(0, { duration: 320, easing: OQ });
      TIO.value = withTiming(1, { duration: 200 });
      ref.slide = 0;
    }
  }, [+F, lay.S0]);

  const starts = useMemo(() => lay.months.map(m => m.y), [lay]);
  useAnimatedReaction(() => { let k = 0; for (let i = 0; i < starts.length; i++) if (starts[i] <= S.value + 20) k = i; return k; }, (k, prev) => { if (k !== prev) runOnJS(setTmIdx)(k); }, [starts]);

  const to = (t: number, s0 = lay.S0) => {
    if (t < 2 && P.value >= 1.99) S.value = s0;
    P.value = withTiming(t, { duration: 420, easing: OQ });
    setMode(t);
  };
  const pickDay = (d: Date) => set({ F: new Date(d) });
  const pickMonthDay = (d: Date) => { const s0 = layout(d, W).S0; S.value = s0; set({ F: new Date(d) }); P.value = withTiming(0, { duration: 420, easing: OQ }); setMode(0); };
  const shift = (dir: number) => { ref.slide = dir; set({ F: addD(F, Math.round(P.value) === 0 ? dir : 7 * dir) }); };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(8)
    .enabled(!menu)
    .onBegin(e => { ref.mode = ''; ref.inTL = P.value < 0.5 && e.y > 168; cancelAnimation(TS); cancelAnimation(S); })
    .onUpdate(e => {
      const mx = e.translationX, my = e.translationY;
      if (!ref.mode) {
        if (Math.hypot(mx, my) < 4) return;
        cancelAnimation(P);
        ref.P0 = P.value; ref.TS0 = TS.value; ref.S0d = S.value;
        const x = Math.abs(mx) > Math.abs(my) && ref.P0 < 1.5;
        ref.mode = x ? 'X' : ref.P0 >= 1.99 ? 'S' : ref.inTL && !(ref.TS0 <= 1 && my > 0) ? 'TS' : 'P';
      }
      if (ref.mode === 'S') { let n = ref.S0d - my; if (n < 0) n *= 0.3; if (n > Smax) n = Smax + (n - Smax) * 0.3; S.value = n; }
      else if (ref.mode === 'TS') { let n = ref.TS0 - my; if (n < 0) n *= 0.3; if (n > TSmax) n = TSmax + (n - TSmax) * 0.3; TS.value = n; }
      else if (ref.mode === 'P') { let n = ref.P0 + my / 240; if (n < 0) n = -0.12 * (1 - 1 / (1 - n * 2)); if (n > 2) n = 2; P.value = n; }
      else DX.value = mx;
    })
    .onEnd(e => {
      if (!ref.mode) return;
      ref.dragAt = Date.now();
      const vx = e.velocityX / 1000, vy = e.velocityY / 1000, m = ref.mode;
      ref.mode = '';
      if (m === 'S') { S.value = withTiming(cl(S.value - vy * 320, 0, Smax), { duration: 650, easing: OQ }); return; }
      if (m === 'TS') { TS.value = withTiming(cl(TS.value - vy * 320, 0, TSmax), { duration: 600, easing: OQ }); return; }
      if (m === 'P') {
        const p = P.value, r0 = Math.round(ref.P0);
        let t = Math.round(p);
        if (vy > 0.4) t = Math.floor(p) + 1;
        if (vy < -0.4) t = Math.ceil(p) - 1;
        to(cl(cl(t, r0 - 1, r0 + 1), 0, 2));
        return;
      }
      const dx = e.translationX;
      if (!(Math.abs(dx) > 80 || Math.abs(vx) > 0.4)) { DX.value = withTiming(0, { duration: 250, easing: OQ }); return; }
      const dir = dx < 0 ? 1 : -1;
      DX.value = withTiming(-dir * W, { duration: 200, easing: OQ });
      TIO.value = withTiming(0, { duration: 200 });
      setTimeout(() => shift(dir), 200);
    });

  // menü
  const openM = (o: boolean) => { setMenu(o); MV.value = withTiming(o ? 1 : 0, { duration: 220, easing: Easing.bezier(0.23, 1, 0.32, 1) }); };
  const menuSt = useAnimatedStyle(() => ({ opacity: MV.value, transform: [{ translateY: (1 - MV.value) * 6 }, { scale: 0.9 + MV.value * 0.1 }] }));
  const scrimSt = useAnimatedStyle(() => ({ opacity: MV.value }));
  const plusSt = useAnimatedStyle(() => ({ transform: [{ rotate: `${MV.value * 45}deg` }] }));

  // başlıklar
  const dayN = L(F).length, wkN = week.reduce((s, d) => s + L(d).length, 0), wo = Math.round((+week[0] - +mon(TODAY)) / 6048e5);
  const tDay = same(F, TODAY) ? 'Bugün' : same(F, addD(TODAY, 1)) ? 'Yarın' : same(F, addD(TODAY, -1)) ? 'Dün' : DL[wd(F)];
  const tWk = wo === 0 ? 'Bu hafta' : wo === 1 ? 'Gelecek hafta' : wo === -1 ? 'Geçen hafta' : `${week[0].getDate()} ${MS[week[0].getMonth()]} haftası`;
  const tm = lay.months[Math.min(tmIdx, lay.months.length - 1)].m0;
  const isToday = same(F, TODAY), inW = week.some(d => same(d, TODAY)), a0 = isToday ? 1 : 0, a1 = inW ? 1 : 0, fi = wd(F);
  const nameOf = (id: number) => (people.find(p => p.id === id) || people[0]).name;

  const topA = useAnimatedStyle(() => ({ opacity: P.value - 1 > 0.5 ? 0 : 1 }));
  const topB = useAnimatedStyle(() => ({ opacity: P.value - 1 > 0.5 ? 1 : 0 }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: cl(P.value, 0, 2) * 50.67 }] }));
  const hdl = useAnimatedStyle(() => ({ opacity: cl(P.value - 1) }));
  const mc = useAnimatedStyle(() => ({ opacity: P.value - 1 > 0 ? 1 : 0 }));
  const mv = useAnimatedStyle(() => ({ transform: [{ translateX: DX.value }] }));
  const sep = useAnimatedStyle(() => ({ opacity: 1 - cl(P.value) }));
  const clip = useAnimatedStyle(() => { const q = cl(P.value - 1); return { opacity: 1 - q, transform: [{ translateY: q * 30 }] }; });
  const nowTag = useAnimatedStyle(() => { const e = cl(P.value); return { transform: [{ translateY: yOf(NOW_H, e, TS.value, HW) + 0.75 - 8 }], opacity: lp(a0, a1, e) }; });
  const nowLine = useAnimatedStyle(() => { const e = cl(P.value); return { transform: [{ translateY: yOf(NOW_H, e, TS.value, HW) }], left: lp(56, 52, e), opacity: lp(a0, a1, e) }; });
  const leg = useAnimatedStyle(() => { const p = P.value; return { opacity: cl(cl(p) * 2 - 1) * (1 - cl(p - 1)) }; });
  const empSt = useAnimatedStyle(() => ({ opacity: cl(1 - cl(P.value - 1) * 2) }));

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top, height: H, backgroundColor: C.bg }}>
      <GestureDetector gesture={pan}>
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          <View pointerEvents="none" style={{ position: 'absolute', left: 18, top: 17 }}>
            <Animated.View style={topA}><T s={13} w={600} c={C.t2}>{MN[F.getMonth()]} {F.getFullYear()}</T></Animated.View>
            <Animated.View style={[{ position: 'absolute' }, topB]}><T s={13} w={600} c={C.t2}>{tm.getFullYear()}</T></Animated.View>
          </View>
          <Title i={0} g={g} DX={DX} TIO={TIO} C={C} t={tDay} sub={`${F.getDate()} ${MN[F.getMonth()]}${tDay === DL[wd(F)] ? '' : ' · ' + DL[wd(F)]} · ${dayN} ders`} />
          <Title i={1} g={g} DX={DX} TIO={TIO} C={C} t={tWk} sub={`${week[0].getDate()} ${MS[week[0].getMonth()]} – ${week[6].getDate()} ${MS[week[6].getMonth()]} · ${wkN} ders`} />
          <Title i={2} g={g} DX={DX} TIO={TIO} C={C} t={MN[tm.getMonth()]} sub="" />

          {DN.map((_, i) => <DayLab key={i} i={i} g={g} C={C} />)}
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 117, height: HL, backgroundColor: C.sep }, hdl]} />

          <Animated.View pointerEvents={mode === 2 ? 'auto' : 'none'} style={[{ position: 'absolute', left: 0, right: 0, top: MT, height: H - MT, overflow: 'hidden' }, mc]}>
            <MonthGrid C={C} lay={lay} F={F} W={W} P={P} S={S} yRowF={yRowF} dots={dots} onPick={d => guard(() => pickMonthDay(d))()} />
          </Animated.View>

          <Animated.View pointerEvents={mode === 2 ? 'none' : 'box-none'} style={[{ position: 'absolute', left: 0, top: 0, width: W, height: H }, mv]}>
            <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 160, height: HL, backgroundColor: C.sep }, sep]} />
            <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 168, height: H - 168, overflow: 'hidden' }, clip]}>
              {Array.from({ length: 16 }, (_, k) => <Hour key={k} h={7 + k} g={g} C={C} a0={a0} a1={a1} hide={emp} />)}
              {week.map((d, di) => L(d).map(l => (
                <Block key={`${+d}-${l[0]}`} l={l} di={di} det={same(d, F)} g={g} C={C} name={nameOf(l[3])} onPress={guard(() => { if (mode === 0) push('lesson', { l, f: +d }); })} />
              )))}
              {emp ? null : (
                <>
                  <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 12, top: 0, height: 16, justifyContent: 'center', backgroundColor: C.now, paddingHorizontal: 6, borderRadius: 99 }, nowTag]}>
                    <T s={10} w={700} c={C.bg} style={{ lineHeight: 14 }}>12:36</T>
                  </Animated.View>
                  <Animated.View pointerEvents="none" style={[{ position: 'absolute', right: 18, top: 0, height: 1.5, backgroundColor: C.now }, nowLine]} />
                </>
              )}
            </Animated.View>
            {week.map((_, i) => <VLine key={i} i={i} g={g} col={i === fi ? C.t3 : C.vl} VLH={VLH} />)}
            <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 18, top: H - tbh - 60, width: 252, flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 7 }, leg]}>
              {(Object.keys(C.ty) as TyKey[]).map(k => (
                <View key={k} style={{ width: 120, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 18, height: 5, borderRadius: 3, backgroundColor: C.ty[k][1] }} />
                  <T s={12.5} c={C.t2}>{C.ty[k][3]}</T>
                </View>
              ))}
            </Animated.View>
            {emp ? (
              <Animated.View pointerEvents={mode === 2 ? 'none' : 'auto'} style={[{ position: 'absolute', left: 30, right: 30, top: 168 + (H - 168 - tbh) / 2 - 100, alignItems: 'center' }, empSt]}>
                <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: C.pbg, alignItems: 'center', justifyContent: 'center' }}><Icon n="event_available" s={30} c={C.a} /></View>
                <T s={17} w={600} ls={-0.01} style={{ marginTop: 14 }}>Takvimin boş</T>
                <T s={13.5} c={C.t2} lh={1.45} style={{ marginTop: 4, textAlign: 'center' }}>İlk dersini ekle, burada görünsün.</T>
                <Btn t="Ders ekle" h={40} fs={14.5} onPress={() => openSheet('newLesson')} style={{ marginTop: 14, marginHorizontal: 0, marginBottom: 0, paddingHorizontal: 18 }} />
              </Animated.View>
            ) : null}
            {week.map((d, i) => <StripCell key={i} i={i} d={d} g={g} C={C} sel={same(d, F)} types={dots(d)} inRow={inRow(d)} yRowF={yRowF} onPress={guard(() => pickDay(d))} />)}
          </Animated.View>

          <View style={{ position: 'absolute', right: 16, top: 14, width: 156, height: 30, borderRadius: 9, backgroundColor: C.seg }}>
            <Animated.View style={[{ position: 'absolute', top: 2, left: 2, width: 50, height: 26, borderRadius: 7, backgroundColor: C.segT, boxShadow: C.dark ? undefined : '0px 1px 3px rgba(0,0,0,0.12)' }, thumb]} />
            {['Gün', 'Hafta', 'Ay'].map((s, i) => (
              <Pressable key={i} onPress={() => to(i)} hitSlop={{ top: 8, bottom: 8 }} accessibilityRole="button" accessibilityState={{ selected: mode === i }} style={{ position: 'absolute', top: 0, left: 2 + i * 50.67, width: 50, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                <T s={13} w={600} c={mode === i ? C.t : C.t2}>{s}</T>
              </Pressable>
            ))}
          </View>
        </View>
      </GestureDetector>

      <Animated.View pointerEvents={menu ? 'auto' : 'none'} style={[{ position: 'absolute', left: 0, right: 0, top: -top, bottom: 0, backgroundColor: C.scrim }, scrimSt]}>
        <Pressable style={{ flex: 1 }} onPress={() => openM(false)} accessibilityLabel="Kapat" />
      </Animated.View>
      <Animated.View pointerEvents={menu ? 'auto' : 'none'} style={[{ position: 'absolute', right: 18, bottom: tbh + 72, width: 210, backgroundColor: C.menu, borderRadius: 16, transformOrigin: 'bottom right', boxShadow: C.dark ? '0px 10px 30px rgba(0,0,0,0.6)' : '0px 10px 30px rgba(0,0,0,0.14), 0px 1px 3px rgba(0,0,0,0.08)' }, menuSt]}>
        {([['event_available', 'Ders ekle', 'Kişi, saat ve ücret', 'newLesson'], ['snooze', 'Mola ekle', 'Ara veya kapalı gün', 'newBreak']] as const).map((m, i) => (
          <Pressable key={i} onPress={() => { openM(false); openSheet(m[3]); }} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: i ? HL : 0, borderTopColor: C.sep }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.pbg, alignItems: 'center', justifyContent: 'center' }}><Icon n={m[0]} s={20} c={C.a} /></View>
            <View>
              <T s={15} w={600}>{m[1]}</T>
              <T s={12} c={C.t2}>{m[2]}</T>
            </View>
          </Pressable>
        ))}
      </Animated.View>
      {emp ? null : (
        <Pressable onPress={() => openM(!menu)} accessibilityRole="button" accessibilityLabel="Ekle" style={{ position: 'absolute', right: 18, bottom: tbh + 14, width: 46, height: 46, borderRadius: 99, backgroundColor: C.a, alignItems: 'center', justifyContent: 'center', boxShadow: menu ? C.fabShadow : `0px 0px 0px 6px ${C.bg}, ${C.fabShadow}` }}>
          <Animated.View style={plusSt}><Icon n="add" s={24} c={C.on} /></Animated.View>
        </Pressable>
      )}
    </View>
  );
}
