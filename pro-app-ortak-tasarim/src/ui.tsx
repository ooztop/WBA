// "Ortak Tasarım" yapı taşları: prototipteki CSS sınıflarının (.band, .row, .chip, .btn, .inp, .sw…) React Native karşılıkları
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle, type TextInputProps } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Rect, Stop, SvgXml } from 'react-native-svg';
import { IC, QR_D } from './icons';
import { EASE, ff } from './theme';
import { get, pop, useC, useFrame } from './store';
import { setPref } from './data/actions';

const saved = (pk: string | undefined) => (pk ? get().prefs[pk] : undefined);

type VS = StyleProp<ViewStyle>;
export type SV = React.ComponentRef<typeof ScrollView>;
export const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

/* ---------- yazı, ikon ---------- */
export function T({ s = 15, w = 500, c, ls, lh, style, ...rest }: TextProps & { s?: number; w?: number; c?: string; ls?: number; lh?: number }) {
  const C = useC();
  return <Text {...rest} style={[{ fontFamily: ff(w), fontSize: s, color: c ?? C.ink, fontVariant: ['tabular-nums'] }, ls != null && { letterSpacing: ls * s }, lh != null && { lineHeight: lh * s }, style]} />;
}
// Küçük büyük harf etiket (.lbl)
export function Lbl({ t, c, style }: { t: string; c?: string; style?: StyleProp<TextStyle> }) {
  const C = useC();
  return <T s={12} w={800} ls={0.05} lh={1.3} c={c ?? C.muted} style={[{ textTransform: 'uppercase' }, style]}>{t}</T>;
}
export const Sm = ({ children, c, style, n }: { children: React.ReactNode; c?: string; style?: StyleProp<TextStyle>; n?: number }) => {
  const C = useC();
  return <T s={13} lh={1.45} c={c ?? C.muted} style={style} numberOfLines={n}>{children}</T>;
};

export function Icon({ n, s = 20, c, sw = 2 }: { n: string; s?: number; c?: string; sw?: number }) {
  const C = useC();
  const d = IC[n] || IC.dots, col = c ?? C.ink;
  const xml = d[1]
    ? `<svg viewBox="0 0 24 24" fill="${col}" stroke="none">${d[0]}</svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d[0]}</svg>`;
  return <SvgXml xml={xml} width={s} height={s} />;
}
export const QR = ({ s, c }: { s: number; c: string }) => (
  <Svg width={s} height={s} viewBox="-1 -1 27 27"><Path d={QR_D} fill={c} fillRule="evenodd" /></Svg>
);
export const Apple = ({ c }: { c: string }) => (
  <Svg width={16} height={19} viewBox="0 0 814 1000">
    <Path fill={c} d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-157 124s-86-40-165-40c-77 0-104 41-167 41s-107-58-157-129C41 788 0 667 0 552c0-185 120-283 239-283 63 0 115 41 155 41 38 0 97-44 169-44 27 0 126 3 191 75zM554 157c30-35 51-84 51-133 0-7-1-14-2-19-49 2-107 33-142 73-27 31-53 80-53 130 0 8 1 15 2 18 3 1 9 2 14 2 44 0 99-29 130-71z" />
  </Svg>
);

export function Av({ ini, lg, s }: { ini: string; lg?: boolean; s?: number }) {
  const C = useC();
  const d = s ?? (lg ? 56 : 44);
  return (
    <View style={{ width: d, height: d, borderRadius: 999, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' }}>
      <T s={s ? Math.round(s * 0.36) : lg ? 20 : 15} w={800} c={C.accentInk}>{ini}</T>
    </View>
  );
}

export type TagK = 'a' | 'i' | 's' | 'd' | 'n';
export function tagC(C: ReturnType<typeof useC>, k: TagK): [string, string] {
  return k === 'a' ? [C.tint, C.accentInk] : k === 'i' ? [C.infoTint, C.info] : k === 's' ? [C.successTint, C.success] : k === 'd' ? [C.dangerTint, C.danger] : [C.divider, C.muted];
}
export function Tag({ k, t }: { k: TagK; t: string }) {
  const C = useC();
  const [bg, fg] = tagC(C, k);
  return <View style={{ backgroundColor: bg, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 }}><T s={12} w={800} lh={1.2} c={fg} numberOfLines={1}>{t}</T></View>;
}
// Dosya / durum ikon karesi (.fic)
export function Fic({ k, ic, c }: { k: TagK; ic: string; c?: string }) {
  const C = useC();
  const [bg, fg] = tagC(C, k);
  return <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Icon n={ic} c={c ?? fg} /></View>;
}

/* ---------- dokunma ---------- */
export function Tap({ onPress, style, children, disabled, label, hit, role = 'button', sel }: { onPress?: () => void; style?: VS; children?: React.ReactNode; disabled?: boolean; label?: string; hit?: number; role?: 'button' | 'switch' | 'tab'; sel?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={sel == null ? undefined : { selected: sel }}
      hitSlop={hit}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.975 }] }]}>
      {children}
    </Pressable>
  );
}

// Yuvarlak ikon düğmesi (.ib)
export function IB({ ic, k = 'g', onPress, label, s = 44, is = 20, style }: { ic: string; k?: 'dk' | 'p' | 'g' | 'q' | 'del' | 'dkq'; onPress?: () => void; label: string; s?: number; is?: number; style?: VS }) {
  const C = useC();
  const box: ViewStyle =
    k === 'dk' ? { backgroundColor: C.sdark2 } : k === 'p' ? { backgroundColor: C.accent } : k === 'g' ? { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border } : k === 'del' ? { backgroundColor: C.dangerTint, borderWidth: 1.5, borderColor: C.dangerLine } : {};
  const col = k === 'dk' || k === 'dkq' ? C.onDark : k === 'p' ? C.onAccent : k === 'del' ? C.danger : C.ink;
  return (
    <Tap onPress={onPress} label={label} hit={4} style={[{ width: s, height: s, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }, box, style]}>
      <Icon n={ic} s={is} c={col} />
    </Tap>
  );
}

export function Btn({ t, k = 'p', ic, left, small, onPress, style, flex, glow, off }: { t: string; k?: 'p' | 'g' | 'x' | 'xf'; ic?: string; left?: React.ReactNode; small?: boolean; onPress?: () => void; style?: VS; flex?: boolean; glow?: boolean; off?: boolean }) {
  const C = useC();
  const col = off ? C.muted : k === 'p' ? C.onAccent : k === 'xf' ? '#FFFFFF' : k === 'x' ? C.danger : C.ink;
  const box: ViewStyle = off ? { backgroundColor: C.divider } : k === 'p' ? { backgroundColor: C.accent } : k === 'xf' ? { backgroundColor: C.dangerFill } : { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border };
  return (
    <Tap
      onPress={off ? undefined : onPress}
      disabled={off}
      style={[
        { height: small ? 44 : 56, borderRadius: small ? 12 : 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: small ? 14 : 20 },
        box,
        flex && { flex: 1, paddingHorizontal: 10 },
        glow && !off && { boxShadow: k === 'p' ? `0px 10px 24px -6px ${C.accent}8C` : C.shFloat },
        style,
      ]}>
      {left}
      {ic ? <Icon n={ic} c={col} /> : null}
      <T s={small ? 14 : 16} w={800} lh={1.2} c={col} numberOfLines={1}>{t}</T>
    </Tap>
  );
}
export const Lnk = ({ t, onPress, s = 15 }: { t: string; onPress?: () => void; s?: number }) => {
  const C = useC();
  return <Tap onPress={onPress} hit={8}><T s={s} w={800} c={C.info}>{t}</T></Tap>;
};

/* ---------- kontroller ---------- */
export function Sw({ init = false, on, onChange, label, pk }: { init?: boolean; on?: boolean; onChange?: (v: boolean) => void; label?: string; pk?: string }) {
  const C = useC();
  const [st, setSt] = useState<boolean>(saved(pk) ?? init);
  const v = on ?? st;
  const x = useSharedValue(v ? 1 : 0);
  useEffect(() => { x.value = withTiming(v ? 1 : 0, { duration: 300, easing: Easing.bezier(...EASE) }); }, [v]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(x.value, [0, 1], [C.divider, C.accent]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 20 }] }));
  return (
    <Pressable onPress={() => { setSt(!v); if (pk) setPref(pk, !v); onChange?.(!v); }} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: v }} hitSlop={8}>
      <Animated.View style={[{ width: 51, height: 31, borderRadius: 999 }, track]}>
        <Animated.View style={[{ position: 'absolute', top: 3, left: 3, width: 25, height: 25, borderRadius: 999, backgroundColor: C.knob, boxShadow: '0px 1px 3px rgba(0,0,0,0.25)' }, knob]} />
      </Animated.View>
    </Pressable>
  );
}

// Seçili çip vurgu mavisinde; dark: seçili çip siyah (paket oluşturmadaki seans/süre/geçerlilik seçimleri)
export function Chip({ t, on, onPress, cn, grid, style, dark = false }: { t?: string; on?: boolean; onPress?: () => void; cn?: string; grid?: boolean; style?: VS; dark?: boolean; children?: React.ReactNode }) {
  const C = useC();
  const sb = dark ? C.sdark : C.accent, sf = dark ? C.onDark : C.onAccent;
  return (
    <Tap onPress={onPress} sel={!!on} style={[{ height: grid ? 44 : 36, paddingHorizontal: grid ? 4 : 14, borderRadius: grid ? 12 : 999, borderWidth: 1.5, borderColor: on ? sb : C.border, backgroundColor: on ? sb : C.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, grid && { flex: 1 }, style]}>
      <T s={13} w={700} c={on ? sf : C.ink} numberOfLines={1}>{t}</T>
      {cn ? <T s={13} w={800} c={on ? sf : C.muted} style={{ marginLeft: 5 }}>{cn}</T> : null}
    </Tap>
  );
}

// Izgara çipler (.pchips): eşit sütun, 44px; cst = ✎ özel değer birimi
export function PChips({ items, init = 0, value, cols = 4, cst, cstInit, onChange, style, pk, dark }: { items: string[]; init?: number; value?: number; cols?: number; cst?: string; cstInit?: string; onChange?: (i: number, label: string) => void; style?: VS; pk?: string; dark?: boolean }) {
  const C = useC();
  const sb = dark ? C.sdark : C.accent, sf = dark ? C.onDark : C.onAccent;
  const sv = saved(pk);
  const [sel, setSel] = useState<number>(sv ? sv.s : init);
  const [cus, setCus] = useState<string | null>(sv ? sv.c : cstInit ?? null);
  const [ed, setEd] = useState(false);
  const cur = value ?? sel;
  const cells: React.ReactNode[] = items.map((x, i) => <Chip key={i} grid dark={dark} t={x} on={cus == null && cur === i} onPress={() => { setCus(null); setEd(false); setSel(i); if (pk) setPref(pk, { s: i, c: null }); onChange?.(i, x); }} />);
  if (cst)
    cells.push(
      ed ? (
        <View key="c" style={{ flex: 1, height: 44, borderRadius: 12, borderWidth: 2, borderColor: C.accent, backgroundColor: C.card, justifyContent: 'center' }}>
          <TextInput autoFocus keyboardType="number-pad" maxLength={3} placeholder={cst} placeholderTextColor={C.muted} onBlur={() => setEd(false)} onSubmitEditing={() => setEd(false)}
            onChangeText={v => { const n = parseInt(v, 10); setCus(n > 0 ? `${n} ${cst}` : null); if (n > 0) { if (pk) setPref(pk, { s: sel, c: `${n} ${cst}` }); onChange?.(-1, `${n} ${cst}`); } }}
            style={[{ textAlign: 'center', fontFamily: ff(700), fontSize: 13, color: C.ink, padding: 0, height: 40 }, noOutline]} />
        </View>
      ) : (
        <Tap key="c" onPress={() => setEd(true)} label="Özel değer" style={{ flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: cus ? sb : C.border, backgroundColor: cus ? sb : C.card, alignItems: 'center', justifyContent: 'center' }}>
          {cus ? <T s={13} w={700} c={sf}>{cus}</T> : <Icon n="edit" s={18} />}
        </Tap>
      ),
    );
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols));
  return (
    <View style={[{ gap: 6 }, style]}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 6 }}>
          {r}
          {Array.from({ length: cols - r.length }, (_, j) => <View key={'s' + j} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

export function Seg({ items, sel, onSel, style }: { items: string[]; sel: number; onSel: (i: number) => void; style?: VS }) {
  const C = useC();
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: C.divider, borderRadius: 12, padding: 3, marginTop: 16, marginHorizontal: 16 }, style]}>
      {items.map((x, i) => (
        <Tap key={i} onPress={() => onSel(i)} sel={i === sel} style={{ flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: i === sel ? C.card : 'transparent' }}>
          <T s={14} w={700} c={i === sel ? C.ink : C.muted}>{x}</T>
        </Tap>
      ))}
    </View>
  );
}

// Kutular (.tile): ikon + etiket; seçili = koyu çerçeve
export function Tiles({ items, init = 0, value, multi, cols = 3, onChange, style }: { items: [string, string, string?][]; init?: number | number[]; value?: number; multi?: boolean; cols?: number; onChange?: (i: number) => void; style?: VS }) {
  const C = useC();
  const [sel, setSel] = useState<number | number[]>(init);
  const cur = value ?? sel;
  const rows: [string, string, string?][][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={[{ gap: 8 }, style]}>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 8 }}>
          {r.map((t, j) => {
            const i = ri * cols + j, on = Array.isArray(cur) ? cur.includes(i) : cur === i;
            return (
              <Tap key={i} sel={on} onPress={() => { setSel(multi && Array.isArray(sel) ? (sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]) : i); onChange?.(i); }}
                style={{ flex: 1, minHeight: 76, borderRadius: 12, borderWidth: on ? 2 : 1.5, borderColor: on ? C.ink : C.border, backgroundColor: on ? C.page : C.card, alignItems: 'center', justifyContent: 'center', gap: 4, padding: on ? 7.5 : 8 }}>
                <Icon n={t[0]} s={22} />
                <T s={13} w={700} style={{ textAlign: 'center' }}>{t[1]}</T>
                {t[2] ? <T s={12} c={C.muted} style={{ textAlign: 'center' }}>{t[2]}</T> : null}
              </Tap>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Gün hücresi (.dc)
export function DC({ a, b, on, dis, sm, onPress }: { a?: string; b: string; on?: boolean; dis?: boolean; sm?: boolean; onPress?: () => void }) {
  const C = useC();
  return (
    <Tap onPress={dis ? undefined : onPress} sel={!!on} disabled={dis} style={{ flex: 1, height: sm ? 44 : 56, borderRadius: 12, borderWidth: 1.5, borderColor: on ? C.sdark : C.border, backgroundColor: on ? C.sdark : C.card, alignItems: 'center', justifyContent: 'center', gap: 2, opacity: dis ? 0.35 : 1 }}>
      {a ? <T s={11} w={700} c={on ? C.onDarkMuted : C.muted}>{a}</T> : null}
      <T s={sm ? 13 : 16} w={sm ? 700 : 800} c={on ? C.onDark : C.ink}>{b}</T>
    </Tap>
  );
}

export function Ck({ on }: { on: boolean }) {
  const C = useC();
  return (
    <View style={{ width: 24, height: 24, borderRadius: 999, borderWidth: 1.5, borderColor: on ? C.sdark : C.border, backgroundColor: on ? C.sdark : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      {on ? <Icon n="check" s={14} sw={3} c={C.onDark} /> : null}
    </View>
  );
}

export function Inp({ v, ph, area, style, pk, ...rest }: TextInputProps & { v?: string; ph?: string; area?: boolean; pk?: string }) {
  const C = useC();
  const [val, setVal] = useState<string>(saved(pk) ?? v ?? '');
  const txt = rest.value ?? val;
  return (
    <TextInput
      placeholder={ph}
      placeholderTextColor={C.muted}
      multiline={area}
      selectionColor={C.accent}
      {...rest}
      value={txt}
      onChangeText={t => { setVal(t); if (pk) setPref(pk, t); rest.onChangeText?.(t); }}
      style={[
        { height: area ? 76 : 52, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card, paddingHorizontal: 14, fontFamily: ff(txt ? 700 : 500), fontSize: 16, color: C.ink },
        area && { paddingTop: 12, paddingBottom: 12, lineHeight: 22, textAlignVertical: 'top' },
        noOutline,
        style,
      ]}
    />
  );
}
export function Fld({ label, link, onLink, children, style, flex, ...inp }: TextInputProps & { label?: string; v?: string; ph?: string; area?: boolean; pk?: string; link?: string; onLink?: () => void; children?: React.ReactNode; style?: VS; flex?: boolean }) {
  const C = useC();
  return (
    <View style={[{ gap: 6 }, flex && { flex: 1, minWidth: 0 }, style]}>
      {label ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T s={13} w={700} c={C.muted}>{label}</T>
          {link ? <Lnk t={link} s={13} onPress={onLink} /> : null}
        </View>
      ) : null}
      {children ?? <Inp {...inp} />}
    </View>
  );
}
export const Cols = ({ children, gap = 12, style }: { children: React.ReactNode; gap?: number; style?: VS }) => <View style={[{ flexDirection: 'row', gap }, style]}>{children}</View>;
// +90 kutusu + numara
export function Tel({ v, ph }: { v?: string; ph?: string }) {
  const C = useC();
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={{ width: 72, height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}><T s={16} w={700}>+90</T></View>
      <Inp v={v} ph={ph} keyboardType="phone-pad" style={{ flex: 1 }} />
    </View>
  );
}

/* ---------- liste ---------- */
export function Row({ left, t, s, right, onPress, style, tC, chev }: { left?: React.ReactNode; t: string; s?: string; right?: React.ReactNode; onPress?: () => void; style?: VS; tC?: string; chev?: boolean }) {
  const C = useC();
  const st: VS = [{ backgroundColor: C.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64 }, style];
  const inner = (
    <>
      {left}
      <Rt t={t} s={s} tC={tC} />
      {right}
      {chev ? <Icon n="chevR" c={C.muted} /> : null}
    </>
  );
  return onPress ? <Tap onPress={onPress} style={st}>{inner}</Tap> : <View style={st}>{inner}</View>;
}
export function Rt({ t, s, tC, sC }: { t: string; s?: string; tC?: string; sC?: string }) {
  const C = useC();
  return (
    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
      <T s={15} w={700} lh={1.35} c={tC} numberOfLines={1}>{t}</T>
      {s ? <T s={13} lh={1.4} c={sC ?? C.muted} numberOfLines={1}>{s}</T> : null}
    </View>
  );
}
export const List = ({ children, style }: { children: React.ReactNode; style?: VS }) => <View style={[{ gap: 6, paddingHorizontal: 16 }, style]}>{children}</View>;
export const Grp = ({ t, style, right }: { t: string; style?: VS; right?: React.ReactNode }) => (
  <View style={[{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}><Lbl t={t} />{right}</View>
);
// Gruplu kart (.gcard) ve satırı (.gr)
export function GCard({ children, style }: { children: React.ReactNode; style?: VS }) {
  const C = useC();
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, overflow: 'hidden' }, style]}>
      {kids.map((k, i) => <View key={i} style={i ? { borderTopWidth: 1, borderTopColor: C.divider } : null}>{k}</View>)}
    </View>
  );
}
export function GR({ left, t, s, right, onPress, chev, children, style }: { left?: React.ReactNode; t?: string; s?: string; right?: React.ReactNode; onPress?: () => void; chev?: boolean; children?: React.ReactNode; style?: VS }) {
  const C = useC();
  const st: VS = [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, minHeight: 60 }, style];
  const inner = (
    <>
      {left}
      {children ?? <Rt t={t || ''} s={s} />}
      {right}
      {chev ? <Icon n="chevR" c={C.muted} /> : null}
    </>
  );
  return onPress ? <Tap onPress={onPress} style={st}>{inner}</Tap> : <View style={st}>{inner}</View>;
}
// Sağda değer + ok (.val)
export function Val({ v, onPress }: { v: string; onPress?: () => void }) {
  const C = useC();
  return (
    <Tap onPress={onPress} hit={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44 }}>
      <T s={14} w={700} c={C.muted}>{v}</T>
      <Icon n="chevR" c={C.muted} />
    </Tap>
  );
}
// Anahtar–değer listesi (.kv)
export function KV({ rows, style, bg }: { rows: [string, string, string?, boolean?][]; style?: VS; bg?: string }) {
  const C = useC();
  return (
    <View style={[{ alignSelf: 'stretch', backgroundColor: bg ?? C.page, borderRadius: 16 }, style]}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: i ? 1 : 0, borderTopColor: C.divider }}>
          <T s={14} c={C.muted}>{r[0]}</T>
          <T s={14} w={700} c={r[2]} style={[{ flexShrink: 1, textAlign: 'right' }, r[3] && { textDecorationLine: 'line-through' }]}>{r[1]}</T>
        </View>
      ))}
    </View>
  );
}

/* ---------- sayfa iskeleti ---------- */
const ScrollCtx = createContext<{ by: (h: number) => void } | null>(null);
export const useScrollBy = () => useContext(ScrollCtx);

// Kaydırılan gövde (.scr)
export function Scr({ children, pb = 24, style, scrollRef, bg }: { children?: React.ReactNode; pb?: number; style?: VS; scrollRef?: React.RefObject<SV | null>; bg?: string }) {
  const own = useRef<SV>(null);
  const ref = scrollRef ?? own;
  const y = useRef(0);
  const ctx = useRef({ by: (h: number) => ref.current?.scrollTo({ y: y.current + h, animated: true }) }).current;
  return (
    <ScrollCtx.Provider value={ctx}>
      <ScrollView ref={ref} style={[{ flex: 1, backgroundColor: bg }, style]} contentContainerStyle={{ paddingBottom: pb }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets
        onScroll={e => { y.current = e.nativeEvent.contentOffset.y; }} scrollEventThrottle={32}>
        {children}
      </ScrollView>
    </ScrollCtx.Provider>
  );
}

// Koyu üst bant (.band): durum çubuğu alanını da kaplar
export function Band({ children, left, right, lbl }: { children?: React.ReactNode; left?: React.ReactNode; right?: React.ReactNode; lbl?: string }) {
  const C = useC();
  const { top } = useFrame();
  return (
    <View style={{ backgroundColor: C.sdark, paddingTop: top, paddingHorizontal: 20, paddingBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, marginTop: 8, marginHorizontal: 2 }}>
        {lbl ? <Lbl t={lbl} c={C.onDarkMuted} style={{ marginLeft: -2 }} /> : left ?? <View />}
        {right ?? <View style={{ width: 44, height: 44 }} />}
      </View>
      {children}
    </View>
  );
}
export const BandBack = () => <IB ic="chevL" k="dk" label="Geri" onPress={pop} />;

// Açık sayfa başlığı (.navh): geri · başlık · sağ düğme
export function NavH({ title, sub, right, onBack, left }: { title?: string; sub?: string; right?: React.ReactNode; onBack?: () => void; left?: React.ReactNode }) {
  const { top } = useFrame();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: top + 14, paddingHorizontal: 22, paddingBottom: 8 }}>
      <View style={{ width: 44 }}>{left === undefined ? <IB ic="chevL" label="Geri" onPress={onBack ?? pop} /> : left}</View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {title ? <T s={17} w={800} lh={1.2} numberOfLines={1}>{title}</T> : null}
        {sub ? <Sm n={1}>{sub}</Sm> : null}
      </View>
      <View style={{ width: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

// Yüzen alt düğme alanı (prototipteki .sh>.sfoot): içerik altından akar, üstte zemin rengine yumuşak geçiş.
// Geçiş: 0 px şeffaf → 22 px %85 → 34 px tam zemin. onH ile yüksekliğini bildirir; kaydırma alanı bu kadar alt boşluk bırakır.
export function FloatFoot({ children, bg, onH }: { children: React.ReactNode; bg: string; onH: (h: number) => void }) {
  const { bottom } = useFrame();
  const id = `ff${bg.replace(/[^0-9a-zA-Z]/g, '')}`;
  return (
    <View pointerEvents="box-none" onLayout={e => onH(e.nativeEvent.layout.height)}
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 30, paddingHorizontal: 16, paddingBottom: Math.max(30, bottom + 8), gap: 8 }}>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <Svg width="100%" height={34}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={bg} stopOpacity={0} />
              <Stop offset="0.647" stopColor={bg} stopOpacity={0.85} />
              <Stop offset="1" stopColor={bg} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height={34} fill={`url(#${id})`} />
        </Svg>
        <View style={{ flex: 1, backgroundColor: bg }} />
      </View>
      {children}
    </View>
  );
}

// Alt çift düğme çubuğu (.foot)
export function Foot({ children }: { children: React.ReactNode }) {
  const { bottom } = useFrame();
  // Zemin ve üst çizgi yok: düğmeler sayfa zemininin üstünde durur
  return <View style={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: Math.max(30, bottom + 8), flexDirection: 'row', gap: 8 }}>{children}</View>;
}
export const Pair = ({ children, style }: { children: React.ReactNode; style?: VS }) => <View style={[{ flexDirection: 'row', gap: 8 }, style]}>{children}</View>;

/* ---------- panel (sheet) içi ---------- */
export function SheetH({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: right ? 8 : 6, paddingHorizontal: right ? 16 : 4, paddingBottom: right ? 6 : 4 }}>
      <View style={{ width: 44, marginLeft: right ? 0 : 12 }}><IB ic="chevL" label="Geri" onPress={onBack} /></View>
      <T s={20} w={800} lh={1.25} style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>{title}</T>
      <View style={{ width: 44, marginRight: right ? 0 : 12 }}>{right}</View>
    </View>
  );
}
export const Form = ({ children, gap = 16, style }: { children: React.ReactNode; gap?: number; style?: VS }) => <View style={[{ paddingTop: 8, paddingHorizontal: 16, gap }, style]}>{children}</View>;
// Çerçeveli seçenek kutusu (.oc) ve satırı (.orow)
export function OC({ children }: { children: React.ReactNode }) {
  const C = useC();
  return <View style={{ borderWidth: 1.5, borderColor: C.border, borderRadius: 16, padding: 14, gap: 14 }}>{children}</View>;
}
export function ORow({ t, s, right, style, left }: { t: string; s?: string; right?: React.ReactNode; style?: VS; left?: React.ReactNode }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{left}<Rt t={t} s={s} />{right}</View>;
}

/* ---------- kartlar ---------- */
export function FC({ children, style }: { children: React.ReactNode; style?: VS }) {
  const C = useC();
  return <View style={[{ backgroundColor: C.card, borderRadius: 20, padding: 18, boxShadow: C.shCard, marginTop: 16, marginHorizontal: 16, gap: 12 }, style]}>{children}</View>;
}
export function Stat({ b, t, children, style }: { b?: string; t?: string; children?: React.ReactNode; style?: VS }) {
  const C = useC();
  return (
    <View style={[{ flex: 1, backgroundColor: C.sdark2, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, gap: 2, minHeight: 64, justifyContent: 'center' }, style]}>
      {children ?? (
        <>
          <T s={26} w={800} lh={1.1} c={C.onDark}>{b}</T>
          <T s={13} c={C.onDarkMuted}>{t}</T>
        </>
      )}
    </View>
  );
}
export function Box({ b, t, bC }: { b: string; t: string; bC?: string }) {
  const C = useC();
  return (
    <View style={{ flex: 1, minWidth: 0, backgroundColor: C.card, borderRadius: 12, padding: 12, gap: 2 }}>
      <T s={20} w={800} lh={1.15} c={bC} numberOfLines={1}>{b}</T>
      <T s={13} c={C.muted}>{t}</T>
    </View>
  );
}

export function Empty({ ic, t, sub, children, style }: { ic: string; t: string; sub: string; children?: React.ReactNode; style?: VS }) {
  const C = useC();
  return (
    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 24, gap: 8 }, style]}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Icon n={ic} s={28} c={C.accentInk} /></View>
      <T s={20} w={800} lh={1.25} style={{ textAlign: 'center' }}>{t}</T>
      <T s={15} lh={1.5} c={C.muted} style={{ textAlign: 'center' }}>{sub}</T>
      {children ? <View style={{ gap: 8, width: 240, marginTop: 16 }}>{children}</View> : null}
    </View>
  );
}

/* ---------- sonuç ekranı (.res) ---------- */
export function Res({ ic, red, top, big, strike, sub, rows, children, onBack }: { ic: string; red?: boolean; top: string; big: string; strike?: boolean; sub: string; rows: [string, string, string?, boolean?][]; children: React.ReactNode; onBack: () => void }) {
  const C = useC();
  const fr = useFrame();
  return (
    <View style={{ flex: 1, backgroundColor: C.card }}>
      <View style={{ paddingTop: fr.top + 14, paddingHorizontal: 22 }}><IB ic="chevL" label="Geri" onPress={onBack} /></View>
      <Scr>
        <View style={{ alignItems: 'center', paddingTop: 24, paddingHorizontal: 20 }}>
          <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: red ? C.dangerTint : C.successTint, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon n={ic} s={32} sw={2.4} c={red ? C.danger : C.success} />
          </View>
          <Sm style={{ textAlign: 'center' }}>{top}</Sm>
          <T s={36} w={800} lh={1.1} c={strike ? C.muted : C.ink} style={[{ marginTop: 8, marginBottom: 6, textAlign: 'center' }, strike && { textDecorationLine: 'line-through' }]}>{big}</T>
          <T s={15} lh={1.5} c={C.muted} style={{ textAlign: 'center' }}>{sub}</T>
          <KV rows={rows} style={{ marginTop: 24 }} />
        </View>
      </Scr>
      <View style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: Math.max(30, fr.bottom + 8), gap: 8 }}>{children}</View>
    </View>
  );
}

/* ---------- form blokları ---------- */
// Etiketli blok (.blk)
export const Blk = ({ lbl, right, children, gap = 10 }: { lbl?: string; right?: React.ReactNode; children: React.ReactNode; gap?: number }) => (
  <View style={{ gap }}>
    {lbl ? <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Lbl t={lbl} />{right}</View> : null}
    {children}
  </View>
);
export function Quote({ t }: { t: string }) {
  const C = useC();
  return <View style={{ backgroundColor: C.page, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 }}><T s={14} lh={1.5}>{t}</T></View>;
}
export function Inote({ t, style }: { t: string; style?: VS }) {
  const C = useC();
  return (
    <View style={[{ marginTop: 4, marginHorizontal: 16, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.infoTint, flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
      <Icon n="info" s={18} c={C.info} />
      <T s={13} w={700} c={C.info} style={{ flex: 1 }}>{t}</T>
    </View>
  );
}
export function Steps({ n }: { n: number }) {
  const C = useC();
  return <View style={{ flexDirection: 'row', gap: 4, flex: 1 }}>{[1, 2, 3, 4, 5].map(i => <View key={i} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: i <= n ? C.accent : C.divider }} />)}</View>;
}
// İlerleme parçaları (.pg)
export function Pg({ total, left }: { total: number; left: number }) {
  const C = useC();
  return <View style={{ flexDirection: 'row', gap: 4 }}>{Array.from({ length: total }, (_, i) => <View key={i} style={{ flex: 1, height: 8, borderRadius: 999, backgroundColor: i >= total - left ? C.accent : C.divider }} />)}</View>;
}
