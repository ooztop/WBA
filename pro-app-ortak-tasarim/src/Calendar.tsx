// Takvim (Ortak Tasarım): koyu bant + Gün ↔ Hafta ↔ Ay tek bir P değeriyle (0..2) birbirine dönüşür.
// Prototipteki render(st) mantığının Reanimated karşılığı.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { addD, D1, DL, DN, dkey, hm, lessons, MN, mon, MS, NOW_H, p2, same, TODAY, wd, type Lesson } from './data';
import { openSheet, push, set, useC, useFrame, useStore } from './store';
import type { Colors } from './theme';
import { Btn, Fic, Icon, Lbl, Rt, T, Tag, type TagK } from './ui';

const MT = 124, LABY = 100, BANDH = 184, CLIPT = 192, RH = 60, LH = 40, HW = 30;
const OQ = Easing.out(Easing.poly(4));
const TAGS: Record<string, [TagK, string]> = { ok: ['s', 'Ödendi'], no: ['d', 'Ödenmedi'], nx: ['a', 'Sıradaki'], w: ['i', 'Bekliyor'] };

function cl(x: number, a = 0, b = 1) { 'worklet'; return Math.max(a, Math.min(b, x)); }
function lp(a: number, b: number, t: number) { 'worklet'; return a + (b - a) * t; }
function cxOf(p: number, W: number, i: number) {
  'worklet';
  const e = cl(p), q = cl(p - 1);
  const L = q > 0 ? lp(56, 0, q) : lp(14, 56, e), R = q > 0 ? lp(14, 0, q) : 14;
  return L + ((W - L - R) / 7) * (i + 0.5);
}
function yOf(t: number, e: number, ts: number) { 'worklet'; return (t - lp(7, 8, e)) * lp(48, HW, e) + 8 - ts * (1 - e); }

type Geo = { P: SharedValue<number>; TS: SharedValue<number>; W: number };

function layout(F: Date, W: number) {
  const MCW = W / 7;
  let y = 0;
  const months: { y: number; m0: Date; lx: number }[] = [];
  const rows: { y: number; from: Date; to: Date }[] = [];
  const cells: { d: Date; x: number; y: number; r: number }[] = [];
  for (let mi = -2; mi <= 4; mi++) {
    const m0 = new Date(F.getFullYear(), F.getMonth() + mi, 1), off = wd(m0);
    const nd = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate(), nr = Math.ceil((off + nd) / 7);
    months.push({ y, m0, lx: MCW * (off + 0.5) - 18 });
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

function Num({ C, d, sel, n }: { C: Colors; d: Date; sel: boolean; n: number }) {
  const tod = same(d, TODAY), we = wd(d) > 4;
  return (
    <>
      <View style={{ width: 36, height: 36, alignSelf: 'center', borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? C.card : tod ? C.accent : 'transparent' }}>
        <T s={16} w={sel || tod ? 800 : 700} c={sel ? C.ink : tod ? C.onAccent : we ? C.onDarkMuted : C.onDark}>{d.getDate()}</T>
      </View>
      <View style={{ flexDirection: 'row', gap: 3, justifyContent: 'center', marginTop: 4, height: 5 }}>
        {Array.from({ length: n }, (_, i) => <View key={i} style={{ width: 5, height: 5, borderRadius: 9, backgroundColor: C.onDarkMuted }} />)}
      </View>
    </>
  );
}

function Hour({ h, g, C, a0, a1 }: { h: number; g: Geo; C: Colors; a0: number; a1: number }) {
  const { P, TS } = g;
  const lab = useAnimatedStyle(() => {
    const e = cl(P.value), nv = lp(a0, a1, e);
    return { transform: [{ translateY: yOf(h, e, TS.value) - 8 }], opacity: (h < 8 || h > 20 ? 1 - e : 1) * (Math.abs(h - NOW_H) < 0.5 && nv > 0.5 ? 0 : 1) };
  });
  const line = useAnimatedStyle(() => { const e = cl(P.value); return { transform: [{ translateY: yOf(h, e, TS.value) }], opacity: 1 - e }; });
  return (
    <>
      <Animated.View style={[{ position: 'absolute', left: 4, top: 0, width: 44, alignItems: 'flex-end' }, lab]}><T s={11} w={700} c={C.muted}>{p2(h)}:00</T></Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 56, right: 14, top: 0, height: 1, backgroundColor: C.divider }, line]} />
    </>
  );
}

function Block({ l, di, det, done, g, C, name, onPress }: { l: Lesson; di: number; det: boolean; done: boolean; g: Geo; C: Colors; name: string; onPress: () => void }) {
  const { P, TS, W } = g;
  const st = useAnimatedStyle(() => {
    const p = P.value, e = cl(p);
    const hh = lp(48, HW, e), cx = cxOf(p, W, di);
    const top = yOf(l[0], e, TS.value) + 1, height = (l[1] / 60) * hh - 3;
    if (det) return { left: lp(62, cx - 6, e), width: lp(W - 14 - 62, 12, e), top, height, borderRadius: lp(12, 6, e), opacity: done ? lp(0.65, 0.45, e) : 1 };
    return { left: cx - 6, width: 12, top, height, borderRadius: 6, opacity: cl(e * 1.6 - 0.3) * (done ? 0.45 : 1) };
  });
  const fill = useAnimatedStyle(() => ({ opacity: cl(P.value) }));
  const txt = useAnimatedStyle(() => ({ opacity: cl(1 - cl(P.value) * 3) }));
  if (!det) return <Animated.View pointerEvents="none" style={[{ position: 'absolute', backgroundColor: C.sdark }, st]} />;
  const tg = TAGS[l[4]];
  return (
    <Animated.View style={[{ position: 'absolute', backgroundColor: l[4] === 'nx' ? C.tintSoft : C.card, overflow: 'hidden' }, st]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${name} dersi`} style={{ flex: 1 }}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: C.sdark }, fill]} />
        <Animated.View style={[{ position: 'absolute', left: 10, right: 10, top: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, txt]}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T s={14} w={700} lh={1.35} numberOfLines={1}>{name}</T>
            <T s={12} c={C.muted} numberOfLines={1}>{hm(l[0])} · {l[3]} · {l[1]} dk</T>
          </View>
          <Tag k={tg[0]} t={tg[1]} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function StripCell({ i, d, g, C, sel, n, inRow, yRowF, onPress }: { i: number; d: Date; g: Geo; C: Colors; sel: boolean; n: number; inRow: boolean; yRowF: number; onPress: () => void }) {
  const { P, W } = g;
  const st = useAnimatedStyle(() => {
    const p = P.value, q = cl(p - 1);
    return { transform: [{ translateX: cxOf(p, W, i) - 20 }, { translateY: lp(MT, yRowF, q) }], opacity: q >= 1 ? 0 : inRow ? 1 : 1 - q };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 40 }, st]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${d.getDate()} ${MN[d.getMonth()]}`}><Num C={C} d={d} sel={sel} n={n} /></Pressable>
    </Animated.View>
  );
}

function DayLab({ i, g, C }: { i: number; g: Geo; C: Colors }) {
  const { P, W } = g;
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: cxOf(P.value, W, i) - 20 }] }));
  const a = useAnimatedStyle(() => ({ opacity: P.value - 1 > 0.5 ? 0 : 1 }));
  const b = useAnimatedStyle(() => ({ opacity: P.value - 1 > 0.5 ? 1 : 0 }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: LABY, width: 40, alignItems: 'center' }, st]}>
      <Animated.View style={a}><T s={11} w={700} c={C.onDarkMuted}>{DN[i]}</T></Animated.View>
      <Animated.View style={[{ position: 'absolute' }, b]}><T s={11} w={700} c={C.onDarkMuted}>{D1[i]}</T></Animated.View>
    </Animated.View>
  );
}

function VLine({ i, g, col, VLH }: { i: number; g: Geo; col: string; VLH: number }) {
  const { P, W } = g;
  const st = useAnimatedStyle(() => {
    const p = P.value, e = cl(p), q = cl(p - 1);
    return { transform: [{ translateX: cxOf(p, W, i) - 0.75 }], height: e * (1 - q) * VLH, opacity: Math.min(1, e * 1.5) * (1 - q) };
  });
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: 1.5, borderRadius: 1, backgroundColor: col }, st]} />;
}

function Title({ i, g, DX, TIO, t, C, onPress, live }: { i: number; g: Geo; DX: SharedValue<number>; TIO: SharedValue<number>; t: string; C: Colors; onPress: () => void; live: boolean }) {
  const { P } = g;
  const st = useAnimatedStyle(() => ({ opacity: cl(1 - Math.abs(P.value - i) * 2) * TIO.value, transform: [{ translateY: (P.value - i) * -6 }, { translateX: DX.value * 0.25 }] }));
  return (
    <Animated.View pointerEvents={live ? 'auto' : 'none'} style={[{ position: 'absolute', left: 20, top: 54 }, st]}>
      <Pressable onPress={onPress} accessibilityLabel={`${t} · bugüne dön`}><T s={30} w={800} ls={-0.02} c={C.onDark} style={{ lineHeight: 36 }} numberOfLines={1}>{t}</T></Pressable>
    </Animated.View>
  );
}

const MonthGrid = React.memo(function MonthGrid({ C, lay, F, W, P, S, yRowF, count, onPick }: { C: Colors; lay: ReturnType<typeof layout>; F: Date; W: number; P: SharedValue<number>; S: SharedValue<number>; yRowF: number; count: (d: Date) => number; onPick: (d: Date) => void }) {
  const MCW = W / 7;
  const ml = useAnimatedStyle(() => {
    const q = cl(P.value - 1), yF = lp(MT, yRowF, q);
    return { transform: [{ translateY: -S.value + (1 - q) * (yF - yRowF) }], opacity: q >= 1 ? 1 : q };
  });
  const rf = useAnimatedStyle(() => ({ opacity: P.value - 1 >= 1 ? 1 : 0 }));
  const cell = (c: (typeof lay.cells)[number], k: number) => (
    <Pressable key={k} onPress={() => onPick(c.d)} accessibilityRole="button" accessibilityLabel={`${c.d.getDate()} ${MN[c.d.getMonth()]}`} style={{ position: 'absolute', left: c.x, top: c.y, width: 40 }}>
      <Num C={C} d={c.d} sel={same(c.d, F)} n={count(c.d)} />
    </Pressable>
  );
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: W, height: lay.total }, ml]}>
      {lay.months.map((m, i) => <T key={i} s={19} w={800} c={C.onDark} style={{ position: 'absolute', left: m.lx, top: m.y + 8 }}>{MS[m.m0.getMonth()]}</T>)}
      {lay.rows.map((r, i) => <View key={i} style={{ position: 'absolute', left: wd(r.from) * MCW, width: (wd(r.to) - wd(r.from) + 1) * MCW, top: r.y, height: 1, backgroundColor: C.sdark2 }} />)}
      {lay.cells.filter(c => c.r !== lay.rowF).map(cell)}
      <Animated.View pointerEvents="box-none" style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, rf]}>{lay.cells.filter(c => c.r === lay.rowF).map(cell)}</Animated.View>
    </Animated.View>
  );
});

export function Calendar() {
  const C = useC();
  const fr = useFrame();
  const { W, top, tbh } = fr;
  const H = fr.H - tbh;
  const F = useStore(s => s.F), emp = useStore(s => s.emp), extra = useStore(s => s.extra), cancelled = useStore(s => s.cancelled), people = useStore(s => s.people);
  const P = useSharedValue(0), TS = useSharedValue(84), S = useSharedValue(0), DX = useSharedValue(0), TIO = useSharedValue(1);
  const [mode, setMode] = useState(0);
  const [tmIdx, setTmIdx] = useState(2);

  const VLH = H - CLIPT - 24, MH = H - MT;
  const TSmax = Math.max(0, 15 * 48 + 6 - (H - CLIPT) + 40);
  const g: Geo = useMemo(() => ({ P, TS, W }), [W]);
  const L = (d: Date) => lessons(d, emp, extra, cancelled);
  const lay = useMemo(() => layout(F, W), [+F, W]);
  const week = useMemo(() => { const ws = mon(F); return [...Array(7)].map((_, i) => addD(ws, i)); }, [+F]);
  const yRowF = MT + lay.rows[lay.rowF].y - lay.S0 + 8;
  const Smax = Math.max(0, lay.total - MH + 40);
  const rowOf = lay.rows[lay.rowF];
  const inRow = (d: Date) => (d >= rowOf.from && d <= rowOf.to) || same(d, rowOf.from) || same(d, rowOf.to);
  const count = React.useCallback((d: Date) => Math.min(3, lessons(d, emp, extra, cancelled).length), [emp, extra, cancelled]);

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

  const to = (t: number) => {
    if (t < 2 && P.value >= 1.99) S.value = lay.S0;
    P.value = withTiming(t, { duration: 420, easing: OQ });
    setMode(t);
  };
  const setF = (d: Date) => set({ F: new Date(d) });
  const pickMonthDay = (d: Date) => { S.value = layout(d, W).S0; setF(d); P.value = withTiming(0, { duration: 420, easing: OQ }); setMode(0); };
  const pickWeekDay = (d: Date) => { setF(d); to(0); };
  const goToday = () => {
    TS.value = 84;
    if (mode === 2) { S.value = withTiming(layout(TODAY, W).S0, { duration: 500, easing: OQ }); }
    setF(TODAY);
  };
  const shift = (dir: number) => { ref.slide = dir; setF(addD(F, Math.round(P.value) === 0 ? dir : 7 * dir)); };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(8)
    .onBegin(e => { ref.mode = ''; ref.inTL = P.value < 0.5 && e.y > CLIPT && !emp; cancelAnimation(TS); cancelAnimation(S); })
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

  const wo = Math.round((+week[0] - +mon(TODAY)) / 6048e5);
  const tDay = same(F, TODAY) ? 'Bugün' : same(F, addD(TODAY, 1)) ? 'Yarın' : same(F, addD(TODAY, -1)) ? 'Dün' : DL[wd(F)];
  const tWk = wo === 0 ? 'Bu hafta' : wo === 1 ? 'Gelecek hafta' : wo === -1 ? 'Geçen hafta' : `${week[0].getDate()} ${MS[week[0].getMonth()]} haftası`;
  const tm = lay.months[Math.min(tmIdx, lay.months.length - 1)].m0;
  const isToday = same(F, TODAY), inW = week.some(d => same(d, TODAY)), a0 = emp ? 0 : isToday ? 1 : 0, a1 = emp ? 0 : inW ? 1 : 0, fi = wd(F);
  const away = mode === 0 ? !isToday : mode === 1 ? !inW : !(tm.getMonth() === TODAY.getMonth() && tm.getFullYear() === TODAY.getFullYear());
  const nameOf = (id: number) => (people.find(p => p.id === id) || people[0]).name;

  const band = useAnimatedStyle(() => ({ height: lp(BANDH, H, cl(P.value - 1)) }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: cl(P.value, 0, 2) * 54 }] }));
  const hdl = useAnimatedStyle(() => ({ opacity: cl(P.value - 1) }));
  const mc = useAnimatedStyle(() => ({ opacity: P.value - 1 > 0 ? 1 : 0 }));
  const strip = useAnimatedStyle(() => ({ transform: [{ translateX: DX.value }] }));
  const clip = useAnimatedStyle(() => { const q = cl(P.value - 1); return { opacity: 1 - q, transform: [{ translateX: DX.value }, { translateY: q * 30 }] }; });
  const nowTag = useAnimatedStyle(() => { const e = cl(P.value); return { transform: [{ translateY: yOf(NOW_H, e, TS.value) - 8 }], opacity: lp(a0, a1, e) }; });
  const nowLine = useAnimatedStyle(() => { const e = cl(P.value); return { transform: [{ translateY: yOf(NOW_H, e, TS.value) }], left: lp(56, 52, e), opacity: lp(a0, a1, e) }; });
  const brk = useAnimatedStyle(() => { const e = cl(P.value); return { transform: [{ translateY: yOf(12.5, e, TS.value) + 1 }], height: lp(48, HW, e) - 3, opacity: cl(1 - e * 2) }; });
  const empSt = useAnimatedStyle(() => ({ opacity: 1 - cl(P.value) }));
  const fabSt = useAnimatedStyle(() => ({ opacity: 1 }));

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <View style={{ height: top, backgroundColor: C.sdark }} />
      <View style={{ height: H, overflow: 'hidden' }}>
        <GestureDetector gesture={pan}>
          <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
            {/* 1) çizelge */}
            <Animated.View pointerEvents={mode === 2 ? 'none' : 'auto'} style={[{ position: 'absolute', left: 0, right: 0, top: CLIPT, bottom: 0, overflow: 'hidden' }, clip]}>
              {emp ? (
                <Animated.View pointerEvents={mode === 0 ? 'auto' : 'none'} style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 60, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 8 }, empSt]}>
                  <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Icon n="calCheck" s={28} c={C.accentInk} /></View>
                  <T s={20} w={800} lh={1.25}>Takvimin boş</T>
                  <T s={15} lh={1.5} c={C.muted} style={{ textAlign: 'center' }}>İlk dersini ekle, burada görünsün.</T>
                  <View style={{ width: 240, marginTop: 16 }}><Btn t="Ders ekle" onPress={() => openSheet('newLesson')} /></View>
                </Animated.View>
              ) : (
                <>
                  {Array.from({ length: 16 }, (_, k) => <Hour key={k} h={7 + k} g={g} C={C} a0={a0} a1={a1} />)}
                  {week.map((_, i) => <VLine key={i} i={i} g={g} col={i === fi ? C.muted : C.divider} VLH={VLH} />)}
                  {isToday ? (
                    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 62, right: 14, top: 0, borderRadius: 12, backgroundColor: C.page, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }, brk]}>
                      <Icon n="coffee" s={16} c={C.muted} />
                      <T s={12.5} w={700}>Öğle molası</T>
                      <T s={12.5} c={C.muted}>12:30 – 13:30</T>
                    </Animated.View>
                  ) : null}
                  {week.map((d, di) => L(d).map(l => (
                    <Block key={`${+d}-${l[0]}`} l={l} di={di} det={same(d, F)} done={d < TODAY || (same(d, TODAY) && l[0] + l[1] / 60 < NOW_H)} g={g} C={C} name={nameOf(l[2])}
                      onPress={guard(() => { if (mode === 0) push('lesson', { l, f: +d }); })} />
                  )))}
                  <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 4, top: 0, height: 16, justifyContent: 'center', backgroundColor: C.ink, paddingHorizontal: 6, borderRadius: 999 }, nowTag]}>
                    <T s={10} w={800} c={C.page} style={{ lineHeight: 14 }}>12:36</T>
                  </Animated.View>
                  <Animated.View pointerEvents="none" style={[{ position: 'absolute', right: 14, top: 0, height: 2, backgroundColor: C.ink }, nowLine]} />
                  {mode === 1 ? week.map((d, i) => <Pressable key={i} onPress={guard(() => pickWeekDay(d))} accessibilityLabel={`${d.getDate()} ${MN[d.getMonth()]} gününü aç`} style={{ position: 'absolute', top: 0, bottom: 0, left: 56 + ((W - 70) / 7) * i, width: (W - 70) / 7 }} />) : null}
                </>
              )}
            </Animated.View>

            {/* 2) koyu bant */}
            <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: C.sdark }, band]} />
            {away ? (
              <Pressable onPress={goToday} accessibilityRole="button" accessibilityLabel="Bugüne dön" style={{ position: 'absolute', left: 10, top: 10, height: 44, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Icon n="chevL" s={16} sw={2.6} c={C.onDark} />
                <T s={12} w={800} ls={0.05} c={C.onDark}>BUGÜNE DÖN</T>
              </Pressable>
            ) : (
              <Lbl t={mode === 2 ? String(tm.getFullYear()) : `${MN[F.getMonth()]} ${F.getFullYear()}`} c={C.onDarkMuted} style={{ position: 'absolute', left: 20, top: 24 }} />
            )}
            <Title i={0} g={g} DX={DX} TIO={TIO} C={C} t={tDay} onPress={goToday} live={mode === 0} />
            <Title i={1} g={g} DX={DX} TIO={TIO} C={C} t={tWk} onPress={goToday} live={mode === 1} />
            <Title i={2} g={g} DX={DX} TIO={TIO} C={C} t={MN[tm.getMonth()]} onPress={goToday} live={mode === 2} />
            {DN.map((_, i) => <DayLab key={i} i={i} g={g} C={C} />)}
            <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: MT - 4, height: 1, backgroundColor: C.sdark2 }, hdl]} />

            {/* 3) ay ızgarası */}
            <Animated.View pointerEvents={mode === 2 ? 'auto' : 'none'} style={[{ position: 'absolute', left: 0, right: 0, top: MT, height: MH, overflow: 'hidden' }, mc]}>
              <MonthGrid C={C} lay={lay} F={F} W={W} P={P} S={S} yRowF={yRowF} count={count} onPick={d => guard(() => pickMonthDay(d))()} />
            </Animated.View>

            {/* 4) hafta şeridi */}
            <Animated.View pointerEvents={mode === 2 ? 'none' : 'box-none'} style={[{ position: 'absolute', left: 0, top: 0, width: W, height: 0 }, strip]}>
              {week.map((d, i) => <StripCell key={i} i={i} d={d} g={g} C={C} sel={same(d, F)} n={count(d)} inRow={inRow(d)} yRowF={yRowF} onPress={guard(() => setF(d))} />)}
            </Animated.View>

            <View accessibilityRole="tablist" style={{ position: 'absolute', right: 16, top: 14, width: 168, height: 36, borderRadius: 12, backgroundColor: C.sdark2 }}>
              <Animated.View style={[{ position: 'absolute', top: 3, left: 3, width: 54, height: 30, borderRadius: 10, backgroundColor: C.card }, thumb]} />
              {['Gün', 'Hafta', 'Ay'].map((s, i) => (
                <Pressable key={i} onPress={() => to(i)} hitSlop={{ top: 8, bottom: 8 }} accessibilityRole="tab" accessibilityState={{ selected: mode === i }} style={{ position: 'absolute', top: 0, left: 3 + i * 54, width: 54, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                  <T s={13} w={700} c={mode === i ? C.ink : C.onDarkMuted}>{s}</T>
                </Pressable>
              ))}
            </View>
          </View>
        </GestureDetector>
        {emp ? null : (
          <Animated.View style={[{ position: 'absolute', right: 22, bottom: 16 }, fabSt]}>
            <Pressable onPress={() => set({ menu: true })} accessibilityRole="button" accessibilityLabel="Ekle: ders ya da mola" style={({ pressed }) => [{ width: 56, height: 56, borderRadius: 999, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', boxShadow: C.shFloat }, pressed && { transform: [{ scale: 0.96 }] }]}>
              <Icon n="plus" s={26} c="#FFFFFF" />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

/* ---------- Ekle menüsü (FAB): her şeyin üstünde açılır ---------- */
export function AddMenu() {
  const C = useC();
  const { tbh } = useFrame();
  const open = useStore(s => s.menu);
  const [shown, setShown] = useState(false);
  const v = useSharedValue(0);
  useEffect(() => {
    if (open) { setShown(true); v.value = withTiming(1, { duration: 280, easing: Easing.bezier(0.23, 1, 0.32, 1) }); }
    else v.value = withTiming(0, { duration: 180 }, f => { if (f) runOnJS(setShown)(false); });
  }, [open]);
  const scrim = useAnimatedStyle(() => ({ opacity: v.value }));
  const menu = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 10 }, { scale: 0.82 + v.value * 0.18 }] }));
  const fab = useAnimatedStyle(() => ({ transform: [{ rotate: `${(v.value - 1) * 90}deg` }] }));
  if (!shown) return null;
  const close = () => set({ menu: false });
  const pickItem = (id: string) => { close(); setTimeout(() => openSheet(id), 60); };
  return (
    <View pointerEvents={open ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: C.scrim }, scrim]}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityLabel="Menüyü kapat" />
      </Animated.View>
      <Animated.View accessibilityRole="menu" style={[{ position: 'absolute', right: 22, bottom: tbh + 84, width: 270, backgroundColor: C.card, borderRadius: 16, boxShadow: C.shToast, overflow: 'hidden', transformOrigin: 'bottom right' }, menu]}>
        <Pressable onPress={() => pickItem('newLesson')} accessibilityRole="menuitem" style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, minHeight: 64 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}><Icon n="calPlus" c="#FFFFFF" /></View>
          <Rt t="Ders ekle" s="Kişi, saat ve ücret" />
        </Pressable>
        <Pressable onPress={() => pickItem('newBreak')} accessibilityRole="menuitem" style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, minHeight: 64, borderTopWidth: 1, borderTopColor: C.divider }}>
          <Fic k="n" ic="timer" c={C.ink} />
          <Rt t="Mola ekle" s="Ara veya kapalı gün" />
        </Pressable>
      </Animated.View>
      <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Menüyü kapat" style={{ position: 'absolute', right: 22, bottom: tbh + 16, width: 56, height: 56, borderRadius: 999, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', boxShadow: C.shFloat }}>
        <Animated.View style={fab}><Icon n="close" s={26} c="#FFFFFF" /></Animated.View>
      </Pressable>
    </View>
  );
}
