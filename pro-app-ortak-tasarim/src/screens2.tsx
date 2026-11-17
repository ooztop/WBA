// Sayfalar 2: takvim ayarları, gün sayfası, ders kuralları, paket tercihleri, yardım, hesabı sil
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { DL, DN, type Pkg } from './data';
import type { ID } from './data/models';
import { daysText, go, openSheet, toast, toastLater, useC, useFrame, useStore } from './store';
import { removePackage, setBasePackage, toggleBreakDay, usePref } from './data/actions';
import { openUrl } from './device';
import { EASE, ff } from './theme';
import { Box, Btn, Cols, Empty, FC, Fic, Fld, GCard, GR, IB, Icon, Inote, Lbl, List, NavH, noOutline, PChips, Rt, Scr, Sm, Sw, T, Tag, Tap } from './ui';
import { Amt } from './screens1';

type SP = { p: any };

// Etiket + açıklama (.grp içinde .lbl ve .sm)
export const GrpS = ({ t, s, pt = 18, right, pb = 6 }: { t: string; s?: string; pt?: number; right?: React.ReactNode; pb?: number }) => (
  <View style={{ paddingTop: pt, paddingHorizontal: 16, paddingBottom: pb, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <View style={{ flex: 1 }}>
      <Lbl t={t} />
      {s ? <Sm style={{ marginTop: 2 }}>{s}</Sm> : null}
    </View>
    {right}
  </View>
);

function CalendarPrefs() {
  const C = useC();
  const emp = useStore(s => s.emp);
  const breaks = useStore(s => s.breaks);
  const prefs = useStore(s => s.prefs);
  const H = [0, 1, 2, 3, 4, 5, 6].map(i => ((prefs[`day.${i}.on`] ?? i !== 6) ? `${prefs[`day.${i}.s`] ?? prefs['wh.s'] ?? '10:00'} – ${prefs[`day.${i}.e`] ?? (i === 5 ? '14:00' : prefs['wh.e'] ?? '18:00')}` : null));
  return (
    <>
      <NavH title="Takvim ayarlarım" />
      <Scr>
        <GrpS t="Çalışma saatleri" pt={8} />
        <View style={{ backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, paddingTop: 12, paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
          <Sm>Her gün için varsayılan. Günlere özel ayar aşağıda.</Sm>
          <Cols><Fld flex label="Başlangıç" v="10:00" pk="wh.s" /><Fld flex label="Bitiş" v="18:00" pk="wh.e" /></Cols>
        </View>
        <GrpS t="Düzenli molalar" pb={4} right={<IB ic="plus" s={36} label="Mola ekle" onPress={() => openSheet('breakNew')} />} />
        {emp || !breaks.length ? (
          <View style={{ marginHorizontal: 16, padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.border }}><Sm style={{ textAlign: 'center' }}>Düzenli mola yok. + ile ekleyebilirsin.</Sm></View>
        ) : (
          <GCard>
            {breaks.map(b => <GR key={b.id} t={b.name} s={`${b.start} – ${b.end} · ${daysText(b.days)}`} chev onPress={() => openSheet('breakNew', { id: b.id })} />)}
          </GCard>
        )}
        <GrpS t="Günler" s="Özel ayar için güne dokun" />
        <GCard>
          {DN.map((g, i) => (
            <GR key={i} chev onPress={() => go('dayRule', undefined, { g: i })} style={i === 5 ? undefined : { minHeight: 52 }} right={i === 5 ? <Tag k="a" t="Özel" /> : null}>
              <T s={15} w={800} c={H[i] ? C.ink : C.muted} style={{ width: 40 }}>{g}</T>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <T s={15} lh={1.35} c={H[i] ? C.ink : C.muted}>{H[i] || 'Kapalı'}</T>
                {i === 5 ? <T s={13} lh={1.4} c={C.muted} numberOfLines={1}>10 geçe başlar · akşam arası yok</T> : null}
              </View>
            </GR>
          ))}
        </GCard>
      </Scr>
    </>
  );
}

function DayRule({ p }: SP) {
  const C = useC();
  const gi = p.g ?? 5, g = DL[gi], sat = gi === 5;
  const [on, setOn] = usePref(`day.${gi}.on`, gi !== 6);
  const breaks = useStore(s => s.breaks);
  return (
    <>
      <NavH title={g} />
      <Scr>
        <FC style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <T s={20} w={800} lh={1.25}>{g} {on ? 'açık' : 'kapalı'}</T>
            <Sm>{on ? `${sat ? '10:00 – 14:00' : '10:00 – 18:00'} · rezervasyon alınır` : 'Bu gün rezervasyon alınmaz'}</Sm>
          </View>
          <Sw on={on} onChange={setOn} label={`${g} açık`} />
        </FC>
        {on ? (
          <>
            <GrpS t="Çalışma saatleri" s="Genel saatten farklıysa değiştir" />
            <Cols style={{ paddingHorizontal: 16 }}><Fld flex label="Başlangıç" v="10:00" pk={`day.${gi}.s`} /><Fld flex label="Bitiş" v={sat ? '14:00' : '18:00'} pk={`day.${gi}.e`} /></Cols>
            <GrpS t="Molalar" s="Bu günde geçerli düzenli molalar" />
            <GCard>
              {breaks.map(b => <GR key={b.id} t={b.name} s={`${b.start} – ${b.end}`} right={<Sw on={b.days.includes(gi)} onChange={v => { void toggleBreakDay(b.id, gi, v); }} label={b.name} />} />)}
            </GCard>
            <GrpS t="Kurallar" />
            <GCard>
              <GR t="Ders kuralları" s={sat ? '10 geçe başlar · genel ayarı ezer' : 'Genel kurallar geçerli'} right={sat ? <Tag k="a" t="Bu güne özel" /> : null} chev onPress={() => go('rules')} />
            </GCard>
          </>
        ) : null}
      </Scr>
    </>
  );
}

// Tek kural kartı (.rule)
export function Rule({ t, s, items, init, cst, cstInit, pk }: { t: string; s: string; items: string[]; init: number; cst: string; cstInit?: string; pk?: string }) {
  const C = useC();
  return (
    <View style={{ backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, padding: 14, gap: 12 }}>
      <View style={{ gap: 2 }}>
        <T s={15} w={700} lh={1.35}>{t}</T>
        <T s={13} lh={1.4} c={C.muted}>{s}</T>
      </View>
      <PChips items={items} init={init} cst={cst} cstInit={cstInit} pk={pk} />
    </View>
  );
}
function Rules() {
  return (
    <>
      <NavH title="Ders kuralları" />
      <Scr>
        <View style={{ gap: 8, paddingTop: 8 }}>
          <Rule pk="rule.0" t="Rezervasyon penceresi" s="Dersten en geç kaç saat önce rezervasyon yapılabilir" items={['1 sa', '2 sa', '24 sa']} init={1} cst="sa" />
          <Rule pk="rule.1" t="Ücretsiz iptal süresi" s="Bu süreden sonraki iptallerde ders ücreti alınır" items={['2 sa', '4 sa', '24 sa']} init={1} cst="sa" />
          <Rule pk="rule.2" t="Ders başlama kademesi" s="Dersler her saatin hangi dakikasında başlar" items={['Tam saat', '15 geçe', '30 geçe']} init={0} cst="geçe" />
          <Rule pk="rule.3" t="Ders arası mola" s="Bir ders bitince sonraki derse kadar zorunlu boşluk" items={['Yok', '10 dk', '15 dk']} init={2} cst="dk" />
        </View>
        <Sm style={{ paddingTop: 14, paddingHorizontal: 20 }}>Paketi olmayan dersler için geçerli. Paketlerin kendi kuralları bunu ezer.</Sm>
      </Scr>
    </>
  );
}

/* ---------- paket satırı: sağa kaydır → temel yap, sola kaydır → sil ---------- */
export const Pkb = ({ t }: { t: string }) => {
  const C = useC();
  return <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.page, alignItems: 'center', justifyContent: 'center' }}><T s={14} w={800}>{t}</T></View>;
};
function SwipeRow({ pk, onStar, onDel, onOpen }: { pk: Pkg; onStar: () => void; onDel: () => void; onOpen: () => void }) {
  const C = useC();
  const x = useSharedValue(0);
  const moved = React.useRef(0);
  const mark = () => { moved.current = Date.now(); };
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => { runOnJS(mark)(); })
    .onUpdate(e => { x.value = Math.max(-140, Math.min(140, e.translationX)); })
    .onEnd(() => {
      const v = x.value;
      x.value = withTiming(0, { duration: 320, easing: Easing.bezier(...EASE) });
      runOnJS(mark)();
      if (v > 90) runOnJS(onStar)();
      else if (v < -90) runOnJS(onDel)();
    });
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const bg = useAnimatedStyle(() => ({ backgroundColor: x.value > 0 ? C.accent : C.danger, opacity: Math.abs(x.value) > 1 ? 1 : 0 }));
  const l = useAnimatedStyle(() => ({ opacity: x.value > 0 ? 1 : 0 }));
  const r = useAnimatedStyle(() => ({ opacity: x.value < 0 ? 1 : 0 }));
  return (
    <View style={{ borderRadius: 12, overflow: 'hidden' }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }, bg]}>
        <Animated.View style={l}><T s={14} w={800} c={C.onAccent}>★ Temel yap</T></Animated.View>
        <Animated.View style={r}><T s={14} w={800} c="#fff">Sil</T></Animated.View>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={st}>
          <Tap onPress={() => { if (Date.now() - moved.current > 350) onOpen(); }} style={{ backgroundColor: pk.base ? C.tintSoft : C.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64 }}>
            <Pkb t={pk.c1} />
            <Rt t={pk.name} s={pk.sub} />
            <Amt b={pk.price} k={pk.base ? 'a' : undefined} tag={pk.base ? 'Temel' : undefined} />
          </Tap>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function Pricing() {
  const emp = useStore(s => s.emp);
  const pkgs = useStore(s => s.packages);
  const star = (id: ID) => { void setBasePackage(id); };
  const del = (pk: Pkg) => { void removePackage(pk); };
  const list = (kind: Pkg['kind']) => (
    <List>{pkgs.filter(p => p.kind === kind).map(pk => <SwipeRow key={pk.id} pk={pk} onStar={() => star(pk.id)} onDel={() => del(pk)} onOpen={() => openSheet(kind === 'single' ? 'packageSingle' : 'packageMulti', { id: pk.id })} />)}</List>
  );
  const add = () => openSheet('packageSingle', { isNew: true });
  return (
    <>
      <NavH title="Paket tercihleri" right={<IB ic="plus" k="p" label="Paket ekle" onPress={add} />} />
      {emp ? (
        <Empty ic="tag" t="Henüz paket yok" sub="Tek ders ya da çoklu paket oluştur. Ders eklerken ücret otomatik gelsin."><Btn t="Paket oluştur" onPress={add} /></Empty>
      ) : (
        <Scr>
          <GrpS t="Tekil ders" s="Tek seanslık dersler" pt={8} />
          {list('single')}
          <GrpS t="Çoklu paket" s="Birden fazla seans, tek ödeme" pt={20} />
          {list('multi')}
          <Inote t="Sağa kaydır: temel yap · Sola kaydır: sil" style={{ marginTop: 20 }} />
        </Scr>
      )}
    </>
  );
}

function Help() {
  const C = useC();
  const open = () => toast('Açılıyor');
  return (
    <>
      <NavH title="Yardım ve destek" />
      <Scr>
        <View style={{ marginTop: 4, marginHorizontal: 16, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.infoTint, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon n="clock" c={C.info} />
          <T s={13} w={700} c={C.info}>Ortalama yanıt süresi 4 saat</T>
        </View>
        <GrpS t="Bize ulaş" pt={16} />
        <GCard>
          <GR left={<Fic k="n" ic="chat" c={C.ink} />} t="Destek ekibine yaz" s="Uygulama içi mesaj" chev onPress={open} />
          <GR left={<Fic k="n" ic="phone" c={C.ink} />} t="WhatsApp'tan sor" s="Hafta içi 09:00 – 19:00" chev onPress={() => openUrl('https://wa.me/908500000000', 'WhatsApp açılıyor')} />
        </GCard>
        <GrpS t="Sık sorulanlar" />
        <GCard>
          {['Her kişiye farklı fiyat nasıl veririm?', 'Fiyatı güncellersem kişilere bildirim gider mi?', 'İptal kurallarını nasıl değiştiririm?', 'Ödemeyi elle kaydetmek nasıl çalışır?'].map(q => (
            <GR key={q} chev onPress={open}><T s={15} w={700} lh={1.35} style={{ flex: 1 }}>{q}</T></GR>
          ))}
        </GCard>
        <GCard style={{ marginTop: 18 }}>
          <GR t="Uygulama sürümü" right={<T s={13} w={700} c={C.muted}>2.4.1</T>} />
          <GR t="Kullanım koşulları" chev onPress={open} />
        </GCard>
      </Scr>
    </>
  );
}

function DeleteAccount() {
  const C = useC();
  const { bottom } = useFrame();
  const emp = useStore(s => s.emp);
  const [v, setV] = useState('');
  const ok = ['SİL', 'SIL'].includes(v.trim().toLocaleUpperCase('tr'));
  return (
    <>
      <NavH title="Hesabı sil" />
      <Scr>
        <GrpS t="Silinecekler" s="Tüm kayıtların kalıcı olarak silinir" pt={8} />
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
          <View style={{ flex: 0.8 }}><Box b={emp ? '0' : '8'} t="kişi" /></View>
          <View style={{ flex: 1 }}><Box b={emp ? '0' : '246'} t="ders kaydı" /></View>
          <View style={{ flex: 1.5 }}><Box b={emp ? '₺0' : '₺148.200'} t="ödeme kaydı" /></View>
        </View>
        {emp ? null : (
          <>
            <GrpS t="Önce çözülmesi gerekenler" pt={20} />
            <GCard>
              <GR chev onPress={() => go('payment', undefined, { i: 1 })}>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <T s={15} w={700} lh={1.35}><T s={15} w={700} c={C.danger}>₺1.500</T> bekleyen tahsilat</T>
                  <T s={13} lh={1.4} c={C.muted}>Mert Kaya</T>
                </View>
              </GR>
              <GR t="4 planlı ders iptal edilecek" s="Kişilere bildirilir" />
            </GCard>
          </>
        )}
        <GrpS t="Onaylamak için SİL yaz" pt={20} />
        <View style={{ paddingHorizontal: 16 }}>
          <TextInput value={v} onChangeText={setV} placeholder="SİL" accessibilityLabel="Onaylamak için SİL yaz" placeholderTextColor={C.muted} autoCapitalize="characters" autoCorrect={false} selectionColor={C.accent}
            style={[{ height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card, paddingHorizontal: 14, fontFamily: ff(v ? 700 : 500), fontSize: 16, color: C.ink, letterSpacing: 1.3 }, noOutline]} />
        </View>
      </Scr>
      <View style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: Math.max(30, bottom + 8), gap: 8 }}>
        <Sm style={{ textAlign: 'center' }}>30 gün içinde giriş yaparsan silme iptal edilir.</Sm>
        <Btn k="x" t="Hesabımı sil" off={!ok} onPress={() => { go('login', 'rep'); toastLater('Silme isteği alındı'); }} />
      </View>
    </>
  );
}

export const S2: Record<string, React.ComponentType<SP>> = { calendarPrefs: CalendarPrefs, dayRule: DayRule, rules: Rules, pricing: Pricing, help: Help, deleteAccount: DeleteAccount };
