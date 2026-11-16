// Prototipteki ortak yapı taşlarının (sec, chips, tog, fld, btn, gbox…) React Native karşılıkları
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View, StyleSheet, type StyleProp, type TextProps, type TextStyle, type ViewStyle, type TextInputProps } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ICONS } from './icons';
import { AVC, EASE, ff } from './theme';
import { closeSheet, pop, toastLater, useC, useFrame } from './store';

export const HL = StyleSheet.hairlineWidth;
type VS = StyleProp<ViewStyle>;

/* ---------- yazı, ikon, avatar ---------- */
export function T({ s = 15, w = 400, c, ls, lh, style, ...rest }: TextProps & { s?: number; w?: number; c?: string; ls?: number; lh?: number }) {
  const C = useC();
  return (
    <Text
      {...rest}
      style={[{ fontFamily: ff(w), fontSize: s, color: c ?? C.t, fontVariant: ['tabular-nums'] }, ls != null && { letterSpacing: ls * s }, lh != null && { lineHeight: lh * s }, style]}
    />
  );
}

export function Icon({ n, s = 22, f = 1, c }: { n: string; s?: number; f?: 0 | 1; c?: string }) {
  const C = useC();
  const d = ICONS[n];
  return (
    <Svg width={s} height={s} viewBox="0 -960 960 960">
      <Path d={d ? d[f] : ''} fill={c ?? C.t} />
    </Svg>
  );
}

export const Bell = ({ s, c }: { s: number; c: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path fill={c} d="M12 2.6c-3.5 0-6.2 2.8-6.2 6.3v3.5l-1.5 2.6c-.5.9.1 2 1.1 2h13.2c1 0 1.6-1.1 1.1-2l-1.5-2.6V8.9c0-3.5-2.7-6.3-6.2-6.3z" />
    <Path fill={c} d="M9.8 18.3h4.4a2.2 2.2 0 0 1-4.4 0z" />
  </Svg>
);

export const Apple = ({ c }: { c: string }) => (
  <Svg width={16} height={19} viewBox="0 0 814 1000" style={{ marginTop: -3 }}>
    <Path fill={c} d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-157 124s-86-40-165-40c-77 0-104 41-167 41s-107-58-157-129C41 788 0 667 0 552c0-185 120-283 239-283 63 0 115 41 155 41 38 0 97-44 169-44 27 0 126 3 191 75zM554 157c30-35 51-84 51-133 0-7-1-14-2-19-49 2-107 33-142 73-27 31-53 80-53 130 0 8 1 15 2 18 3 1 9 2 14 2 44 0 99-29 130-71z" />
  </Svg>
);

export function Av({ ini, ci = 0, s = 40 }: { ini: string; ci?: number; s?: number }) {
  const a = AVC[ci % 4];
  return (
    <View style={{ width: s, height: s, borderRadius: 99, backgroundColor: a[0], alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: ff(700), fontSize: Math.round(s * 0.36), color: a[1] }}>{ini}</Text>
    </View>
  );
}

/* ---------- dokunma ---------- */
export function Tap({ onPress, fx = 'dim', style, children, disabled, label, hit }: { onPress?: () => void; fx?: 'dim' | 'scale' | 'bg' | 'none'; style?: VS; children?: React.ReactNode; disabled?: boolean; label?: string; hit?: number }) {
  const C = useC();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={hit}
      style={({ pressed }) => [style, pressed && (fx === 'scale' ? { transform: [{ scale: 0.97 }] } : fx === 'bg' ? { backgroundColor: C.fill } : fx === 'dim' ? { opacity: 0.6 } : null)]}>
      {children}
    </Pressable>
  );
}

/* ---------- gezinme çubukları ---------- */
export function Cbtn({ ic, onPress, ok, sm, color, size, bg, label, style }: { ic: string; onPress?: () => void; ok?: boolean; sm?: boolean; color?: string; size?: number; bg?: string; label?: string; style?: VS }) {
  const C = useC();
  const d = sm ? 30 : 36;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [{ width: d, height: d, borderRadius: 99, backgroundColor: bg ?? (ok ? C.a : C.fill), alignItems: 'center', justifyContent: 'center' }, pressed && { transform: [{ scale: 0.92 }] }, style]}>
      <Icon n={ic} s={size ?? (ic === 'chevron_left' ? 24 : ic === 'add' || ic === 'check' ? 22 : ic === 'close' ? 21 : 20)} f={0} c={color ?? (ok ? C.on : ic === 'add' ? C.a : C.t)} />
    </Pressable>
  );
}

function NavRow({ left, mid, right }: { left?: React.ReactNode; mid?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={{ height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 44, alignItems: 'flex-start' }}>{left}</View>
      <View style={{ flex: 1, alignItems: 'center' }}>{mid}</View>
      <View style={{ width: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}
export { NavRow };

export function NavB({ title, right, blue = true, mid, onBack }: { title?: string; right?: React.ReactNode; blue?: boolean; mid?: React.ReactNode; onBack?: () => void }) {
  const C = useC();
  return <NavRow left={<Cbtn ic="chevron_left" onPress={onBack ?? pop} label="Geri" />} mid={mid ?? (title ? <T s={17} w={600} c={blue ? C.a : C.t} numberOfLines={1}>{title}</T> : null)} right={right} />;
}

export function NavS({ title, toast: msg = 'Kaydedildi', blue = false, onOk }: { title: string; toast?: string; blue?: boolean; onOk?: () => void }) {
  const C = useC();
  const ok = onOk ?? (() => { closeSheet(); toastLater(msg, 250); });
  return (
    <NavRow
      left={<Cbtn ic="close" onPress={closeSheet} label="Vazgeç" />}
      mid={<T s={17} w={600} c={blue ? C.a : C.t} numberOfLines={1}>{title}</T>}
      right={<Cbtn ic="check" ok onPress={ok} label="Kaydet" />}
    />
  );
}

/* ---------- gövde ve alt alan ---------- */
export type SV = React.ComponentRef<typeof ScrollView>;
const ScrollCtx = createContext<{ by: (h: number) => void } | null>(null);

export function Body({ children, pb = 28, style, scrollRef }: { children?: React.ReactNode; pb?: number; style?: VS; scrollRef?: React.RefObject<SV | null> }) {
  const own = useRef<SV>(null);
  const ref = scrollRef ?? own;
  const y = useRef(0);
  const ctx = useRef({ by: (h: number) => ref.current?.scrollTo({ y: y.current + h, animated: true }) }).current;
  return (
    <ScrollCtx.Provider value={ctx}>
      <ScrollView
        ref={ref}
        style={[{ flex: 1 }, style]}
        contentContainerStyle={{ paddingBottom: pb }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        onScroll={e => { y.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={32}>
        {children}
      </ScrollView>
    </ScrollCtx.Provider>
  );
}

export function Foot({ children, line = true, pt = 12, style }: { children?: React.ReactNode; line?: boolean; pt?: number; style?: VS }) {
  const C = useC();
  const fr = useFrame();
  return <View style={[{ paddingTop: pt, paddingBottom: Math.max(26, fr.bottom), borderTopWidth: line ? HL : 0, borderTopColor: C.sep }, style]}>{children}</View>;
}
export const BPair = ({ children, style }: { children?: React.ReactNode; style?: VS }) => <View style={[{ flexDirection: 'row', gap: 10, paddingHorizontal: 18 }, style]}>{children}</View>;
export const Bp = ({ children, line = true }: { children?: React.ReactNode; line?: boolean }) => (
  <Foot line={line}>
    <BPair>{children}</BPair>
  </Foot>
);

type BK = 'p' | 'o' | 'dsoft' | 'dline';
export function Btn({ t, k = 'p', ic, left, onPress, off, pair, h, fs, style }: { t: string; k?: BK; ic?: string; left?: React.ReactNode; onPress?: () => void; off?: boolean; pair?: boolean; h?: number; fs?: number; style?: VS }) {
  const C = useC();
  const col = k === 'p' ? C.on : k === 'o' ? C.t : C.red;
  const box: ViewStyle =
    k === 'p' ? { backgroundColor: C.a } : k === 'o' ? { borderWidth: 1, borderColor: C.sep } : k === 'dsoft' ? { backgroundColor: C.redSoft, borderWidth: 1, borderColor: C.red30 } : { borderWidth: 1, borderColor: C.red35 };
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={({ pressed }) => [
        { height: h ?? (pair || k === 'dline' ? 44 : 48), borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
        pair ? { flex: 1 } : { marginHorizontal: 18, marginBottom: 10 },
        box,
        off && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.97 }] },
        style,
      ]}>
      {left}
      {ic ? <Icon n={ic} s={19} c={col} /> : null}
      <T s={fs ?? (pair ? 15 : 15.5)} w={pair ? 570 : 500} c={col}>{t}</T>
    </Pressable>
  );
}

/* ---------- bölüm dili ---------- */
export const BlueCtx = createContext(false);

export function Sec({ ic, t, sub, right, onPress, style, subC }: { ic: string; t: string; sub?: string; right?: React.ReactNode; onPress?: () => void; style?: VS; subC?: string }) {
  const C = useC();
  const blue = useContext(BlueCtx);
  const inner = (
    <>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: blue ? C.bg : C.pbg, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        <Icon n={ic} s={19} c={C.a} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T s={15} w={570}>{t}</T>
        {sub ? <T s={12.5} c={subC ?? C.t2} lh={1.4} style={{ marginTop: 2 }}>{sub}</T> : null}
      </View>
      {right ? <View style={{ alignSelf: 'center' }}>{right}</View> : null}
    </>
  );
  const st: VS = [{ flexDirection: 'row', alignItems: sub ? 'flex-start' : 'center', gap: 12, paddingTop: 14, paddingBottom: 10, paddingHorizontal: blue ? 8 : 18 }, style];
  return onPress ? <Tap onPress={onPress} style={st}>{inner}</Tap> : <View style={st}>{inner}</View>;
}

export function Sdiv({ style }: { style?: VS }) {
  const C = useC();
  const blue = useContext(BlueCtx);
  return <View style={[{ height: 0, borderTopWidth: HL, borderTopColor: blue ? C.a15 : C.sep, marginTop: 14, marginBottom: 2, marginHorizontal: blue ? 8 : 18 }, style]} />;
}

export const Arrow = ({ c, s = 20, f = 0 }: { c?: string; s?: number; f?: 0 | 1 }) => {
  const C = useC();
  return <Icon n="chevron_right" s={s} f={f} c={c ?? C.t3} />;
};

// Sağda silik değer + mavi ok; dokununca alttan seçim açılır
export function VBtn({ v, onPress }: { v?: string; onPress?: () => void }) {
  const C = useC();
  return (
    <Tap onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} hit={8}>
      {v ? <T s={13.5} c={C.t3}>{v}</T> : null}
      <Icon n="chevron_right" s={20} f={0} c={C.a} />
    </Tap>
  );
}

// Açılır bölüm (Ders kuralları, Tekrar): başlık + ok; açılınca açık mavi alan
export function Expand({ ic, t, sub, subOn, children }: { ic: string; t: string; sub: string; subOn: string; children: React.ReactNode }) {
  const C = useC();
  const [o, setO] = useState(false);
  const sc = useContext(ScrollCtx);
  const done = useRef(false);
  const r = useSharedValue(0);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 90}deg` }] }));
  return (
    <>
      <Sec
        ic={ic}
        t={t}
        sub={o ? subOn : sub}
        style={{ alignItems: 'center' }}
        onPress={() => { done.current = false; r.value = withTiming(o ? 0 : 1, { duration: 250 }); setO(!o); }}
        right={<Animated.View style={st}><Icon n="chevron_right" s={22} f={0} c={C.t3} /></Animated.View>}
      />
      {o ? (
        <View
          onLayout={e => { if (!done.current) { done.current = true; sc?.by(e.nativeEvent.layout.height); } }}
          style={{ marginTop: 4, marginHorizontal: 10, borderRadius: 18, backgroundColor: C.pbg, paddingTop: 2, paddingBottom: 14 }}>
          <BlueCtx.Provider value={true}>{children}</BlueCtx.Provider>
        </View>
      ) : null}
    </>
  );
}

/* ---------- kontroller ---------- */
export function Tog({ init = false, on, onChange, style }: { init?: boolean; on?: boolean; onChange?: (v: boolean) => void; style?: VS }) {
  const C = useC();
  const [st, setSt] = useState(init);
  const v = on ?? st;
  const x = useSharedValue(v ? 1 : 0);
  useEffect(() => { x.value = withTiming(v ? 1 : 0, { duration: 280, easing: Easing.bezier(...EASE) }); }, [v]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(x.value, [0, 1], [C.fill2, C.a]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 17 }] }));
  return (
    <Pressable onPress={() => { setSt(!v); onChange?.(!v); }} accessibilityRole="switch" accessibilityState={{ checked: v }} hitSlop={8} style={style}>
      <Animated.View style={[{ width: 42, height: 25, borderRadius: 99 }, track]}>
        <Animated.View style={[{ position: 'absolute', top: 2, left: 2, width: 21, height: 21, borderRadius: 99, backgroundColor: '#fff', boxShadow: '0px 2px 6px rgba(0,0,0,0.2)' }, knob]} />
      </Animated.View>
    </Pressable>
  );
}

const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

export function Inp({ v, ph, area, style, color, ...rest }: TextInputProps & { v?: string; ph?: string; area?: boolean; color?: string }) {
  const C = useC();
  const [f, setF] = useState(false);
  return (
    <TextInput
      defaultValue={v}
      placeholder={ph}
      placeholderTextColor={C.t3}
      multiline={area}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      selectionColor={C.a}
      {...rest}
      style={[
        { height: area ? 66 : 44, borderRadius: 12, borderWidth: 1, borderColor: f ? C.a : C.sep, paddingHorizontal: 13, fontFamily: ff(470), fontSize: 15, color: color ?? C.t },
        area && { paddingTop: 11, paddingBottom: 11, lineHeight: 21, textAlignVertical: 'top' },
        noOutline,
        style,
      ]}
    />
  );
}

export function Fld({ label, right, bare, style, pr, ...inp }: TextInputProps & { label?: string; v?: string; ph?: string; area?: boolean; right?: React.ReactNode; bare?: boolean; pr?: number; style?: VS }) {
  const C = useC();
  return (
    <View style={[bare ? { flex: 1 } : { paddingHorizontal: 18, paddingBottom: 12 }, style]}>
      {label ? <T s={12.5} w={500} c={C.t2} style={{ marginBottom: 5 }}>{label}</T> : null}
      <View>
        <Inp {...inp} style={pr ? { paddingRight: pr } : undefined} />
        {right ? <View style={{ position: 'absolute', right: 13, top: 0, bottom: 0, justifyContent: 'center' }}>{right}</View> : null}
      </View>
    </View>
  );
}
export const Two = ({ children, style }: { children: React.ReactNode; style?: VS }) => <View style={[{ flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingBottom: 12 }, style]}>{children}</View>;

// Seçim çipleri: eşit ızgara (cols) ya da sarılan dizi; cst = ✎ özel değer birimi
export function Chips({ items, init = 0, multi, cols, cst, cstInit, blue = true, sm = true, onChange, style, off = [], render }: {
  items: string[]; init?: number | number[]; multi?: boolean; cols?: number; cst?: string; cstInit?: string; blue?: boolean; sm?: boolean;
  onChange?: (sel: number | number[]) => void; style?: VS; off?: number[]; render?: (label: string, on: boolean, color: string) => React.ReactNode;
}) {
  const C = useC();
  const inBlue = useContext(BlueCtx);
  const [sel, setSel] = useState<number | number[]>(init);
  const [cus, setCus] = useState<string | null>(cstInit ?? null);
  const [ed, setEd] = useState(false);
  const isOn = (i: number) => (cus != null ? false : Array.isArray(sel) ? sel.includes(i) : sel === i);
  const press = (i: number) => {
    let n: number | number[];
    if (multi && Array.isArray(sel)) n = sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i];
    else n = i;
    setCus(null); setEd(false); setSel(n); onChange?.(n);
  };
  const chip = (x: string, i: number) => {
    const on = isOn(i), dis = off.includes(i);
    const col = on ? (blue ? C.on : C.bg) : C.t;
    return (
      <Pressable
        key={i}
        onPress={() => press(i)}
        disabled={dis}
        accessibilityRole="button"
        accessibilityState={{ selected: on, disabled: dis }}
        style={({ pressed }) => [
          { borderRadius: render ? 14 : 99, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? (blue ? C.a : C.t) : inBlue ? C.bg : C.fill },
          cols ? { flex: 1, paddingVertical: render ? 7 : 8 } : sm ? { paddingVertical: 6, paddingHorizontal: 11 } : { paddingVertical: 9, paddingHorizontal: 15 },
          dis && { opacity: 0.35, backgroundColor: 'transparent', borderWidth: 1, borderColor: C.sep },
          pressed && { transform: [{ scale: 0.97 }] },
        ]}>
        {render ? render(x, on, col) : <T s={sm ? 13 : 14} w={500} c={col} numberOfLines={1}>{x}</T>}
      </Pressable>
    );
  };
  const cells: React.ReactNode[] = items.map(chip);
  if (cst) {
    cells.push(
      ed ? (
        <View key="c" style={{ flex: 1, borderRadius: 99, borderWidth: 1.5, borderColor: C.a, backgroundColor: C.bg, minHeight: 32, justifyContent: 'center' }}>
          <TextInput
            autoFocus
            keyboardType="number-pad"
            maxLength={2}
            placeholder={cst}
            placeholderTextColor={C.t3}
            onBlur={e => { setEd(false); }}
            onSubmitEditing={() => setEd(false)}
            onChangeText={v => { const n = parseInt(v, 10); if (n > 0) { setCus(`${n} ${cst}`); onChange?.(-1); } else setCus(null); }}
            style={[{ textAlign: 'center', fontFamily: ff(570), fontSize: 13, color: C.a, padding: 0, height: 28 }, noOutline]}
          />
        </View>
      ) : (
        <Pressable key="c" onPress={() => setEd(true)} accessibilityLabel="Özel değer" style={{ flex: cols ? 1 : undefined, borderRadius: 99, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: cols ? 0 : 11, backgroundColor: cus ? C.a : inBlue ? C.bg : C.fill }}>
          {cus ? <T s={13} w={500} c={C.on}>{cus}</T> : <Icon n="edit" s={16} f={0} c={C.a} />}
        </Pressable>
      ),
    );
  }
  const pad = { paddingHorizontal: inBlue ? 8 : 18, paddingBottom: 4 };
  if (!cols) return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, pad, style]}>{cells}</View>;
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols));
  return (
    <View style={[{ gap: 6 }, pad, style]}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: render ? 4 : 6 }}>
          {r}
          {Array.from({ length: cols - r.length }, (_, j) => <View key={'s' + j} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

// Nakit / Havale / Kart dili: ikon + etiket kutuları
export function Tiles({ items, init = 0, multi, cols = 3, onChange, style, value }: { items: [string, string, string?][]; init?: number | number[]; multi?: boolean; cols?: number; onChange?: (i: number) => void; style?: VS; value?: number }) {
  const C = useC();
  const [sel, setSel] = useState<number | number[]>(init);
  const cur = value ?? sel;
  const rows: [string, string, string?][][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={[{ gap: 8, paddingHorizontal: 18 }, style]}>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 8 }}>
          {r.map((t, j) => {
            const i = ri * cols + j;
            const on = Array.isArray(cur) ? cur.includes(i) : cur === i;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => { setSel(Array.isArray(sel) && multi ? (sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]) : i); onChange?.(i); }}
                style={({ pressed }) => [{ flex: 1, borderWidth: 1, borderColor: on ? C.a : C.sep, backgroundColor: on ? C.pbg : 'transparent', borderRadius: 14, paddingTop: 12, paddingBottom: 10, paddingHorizontal: 6, alignItems: 'center', gap: 5 }, pressed && { transform: [{ scale: 0.97 }] }]}>
                <Icon n={t[0]} s={cols === 2 && !t[2] ? 24 : 22} c={on ? C.a : C.t3} />
                <T s={13} w={570} c={on ? C.a : C.t2}>{t[1]}</T>
                {t[2] ? <T s={11} w={500} c={on ? C.a : C.t3} style={{ marginTop: -2, opacity: on ? 0.8 : 1 }}>{t[2]}</T> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function Seg({ items, sel, onSel }: { items: string[]; sel: number; onSel: (i: number) => void }) {
  const C = useC();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.fill, borderRadius: 10, padding: 2, marginHorizontal: 18, marginBottom: 6 }}>
      {items.map((x, i) => (
        <Pressable key={i} onPress={() => onSel(i)} style={[{ flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 8 }, i === sel && { backgroundColor: C.segOn, boxShadow: '0px 1px 3px rgba(0,0,0,0.12)' }]}>
          <T s={13.5} w={i === sel ? 620 : 550} c={i === sel ? C.t : C.t2}>{x}</T>
        </Pressable>
      ))}
    </View>
  );
}

/* ---------- listeler ---------- */
export function GBox({ children, style }: { children: React.ReactNode; style?: VS }) {
  const C = useC();
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ marginHorizontal: 18, borderWidth: 1, borderColor: C.sep, borderRadius: 14, overflow: 'hidden' }, style]}>
      {kids.map((k, i) => (
        <View key={i} style={i ? { borderTopWidth: HL, borderTopColor: C.sep } : null}>{k}</View>
      ))}
    </View>
  );
}
export function GRow({ t, sub, right, left, onPress, tNode, style }: { t?: string; sub?: string; right?: React.ReactNode; left?: React.ReactNode; onPress?: () => void; tNode?: React.ReactNode; style?: VS }) {
  const C = useC();
  const inner = (
    <>
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        {tNode ?? <T s={14.5} w={500}>{t}</T>}
        {sub ? <T s={12} c={C.t2} style={{ marginTop: 1 }}>{sub}</T> : null}
      </View>
      {right}
    </>
  );
  const st: VS = [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12 }, style];
  return onPress ? <Tap fx="bg" onPress={onPress} style={st}>{inner}</Tap> : <View style={st}>{inner}</View>;
}
// Anahtar–değer satırı
export function KV({ t, v, col, strike, right, onPress, w = 570 }: { t: string; v?: string; col?: string; strike?: boolean; right?: React.ReactNode; onPress?: () => void; w?: number }) {
  const C = useC();
  const inner = (
    <>
      <T s={14.5} c={C.t2} style={{ flex: 1 }}>{t}</T>
      {right ?? <T s={14.5} w={strike ? 500 : w} c={col ?? C.t} style={strike ? { textDecorationLine: 'line-through' } : undefined}>{v}</T>}
    </>
  );
  const st: VS = { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12 };
  return onPress ? <Tap fx="bg" onPress={onPress} style={st}>{inner}</Tap> : <View style={st}>{inner}</View>;
}

export function Row({ av, ic, t, s, sC, v, x, chev, red, onPress, tC, style }: { av?: [string, number, number?]; ic?: string; t: string; s?: string; sC?: string; v?: string; x?: React.ReactNode; chev?: boolean; red?: boolean; onPress?: () => void; tC?: string; style?: VS }) {
  const C = useC();
  const inner = (
    <>
      {av ? <Av ini={av[0]} ci={av[1]} s={av[2] ?? 38} /> : null}
      {ic ? <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}><Icon n={ic} s={21} c={red ? C.red : C.a} /></View> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <T s={15} w={600} c={tC ?? (red ? C.red : C.t)} numberOfLines={2}>{t}</T>
        {s ? <T s={13} c={sC ?? C.t2} style={{ marginTop: 1 }} numberOfLines={1}>{s}</T> : null}
      </View>
      {v ? <T s={15} c={C.t2}>{v}</T> : null}
      {x}
      {chev ? <Arrow /> : null}
    </>
  );
  const st: VS = [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingRight: 18, minHeight: 54 }, style];
  return onPress ? <Tap fx="bg" onPress={onPress} style={st}>{inner}</Tap> : <View style={st}>{inner}</View>;
}
// Satır grubu: ilk satır hariç 18px girintili ince çizgi
export function Rows({ children }: { children: React.ReactNode }) {
  const C = useC();
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <View>
      {kids.map((k, i) => (
        <View key={i} style={{ paddingLeft: 18 }}>
          {i ? <View style={{ height: HL, backgroundColor: C.sep }} /> : null}
          {k}
        </View>
      ))}
    </View>
  );
}

export const Sh = ({ t }: { t: string }) => {
  const C = useC();
  return <T s={12.5} w={500} c={C.t2} style={{ paddingTop: 16, paddingHorizontal: 18, paddingBottom: 7, minHeight: 6 }}>{t}</T>;
};
export const Note = ({ t, style }: { t: string; style?: StyleProp<TextStyle> }) => {
  const C = useC();
  return <T s={13} lh={1.5} c={C.t2} style={[{ paddingTop: 6, paddingHorizontal: 18, paddingBottom: 10 }, style]}>{t}</T>;
};

export function Lbox({ d, t, bar, v, vC, right, onPress, on, style }: { d: string; t: string; bar?: string; v?: string; vC?: string; right?: React.ReactNode; onPress?: () => void; on?: boolean; style?: VS }) {
  const C = useC();
  const inner = (
    <>
      {bar ? <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: bar }} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <T s={14} w={bar ? 500 : 570}>{d}</T>
        <T s={bar ? 12 : 12.5} c={C.t2} style={{ marginTop: 1 }}>{t}</T>
      </View>
      {v ? <T s={13.5} w={500} c={vC ?? C.t}>{v}</T> : null}
      {right}
    </>
  );
  const st: VS = [{ marginHorizontal: 18, marginBottom: 7, borderWidth: 1, borderColor: C.sep, borderRadius: 13, paddingVertical: 9, paddingRight: 13, paddingLeft: 11, flexDirection: 'row', gap: 12, alignItems: 'center' }, style];
  return onPress ? <Tap onPress={onPress} style={st}>{inner}</Tap> : <View style={st}>{inner}</View>;
}

export function Check({ on, s = 22 }: { on: boolean; s?: number }) {
  const C = useC();
  return (
    <View style={{ width: s, height: s, borderRadius: 99, borderWidth: 2, borderColor: on ? C.a : C.t3, backgroundColor: on ? C.a : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      {on ? <Icon n="check" s={s - 8} f={0} c={C.on} /> : null}
    </View>
  );
}

export function Obox({ t, s, init, children, right, style }: { t: string; s?: string; init?: boolean; children?: React.ReactNode; right?: React.ReactNode; style?: VS }) {
  const C = useC();
  return (
    <View style={[{ marginTop: 2, marginHorizontal: 18, marginBottom: 14, borderWidth: 1, borderColor: C.sep, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T s={14} w={570}>{t}</T>
          {s ? <T s={12} c={C.t2} style={{ marginTop: 1 }}>{s}</T> : null}
        </View>
        {right ?? <Tog init={init} />}
      </View>
      {children}
    </View>
  );
}

/* ---------- sekme başlığı ---------- */
export function RHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  const C = useC();
  return (
    <View style={{ height: 96 }}>
      <View style={{ position: 'absolute', left: 18, top: 33 }}>
        <T s={28} w={700} ls={-0.03} lh={1.15} numberOfLines={1}>{title}</T>
        <T s={14} c={C.t2} style={{ marginTop: 2 }} numberOfLines={1}>{sub}</T>
      </View>
      <View style={{ position: 'absolute', right: 18, top: 31, flexDirection: 'row', gap: 8 }}>{right}</View>
    </View>
  );
}
export function RBtn({ ic, onPress, label, s = 20 }: { ic: string; onPress: () => void; label: string; s?: number }) {
  const C = useC();
  return (
    <Tap onPress={onPress} label={label} hit={6} style={{ width: 36, height: 36, borderRadius: 99, backgroundColor: C.fill, alignItems: 'center', justifyContent: 'center' }}>
      <Icon n={ic} s={s} c={C.a} />
    </Tap>
  );
}

/* ---------- boş hâller ---------- */
export function Empt({ ic, t, sub, children, pt = 70 }: { ic: string; t: string; sub: string; children?: React.ReactNode; pt?: number }) {
  const C = useC();
  return (
    <View style={{ alignItems: 'center', paddingTop: pt, paddingHorizontal: 34, paddingBottom: 20 }}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: C.pbg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon n={ic} s={30} c={C.a} />
      </View>
      <T s={17} w={600} ls={-0.01} style={{ marginTop: 16, textAlign: 'center' }}>{t}</T>
      <T s={13.5} c={C.t2} lh={1.45} style={{ marginTop: 4, textAlign: 'center', maxWidth: 260 }}>{sub}</T>
      {children ? <View style={{ gap: 8, marginTop: 20, width: '100%', maxWidth: 240 }}>{children}</View> : null}
    </View>
  );
}
export const Emps = ({ t }: { t: string }) => {
  const C = useC();
  return (
    <View style={{ marginHorizontal: 18, paddingVertical: 13, paddingHorizontal: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: C.sep, borderRadius: 13 }}>
      <T s={13} c={C.t3} style={{ textAlign: 'center' }}>{t}</T>
    </View>
  );
};

/* ---------- sonuç ekranı ---------- */
export function DoneS({ ic, red, onClose, bk, top, big, sub, rows, children, icS = 32 }: {
  ic: string; red?: boolean; onClose?: () => void; bk?: boolean; top: string; big: string; sub: string; rows: [string, string, string?, boolean?][]; children: React.ReactNode; icS?: number;
}) {
  const C = useC();
  return (
    <>
      {bk ? <NavB /> : <NavRow right={<Cbtn ic="close" onPress={onClose ?? pop} label="Kapat" />} />}
      <Body>
        <View style={{ alignItems: 'center', paddingTop: 26, paddingHorizontal: 28, paddingBottom: 6 }}>
          <View style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: red ? C.redSoft : C.pbg, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 68, height: 68, borderRadius: 99, backgroundColor: red ? C.red : C.a, alignItems: 'center', justifyContent: 'center' }}>
              <Icon n={ic} s={icS} f={0} c="#fff" />
            </View>
          </View>
          <T s={13.5} c={C.t2} style={{ marginTop: 8, textAlign: 'center' }}>{top}</T>
          <T s={34} w={600} ls={-0.03} c={red ? C.t3 : C.t} style={[{ marginTop: 2 }, red && { textDecorationLine: 'line-through' }]}>{big}</T>
          <T s={13.5} c={C.t2} lh={1.45} style={{ marginTop: 4, textAlign: 'center' }}>{sub}</T>
        </View>
        <GBox style={{ marginTop: 22 }}>
          {rows.map((r, i) => <KV key={i} t={r[0]} v={r[1]} col={r[2]} strike={r[3]} />)}
        </GBox>
      </Body>
      <Bp>{children}</Bp>
    </>
  );
}

/* ---------- ders kuralları (gün sayfası ve paketlerde aynı 4 kural) ---------- */
export function RulesBody({ win, cancel, step = 0, stepCst, gap = 2 }: { win: string; cancel: string; step?: number; stepCst?: string; gap?: number }) {
  return (
    <>
      <Sec ic="event_available" t="Rezervasyon penceresi" sub={win} />
      <Chips items={['1 sa', '2 sa', '24 sa']} init={1} cols={4} cst="sa" />
      <Sdiv />
      <Sec ic="event_busy" t="Ücretsiz iptal" sub={cancel} />
      <Chips items={['2 sa', '4 sa', '24 sa']} init={1} cols={4} cst="sa" />
      <Sdiv />
      <Sec ic="schedule" t="Ders başlama kademesi" sub="Kişiler dersi hangi dakikalarda başlatabilir" />
      <Chips items={['Tam saat', '15 dk', '30 dk']} init={step} cols={4} cst="dk" cstInit={stepCst} />
      <Sdiv />
      <Sec ic="snooze" t="Ders arası mola" sub="Bir ders bitince sonrakine kadar boşluk" />
      <Chips items={['Yok', '10 dk', '15 dk']} init={gap} cols={4} cst="dk" />
    </>
  );
}

export function RepBlock({ what, init, sum }: { what: string; init: number; sum: string }) {
  return (
    <Expand ic="repeat" t="Tekrar" sub={sum} subOn={sum}>
      <Sec ic="event_repeat" t="Sıklık" sub={`${what} ne kadar sıklıkla tekrar etsin`} />
      <Chips items={['Yok', 'Her gün', 'Her hafta']} init={init} cols={4} cst="gün" />
      <Sdiv />
      <Sec ic="date_range" t="Tarih aralığı" sub="Tekrar bu tarihler arasında sürer" />
      <Two style={{ paddingHorizontal: 8, paddingBottom: 0 }}>
        <Fld bare label="Başlangıç" v="10 Eylül" />
        <Fld bare label="Bitiş" ph="27 Mayıs" />
      </Two>
    </Expand>
  );
}
