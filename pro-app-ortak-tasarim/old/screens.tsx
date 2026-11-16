// İtilen ekranlar (prototipteki SCR)
import React, { useRef, useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { DL, DN, first, hm, MN, MS, wd, dkey, type Lesson, type Pkg } from './data';
import { go, home, openAction, openMenu, openSheet, person, personByName, pick, pop, set, toast, toastLater, useC, useFrame, useStore } from './store';
import { EASE, ff } from './theme';
import {
  Apple, Arrow, Av, Body, Bp, BPair, Btn, Cbtn, Check, Chips, DoneS, Empt, Emps, Expand, Fld, Foot, GBox, GRow, HL, Icon, Inp, KV, Lbox, NavB, NavRow, Note, Obox, Row, Rows, RulesBody, Sdiv, Sec, Seg, Sh, T, Tap, Tiles, Tog, Two, VBtn,
} from './ui';
import { QR } from './tabs';

type SP = { p: any };
const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

/* ================= ders ================= */
function LessonScr({ p }: SP) {
  const C = useC();
  const { top } = useFrame();
  const l: Lesson = p.l, d = new Date(p.f), Ty = C.ty[l[2]], pe = person(l[3]), paid = l[3] % 2 === 0;
  const when = `${DN[wd(d)]} ${d.getDate()} ${MS[d.getMonth()]} · ${hm(l[0])}`;
  const info = { n: pe.name, when, big: `${d.getDate()} ${MS[d.getMonth()]} · ${hm(l[0])}`, lk: `${dkey(d)}|${l[0]}`, ty: `${Ty[3]} · ${l[1]} dk` };
  return (
    <>
      <View style={{ backgroundColor: C.a, paddingTop: top, paddingHorizontal: 18, paddingBottom: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 52 }}>
          <Cbtn ic="chevron_left" onPress={pop} bg="rgba(255,255,255,0.18)" color="#fff" label="Geri" />
          <T s={15} w={570} c="#fff" style={{ opacity: 0.85 }}>Ders detayı</T>
        </View>
        <T s={26} w={600} ls={-0.02} c="#fff" style={{ marginTop: 6 }}>{Ty[3]} · {l[1]} dk</T>
        <T s={14} c="#fff" style={{ opacity: 0.85, marginTop: 3 }}>{d.getDate()} {MN[d.getMonth()]} {DL[wd(d)]} · {hm(l[0])} – {hm(l[0] + l[1] / 60)}</T>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 5, marginTop: 12, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)' }}>
          <Icon n="repeat" s={15} f={0} c="#fff" />
          <T s={12.5} w={570} c="#fff">Her hafta tekrarlanır</T>
        </View>
      </View>
      <Body>
        <GBox style={{ marginTop: 16 }}>
          <GRow left={<Av ini={pe.ini} ci={pe.ci} s={44} />} tNode={<T s={15.5} w={570}>{pe.name}</T>} sub="Aylık paket · 12. ders" right={<Arrow />} onPress={() => go('contact', undefined, { i: pe.id })} style={{ padding: 12 }} />
        </GBox>
        <GBox style={{ marginTop: 10 }}>
          {l[2] === 'o' ? (
            <KV t="Konum" v="Online görüşme" col={C.a} />
          ) : (
            <KV t="Konum" onPress={() => toast('Haritalar açılıyor')} right={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><T s={14.5} w={570} c={C.a}>Kadıköy stüdyo</T><Icon n="north_east" s={15} f={0} c={C.a} /></View>} />
          )}
          <KV t="Ücret" v="₺750" w={600} />
          <KV t="Ödeme" v={paid ? 'Ödendi' : 'Ödenmedi'} col={paid ? C.ok : C.red} onPress={paid ? undefined : () => go('payment', undefined, { i: pe.id })} />
        </GBox>
        <GBox style={{ marginTop: 10 }}>
          <View style={{ paddingVertical: 11, paddingHorizontal: 12 }}>
            <T s={12.5} c={C.t2}>Ders notu</T>
            <TextInput multiline placeholder="Not ekle" placeholderTextColor={C.t3} selectionColor={C.a} defaultValue={paid ? 'Türev konusunu bitirdik, önümüzdeki hafta integral testi yapılacak.' : ''} style={[{ fontFamily: ff(470), fontSize: 14.5, lineHeight: 21, color: C.t, marginTop: 3, height: 44, padding: 0, textAlignVertical: 'top' }, noOutline]} />
          </View>
        </GBox>
        <GBox style={{ marginTop: 10 }}>
          <GRow tNode={<T s={14.5} w={570}>Seriyi görüntüle</T>} sub={`Her ${DL[wd(d)].toLocaleLowerCase('tr')} · 8 ders kaldı`} right={<Arrow />} onPress={() => toast('Seri görünümü yakında')} />
        </GBox>
      </Body>
      <Bp line={false}>
        <Btn pair k="dline" t="İptal et" onPress={() => go('cancel', undefined, info)} />
        <Btn pair t="Dersi ertele" onPress={() => go('reschedule', undefined, info)} />
      </Bp>
    </>
  );
}

const RS_DAYS: [string, number][] = [['Per', 11], ['Cum', 12], ['Cmt', 13], ['Pzt', 15], ['Sal', 16], ['Çar', 17]];
const RS_SLOTS = [['14:00', '15:10', '16:20'], ['10:00', '11:10', '14:00', '15:10', '18:00', '19:10'], ['11:00', '12:10'], ['10:00', '14:00', '16:20'], ['10:00', '11:10', '13:30'], ['15:10', '17:30']];

function Reschedule({ p }: SP) {
  const C = useC();
  const f = first(p.n || 'Kişi');
  const [di, setDi] = useState(1);
  const [slot, setSlot] = useState('18:00');
  const day = RS_DAYS[di];
  return (
    <>
      <NavB title="Dersi ertele" />
      <Body>
        <View style={{ marginTop: 6, marginHorizontal: 18, marginBottom: 2, borderRadius: 18, backgroundColor: C.pbg, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T s={12} c={C.t3}>Eski</T>
            <T s={14} w={500} c={C.t3} style={{ textDecorationLine: 'line-through' }} numberOfLines={1}>{p.when || 'Çar 10 Eyl · 09:00'}</T>
          </View>
          <Icon n="arrow_forward" s={20} f={0} c={C.a} />
          <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-end' }}>
            <T s={12} c={C.a}>Yeni</T>
            <T s={18} w={600} c={C.a} numberOfLines={1}>{day[0]} {day[1]} · {slot}</T>
          </View>
        </View>
        <Sdiv />
        <Sec ic="event_available" t="Müsait saatlerin" />
        <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 18 }}>
          {RS_DAYS.map((d, i) => (
            <Pressable key={i} onPress={() => { setDi(i); setSlot(RS_SLOTS[i][0]); }} accessibilityRole="button" accessibilityState={{ selected: i === di }} style={{ flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 14, backgroundColor: i === di ? C.a : 'transparent' }}>
              <T s={11} c={i === di ? C.on : C.t2} style={{ opacity: i === di ? 0.8 : 1 }}>{d[0]}</T>
              <T s={16} w={600} c={i === di ? C.on : C.t}>{d[1]}</T>
            </Pressable>
          ))}
        </View>
        <SlotGrid items={RS_SLOTS[di]} sel={slot} onSel={setSlot} style={{ paddingTop: 14, paddingBottom: 4 }} />
        <Tap onPress={() => toast('Takvim açılır')} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, marginHorizontal: 18, marginBottom: 2, paddingVertical: 10, gap: 6 }}>
          <Icon n="calendar_month" s={19} c={C.a} />
          <T s={14} w={570} c={C.a} style={{ flex: 1 }}>Takvimden başka saat seç</T>
          <Arrow />
        </Tap>
        <Sdiv />
        <Sec ic="send" t={`${f}'e bildir`} sub="Yeni saati onaylaması istenir" right={<Tog init />} />
        <Note t="Sadece bu ders taşınır; seri ve ödeme aynı kalır." style={{ paddingTop: 12 }} />
      </Body>
      <Bp><Btn pair t="Ertelemeyi onayla" onPress={() => { pop(); toastLater(`Ders ${day[1]} Eylül ${slot} saatine taşındı`); }} /></Bp>
    </>
  );
}

function SlotGrid({ items, sel, onSel, style, fs = 14.5 }: { items: string[]; sel: string | null; onSel: (v: string) => void; style?: any; fs?: number }) {
  const C = useC();
  const rows: string[][] = [];
  for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
  return (
    <View style={[{ gap: 8, paddingHorizontal: 18 }, style]}>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 8 }}>
          {r.map(t => (
            <Pressable key={t} onPress={() => onSel(t)} accessibilityRole="button" accessibilityState={{ selected: t === sel }} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: t === sel ? C.a : C.sep, backgroundColor: t === sel ? C.a : 'transparent' }}>
              <T s={fs} w={570} c={t === sel ? C.on : C.t}>{t}</T>
            </Pressable>
          ))}
          {Array.from({ length: 3 - r.length }, (_, j) => <View key={j} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

function Cancel({ p }: SP) {
  const C = useC();
  const n = p.n || 'Kişi', f = first(n);
  const [pay, setPay] = useState('Derse aktar');
  const ask = () =>
    openAction('Ders iptal edilsin mi?', `${f}'e bildirim gider. Bu işlem geri alınamaz.`, 'Dersi iptal et', true, () => {
      if (p.lk) set(s => ({ cancelled: [...s.cancelled, p.lk] }));
      go('cancelled', 'rep', { n, big: p.big });
    });
  return (
    <>
      <NavB title="Dersi iptal et" />
      <Body>
        <View style={{ marginTop: 6, marginHorizontal: 18, marginBottom: 2, borderRadius: 18, backgroundColor: C.red8, paddingVertical: 14, paddingHorizontal: 16 }}>
          <T s={12} w={570} c={C.red}>İptal edilecek ders</T>
          <T s={20} w={600} style={{ marginTop: 2 }}>{p.when || 'Çar 10 Eyl · 09:00'}</T>
          <T s={13} c={C.t2} style={{ marginTop: 1 }}>{n} · {p.ty || 'Bireysel · 60 dk'}</T>
        </View>
        <Sdiv />
        <Sec ic="help" t="İptal sebebi" />
        <Chips items={['Ben iptal ediyorum', 'Kişi gelemiyor', 'Hava / mekân', 'Diğer']} cols={2} />
        <Sdiv />
        <Sec ic="chat" t={`${f}'e mesaj`} sub="Bildirimle birlikte gider" />
        <Fld area ph="Örn. bu haftayı cumaya alalım mı?" style={{ paddingBottom: 0 }} />
        <Sdiv />
        <Sec ic="payments" t="Ödeme" sub="₺750 alındı" right={<VBtn v={pay} onPress={() => pick('Ödeme', ['İade et', 'Derse aktar', 'İade etme'], pay, setPay)} />} />
        <Sdiv />
        <Sec ic="undo" t="Paket hakkı geri verilsin" sub="Ders paketten düşmez" right={<Tog init />} />
        <View style={{ height: 20 }} />
      </Body>
      <Foot line={false}><Btn k="dsoft" t="Dersi iptal et" onPress={ask} style={{ marginBottom: 0 }} /></Foot>
    </>
  );
}

function Cancelled({ p }: SP) {
  const C = useC();
  const n = p.n || 'Kişi', f = first(n);
  const again = <Btn pair k="o" t="Yeni saat öner" onPress={() => go('reschedule', 'rep', { n })} />;
  if (p.k)
    return (
      <DoneS ic="event_busy" red bk={!!p.nb} onClose={home} top={`${n} · dersi iptal etti`} big="8 Eyl · 19:00" sub="Ücretsiz iptal süresi içinde iptal etti." rows={[['Sebep', 'Hastalık'], ['Ödeme', 'Alınmamıştı'], ['Paket hakkı', 'Geri verildi'], ['Saat', 'Yeniden müsait', C.a]]}>
        {again}
        <Btn pair t="Tamam" onPress={p.nb ? pop : home} />
      </DoneS>
    );
  return (
    <DoneS ic="event_busy" red onClose={home} top={`${n} · ders iptal edildi`} big={p.big || '10 Eyl · 09:00'} sub={`Takvimden kaldırıldı, ${f}'e bildirim gitti.`} rows={[['Ödeme', 'Derse aktarıldı'], ['Paket hakkı', 'Geri verildi'], ['Seri', 'Diğer 8 ders duruyor'], ['Saat', 'Yeniden müsait', C.a]]}>
      {again}
      <Btn pair t="Tamam" onPress={home} />
    </DoneS>
  );
}

/* ================= rezervasyon talebi ================= */
function Request({ p }: SP) {
  const C = useC();
  const x = person(p.c ? 7 : 6), f = first(x.name);
  const [alt, setAlt] = useState<string | null>(null);
  const toRes = () => go('reschedule', undefined, { n: x.name });
  return (
    <>
      <NavB title="Rezervasyon talebi" />
      <Body>
        <View style={{ marginTop: 6, marginHorizontal: 18, marginBottom: 2, borderRadius: 18, backgroundColor: C.pbg, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Av ini={x.ini} ci={x.ci} s={40} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T s={15} w={600}>{x.name}</T>
              <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>{p.c ? 'Tam zamanlı üyelik' : 'Tek ders · 3 ders geçmişi'}</T>
            </View>
            <T s={12} w={570} c={C.a} style={{ alignSelf: 'flex-start', marginTop: 2 }}>22 sa kaldı</T>
          </View>
          <T s={26} w={600} ls={-0.02} c={C.a} style={{ marginTop: 14 }}>{p.c ? '10 Eyl Çar · 11:30' : '12 Eyl Cum · 18:00'}</T>
          <T s={13} c={C.t2} style={{ marginTop: 2 }}>Bireysel · 60 dk · Kadıköy stüdyo</T>
        </View>
        {p.c ? (
          <>
            <Sec ic="event_busy" t="Bu saatte başka dersin var" sub="Mert Kaya · Grup dersi · 11:30 – 13:00" />
            <Sdiv />
            <Sec ic="event_available" t="Başka saat öner" sub="En yakın müsait saatlerin" onPress={toRes} right={<Icon n="chevron_right" s={20} c={C.a} />} />
            <SlotGrid items={['11 Eyl 14:00', '11 Eyl 15:10', '12 Eyl 10:00']} sel={alt} onSel={t => setAlt(alt === t ? null : t)} fs={13.5} style={{ paddingTop: 4, paddingBottom: 4 }} />
            <Sdiv />
          </>
        ) : null}
        <Sec ic="payments" t="Ücret" sub={p.c ? 'Üyelik kapsamında' : 'Ön ödeme alındı'} right={<T s={15} w={600}>{p.c ? 'Üyelik' : '₺750'}</T>} style={{ paddingTop: 22, paddingBottom: 0 }} />
        <Sdiv />
        <Sec ic="chat_bubble" t="Kişinin notu" />
        <T s={14} lh={1.5} style={{ marginHorizontal: 18 }}>Sınavım var, mümkünse konu tekrarına ağırlık verebilir miyiz?</T>
        {p.c ? null : (
          <>
            <Sdiv />
            <Sec ic="schedule" t="Başka saat öner" sub={`${f}'e farklı bir saat gönder`} onPress={toRes} right={<Icon n="chevron_right" s={20} c={C.a} />} />
          </>
        )}
        <View style={{ height: 16 }} />
      </Body>
      <Bp>
        <Btn pair k="dline" t="Reddet" onPress={() => openAction('Talep reddedilsin mi?', 'Kişiye nazik bir ret bildirimi gider, ön ödeme iade edilir.', 'Talebi reddet', true, () => go('requestRejected', 'rep', { n: x.name, c: p.c ? 1 : 0 }))} />
        <Btn pair t={alt ? 'Bu saati öner' : p.c ? 'Yine de onayla' : 'Onayla'} onPress={() => (alt ? toast('Karşı teklif gönderildi') : go('requestAccepted', 'rep', { n: x.name, c: p.c ? 1 : 0 }))} />
      </Bp>
    </>
  );
}

function RequestAccepted({ p }: SP) {
  const C = useC();
  const n = p.n || 'Kişi';
  return (
    <DoneS ic="check" onClose={home} top={`${n} · rezervasyon onaylandı`} big={p.c ? '10 Eyl · 11:30' : '12 Eyl · 18:00'} sub={`Takvimine eklendi, ${first(n)}'a bildirim gitti.`} rows={[['Ders', 'Bireysel · 60 dk'], ['Yer', 'Kadıköy stüdyo'], ['Ücret', p.c ? 'Üyelik' : '₺750 ön ödeme alındı'], ['Takvim', p.c ? '11:30 – 12:30 dolu' : '18:00 – 19:00 dolu', C.a]]}>
      <Btn pair k="o" t="Takvimde gör" onPress={home} />
      <Btn pair t="Tamam" onPress={home} />
    </DoneS>
  );
}
function RequestRejected({ p }: SP) {
  const C = useC();
  const n = p.n || 'Kişi';
  return (
    <DoneS ic="close" red top={`${n} · talep reddedildi`} big={p.c ? '10 Eyl · 11:30' : '12 Eyl · 18:00'} sub={`${first(n)}'a nazik bir ret bildirimi gitti.`} rows={[['Ders', 'Bireysel · 60 dk'], ['Ücret', p.c ? 'Üyelik · ücret yok' : '₺750 iade edildi'], ['Saat', p.c ? 'Grup dersinde kaldı' : 'Müsait kaldı', C.a]]}>
      <Btn pair k="o" t="Başka saat öner" onPress={() => go('reschedule', 'rep', { n })} />
      <Btn pair t="Tamam" onPress={pop} />
    </DoneS>
  );
}
function RsAccepted({ p }: SP) {
  const C = useC();
  const n = p.n || 'Kişi';
  return (
    <DoneS ic="event_available" bk top={`${n} · yeni saati onayladı`} big="12 Eyl · 18:00" sub="Ders yeni saatine taşındı." rows={[['Eski saat', '10 Eyl · 09:00', C.t3, true], ['Yeni saat', '12 Eyl · 18:00', C.a], ['Ders', 'Bireysel · 60 dk'], ['Yer', 'Kadıköy stüdyo']]}>
      <Btn pair k="o" t="Takvimde gör" onPress={home} />
      <Btn pair t="Tamam" onPress={pop} />
    </DoneS>
  );
}

/* ================= kişi ================= */
function Contact({ p }: SP) {
  const C = useC();
  useStore(s => s.people);
  const x = person(p.i || 0), debt = x.tag[0] === 'red', k = x.id % 20;
  const [tab, setTab] = useState(0);
  const [show, setShow] = useState(false);
  const tp = (['b', 'g', 'o', 'd'] as const)[k % 4], tn = C.ty[tp][3], bar = C.ty[tp][1];
  const stat = { flex: 1, backgroundColor: C.fill, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 } as const;
  const reach = () => openMenu(x.name, [
    { icon: 'call', label: 'Ara', onPress: () => toastLater('Aranıyor…', 200) },
    { icon: 'chat', label: "WhatsApp'tan yaz", onPress: () => toastLater('WhatsApp açılıyor', 200) },
    { icon: 'content_copy', label: 'Numarayı kopyala', onPress: () => toastLater('Numara kopyalandı', 200) },
  ]);
  const newL = () => openSheet('newLesson', { n: x.name });
  return (
    <>
      <NavB right={<Cbtn ic="edit" label="Düzenle" onPress={() => openSheet('editContact', { i: x.id })} />} />
      <Body>
        <Tap onPress={reach} style={{ alignItems: 'center', paddingHorizontal: 18, paddingBottom: 16 }}>
          <Av ini={x.ini} ci={x.ci} s={54} />
          <T s={19} w={600} ls={-0.02} style={{ marginTop: 8 }}>{x.name}</T>
          <T s={13} w={500} c={C.a} style={{ marginTop: 1 }}>+90 532 {String(10 + k * 7).padStart(2, '0')} {40 + k} {String(k * 3).padStart(2, '0')}</T>
        </Tap>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 18 }}>
          <View style={stat}>
            <T s={24} w={600} ls={-0.02} c={C.a}>12</T>
            <T s={11.5} c={C.t2}>toplam ders</T>
          </View>
          <Tap onPress={() => setShow(!show)} label="Bekleyen tutarı göster" style={[stat, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <T s={24} w={600} ls={-0.02} c={show && debt ? C.red : C.a}>{show ? (debt ? '₺1.500' : '₺0') : '***'}</T>
              <T s={11.5} c={C.t2}>bekleyen</T>
            </View>
            <Icon n={show ? 'visibility_off' : 'visibility'} s={20} f={0} c={C.a} />
          </Tap>
        </View>
        {x.tag[1] === 'PAKET' ? (
          <View style={{ marginTop: 8, marginHorizontal: 18, borderRadius: 16, backgroundColor: C.pbg, paddingTop: 9, paddingHorizontal: 14, paddingBottom: 11 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <T s={26} w={600} ls={-0.02} c={C.a}>2</T>
                <T s={14} w={570} c={C.a} style={{ marginLeft: 6 }}>ders kaldı</T>
              </View>
              <Tap onPress={newL} hit={8}><T s={14} w={570} c={C.a}>Yenile</T></Tap>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, height: 6, marginTop: 7 }}>
              {Array.from({ length: 8 }, (_, j) => <View key={j} style={{ flex: 1, borderRadius: 3, backgroundColor: j >= 6 ? C.a : C.a12 }} />)}
            </View>
          </View>
        ) : null}
        <View style={{ height: 16 }} />
        <Seg items={['Geçmiş', 'Gelecek']} sel={tab} onSel={setTab} />
        {tab === 0 ? (
          <>
            <Sh t="Eylül" />
            <Lbox d="3 Eylül · 09:00" t={`${tn} · 60 dk`} bar={bar} v="₺750" vC={debt ? C.red : undefined} />
            <Sh t="Ağustos" />
            <Lbox d="27 Ağustos · 09:00" t={`${tn} · 60 dk`} bar={bar} v="₺750" vC={debt ? C.red : undefined} />
            <Lbox d="20 Ağustos · 09:00" t={`${tn} · 60 dk`} bar={bar} v="₺750" />
            <Lbox d="13 Ağustos · 09:00" t="Deneme dersi · 45 dk" bar={C.ty.d[1]} v="Ücretsiz" vC={C.t3} />
          </>
        ) : (
          <>
            <Sh t="Bu hafta" />
            <Lbox d="17 Eylül · 09:00 · Yarın" t={`${tn} · 60 dk`} bar={bar} v="₺750" />
            <Lbox d="20 Eylül · 11:00" t={`Onay bekliyor · ${tn} · 60 dk`} bar={bar} v="₺750" vC={C.t2} />
            <Sh t="Önümüzdeki hafta" />
            <Lbox d="24 Eylül · 09:00" t={`${tn} · 60 dk · haftalık`} bar={bar} v="₺750" />
            <Lbox d="27 Eylül · 11:00" t={`${tn} · 90 dk`} bar={bar} v="₺1.125" />
          </>
        )}
      </Body>
      <Bp>
        <Btn pair k="o" ic="folder" t="Dokümanlar" onPress={() => go('docs', undefined, { i: x.id })} />
        <Btn pair t="Ders ekle" onPress={newL} />
      </Bp>
    </>
  );
}

function Docs({ p }: SP) {
  const C = useC();
  const emp = useStore(s => s.emp);
  const x = person(p.i || 0);
  const dr = (ic: string, col: string, t: string, sub: string) => (
    <GRow left={<View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: col + '1A', alignItems: 'center', justifyContent: 'center' }}><Icon n={ic} s={19} c={col} /></View>} t={t} sub={sub} right={<Icon n="chevron_right" s={20} f={0} c={C.a} />} onPress={() => toast('Dosya açılıyor')} />
  );
  const add = () => pick('Ekle', ['Dosya seç', 'Fotoğraf çek', 'Fotoğraflardan seç', 'Not yaz'], '', v => toastLater(v, 200));
  return (
    <>
      <NavB
        mid={
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <T s={19} w={600} ls={-0.01} c={C.a} numberOfLines={1}>{x.name}</T>
            <T s={11.5} c={C.t3} style={{ marginTop: 2 }}>Dokümanlar</T>
          </View>
        }
        right={<Cbtn ic="add" label="Doküman ekle" onPress={add} />}
      />
      <Body>
        <View style={{ height: 4 }} />
        {emp ? (
          <Empt ic="folder" t="Henüz doküman yok" sub={`${first(x.name)} ile ilgili dosyalar ve notlar burada toplanır.`}>
            <Btn t="Doküman ekle" h={44} fs={15} onPress={add} style={{ marginHorizontal: 0, marginBottom: 0 }} />
          </Empt>
        ) : (
          <>
            <Sec ic="description" t="Dosyalar" sub="Paylaştığın ve yüklediğin belgeler" />
            <GBox>
              {dr('picture_as_pdf', '#D6453D', 'Beslenme programı.pdf', '1,2 MB · 28 Ağu')}
              {dr('image', '#2F4BD1', 'Ölçüm sonuçları.jpg', '840 KB · 20 Ağu')}
              {dr('draw', '#8A3FD1', 'Onam formu.pdf', 'İmzalı · 13 Ağu')}
            </GBox>
            <Sdiv />
            <Sec ic="edit_note" t="Ders notları" sub="Derslerden sonra aldığın notlar" />
            <GBox>
              {dr('sticky_note_2', '#F07A1A', '3 Eylül dersi', 'Konu tekrarı yapıldı, ödev verildi')}
              {dr('sticky_note_2', '#F07A1A', '27 Ağustos dersi', 'Hedefler belirlendi')}
            </GBox>
            <View style={{ height: 24 }} />
          </>
        )}
      </Body>
    </>
  );
}

/* ================= ödeme ================= */
function Payment({ p }: SP) {
  const C = useC();
  const x = person(p.i ?? 1);
  const [sel, setSel] = useState([true, true]);
  const LS = [['27 Ağustos · 09:00', 'Bireysel · 60 dk'], ['3 Eylül · 09:00', 'Bireysel · 60 dk']];
  return (
    <>
      <NavB title="Ödeme al" />
      <Body>
        <View style={{ alignItems: 'center', paddingTop: 14, paddingHorizontal: 18, paddingBottom: 4 }}>
          <Av ini={x.ini} ci={x.ci} s={40} />
          <T s={13} c={C.t2} style={{ marginTop: 8 }}>{x.name} · 2 ders</T>
          <T s={32} w={600} ls={-0.03} lh={1.1} style={{ marginTop: 2 }}>₺1.500</T>
          <View style={{ marginTop: 10, paddingVertical: 4, paddingHorizontal: 11, borderRadius: 99, backgroundColor: C.redSoft }}><T s={12} w={570} c={C.red}>6 gün gecikmiş</T></View>
        </View>
        <Sdiv />
        <Sec ic="event_note" t="Dersler" sub="Ödenecek dersleri seç" />
        {LS.map((l, i) => (
          <Lbox key={i} d={l[0]} t={l[1]} bar={C.ty.b[1]} v="₺750" right={<Check on={sel[i]} />} onPress={() => setSel(sel.map((v, j) => (j === i ? !v : v)))} />
        ))}
        <Sdiv />
        <Sec ic="payments" t="Ödeme yöntemi" />
        <Tiles items={[['payments', 'Nakit'], ['account_balance', 'Havale'], ['credit_card', 'Kart']]} init={1} />
        <Sdiv />
        <Sec ic="edit" t="Alınan tutar" sub="Kısmi ödeme için değiştir" />
        <Fld v="₺ 1.500" accessibilityLabel="Tutar" style={{ paddingBottom: 0 }} />
        <Sdiv />
        <Sec ic="receipt_long" t="Makbuz gönder" sub="WhatsApp ile PDF" right={<Tog init />} />
        <View style={{ height: 20 }} />
      </Body>
      <Bp><Btn pair t="₺1.500 tahsil et" onPress={() => go('paymentDone', 'rep', { n: x.name })} /></Bp>
    </>
  );
}

function PaymentDone({ p }: SP) {
  const C = useC();
  return (
    <DoneS ic="check" icS={34} top={`${p.n || 'Kişi'} · ödeme alındı`} big="₺1.500" sub="Borç kapandı, kişi kartı güncellendi." rows={[['Yöntem', 'Havale / EFT'], ['Dersler', '27 Ağu, 3 Eyl'], ['Tarih', '10 Eyl · 14:32'], ['Makbuz', 'WhatsApp ile gönderildi', C.a]]}>
      <Btn pair k="o" t="Makbuzu gör" onPress={() => toast('Makbuz açılıyor')} />
      <Btn pair t="Tamam" onPress={pop} />
    </DoneS>
  );
}

function Payments() {
  const C = useC();
  const emp = useStore(s => s.emp);
  const [tab, setTab] = useState(0);
  const it = (ini: string, c: number, n: string, sub: string, v: string, red?: boolean, i?: number) => (
    <Row av={[ini, c, 36]} t={n} s={sub} sC={red ? C.red : undefined} x={<T s={15} w={600} c={red ? C.red : C.t}>{v}</T>} onPress={red ? () => go('payment', undefined, { i }) : undefined} />
  );
  return (
    <>
      <NavB title="Ödemeler" right={<Cbtn ic="add" label="Ödeme kaydet" onPress={() => go('payment', undefined, { i: 1 })} />} />
      <Body>
        <View style={{ alignItems: 'center', paddingTop: 2, paddingHorizontal: 18, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Tap onPress={() => toast('Ağustos')} hit={8} label="Önceki ay"><Icon n="chevron_left" s={20} f={0} c={C.t2} /></Tap>
            <T s={13} w={500} c={C.t2}>Eylül 2026</T>
            <Tap onPress={() => toast('Ekim')} hit={8} label="Sonraki ay"><Icon n="chevron_right" s={20} f={0} c={C.t2} /></Tap>
          </View>
          <T s={34} w={600} ls={-0.03} style={{ marginTop: 2 }}>{emp ? '₺0' : '₺12.400'}</T>
          {emp ? <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>bu ay tahsilat yok</T> : <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>tahsil edildi · <T s={12.5} w={570} c={C.red}>₺2.250 bekliyor</T></T>}
        </View>
        <Seg items={emp ? ['Ödenmemiş', 'Tahsil edilen'] : ['Ödenmemiş · 2', 'Tahsil edilen · 4']} sel={tab} onSel={setTab} />
        {emp ? (
          tab === 0 ? <Empt ic="task_alt" t="Ödenmemiş ders yok" sub="Ödemesi alınmamış dersler burada listelenir." /> : <Empt ic="receipt_long" t="Bu ay tahsilat yok" sub="Aldığın ödemeler tarihe göre burada görünür." />
        ) : tab === 0 ? (
          <>
            <View style={{ height: 6 }} />
            <Rows>
              {it('MK', 1, 'Mert Kaya', '2 ders · 6 gün gecikti', '₺1.500', true, 1)}
              {it('BŞ', 2, 'Burak Şahin', '1 ders · vadesi yarın', '₺750', true, 6)}
            </Rows>
          </>
        ) : (
          <>
            <Sh t="10 Eylül" /><Rows>{it('ZA', 3, 'Zeynep Aydın', 'Havale · aylık üyelik', '₺5.400')}</Rows>
            <Sh t="8 Eylül" /><Rows>{it('EY', 0, 'Elif Yıldırım', 'Nakit · 4 ders', '₺3.000')}</Rows>
            <Sh t="5 Eylül" /><Rows>{it('CÖ', 0, 'Can Öztürk', 'Havale · 8 derslik paket', '₺2.500')}</Rows>
            <Sh t="3 Eylül" /><Rows>{it('DA', 2, 'Deniz Arslan', 'Kart · 2 ders', '₺1.500')}</Rows>
          </>
        )}
      </Body>
    </>
  );
}

/* ================= paylaş ================= */
function Share() {
  const C = useC();
  return (
    <>
      <NavB title="Profilini paylaş" />
      <Body>
        <View style={{ marginTop: 10, marginHorizontal: 18, paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center' }}>
          <Av ini="DA" ci={2} s={52} />
          <T s={18} w={600} ls={-0.01} style={{ marginTop: 10 }}>Deniz Arslan</T>
          <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>Özel ders · İstanbul</T>
          <View style={{ marginTop: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: C.sep, padding: 12, borderRadius: 16 }}><QR s={176} /></View>
          <Tap onPress={() => toast('Bağlantı kopyalandı')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: C.sep }}>
            <T s={13.5} w={570} c={C.a}>pro.app/deniz-arslan</T>
            <Icon n="content_copy" s={16} c={C.a} />
          </Tap>
        </View>
        <T s={12.5} c={C.t2} lh={1.45} style={{ textAlign: 'center', paddingTop: 14, paddingHorizontal: 34 }}>Kişiler bu kodu okutup müsait saatlerini görür ve rezervasyon yapar.</T>
      </Body>
      <Bp>
        <Btn pair k="o" ic="nfc" t="NFC" onPress={() => toast('Telefonu yaklaştır')} />
        <Btn pair ic="ios_share" t="Paylaş" onPress={() => toast('Paylaşım menüsü')} />
      </Bp>
    </>
  );
}

/* ================= ayarlar ================= */
function CalendarPrefs() {
  const C = useC();
  const emp = useStore(s => s.emp);
  const H = ['10:00 – 18:00', '10:00 – 18:00', '10:00 – 18:00', '10:00 – 18:00', '10:00 – 18:00', '10:00 – 14:00', null];
  const br = (n: string, t: string, d: string) => <Lbox d={n} t={`${t} · ${d}`} right={<Arrow />} onPress={() => openSheet('breakNew')} />;
  return (
    <>
      <NavB title="Takvim ayarlarım" />
      <Body>
        <Sec ic="schedule" t="Çalışma saatleri" sub="Her gün için varsayılan. Günlere özel ayar aşağıda." />
        <Two><Fld bare label="Başlangıç" v="10:00" /><Fld bare label="Bitiş" v="18:00" /></Two>
        <Sdiv />
        <Sec ic="snooze" t="Düzenli molalar" sub="Her hafta tekrar eder" right={<Cbtn sm ic="add" label="Mola ekle" onPress={() => openSheet('breakNew')} />} />
        {emp ? <Emps t="Düzenli mola yok. + ile ekleyebilirsin." /> : <>{br('Öğle molası', '12:30 – 13:30', 'Pzt – Cmt')}{br('Akşam arası', '17:00 – 17:30', 'Sal, Per')}</>}
        <Sdiv />
        <Sec ic="calendar_month" t="Günler" sub="Özel ayar için güne dokun" />
        <View style={{ marginHorizontal: 18, borderWidth: 1, borderColor: C.sep, borderRadius: 13, overflow: 'hidden' }}>
          {DN.map((g, i) => (
            <Tap key={i} fx="bg" onPress={() => go('dayRule', undefined, { g: i })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderTopWidth: i ? HL : 0, borderTopColor: C.sep, backgroundColor: i === 5 ? C.pbg : undefined }}>
              <T s={14} w={570} c={H[i] ? C.t : C.t3} style={{ width: 52 }}>{g}</T>
              <View style={{ flex: 1, minWidth: 0 }}>
                <T s={14} c={H[i] ? C.t2 : C.t3}>{H[i] || 'Kapalı'}</T>
                {i === 5 ? <T s={12} c={C.a} lh={1.35} style={{ marginTop: 2 }}>10 geçe başlar · akşam arası yok</T> : null}
              </View>
              <Arrow />
            </Tap>
          ))}
        </View>
        <Sdiv />
        <Sec ic="beach_access" t="İzin / kapalı gün" sub="Seçtiğin günlerde rezervasyon alınmaz" right={<Arrow />} onPress={() => go('timeOff')} style={{ alignItems: 'center' }} />
        <Sdiv />
        <Sec ic="sync" t="Apple Takvim senkronu" sub="Son senkron: 2 dk önce" right={<Tog init />} />
      </Body>
    </>
  );
}

function DayRule({ p }: SP) {
  const C = useC();
  const gi = p.g ?? 5, g = DL[gi], sat = gi === 5;
  const [on, setOn] = useState(gi !== 6);
  const [touched, setTouched] = useState(false);
  return (
    <>
      <NavB title={g} />
      <Body>
        <View style={{ marginTop: 8, marginHorizontal: 18, marginBottom: 6, borderRadius: 18, backgroundColor: on ? C.pbg : C.fill, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T s={17} w={600} c={on ? C.t : C.t2}>{g} {on ? 'açık' : 'kapalı'}</T>
            <T s={12.5} c={C.t2} style={{ marginTop: 2 }}>{on ? (touched ? 'Çalışma saatlerinde rezervasyon alınır' : sat ? '10:00 – 14:00 · rezervasyon alınır' : '10:00 – 18:00 · rezervasyon alınır') : 'Bu gün rezervasyon alınmaz'}</T>
          </View>
          <Tog on={on} onChange={v => { setOn(v); setTouched(true); }} />
        </View>
        {on ? (
          <>
            <Sec ic="schedule" t="Çalışma saatleri" sub="Genel saatten farklıysa değiştir" />
            <Two><Fld bare label="Başlangıç" v="10:00" /><Fld bare label="Bitiş" v={sat ? '14:00' : '18:00'} /></Two>
            <Sdiv />
            <Sec ic="snooze" t="Molalar" sub="Bu günde geçerli düzenli molalar" />
            <Obox t="Öğle molası" s="12:30 – 13:30" init style={{ marginBottom: 8, paddingVertical: 9 }} />
            <Obox t="Akşam arası" s="17:00 – 17:30" init={!sat} style={{ marginBottom: 8, paddingVertical: 9 }} />
            <Sdiv />
            <Expand ic="gavel" t="Ders kuralları" sub={sat ? 'Bu güne özel' : 'Genel kurallar geçerli'} subOn="Bu güne özel · genel ayarı ezer">
              <RulesBody win="Dersten en geç kaç saat önce" cancel="Bu süreden sonra ücret alınır" step={sat ? -1 : 0} stepCst={sat ? '10 dk' : undefined} gap={1} />
            </Expand>
          </>
        ) : null}
        <View style={{ height: 24 }} />
      </Body>
    </>
  );
}

function TimeOff() {
  const C = useC();
  const emp = useStore(s => s.emp);
  const [all, setAll] = useState(true);
  const lx = (d: string, t: string, ty: 'b' | 'o' | 'g') => <Lbox d={d} t={t} bar={C.ty[ty][1]} right={<Arrow />} onPress={() => toast('Ders detayı açılır')} />;
  return (
    <>
      <NavB title="İzin / kapalı gün" right={<Cbtn ic="check" ok label="Kaydet" onPress={() => { pop(); toastLater('İzin kaydedildi'); }} />} />
      <Body>
        <View style={{ height: 4 }} />
        <Sec ic="date_range" t="Tarih" sub="Başlangıç ve bitiş dahil" />
        <Two><Fld bare label="Başlangıç" v="15 Eyl" /><Fld bare label="Bitiş" v="18 Eyl" /></Two>
        <Sdiv />
        <Sec ic="schedule" t="Tüm gün" sub="Kapatırsan saat aralığı seçebilirsin" right={<Tog on={all} onChange={setAll} />} />
        {all ? null : <Two><Fld bare label="Saat başı" v="09:00" /><Fld bare label="Saat sonu" v="13:00" /></Two>}
        <Sdiv />
        <Sec ic="edit_note" t="Sebep" sub="Kişilere gösterilir" />
        <Chips items={['Tatil', 'Hastalık', 'Etkinlik', 'Diğer']} cols={4} />
        <Sdiv />
        {emp ? (
          <>
            <Sec ic="event_busy" t="Bu aralıktaki dersler" />
            <Emps t="Bu tarihlerde dersin yok." />
          </>
        ) : (
          <>
            <Sec ic="event_busy" t="Bu aralıktaki dersler" sub="3 ders otomatik iptal edilmez. Tek tek ertele ya da iptal et." />
            {lx('15 Eylül · 09:00', 'Elif Yıldırım · Bireysel', 'b')}
            {lx('17 Eylül · 11:00', 'Burak Şahin · Online', 'o')}
            {lx('18 Eylül · 19:00', 'Selin Demir · Grup', 'g')}
          </>
        )}
        <View style={{ height: 20 }} />
      </Body>
    </>
  );
}

function Rules() {
  const { bottom } = useFrame();
  const pad = { paddingTop: 2, paddingRight: 18, paddingBottom: 4, paddingLeft: 62 };
  return (
    <>
      <NavB title="Ders kuralları" />
      <Body>
        <Sec ic="event_available" t="Rezervasyon penceresi" sub="Kişi dersten en geç kaç saat önce rezervasyon yapabilir" />
        <Chips items={['1 sa', '2 sa', '24 sa']} init={1} cols={4} cst="sa" style={pad} />
        <Sdiv />
        <Sec ic="event_busy" t="Ücretsiz iptal süresi" sub="Bu süreden sonraki iptallerde ders ücreti alınır" />
        <Chips items={['2 sa', '4 sa', '24 sa']} init={1} cols={4} cst="sa" style={pad} />
        <Sdiv />
        <Sec ic="schedule" t="Ders başlama kademesi" sub="Kişiler dersi hangi dakikalarda başlatabilir" />
        <Chips items={['Tam saat', '15 dk', '30 dk']} init={0} cols={4} cst="dk" style={pad} />
        <Sdiv />
        <Sec ic="snooze" t="Ders arası mola" sub="Bir ders bitince sonraki derse kadar zorunlu boşluk" />
        <Chips items={['Yok', '10 dk', '15 dk']} init={2} cols={4} cst="dk" style={pad} />
      </Body>
      <Note t="Paketi olmayan dersler için geçerli. Paketlerin kendi kuralları bunu ezer." style={{ paddingTop: 10, paddingBottom: Math.max(30, bottom) }} />
    </>
  );
}

/* ---------- paket satırı: sağa çek → Temel, sola çek → Sil ---------- */
export function PkBadge({ c1, c2, on, icon }: { c1?: string; c2?: string; on?: boolean; icon?: string }) {
  const C = useC();
  return (
    <View style={{ width: 40, height: 40, borderRadius: 99, backgroundColor: on ? C.aSoft : C.fill, alignItems: 'center', justifyContent: 'center' }}>
      {icon ? <Icon n={icon} s={20} f={0} c={C.t} /> : <T s={c2 ? 14 : 13.5} w={600} c={on ? C.a : C.t} style={{ lineHeight: 15 }}>{c1}</T>}
      {c2 ? <T s={9.5} c={on ? C.a : C.t2} style={{ lineHeight: 11 }}>{c2}</T> : null}
    </View>
  );
}

function SwipeRow({ pk, onStar, onDel, onOpen }: { pk: Pkg; onStar: () => void; onDel: () => void; onOpen: () => void }) {
  const C = useC();
  const x = useSharedValue(0), base = useSharedValue(0);
  const moved = useRef(0);
  const [open, setOpen] = useState(0);
  const settle = (o: number) => { moved.current = Date.now(); setOpen(o); };
  const mark = () => { moved.current = Date.now(); };
  const spring = { duration: 300, easing: Easing.bezier(...EASE) };
  const close = () => { x.value = withTiming(0, spring); setOpen(0); };
  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-8, 8])
    .onStart(() => { base.value = x.value; runOnJS(mark)(); })
    .onUpdate(e => { let v = base.value + e.translationX; if (Math.abs(v) > 76) v = Math.sign(v) * (76 + (Math.abs(v) - 76) * 0.3); x.value = v; })
    .onEnd(() => { const o = x.value < -40 ? -1 : x.value > 40 ? 1 : 0; x.value = withTiming(o * 76, spring); runOnJS(settle)(o); });
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const la = useAnimatedStyle(() => ({ opacity: x.value > 0.5 ? 1 : 0 }));
  const ra = useAnimatedStyle(() => ({ opacity: x.value < -0.5 ? 1 : 0 }));
  const act = (left: boolean, ic: string, t: string) => (
    <Animated.View style={[left ? la : ra, { position: 'absolute', top: 0, bottom: 0, width: 76, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: left ? C.a : C.red }, left ? { left: 0 } : { right: 0 }]}>
      <Icon n={ic} s={20} c="#fff" />
      <T s={11.5} w={570} c="#fff">{t}</T>
    </Animated.View>
  );
  return (
    <View style={{ overflow: 'hidden' }}>
      {act(true, 'star', 'Temel')}
      {act(false, 'delete', 'Sil')}
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ backgroundColor: C.bg }, st]}>
          <Pressable onPress={() => { if (Date.now() - moved.current < 350) return; if (open) close(); else onOpen(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12 }}>
            <PkBadge c1={pk.c1} c2={pk.c2} on={pk.base} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T s={15} w={570}>{pk.name}</T>
              <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>{pk.sub}</T>
            </View>
            <T s={15} w={600}>{pk.price}</T>
          </Pressable>
        </Animated.View>
      </GestureDetector>
      {open ? (
        <Pressable onPress={() => { close(); (open > 0 ? onStar : onDel)(); }} accessibilityRole="button" accessibilityLabel={open > 0 ? 'Temel' : 'Sil'} style={[{ position: 'absolute', top: 0, bottom: 0, width: 76 }, open > 0 ? { left: 0 } : { right: 0 }]} />
      ) : null}
    </View>
  );
}

function Pricing() {
  const emp = useStore(s => s.emp);
  const pkgs = useStore(s => s.packages);
  const star = (id: number) => { set(s => ({ packages: s.packages.map(p => ({ ...p, base: p.id === id })) })); toast('Temel paket güncellendi'); };
  const del = (pk: Pkg) => {
    const prev = pkgs;
    set(s => ({ packages: s.packages.filter(p => p.id !== pk.id) }));
    toast(`${pk.name} silindi`, 'Geri al', () => set({ packages: prev }));
  };
  const list = (kind: Pkg['kind']) => {
    const l = pkgs.filter(p => p.kind === kind);
    return l.length ? <GBox>{l.map(pk => <SwipeRow key={pk.id} pk={pk} onStar={() => star(pk.id)} onDel={() => del(pk)} onOpen={() => openSheet(kind === 'single' ? 'packageSingle' : 'packageMulti')} />)}</GBox> : <Emps t="Bu türde paket yok. + ile ekleyebilirsin." />;
  };
  return (
    <>
      <NavB title="Paket tercihleri" right={<Cbtn ic="add" label="Paket ekle" onPress={() => openSheet('packageSingle')} />} />
      <Body>
        {emp ? (
          <Empt ic="sell" t="Henüz paket yok" sub="Tek ders ya da çoklu paket oluştur. Ders eklerken ücret otomatik gelsin.">
            <Btn t="Paket oluştur" h={44} fs={15} onPress={() => openSheet('packageSingle')} style={{ marginHorizontal: 0, marginBottom: 0 }} />
          </Empt>
        ) : (
          <>
            <Sec ic="person" t="Tekil ders" sub="Tek seanslık dersler" />
            {list('single')}
            <Sdiv />
            <Sec ic="stacks" t="Çoklu paket" sub="Birden fazla seans, tek ödeme" />
            {list('multi')}
          </>
        )}
      </Body>
    </>
  );
}

function NotifPrefs() {
  const [quiet, setQuiet] = useState(true);
  const [v, setV] = useState({ rem: '1 sa önce', mail: 'Haftalık', sms: 'Kapalı' });
  const vb = (k: keyof typeof v, title: string, opts: string[]) => <VBtn v={v[k]} onPress={() => pick(title, opts, v[k], x => setV({ ...v, [k]: x }))} />;
  return (
    <>
      <NavB title="Bildirim ayarları" />
      <Body>
        <Sec ic="notifications" t="Anlık bildirimler" sub="Hangi durumda haber verilsin" />
        <GBox>
          <GRow t="Rezervasyon talebi" right={<Tog init />} />
          <GRow t="Ödeme hareketi" right={<Tog init />} />
          <GRow t="İptal ve erteleme" right={<Tog init />} />
          <GRow t="Ders hatırlatması" right={vb('rem', 'Ders hatırlatması', ['Kapalı', '15 dk önce', '1 sa önce', '1 gün önce'])} />
        </GBox>
        <Sdiv />
        <Sec ic="bedtime" t="Sessiz saatler" sub="Bu aralıkta sadece iptaller gelir" right={<Tog on={quiet} onChange={setQuiet} />} />
        <View pointerEvents={quiet ? 'auto' : 'none'} style={{ opacity: quiet ? 1 : 0.35 }}>
          <Two><Fld bare label="Başlangıç" v="22:00" /><Fld bare label="Bitiş" v="08:00" /></Two>
        </View>
        <Sdiv />
        <Sec ic="mail" t="Diğer kanallar" />
        <GBox>
          <GRow t="E-posta özeti" right={vb('mail', 'E-posta özeti', ['Kapalı', 'Günlük', 'Haftalık'])} />
          <GRow t="SMS hatırlatma" sub="Kişilere ders öncesi" right={vb('sms', 'SMS hatırlatma', ['Kapalı', '1 sa önce', '1 gün önce'])} />
        </GBox>
        <View style={{ height: 24 }} />
      </Body>
    </>
  );
}

function Help() {
  return (
    <>
      <NavB title="Yardım ve destek" />
      <Body>
        <Note t="Ortalama yanıt süresi 4 saat." />
        <Rows>
          <Row ic="forum" t="Destek ekibine yaz" s="Uygulama içi mesaj" chev onPress={() => toast('Destek sohbeti açılıyor')} />
          <Row ic="chat" t="WhatsApp'tan sor" s="Hafta içi 09:00 – 19:00" chev onPress={() => toast('WhatsApp açılıyor')} />
        </Rows>
        <Sh t="Sık sorulanlar" />
        <Rows>
          {['Her kişiye farklı fiyat nasıl veririm?', 'Fiyatı güncellersem kişilere bildirim gider mi?', 'İptal kurallarını nasıl değiştiririm?', 'Ödemeyi elle kaydetmek nasıl çalışır?'].map(q => <Row key={q} t={q} chev onPress={() => toast('Yanıt açılıyor')} />)}
        </Rows>
        <Sh t="" />
        <Rows>
          <Row ic="info" t="Uygulama sürümü" v="2.4.1" />
          <Row ic="description" t="Kullanım koşulları" chev onPress={() => toast('Açılıyor')} />
        </Rows>
      </Body>
    </>
  );
}

function DeleteAccount() {
  const C = useC();
  const emp = useStore(s => s.emp);
  const [v, setV] = useState('');
  const [foc, setFoc] = useState(false);
  const ok = ['SİL', 'SIL'].includes(v.trim().toLocaleUpperCase('tr'));
  const cell = (b: string, s: string, i: number) => (
    <View key={i} style={{ flex: 1, paddingVertical: 11, paddingHorizontal: 12, borderLeftWidth: i ? HL : 0, borderLeftColor: C.sep }}>
      <T s={17} w={600} ls={-0.01} numberOfLines={1}>{b}</T>
      <T s={12} c={C.t2} style={{ marginTop: 1 }}>{s}</T>
    </View>
  );
  return (
    <>
      <NavB title="Hesabı sil" />
      <Body>
        <View style={{ height: 4 }} />
        <Sec ic="inventory_2" t="Silinecekler" sub="Tüm kayıtların kalıcı olarak silinir" />
        <View style={{ flexDirection: 'row', marginHorizontal: 18, borderWidth: 1, borderColor: C.sep, borderRadius: 14 }}>
          {(emp ? [['0', 'kişi'], ['0', 'ders kaydı'], ['₺0', 'ödeme kaydı']] : [['8', 'kişi'], ['246', 'ders kaydı'], ['₺148.200', 'ödeme kaydı']]).map((x, i) => cell(x[0], x[1], i))}
        </View>
        {emp ? null : (
          <>
            <Sdiv />
            <Sec ic="checklist" t="Önce çözülmesi gerekenler" />
            <GBox>
              <GRow tNode={<T s={14.5} w={500}><T s={14.5} w={500} c={C.red}>₺1.500</T> bekleyen tahsilat</T>} sub="Mert Kaya" right={<Icon n="chevron_right" s={20} c={C.a} />} onPress={() => go('payment', undefined, { i: 1 })} />
              <GRow t="4 planlı ders iptal edilecek" sub="Kişilere bildirilir" />
            </GBox>
          </>
        )}
        <Sdiv />
        <Sec ic="keyboard" t="Onaylamak için SİL yaz" />
        <View style={{ paddingHorizontal: 18 }}>
          <TextInput value={v} onChangeText={setV} placeholder="SİL" placeholderTextColor={C.t3} autoCapitalize="characters" autoCorrect={false} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} selectionColor={C.red} style={[{ height: 46, borderWidth: 1, borderColor: foc ? C.red35 : C.sep, borderRadius: 13, paddingHorizontal: 14, fontFamily: ff(570), fontSize: 15, color: C.red, letterSpacing: 0.6 }, noOutline]} />
        </View>
      </Body>
      <T s={12.5} c={C.t3} style={{ textAlign: 'center', paddingTop: 10, paddingHorizontal: 24, paddingBottom: 12 }}>30 gün içinde giriş yaparsan silme iptal edilir.</T>
      <Bp line={false}><Btn pair k="dsoft" t="Hesabımı sil" off={!ok} onPress={() => go('login', 'rep')} /></Bp>
    </>
  );
}

/* ================= giriş / kaydol ================= */
function LgHead({ t, sub, pt = 36 }: { t: string; sub: string; pt?: number }) {
  const C = useC();
  return (
    <View style={{ alignItems: 'flex-start', paddingTop: pt, paddingHorizontal: 18, paddingBottom: 26 }}>
      <View style={{ width: 52, height: 52, borderRadius: 15, backgroundColor: C.a, alignItems: 'center', justifyContent: 'center' }}><T s={20} w={700} ls={-0.04} c={C.on}>Pro</T></View>
      <T s={26} w={600} ls={-0.02} style={{ marginTop: 18 }}>{t}</T>
      <T s={14} c={C.t2} style={{ marginTop: 3 }}>{sub}</T>
    </View>
  );
}
const LgLabel = ({ t, first: f }: { t: string; first?: boolean }) => {
  const C = useC();
  return <T s={12.5} w={500} c={C.t2} style={{ marginTop: f ? 0 : 12, marginBottom: 5 }}>{t}</T>;
};
function Or() {
  const C = useC();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, marginHorizontal: 18, marginBottom: 14 }}>
      <View style={{ flex: 1, height: HL, backgroundColor: C.sep }} />
      <T s={12.5} c={C.t3}>veya</T>
      <View style={{ flex: 1, height: HL, backgroundColor: C.sep }} />
    </View>
  );
}

function Login() {
  const C = useC();
  const { bottom } = useFrame();
  const [hide, setHide] = useState(true);
  return (
    <>
      <View style={{ height: 40 }} />
      <Body>
        <LgHead t="Tekrar hoş geldin" sub="Takvimin ve kişilerin seni bekliyor." />
        <View style={{ paddingHorizontal: 18, paddingBottom: 16 }}>
          <LgLabel t="E-posta" first />
          <Inp v="deniz@ornek.com" keyboardType="email-address" autoCapitalize="none" />
          <LgLabel t="Şifre" />
          <View>
            <Inp v="sifre1234" secureTextEntry={hide} style={{ paddingRight: 44 }} />
            <Tap onPress={() => setHide(!hide)} label="Şifreyi göster" style={{ position: 'absolute', right: 12, top: 0, height: 44, justifyContent: 'center' }}><Icon n={hide ? 'visibility' : 'visibility_off'} s={20} c={C.t3} /></Tap>
          </View>
          <Tap onPress={() => toast('Sıfırlama bağlantısı gönderildi')} style={{ alignSelf: 'flex-end', marginTop: 10 }}><T s={13} w={570} c={C.a}>Şifremi unuttum</T></Tap>
        </View>
        <Btn t="Giriş yap" onPress={home} />
        <Or />
        <Btn k="o" t="Apple ile devam et" left={<Apple c={C.t} />} onPress={home} />
      </Body>
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10, paddingBottom: Math.max(34, bottom) }}>
        <T s={14} c={C.t2}>Hesabın yok mu? </T>
        <Tap onPress={() => go('signup')} hit={10}><T s={14} w={570} c={C.a}>Kaydol</T></Tap>
      </View>
    </>
  );
}

function Signup() {
  const C = useC();
  const { bottom } = useFrame();
  return (
    <>
      <View style={{ height: 40 }} />
      <Body>
        <LgHead t="Hesap oluştur" sub="Takvimini birkaç dakikada kur." pt={20} />
        <View style={{ paddingHorizontal: 18, paddingBottom: 16 }}>
          <LgLabel t="Ad soyad" first />
          <Inp ph="Deniz Arslan" />
          <LgLabel t="Şifre" />
          <Inp ph="En az 8 karakter" secureTextEntry />
          <LgLabel t="Şifre tekrar" />
          <Inp ph="Şifreni tekrar yaz" secureTextEntry />
        </View>
        <Btn t="Devam et" onPress={() => go('suMail')} />
        <Or />
        <Btn k="o" t="Apple ile kaydol" left={<Apple c={C.t} />} onPress={() => go('suJob')} />
      </Body>
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10, paddingBottom: Math.max(34, bottom) }}>
        <T s={14} c={C.t2}>Hesabın var mı? </T>
        <Tap onPress={pop} hit={10}><T s={14} w={570} c={C.a}>Giriş yap</T></Tap>
      </View>
    </>
  );
}

// 6 ayrı kutu; yazdıkça sonrakine geçer
function Code() {
  const C = useC();
  const [v, setV] = useState('482915'.split(''));
  const [foc, setFoc] = useState(-1);
  const refs = useRef<(React.ComponentRef<typeof TextInput> | null)[]>([]);
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {v.map((ch, j) => (
        <TextInput
          key={j}
          ref={r => { refs.current[j] = r; }}
          value={ch}
          maxLength={1}
          keyboardType="number-pad"
          selectTextOnFocus
          accessibilityLabel={`Kod ${j + 1}. hane`}
          onFocus={() => setFoc(j)}
          onBlur={() => setFoc(-1)}
          onChangeText={t => { setV(v.map((x, k) => (k === j ? t : x))); if (t && j < 5) refs.current[j + 1]?.focus(); }}
          onKeyPress={e => { if (e.nativeEvent.key === 'Backspace' && !v[j] && j > 0) refs.current[j - 1]?.focus(); }}
          style={[{ flex: 1, minWidth: 0, height: 54, borderWidth: foc === j ? 2 : 1, borderColor: foc === j ? C.a : C.sep, borderRadius: 13, textAlign: 'center', fontFamily: ff(600), fontSize: 22, color: C.t, padding: 0 }, noOutline]}
        />
      ))}
    </View>
  );
}

function SuS({ st, t, sub, bold, ic, bt, onNext, children, extra }: { st: number; t: string; sub: string; bold?: string; ic?: string; bt: string; onNext: () => void; children: React.ReactNode; extra?: React.ReactNode }) {
  const C = useC();
  return (
    <>
      <NavB mid={<View style={{ flexDirection: 'row', gap: 4, width: '100%', maxWidth: 200 }}>{[1, 2, 3, 4, 5].map(i => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= st ? C.a : C.a14 }} />)}</View>} />
      <Body>
        <View style={{ paddingTop: 18, paddingHorizontal: 18, paddingBottom: 20 }}>
          {ic ? <View style={{ width: 56, height: 56, borderRadius: 17, backgroundColor: C.pbg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon n={ic} s={30} c={C.a} /></View> : null}
          <T s={26} w={600} ls={-0.02}>{t}</T>
          <T s={14} c={C.t2} lh={1.45} style={{ marginTop: 4 }}>{bold ? <T s={14} w={570}>{bold}</T> : null}{sub}</T>
        </View>
        <View style={{ paddingHorizontal: 18 }}>{children}</View>
        {ic ? (
          <>
            <View style={{ height: 18 }} />
            <Btn t={bt} onPress={onNext} />
            {extra}
          </>
        ) : null}
      </Body>
      {ic ? null : <Foot line={false}><Btn t={bt} onPress={onNext} style={{ marginBottom: 0 }} /></Foot>}
    </>
  );
}
const Again = () => {
  const C = useC();
  return <Tap onPress={() => toast('Kod tekrar gönderildi')} style={{ alignSelf: 'center', marginTop: 8 }} hit={8}><T s={13.5} w={570} c={C.a}>Kodu tekrar gönder</T></Tap>;
};

const SuMail = () => <SuS st={1} t="E-posta adresin" sub="Giriş ve bildirimler için kullanacağız." ic="mail" bt="Kod gönder" onNext={() => go('suMailCode')}><Inp v="deniz@ornek.com" ph="ornek@mail.com" keyboardType="email-address" autoCapitalize="none" /></SuS>;
const SuMailCode = () => <SuS st={2} t="Mailini kontrol et" bold="deniz@ornek.com" sub=" adresine 6 haneli bir kod gönderdik." ic="mark_email_read" bt="Doğrula" onNext={() => go('suPhone')} extra={<Again />}><Code /></SuS>;
function SuPhone() {
  const C = useC();
  return (
    <SuS st={3} t="Telefon numaran" sub="Ders hatırlatmaları ve güvenlik için." ic="mobile" bt="Kod gönder" onNext={() => go('suPhoneCode')}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ height: 44, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: C.sep, borderRadius: 12 }}><T s={15} w={500}>🇹🇷 +90</T></View>
        <Inp v="532 384 41 12" ph="532 000 00 00" keyboardType="phone-pad" style={{ flex: 1 }} />
      </View>
    </SuS>
  );
}
const SuPhoneCode = () => <SuS st={4} t="SMS kodunu gir" bold="+90 532 384 41 12" sub=" numarasına 6 haneli bir kod gönderdik." ic="sms" bt="Doğrula" onNext={() => go('suJob')} extra={<Again />}><Code /></SuS>;
const SuJob = () => (
  <SuS st={5} t="Ne iş yapıyorsun?" sub="Uygulamayı sana göre hazırlayalım." bt="Başla" onNext={() => { home(); toast('Hesabın hazır'); }}>
    <Tiles cols={2} style={{ paddingHorizontal: 0 }} items={[['psychology', 'Psikolog'], ['nutrition', 'Diyetisyen'], ['fitness_center', 'Antrenör'], ['school', 'Eğitmen'], ['spa', 'Yoga / pilates'], ['more_horiz', 'Diğer']]} />
  </SuS>
);

export const SCREEN_MAP: Record<string, React.ComponentType<SP>> = {
  lesson: LessonScr, reschedule: Reschedule, cancel: Cancel, cancelled: Cancelled, request: Request, requestAccepted: RequestAccepted, requestRejected: RequestRejected, rsAccepted: RsAccepted,
  contact: Contact, docs: Docs, payment: Payment, paymentDone: PaymentDone, payments: Payments, share: Share, calendarPrefs: CalendarPrefs, dayRule: DayRule, timeOff: TimeOff, rules: Rules,
  pricing: Pricing, notifPrefs: NotifPrefs, help: Help, deleteAccount: DeleteAccount, login: Login, signup: Signup, suMail: SuMail, suMailCode: SuMailCode, suPhone: SuPhone, suPhoneCode: SuPhoneCode, suJob: SuJob,
};
