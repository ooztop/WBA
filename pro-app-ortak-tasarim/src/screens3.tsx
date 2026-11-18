// Sayfalar 3: ders detayı, erteleme, iptal, rezervasyon talebi, sonuç ekranları, ödeme al, giriş / kaydol
import React, { useRef, useState } from 'react';
import { TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { DL, DN, MN, MS, first, hm, lessonStarted, wd, type Lesson } from './data';
import type { Req } from './data/models';
import { fromIso, iso } from './data/dates';
import { stripDays, type SlotDay } from './data/reschedule';
import { durOf, lessonPrice } from './data/price';
import { CANCEL_REASONS, cancelOptions, cancelResult, freeCancelHours, hoursUntil } from './data/cancelPolicy';
import { get, go, hhmm, home, pickDate, pickTime, openAction, popAll as toRoot, tl, useStore, person, personByName, pick, pop, set, toast, toastLater, useC, useFrame } from './store';
import { acceptRequest, cancelLesson, collectPayment, lessonNoteKey, rejectRequest, rescheduleLesson } from './data/actions';
import { ff } from './theme';
import { Apple, Av, Band, BandBack, Blk, Btn, Ck, Empty, FloatFoot, Cols, FC, Fld, Foot, GCard, GR, IB, Icon, Inp, Lbl, List, Lnk, NavH, noOutline, ORow, Pair, PChips, Quote, Res, Row, Rt, Scr, Sm, Steps, Sw, T, Tag, Tap, Tel, Tiles } from './ui';
import { GrpS } from './screens2';

import { openUrl } from './device';

type SP = { p: any };
// Rezervasyon talebi yardımcıları (Bildirimler ve talep ekranı ortak kullanır)
export const reqDate = (r: Req) => fromIso(r.date);
export const reqWhen = (r: Req) => { const d = reqDate(r); return `${d.getDate()} ${MS[d.getMonth()]} ${DN[wd(d)]} · ${hm(r.h)}`; };
const reqBig = (r: Req) => { const d = reqDate(r); return `${d.getDate()} ${MS[d.getMonth()]} · ${hm(r.h)}`; };
const reqInfo = (r: Req) => ({ n: person(r.pid).name, big: reqBig(r), date: r.date, h: r.h, dur: r.dur, type: r.type, price: r.price });
// Onayla: talep listeden düşer, ders takvime eklenir. Reddet: onay penceresinden sonra listeden düşer.
export function acceptReq(r: Req, mode?: 'rep') { void acceptRequest(r.id); go('requestAccepted', mode, reqInfo(r)); }
export function rejectReq(r: Req, mode?: 'rep') {
  openAction('Talep reddedilsin mi?', 'Kişiye nazik bir ret bildirimi gider, ön ödeme iade edilir.', 'Talebi reddet', true, () => { void rejectRequest(r.id); go('requestRejected', mode, reqInfo(r)); });
}
const OK = (C: ReturnType<typeof useC>) => C.success;

// Beyaz zeminli form sayfası: başlık · form · altta düğme
function Page({ title, children, foot, gap = 18 }: { title: string; children: React.ReactNode; foot: React.ReactNode; gap?: number }) {
  const C = useC();
  const [fh, setFh] = useState(0);
  return (
    <View style={{ flex: 1, backgroundColor: C.card }}>
      <NavH title={title} />
      <Scr pb={16 + Math.max(0, fh - 30)}><View style={{ paddingTop: 8, paddingHorizontal: 16, gap }}>{children}</View></Scr>
      <FloatFoot bg={C.card} onH={setFh}>{foot}</FloatFoot>
    </View>
  );
}
function InCard({ children }: { children: React.ReactNode }) {
  const C = useC();
  const kids = React.Children.toArray(children).filter(Boolean);
  return <View style={{ backgroundColor: C.card, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, overflow: 'hidden' }}>{kids.map((k, i) => <View key={i} style={i ? { borderTopWidth: 1, borderTopColor: C.divider } : null}>{k}</View>)}</View>;
}

/* ================= ders ================= */
function LessonScr({ p }: SP) {
  const C = useC();
  const l: Lesson | undefined = p.l;
  const d = l ? new Date(p.f) : new Date(2026, 8, 9);
  const h0 = l ? l.h : 9, dur = l ? l.dur : 60, ty = l ? l.type : 'Bireysel';
  const pe = l ? person(l.pid) : personByName(p.n || 'Elif Yıldırım') || person('0');
  const paid = l ? l.st === 'ok' : true;
  const [note] = useState(paid ? 'Türev konusunu bitirdik, önümüzdeki hafta integral testi yapılacak.' : '');
  const info = { n: pe.name, when: `${DN[wd(d)]} ${d.getDate()} ${MS[d.getMonth()]} · ${hm(h0)}`, big: `${d.getDate()} ${MS[d.getMonth()]} · ${hm(h0)}`, lid: l?.id, ty: `${ty} · ${dur} dk`, l };
  // Paket adı, tekrar ve konum: yeni derste seçilenler; demo derslerinde türe göre
  const pkName = l?.pk ?? (ty.startsWith('Deneme') ? 'Deneme dersi' : pe.tag[1] === 'Paket' || pe.name === 'Elif Yıldırım' ? '8 derslik paket' : pe.tag[1] === 'Üye' ? 'Aylık üyelik' : `Tek ders · ${dur} dk`);
  const rep = l?.rep ?? (ty.startsWith('Deneme') ? 0 : 2);
  // İptal ekranı ödeme, paket ve seri satırlarını bu dersin gerçek bilgisinden kurar
  const cinfo = { ...info, st: l ? l.st : 'ok', pk: /paket/i.test(pkName), rep };
  const loc = l?.loc ?? (ty.startsWith('Online') ? 'Online' : 'Stüdyo');
  const st = l ? l.st : 'ok';
  // Başlamış (geçmiş ya da devam eden) derste iptal/erteleme yok; ödenmemişse Ödeme al
  const started = lessonStarted(d, h0);
  const kv = (t: string, right: React.ReactNode) => <GR style={{ minHeight: 52 }} right={right}><T s={15} lh={1.35} c={C.muted} style={{ flex: 1 }}>{t}</T></GR>;
  return (
    <>
      <Band left={<BandBack />} right={<View style={{ width: 44 }} />}>
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: useFrame().top + 8, height: 56, alignItems: 'center', justifyContent: 'center' }}><Lbl t={`${ty} · ${dur} dk`} c={C.onDarkMuted} /></View>
        <T s={24} w={800} lh={1.15} c={C.onDark}>{d.getDate()} {MN[d.getMonth()]} {DL[wd(d)]}</T>
        <T s={15} lh={1.45} c={C.onDark} style={{ marginTop: 4 }}>{hm(h0)} – {hm(h0 + dur / 60)}</T>
        {rep ? (
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: C.sdark2, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }}>
          <Icon n="repeat" s={16} c={C.onDark} />
          <T s={13} w={700} c={C.onDark}>{rep === 1 ? 'Her gün tekrarlanır' : 'Her hafta tekrarlanır'}</T>
        </View>
        ) : null}
      </Band>
      <Scr>
        <View style={{ paddingTop: 16, gap: 10 }}>
          <List><Row left={<Av ini={pe.ini} />} t={pe.name} s={pe.sub || pe.tag[1]} chev onPress={() => go('contact', undefined, { i: pe.id })} /></List>
          <GCard>
            {kv('Ders', <T s={15} w={800} numberOfLines={1}>{pkName}</T>)}
            {kv('Konum', loc === 'Online' ? <T s={14} w={700}>Online görüşme</T> : loc === 'Adres' ? <T s={14} w={700}>Kişinin adresi</T> : <Lnk s={14} t="Kadıköy stüdyo ↗" onPress={() => openUrl('https://maps.apple.com/?q=Kad%C4%B1k%C3%B6y', 'Haritalar açılıyor')} />)}
            {kv('Ödeme', st === 'ok' ? <Tag k="s" t="Ödendi" /> : st === 'no' ? <Tap onPress={() => go('payment', undefined, { i: pe.id, l })}><Tag k="d" t="Ödenmedi" /></Tap> : <Tag k="i" t="Bekliyor" />)}
          </GCard>
          <View style={{ backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 14 }}>
            <Fld label="Ders notu" area v={note} ph="Not ekle" pk={l ? lessonNoteKey(get().prefs, l) : undefined} />
          </View>
        </View>
      </Scr>
      {!started ? (
        <Foot>
          <Btn flex k="x" t="İptal et" onPress={() => go('cancel', undefined, cinfo)} />
          <Btn flex t="Dersi ertele" onPress={() => go('reschedule', undefined, info)} />
        </Foot>
      ) : st !== 'ok' ? (
        <Foot><Btn flex t="Ödeme al" onPress={() => go('payment', undefined, { i: pe.id, l })} /></Foot>
      ) : null}
    </>
  );
}

// Demo müsait günler: bugünden sonraki 6 açık gün (Pazar kapalı); gün adı tarihten hesaplanır
const RS_DATES = [10, 11, 12, 14, 15, 16];
const RS = [['14:00', '15:10', '16:20'], ['10:00', '11:10', '14:00', '15:10', '18:00', '19:10'], ['11:00', '12:10'], ['10:00', '14:00', '16:20'], ['10:00', '11:10', '13:30'], ['15:10', '17:30']];

// Erteleme: kutusuz gün şeridi (takvimin hafta şeridi gibi) ve çerçevesiz yumuşak saat çipleri
function DayStrip({ days, di, onSel }: { days: Date[]; di: number; onSel: (i: number) => void }) {
  const C = useC();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {days.map((x, i) => [DN[wd(x)], String(x.getDate())]).map((d, i) => (
        <Tap key={i} onPress={() => onSel(i)} sel={i === di} style={{ alignItems: 'center', gap: 4, minWidth: 44 }}>
          <T s={12} w={700} c={C.muted}>{d[0]}</T>
          <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: i === di ? C.sdark : 'transparent' }}>
            <T s={17} w={800} c={i === di ? C.onDark : C.ink}>{d[1]}</T>
          </View>
        </Tap>
      ))}
    </View>
  );
}
function Soft({ t, on, onPress, style }: { t: string; on: boolean; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const C = useC();
  return (
    <Tap onPress={onPress} sel={on} style={[{ height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.accent : C.page }, style]}>
      <T s={14} w={700} c={on ? C.onAccent : C.ink}>{t}</T>
    </Tap>
  );
}

function Reschedule({ p }: SP) {
  const C = useC();
  const f = first(p.n || 'Elif');
  const [di, setDi] = useState(1);
  const [si, setSi] = useState(4);
  const [tell, setTell] = useState(true);
  // Takvimden seçilen gün ve saat; seçilince şeritteki hazır saatlerin yerine geçer
  const [cus, setCus] = useState<{ d: Date; h: number } | null>(null);
  const base: SlotDay[] = RS_DATES.map((n, i) => ({ d: new Date(2026, 8, n), times: RS[i] }));
  // Takvimden seçilen gün/saat şeridin içine yerleşir ve orada seçili görünür
  const { days, sel } = stripDays(base, cus);
  const sd = sel ? sel.di : di, st = sel ? sel.si : si;
  const tgt = cus ?? { d: base[di].d, h: hhmm(base[di].times[si] ?? base[di].times[0], 18) };
  const nv = `${DN[wd(tgt.d)]} ${tgt.d.getDate()} ${MS[tgt.d.getMonth()]} · ${hm(tgt.h)}`;
  // Şeritten gün/saat seçmek takvim seçimini bırakır (takvimden gelen gün ya da saat değilse)
  const baseIdx = (d: Date) => base.findIndex(x => x.d.toDateString() === d.toDateString());
  const onDay = (i: number) => { const bi = baseIdx(days[i].d); if (bi < 0) return; setCus(null); setDi(bi); setSi(0); };
  const onTime = (t: string) => {
    const bi = baseIdx(days[sd].d), k = bi < 0 ? -1 : base[bi].times.indexOf(t);
    if (k < 0) return;
    setCus(null); setDi(bi); setSi(k);
  };
  const fromCal = () =>
    pickDate(tgt.d, d =>
      // Tarih seçici kapanınca saat seçici açılır
      setTimeout(() => pickTime(tgt.h, h => {
        if (lessonStarted(d, h)) { toast('Geçmiş bir saat seçilemez'); return; }
        setCus({ d, h });
      }), 350));
  const ok = () => {
    const l: Lesson | undefined = p.l;
    if (p.lid && l) {
      // Dersi gerçekten taşı: eski saat takvimden kalkar, yeni saate eklenir
      const nd = tgt.d;
      void rescheduleLesson(p.lid, { date: iso(nd), h: tgt.h });
      set({ F: nd });
      toRoot();
    } else pop();
    toastLater(tell ? `Yeni saat ${f}'e gönderildi · ${nv}` : `Ders ${nv} saatine taşındı`, 400);
  };
  const small = (t: string) => <T s={12} w={800} ls={0.05} c={C.muted} style={{ textTransform: 'uppercase', marginBottom: 2 }}>{t}</T>;
  return (
    <Page title="Dersi ertele" foot={<Btn t="Ertelemeyi onayla" onPress={ok} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.page, borderRadius: 16, padding: 14 }}>
        <View style={{ flexShrink: 1, minWidth: 0 }}>{small('Eski')}<T s={15} w={700} c={C.muted} style={{ textDecorationLine: 'line-through' }} numberOfLines={1}>{p.when || 'Çar 10 Eyl · 09:00'}</T></View>
        {/* Yeni tarih hep tam görünür; yer daralırsa eski tarih kısalır */}
        <View style={{ width: 20, marginHorizontal: 10 }}><Icon n="arrowR" s={20} c={C.muted} /></View>
        <View style={{ flexShrink: 0 }}>{small('Yeni')}<T s={17} w={800} numberOfLines={1}>{nv}</T></View>
      </View>
      <Blk lbl="Müsait saatlerin" right={<Tap onPress={fromCal} hit={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32 }}><Icon n="calendar" s={16} c={C.accent} /><T s={13} w={800} c={C.accent}>Takvimden seç</T></Tap>}>
        <DayStrip days={days.map(x => x.d)} di={sd} onSel={onDay} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{days[sd].times.map((t, i) => <Soft key={sd + t} t={t} on={i === st} onPress={() => onTime(t)} style={{ width: '30%', flexGrow: 1, maxWidth: '32%' }} />)}</View>
      </Blk>
      <ORow style={{ marginTop: 8 }} t={`${f}'e bildir`} s="Yeni saati onaylaması istenir" right={<Sw on={tell} onChange={setTell} label={`${f}'e bildir`} />} />
      <Sm>Sadece bu ders taşınır; seri ve ödeme aynı kalır.</Sm>
    </Page>
  );
}

function Cancel({ p }: SP) {
  const C = useC();
  const n = p.n || 'Elif Yıldırım', f = first(n);
  // Demo girişlerinde (p.st yok) eski davranış: ödenmiş, paketli, tekrarlı ders
  const paid = (p.st ?? 'ok') === 'ok', hasPk = p.pk ?? true, rep = p.rep ?? 2;
  const l: Lesson | undefined = p.l;
  const freeH = freeCancelHours(useStore(s => s.prefs['rule.1']));
  const hoursLeft = l ? hoursUntil(l.date, l.h) : 99;
  const [why, setWhy] = useState<string>(CANCEL_REASONS[0]);
  const pol = cancelOptions({ pk: hasPk, paid, reason: why, hoursLeft, freeH });
  const [choice, setChoice] = useState(pol.def);
  // Sebep değişince seçim, o sebebin varsayılanına döner
  const pickWhy = (r: string) => { setWhy(r); setChoice(cancelOptions({ pk: hasPk, paid, reason: r, hoursLeft, freeH }).def); };
  const ask = () =>
    openAction('Ders iptal edilsin mi?', `${f}'e bildirim gider. Bu işlem geri alınamaz.`, 'Dersi iptal et', true, () => {
      if (p.lid) void cancelLesson(p.lid);
      go('cancelled', 'rep', { n, big: p.big, why, title: pol.title, res: cancelResult[choice], rep });
    });
  const v = (t: string) => <T s={14} w={700} c={C.muted} numberOfLines={1} style={{ flexShrink: 1 }}>{t}</T>;
  const sub = pol.late ? 'Ücretsiz iptal süresi geçti' : pol.title === 'Ödeme' ? 'Ödendi' : pol.title === 'Ücret' ? 'Henüz ödenmedi' : undefined;
  return (
    <Page title="Dersi iptal et" foot={<Btn k="xf" t="Dersi iptal et" onPress={ask} />}>
      <View style={{ backgroundColor: C.dangerSoft, borderRadius: 16, padding: 14 }}>
        <Lbl t="İptal edilecek ders" c={C.danger} />
        <T s={17} w={800} lh={1.3} style={{ marginTop: 4 }}>{p.when || 'Çar 10 Eyl · 09:00'}</T>
        <Sm>{n} · {p.ty || 'Bireysel · 60 dk'}</Sm>
      </View>
      <InCard>
        <GR t="Sebep" chev onPress={() => pick('İptal sebebi', [...CANCEL_REASONS], why, pickWhy)} right={v(why)} />
        <GR chev onPress={() => pick(pol.title, pol.opts, choice, setChoice)} right={v(choice)}>
          <Rt t={pol.title} s={sub} sC={pol.late ? C.danger : undefined} />
        </GR>
      </InCard>
      <Fld label={`${f}'e mesaj · isteğe bağlı`} area ph="Bildirimle birlikte gider" />
    </Page>
  );
}

function Cancelled({ p }: SP) {
  const C = useC();
  const n = p.n || 'Elif Yıldırım', f = first(n);
  if (p.k)
    return (
      <Res ic="calX" red onBack={pop} top={`${n} · dersi iptal etti`} big="8 Eyl · 19:00" strike sub="Ücretsiz iptal süresi içinde iptal etti." rows={[['Sebep', 'Hastalık'], ['Ödeme', 'Alınmamıştı'], ['Paket hakkı', 'Geri verildi'], ['Saat', 'Yeniden müsait', OK(C)]]}>
        <Pair><Btn flex k="g" t="Yeni saat öner" onPress={() => go('reschedule', undefined, { n })} /><Btn flex t="Tamam" onPress={pop} /></Pair>
      </Res>
    );
  const rows: [string, string, string?][] = [];
  if (p.why) rows.push(['Sebep', p.why]);
  rows.push([p.title || 'Paket', p.res || 'Pakete geri eklendi']);
  if ((p.rep ?? 2) > 0) rows.push(['Seri', 'Diğer dersler duruyor']);
  rows.push(['Saat', 'Yeniden müsait', OK(C)]);
  return (
    <Res ic="calX" red onBack={toRoot} top={`${n} · ders iptal edildi`} big={p.big || '10 Eyl · 09:00'} strike sub={`Takvimden kaldırıldı, ${f}'e bildirim gitti.`} rows={rows}>
      <Pair><Btn flex k="g" t="Yeni saat öner" onPress={() => go('reschedule', 'rep', { n })} /><Btn flex t="Tamam" onPress={toRoot} /></Pair>
    </Res>
  );
}

/* ================= rezervasyon talebi ================= */
function Request({ p }: SP) {
  const C = useC();
  const r = useStore(s => s.reqs.find(x => x.id === p.id));
  if (!r) return <><NavH title="Rezervasyon talebi" /><Empty ic="bell" t="Talep yanıtlandı" sub="Bu talep artık beklemiyor." /></>;
  const x = person(r.pid), f = first(x.name);
  return (
    <>
      <NavH title="Rezervasyon talebi" />
      <Scr>
        <FC style={{ marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', gap: 12, alignItems: 'center' }}><Av ini={x.ini} /><Rt t={x.name} s={x.sub} /></View>
            <T s={13} w={800} c={C.accentInk}>{r.left} sa kaldı</T>
          </View>
          <T s={24} w={800} lh={1.15}>{reqWhen(r)}</T>
          <Sm style={{ marginTop: -6 }}>{r.type} · {r.dur} dk · Kadıköy stüdyo</Sm>
        </FC>
        <GCard style={{ marginTop: 14 }}><GR t="Ücret" s="Ön ödeme alındı" right={<T s={15} w={800}>{r.price}</T>} /></GCard>
        {r.note ? <><GrpS t="Kişinin notu" pt={16} /><View style={{ marginHorizontal: 16, backgroundColor: C.card, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 }}><T s={14} lh={1.5}>{r.note}</T></View></> : null}
        <GCard style={{ marginTop: 14 }}><GR t="Başka saat öner" s={`${f}'a farklı bir saat gönder`} chev onPress={() => go('reschedule', undefined, { n: x.name, when: reqWhen(r) })} /></GCard>
      </Scr>
      <Foot>
        <Btn flex k="x" t="Reddet" onPress={() => rejectReq(r, 'rep')} />
        <Btn flex t="Onayla" onPress={() => acceptReq(r, 'rep')} />
      </Foot>
    </>
  );
}
const RequestAccepted = ({ p }: SP) => {
  const n = p.n || 'Burak Şahin', h = p.h ?? 18, dur = p.dur ?? 60;
  return (
    <Res ic="check" onBack={toRoot} top={`${n} · rezervasyon onaylandı`} big={p.big || '12 Eyl · 18:00'} sub={`Takvimine eklendi, ${first(n)}'a bildirim gitti.`} rows={[['Ders', `${p.type || 'Bireysel'} · ${dur} dk`], ['Yer', 'Kadıköy stüdyo'], ['Ücret', `${p.price || '₺750'} ön ödeme alındı`], ['Takvim', `${hm(h)} – ${hm(h + dur / 60)} dolu`]]}>
      <Pair><Btn flex k="g" t="Takvimde gör" onPress={() => { set({ F: p.date ? fromIso(p.date) : new Date(2026, 8, 12) }); home(); }} /><Btn flex t="Tamam" onPress={toRoot} /></Pair>
    </Res>
  );
};
function RequestRejected({ p }: SP) {
  const C = useC();
  const n = p.n || 'Burak Şahin';
  return (
    <Res ic="close" red onBack={toRoot} top={`${n} · talep reddedildi`} big={p.big || '12 Eyl · 18:00'} strike sub={`${first(n)}'a nazik bir ret bildirimi gitti.`} rows={[['Ders', `${p.type || 'Bireysel'} · ${p.dur ?? 60} dk`], ['Ücret', `${p.price || '₺750'} iade edildi`], ['Saat', 'Müsait kaldı', OK(C)]]}>
      <Pair><Btn flex k="g" t="Başka saat öner" onPress={() => go('reschedule', 'rep', { n })} /><Btn flex t="Tamam" onPress={toRoot} /></Pair>
    </Res>
  );
}
function RsAccepted({ p }: SP) {
  const C = useC();
  const n = p.n || 'Elif Yıldırım';
  return (
    <Res ic="calCheck" onBack={pop} top={`${n} · yeni saati onayladı`} big="12 Eyl · 18:00" sub="Ders yeni saatine taşındı." rows={[['Eski saat', '10 Eyl · 09:00', C.muted, true], ['Yeni saat', '12 Eyl · 18:00'], ['Ders', 'Bireysel · 60 dk'], ['Yer', 'Kadıköy stüdyo']]}>
      <Pair><Btn flex k="g" t="Takvimde gör" onPress={home} /><Btn flex t="Tamam" onPress={pop} /></Pair>
    </Res>
  );
}


/* ================= ödeme ================= */
// Ödeme al: hangi dersten açıldıysa o ders seçili gelir; kişinin diğer ödenmemiş dersleri altında seçimsiz durur.
// Borç listesinden açılınca bütün borç dersleri seçili gelir. Fiyat Paket tercihlerindeki tek ders fiyatından.
type PayItem = { key: string; when: string; what: string; amt: number; lid?: string; debtIdx?: number };
function Payment({ p }: SP) {
  const C = useC();
  const x = person(p.i ?? '1');
  const debt = useStore(s => s.debts).find(d => d.pid === x.id);
  const pkgs = useStore(s => s.packages);
  const [items] = useState<PayItem[]>(() => {
    const out: PayItem[] = [];
    const l: Lesson | undefined = p.l;
    if (l) {
      const d = fromIso(l.date);
      out.push({ key: l.id, when: `${d.getDate()} ${MN[d.getMonth()]} · ${hm(l.h)}`, what: `${l.type} · ${l.dur} dk`, amt: lessonPrice(l.dur, pkgs), lid: l.id });
    }
    (debt?.lessons ?? []).forEach((dl, k) => {
      if (l && dl.lessonId === l.id) { out[0].debtIdx = k; return; }
      out.push({ key: `d${k}`, when: dl.when, what: dl.what, amt: lessonPrice(durOf(dl.what), pkgs), lid: dl.lessonId, debtIdx: k });
    });
    if (!out.length) out.push({ key: 'x', when: 'Bu ders', what: 'Bireysel · 60 dk', amt: lessonPrice(60, pkgs) });
    return out;
  });
  const [sel, setSel] = useState(() => items.map((_, i) => (p.l ? i === 0 : true)));
  const [mi, setMi] = useState(1);
  const [custom, setCustom] = useState<number | null>(null);
  const [edit, setEdit] = useState(false);
  const M = ['Nakit', 'Havale', 'Kart'];
  const chosen = items.filter((_, i) => sel[i]);
  const sum = chosen.reduce((a, it) => a + it.amt, 0);
  const amt = custom == null ? sum : Math.min(custom, sum);
  const part = amt < sum;
  // Seçilmeyen borç dersi varsa borç kapanmaz
  const rest = items.some((it, i) => !sel[i] && it.debtIdx != null);
  const toggle = (i: number) => { setSel(sel.map((v, j) => (j === i ? !v : v))); setCustom(null); setEdit(false); };
  const pay = () => {
    void collectPayment({
      pid: x.id, name: x.name, ini: x.ini, method: M[mi], amount: amt, part,
      lessonIdx: chosen.filter(it => it.debtIdx != null).map(it => it.debtIdx as number),
      lessonIds: chosen.filter(it => it.lid && it.debtIdx == null).map(it => it.lid as string),
    });
    go('paymentDone', 'rep', { n: x.name, total: tl(amt), m: mi === 1 ? 'Havale / EFT' : M[mi], ls: chosen.map(it => { const w = it.when.split(' · ')[0].split(' '); return w.length > 1 ? `${w[0]} ${w[1].slice(0, 3)}` : w[0]; }).join(', '), part, rest });
  };
  return (
    <Page title="Ödeme al" gap={16} foot={<Btn t={`${tl(amt)} tahsil et`} off={amt <= 0} onPress={pay} />}>
      <View style={{ alignItems: 'center', gap: 4, marginTop: -8 }}>
        <Av ini={x.ini} s={40} />
        <T s={14} lh={1.45} c={C.muted}>{x.name} · {chosen.length} ders</T>
        <T s={36} w={800} lh={1.1}>{tl(amt)}</T>
        {debt?.late ? <Tag k="d" t="6 gün gecikmiş" /> : <Tag k="i" t="Bekliyor" />}
        {sum > 0 && !edit ? <Lnk s={14} t="Tutarı değiştir" onPress={() => setEdit(true)} /> : null}
        {edit ? (
          <View style={{ alignSelf: 'stretch', marginTop: 6 }}>
            <Inp autoFocus keyboardType="number-pad" ph={tl(sum)} v={custom == null ? '' : String(custom)} onChangeText={v => { const n = parseInt(v.replace(/[^\d]/g, ''), 10); setCustom(Number.isFinite(n) ? n : null); }} />
          </View>
        ) : null}
        {part ? <T s={13} w={700} c={C.danger} style={{ marginTop: 2 }}>{tl(sum - amt)} borç olarak kalır</T> : null}
      </View>
      <Blk lbl="Dersler" gap={6}>
        {items.map((it, i) => <Row key={it.key} left={<Ck on={sel[i]} />} t={it.when} s={it.what} right={<T s={15} w={800}>{tl(it.amt)}</T>} onPress={() => toggle(i)} style={{ backgroundColor: C.page, minHeight: 56 }} />)}
      </Blk>
      <Blk lbl="Ödeme yöntemi" gap={6}><Tiles items={[['cash', 'Nakit'], ['bank', 'Havale'], ['card2', 'Kart']]} value={mi} onChange={setMi} /></Blk>
      <ORow t="Makbuz gönder" s="WhatsApp ile PDF" right={<Sw init label="Makbuz gönder" />} />
    </Page>
  );
}
function PaymentDone({ p }: SP) {
  const C = useC();
  return (
    <Res ic="check" onBack={toRoot} top={`${p.n || 'Mert Kaya'} · ödeme alındı`} big={p.total || '₺1.500'} sub={p.part ? 'Kalan borç duruyor, kişi kartı güncellendi.' : p.rest ? 'Ödeme alındı, diğer borçlar duruyor.' : 'Borç kapandı, kişi kartı güncellendi.'} rows={[['Yöntem', p.m || 'Havale / EFT'], ['Dersler', p.ls || '27 Ağu, 3 Eyl'], ['Tarih', '10 Eyl · 14:32'], ['Makbuz', 'WhatsApp ile gönderildi', OK(C)]]}>
      <Pair><Btn flex k="g" t="Makbuzu gör" onPress={() => toast('Makbuz açılıyor')} /><Btn flex t="Tamam" onPress={toRoot} /></Pair>
    </Res>
  );
}

/* ================= giriş / kaydol ================= */
function AuthShell({ children, bottomText, link, onLink }: { children: React.ReactNode; bottomText: string; link: string; onLink: () => void }) {
  const C = useC();
  const { top, bottom } = useFrame();
  return (
    <View style={{ flex: 1, backgroundColor: C.card, paddingTop: top }}>
      <Scr><View style={{ paddingTop: 48, paddingHorizontal: 24, gap: 16 }}>{children}</View></Scr>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: Math.max(34, bottom + 8) }}>
        <T s={14} c={C.muted}>{bottomText} </T><Lnk s={14} t={link} onPress={onLink} />
      </View>
    </View>
  );
}
const Logo = () => {
  const C = useC();
  return <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: C.sdark, alignItems: 'center', justifyContent: 'center' }}><T s={18} w={800} c={C.onDark}>Pro</T></View>;
};
const Head = ({ t, s }: { t: string; s: string }) => {
  const C = useC();
  return <View><T s={28} w={800} lh={1.2}>{t}</T><T s={15} lh={1.5} c={C.muted} style={{ marginTop: 4 }}>{s}</T></View>;
};
function Or() {
  const C = useC();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1, height: 1, backgroundColor: C.divider }} /><T s={13} w={700} c={C.muted}>veya</T><View style={{ flex: 1, height: 1, backgroundColor: C.divider }} /></View>;
}
function Login() {
  const C = useC();
  const [hide, setHide] = useState(true);
  return (
    <AuthShell bottomText="Hesabın yok mu?" link="Kaydol" onLink={() => go('signup')}>
      <Logo />
      <Head t="Tekrar hoş geldin" s="Takvimin ve kişilerin seni bekliyor." />
      <Fld label="E-posta" v="deniz@ornek.com" keyboardType="email-address" autoCapitalize="none" />
      <Fld label="Şifre">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Inp v="sifre1234" secureTextEntry={hide} style={{ flex: 1 }} accessibilityLabel="Şifre" />
          <IB ic={hide ? 'eye' : 'eyeOff'} s={52} label="Şifreyi göster" onPress={() => setHide(!hide)} />
        </View>
        <View style={{ alignSelf: 'flex-end', minHeight: 32, justifyContent: 'center' }}><Lnk s={13} t="Şifremi unuttum" onPress={() => toast('Sıfırlama bağlantısı gönderildi')} /></View>
      </Fld>
      <Btn t="Giriş yap" onPress={home} />
      <Or />
      <Btn k="g" t="Apple ile devam et" left={<Apple c={C.ink} />} onPress={home} />
    </AuthShell>
  );
}
function Signup() {
  const C = useC();
  return (
    <AuthShell bottomText="Hesabın var mı?" link="Giriş yap" onLink={pop}>
      <Logo />
      <Head t="Hesap oluştur" s="Takvimini birkaç dakikada kur." />
      <Fld label="Ad soyad" ph="Adın ve soyadın" />
      <Fld label="Şifre" ph="En az 8 karakter" secureTextEntry />
      <Fld label="Şifre tekrar" ph="Şifreni tekrar yaz" secureTextEntry />
      <Btn t="Devam et" onPress={() => go('suMail')} />
      <Or />
      <Btn k="g" t="Apple ile kaydol" left={<Apple c={C.ink} />} onPress={() => go('suJob')} />
    </AuthShell>
  );
}

// 6 haneli kod: yazdıkça sonraki kutuya geçer
function Code() {
  const C = useC();
  const [v, setV] = useState(['4', '8', '2', '1', '7', '']);
  const [foc, setFoc] = useState(5);
  const refs = useRef<(React.ComponentRef<typeof TextInput> | null)[]>([]);
  return (
    <View accessibilityLabel="Doğrulama kodu" style={{ flexDirection: 'row', gap: 8 }}>
      {v.map((ch, j) => (
        <TextInput key={j} ref={r => { refs.current[j] = r; }} value={ch} maxLength={1} keyboardType="number-pad" selectTextOnFocus accessibilityLabel={`Kod ${j + 1}. hane`}
          onFocus={() => setFoc(j)} onBlur={() => setFoc(f => (f === j ? -1 : f))}
          onChangeText={t => { setV(v.map((x, k) => (k === j ? t : x))); if (t && j < 5) refs.current[j + 1]?.focus(); }}
          onKeyPress={e => { if (e.nativeEvent.key === 'Backspace' && !v[j] && j > 0) refs.current[j - 1]?.focus(); }}
          style={[{ flex: 1, minWidth: 0, height: 56, borderRadius: 12, borderWidth: foc === j ? 2 : 1.5, borderColor: foc === j ? C.ink : C.border, backgroundColor: C.card, textAlign: 'center', fontFamily: ff(800), fontSize: 22, color: C.ink, padding: 0 }, noOutline]} />
      ))}
    </View>
  );
}
function Step({ n, ic, t, sub, bold, bt, onNext, children, again }: { n: number; ic: string; t: string; sub: string; bold?: string; bt: string; onNext: () => void; children: React.ReactNode; again?: boolean }) {
  const C = useC();
  const { top } = useFrame();
  return (
    <View style={{ flex: 1, backgroundColor: C.card, paddingTop: top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 4, paddingRight: 20, paddingLeft: 16 }}><IB ic="chevL" label="Geri" onPress={pop} /><Steps n={n} /></View>
      <Scr>
        <View style={{ paddingTop: 28, paddingHorizontal: 24, gap: 8 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Icon n={ic} s={26} c={C.accentInk} /></View>
          <T s={28} w={800} lh={1.2}>{t}</T>
          <T s={15} lh={1.5} c={C.muted} style={{ marginBottom: 12 }}>{bold ? <T s={15} w={800}>{bold}</T> : null}{sub}</T>
          {children}
          <Btn t={bt} onPress={onNext} style={{ marginTop: 12 }} />
          {again ? <View style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center' }}><Lnk t="Kodu tekrar gönder" onPress={() => toast('Kod tekrar gönderildi')} /></View> : null}
        </View>
      </Scr>
    </View>
  );
}
const SuMail = () => <Step n={1} ic="mail" t="E-posta adresin" sub="Giriş ve bildirimler için kullanacağız." bt="Kod gönder" onNext={() => go('suMailCode')}><Fld label="E-posta" ph="ornek@mail.com" v="deniz@ornek.com" keyboardType="email-address" autoCapitalize="none" /></Step>;
const SuMailCode = () => <Step n={2} ic="mail" t="Mailini kontrol et" bold="deniz@ornek.com" sub=" adresine 6 haneli bir kod gönderdik." bt="Doğrula" onNext={() => go('suPhone')} again><Code /></Step>;
const SuPhone = () => <Step n={3} ic="mobile" t="Telefon numaran" sub="Ders hatırlatmaları ve güvenlik için." bt="Kod gönder" onNext={() => go('suPhoneCode')}><Fld label="Telefon"><Tel ph="5•• ••• •• ••" v="532 384 41 12" /></Fld></Step>;
const SuPhoneCode = () => <Step n={4} ic="chatDots" t="SMS kodunu gir" bold="+90 532 384 41 12" sub=" numarasına 6 haneli bir kod gönderdik." bt="Doğrula" onNext={() => go('suJob')} again><Code /></Step>;
const SuJob = () => (
  <Step n={5} ic="briefcase" t="Ne iş yapıyorsun?" sub="Uygulamayı sana göre hazırlayalım." bt="Başla" onNext={() => { home(); toastLater('Hesabın hazır', 200); }}>
    <Tiles cols={2} items={[['chatHeart', 'Psikolog'], ['nutrition', 'Diyetisyen'], ['dumbbell', 'Antrenör'], ['gradcap', 'Eğitmen'], ['yoga', 'Yoga / pilates'], ['dots3', 'Diğer']]} />
  </Step>
);

export const S3: Record<string, React.ComponentType<SP>> = {
  lesson: LessonScr, reschedule: Reschedule, cancel: Cancel, cancelled: Cancelled, request: Request, requestAccepted: RequestAccepted, requestRejected: RequestRejected, rsAccepted: RsAccepted,
  payment: Payment, paymentDone: PaymentDone, login: Login, signup: Signup, suMail: SuMail, suMailCode: SuMailCode, suPhone: SuPhone, suPhoneCode: SuPhoneCode, suJob: SuJob,
};
export const BAND3 = ['lesson'];
