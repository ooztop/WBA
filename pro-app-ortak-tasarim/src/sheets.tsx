// Alttan açılan paneller ve panel içi ikinci ekranlar (Kişi seç, Paketler)
import React, { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DN, MN, TODAY, addD, dkey, first, type Lesson } from './data';
import { addPerson, closeSheet, hhmm, nextId, num, tl, openAction, openSheet, patchPerson, person, personByName, pick, pop, push, repSheet, set, toast, toastLater, useC, useFrame, useStore } from './store';
import { EASE, ff } from './theme';
import { Av, Blk, Btn, Ck, Cols, DC, Fld, Form, GR, Grp, IB, Icon, Inp, Lbl, List, Lnk, noOutline, OC, ORow, Pair, PChips, Row, Rt, Scr, Seg, SFoot, SheetH, Sm, Sw, T, Tag, Tap, Tel, Tiles } from './ui';
import { Amt } from './screens1';
import { GrpS, Pkb } from './screens2';

type SP = { p: any };
const ease = Easing.bezier(...EASE);

// Panel iskeleti: başlık · kaydırılan form · altta yapışık ana düğme
function Sheet({ title, right, children, foot, extra, gap = 16, onBack }: { title: string; right?: React.ReactNode; children: React.ReactNode; foot?: React.ReactNode; extra?: React.ReactNode; gap?: number; onBack?: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <SheetH title={title} onBack={onBack ?? closeSheet} right={right} />
      <Scr pb={16}>
        <Form gap={gap}>{children}</Form>
        {extra ? <View style={{ gap: 8, paddingTop: 8, paddingHorizontal: 16 }}>{extra}</View> : null}
      </Scr>
      {foot ? <SFoot>{foot}</SFoot> : null}
    </View>
  );
}
const done = (msg: string) => () => { closeSheet(); toastLater(msg); };

// Çerçeveli iç kart (.gcard, margin 0 + kenarlık)
function InCard({ children }: { children: React.ReactNode }) {
  const C = useC();
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ backgroundColor: C.card, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, overflow: 'hidden' }}>
      {kids.map((k, i) => <View key={i} style={i ? { borderTopWidth: 1, borderTopColor: C.divider } : null}>{k}</View>)}
    </View>
  );
}
// Açılır satır (.rpb + .rpx): ok 90° döner, altında içerik açılır
function Expander({ t, s, children, gap = 10, onToggle }: { t: string; s: string; children: React.ReactNode; gap?: number; onToggle?: (o: boolean) => void }) {
  const C = useC();
  const [o, setO] = useState(false);
  const r = useSharedValue(0);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 90}deg` }] }));
  return (
    <View>
      <GR t={t} s={s} onPress={() => { r.value = withTiming(o ? 0 : 1, { duration: 250 }); setO(!o); onToggle?.(!o); }} right={<Animated.View style={st}><Icon n="chevR" c={C.muted} /></Animated.View>} />
      {o ? <View style={{ gap, paddingTop: 12, paddingHorizontal: 14, paddingBottom: 16, borderTopWidth: 1, borderTopColor: C.divider }}>{children}</View> : null}
    </View>
  );
}
// Tekrar: sıklık + tarih aralığı
function Repeat({ init, sum0, start }: { init: number; sum0: string; start: string }) {
  const OPT = ['Yok', 'Her gün', 'Her hafta'];
  const [v, setV] = useState(init);
  const [end, setEnd] = useState('');
  const [touched, setTouched] = useState(false);
  const sum = !touched ? sum0 : v === 0 ? 'Tekrar yok' : `${OPT[v]} · ${end.trim() ? `${end.trim()}'e kadar` : 'bitiş yok'}`;
  return (
    <Expander t="Tekrar" s={sum}>
      <Lbl t="Sıklık" />
      <Seg items={OPT} sel={v} onSel={i => { setV(i); setTouched(true); }} style={{ marginTop: 0, marginHorizontal: 0 }} />
      {v !== 0 ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <Lbl t="Tarih aralığı" />
          <Cols><Fld flex label="Başlangıç" v={start} /><Fld flex label="Bitiş" ph="Bitiş yok" value={end} onChangeText={t => { setEnd(t); setTouched(true); }} /></Cols>
        </View>
      ) : null}
    </Expander>
  );
}
const RuleBlk = ({ t, s, items, init, cst }: { t: string; s: string; items: string[]; init: number; cst: string }) => (
  <View style={{ gap: 10 }}><Rt t={t} s={s} /><PChips items={items} init={init} cst={cst} /></View>
);
function RulesExp({ multi }: { multi?: boolean }) {
  const [o, setO] = useState(false);
  return (
    <Expander t="Ders kuralları" s={o ? 'Bu pakete özel · genel ayarı ezer' : 'Genel kurallar geçerli'} gap={18} onToggle={setO}>
      <RuleBlk t="Rezervasyon penceresi" s={multi ? 'Seanstan en geç kaç saat önce' : 'Dersten en geç kaç saat önce'} items={['1 sa', '2 sa', '24 sa']} init={1} cst="sa" />
      <RuleBlk t="Ücretsiz iptal" s={multi ? 'Bu süreden sonra seans düşer' : 'Bu süreden sonra ücret alınır'} items={['2 sa', '4 sa', '24 sa']} init={1} cst="sa" />
      <RuleBlk t="Ders başlama kademesi" s="Kişiler dersi hangi dakikalarda başlatabilir" items={['Tam saat', '15 dk', '30 dk']} init={0} cst="dk" />
      <RuleBlk t="Ders arası mola" s="Bir ders bitince sonrakine kadar boşluk" items={['Yok', '10 dk', '15 dk']} init={2} cst="dk" />
    </Expander>
  );
}

/* ================= kişi formları ================= */
function PhotoRow({ ini, sub }: { ini?: string; sub: string }) {
  const C = useC();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 }}>
      {ini ? <Av ini={ini} lg /> : (
        <Tap onPress={() => toast('Fotoğraf seç')} label="Fotoğraf ekle" style={{ width: 56, height: 56, borderRadius: 999, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.border, backgroundColor: C.page, alignItems: 'center', justifyContent: 'center' }}><Icon n="camera" c={C.muted} /></Tap>
      )}
      <View style={{ gap: 2 }}>
        {ini ? <Lnk t="Fotoğrafı değiştir" onPress={() => toast('Fotoğraf seç')} /> : <T s={15} w={700}>Fotoğraf ekle</T>}
        <Sm>{sub}</Sm>
      </View>
    </View>
  );
}
function PkgOpts() {
  return (
    <>
      <Fld label="Seans sayısı" style={{ gap: 8 }}><PChips items={['Tek ders', '4', '8', '12']} init={2} /></Fld>
      <Cols><Fld flex label="Seans süresi" v="60 dk" /><Fld flex label="Paket ücreti" v="₺5.000" /></Cols>
    </>
  );
}

function AddContact() {
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [pk, setPk] = useState(false);
  const save = () => {
    const n = `${ad.trim()} ${soyad.trim()}`.trim();
    if (!n) { toast('Önce bir ad yaz'); return; }
    addPerson(n, 'Yeni kişi');
    closeSheet();
    toastLater('Kişi eklendi');
  };
  return (
    <Sheet title="Yeni kişi" foot={<Btn glow t="Kişiyi kaydet" onPress={save} />}>
      <PhotoRow sub="İsteğe bağlı · rehberden de alabilirsin" />
      <Cols><Fld flex label="Ad" ph="Ad" value={ad} onChangeText={setAd} /><Fld flex label="Soyad" ph="Soyad" value={soyad} onChangeText={setSoyad} /></Cols>
      <Fld label="Telefon" link="Rehberden seç" onLink={() => toast('Rehber açılıyor')}><Tel ph="5•• ••• •• ••" /></Fld>
      <Fld label="E-posta (isteğe bağlı)" ph="ornek@mail.com" keyboardType="email-address" autoCapitalize="none" />
      <Fld label="Not (isteğe bağlı)" area ph="Örn. salı ve perşembe uygun" />
      <OC>
        <ORow t="Özel paket tanımla" s="Bu kişiye özel fiyat veya paket" right={<Sw on={pk} onChange={setPk} label="Özel paket tanımla" />} />
        {pk ? <PkgOpts /> : null}
      </OC>
      <ORow t="Profilimi paylaş" s="Kişiye rezervasyon bağlantısı gönder" right={<Sw init label="Profilimi paylaş" />} style={{ paddingHorizontal: 2 }} />
    </Sheet>
  );
}

function EditContact({ p }: SP) {
  const x = person(p.i || 0), n = x.name.split(' ');
  const [pk, setPk] = useState(true);
  const [ad, setAd] = useState(n[0]);
  const [soyad, setSoyad] = useState(n.slice(1).join(' '));
  const saveC = () => {
    const nm = `${ad.trim()} ${soyad.trim()}`.trim();
    if (!nm) { toast('Önce bir ad yaz'); return; }
    patchPerson(x.id, { name: nm, ini: nm.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr') });
    closeSheet(); toastLater('Değişiklikler kaydedildi');
  };
  const gone = (patch: { arch?: boolean; gone?: boolean }, msg: string) => {
    patchPerson(x.id, patch);
    closeSheet(); pop();
    toastLater(msg, 350, 'Geri al', () => patchPerson(x.id, { arch: false, gone: false }));
  };
  return (
    <Sheet
      title="Kişiyi düzenle"
      foot={<Btn glow t="Kaydet" onPress={saveC} />}
      extra={
        <Pair>
          <Btn flex k="g" ic="archive" t="Arşivle" onPress={() => openAction(`${x.name} arşivlensin mi?`, 'Kişiler listesinden kalkar, gelecek dersleri iptal edilir. Ders geçmişi ve ödeme kaydı durur.', 'Arşivle', false, () => gone({ arch: true }, `${x.name} arşivlendi`))} />
          <Btn flex k="x" ic="trash" t="Kişiyi sil" onPress={() => openAction(`${x.name} silinsin mi?`, 'Tüm ders kaydı ve ödeme geçmişi kalıcı olarak silinir.', 'Kişiyi sil', true, () => gone({ gone: true }, `${x.name} silindi`))} />
        </Pair>
      }>
      <PhotoRow ini={x.ini} sub="İsteğe bağlı · rehberden de alabilirsin" />
      <Cols><Fld flex label="Ad" value={ad} onChangeText={setAd} /><Fld flex label="Soyad" value={soyad} onChangeText={setSoyad} /></Cols>
      <Fld label="Telefon" link="Rehberden seç" onLink={() => toast('Rehber açılıyor')}><Tel v="532 24 43 03" /></Fld>
      <Fld label="E-posta" v={`${n[0].toLocaleLowerCase('tr')}@ornek.com`} keyboardType="email-address" autoCapitalize="none" />
      <Fld label="Not" area v="Ödemeleri ay sonunda toplu yapıyor" />
      <OC>
        <ORow t="Özel paket" s="8 derslik paket · ₺5.000" right={<Sw on={pk} onChange={setPk} label="Özel paket" />} />
        {pk ? <PkgOpts /> : null}
      </OC>
      <ORow t="Ödeme hatırlatması" s="Borç 7 günü geçince otomatik mesaj" right={<Sw init label="Ödeme hatırlatması" />} style={{ paddingHorizontal: 2 }} />
    </Sheet>
  );
}

function AccountEdit() {
  const C = useC();
  const me0 = useStore(s => s.me);
  const [me, setMe] = useState(me0);
  const saveMe = () => { set({ me: { ad: me.ad.trim() || me0.ad, soyad: me.soyad.trim(), title: me.title.trim() } }); closeSheet(); toastLater('Değişiklikler kaydedildi'); };
  return (
    <Sheet title="Hesabı düzenle" foot={<Btn glow t="Kaydet" onPress={saveMe} />} extra={<Btn k="x" t="Hesabı sil" onPress={() => { closeSheet(); setTimeout(() => push('deleteAccount'), 250); }} />}>
      <PhotoRow ini={((me0.ad[0] || '') + (me0.soyad[0] || '')).toLocaleUpperCase('tr')} sub="Profilinde görünür" />
      <Cols><Fld flex label="Ad" value={me.ad} onChangeText={v => setMe({ ...me, ad: v })} /><Fld flex label="Soyad" value={me.soyad} onChangeText={v => setMe({ ...me, soyad: v })} /></Cols>
      <Fld label="Ünvan / iş kolu" value={me.title} onChangeText={v => setMe({ ...me, title: v })} />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T s={13} w={700} c={C.muted}>Telefon</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon n="check" s={16} c={C.success} /><T s={12} w={800} c={C.success}>Doğrulandı</T></View>
        </View>
        <Tel v="532 440 16 28" />
      </View>
      <Fld label="Web sitesi" v="denizarslan.com" autoCapitalize="none" />
      <Fld label="Hakkımda" area v="10 yıldır lise ve üniversite hazırlık dersleri veriyorum." />
      <OC><ORow t="Profil herkese açık" s="QR ile gelenler randevu alabilir" right={<Sw init label="Profil herkese açık" />} /></OC>
    </Sheet>
  );
}

/* ================= molalar ================= */
function BreakNew({ p }: SP) {
  const cur = useStore(s => s.breaks).find(b => b.id === p?.id);
  const [name, setName] = useState(cur?.name ?? 'Kahve arası');
  const [start, setStart] = useState(cur?.start ?? '15:00');
  const [end, setEnd] = useState(cur?.end ?? '15:30');
  const [days, setDays] = useState(cur?.days ?? [0, 1, 2, 3, 4]);
  const mins = Math.max(0, Math.round((hhmm(end, 0) - hhmm(start, 0)) * 60));
  const save = () => {
    const b = { id: cur?.id ?? nextId(), name: name.trim() || 'Mola', start, end, days };
    set(s => ({ breaks: cur ? s.breaks.map(x => (x.id === cur.id ? b : x)) : [...s.breaks, b] }));
    closeSheet(); toastLater('Mola kaydedildi');
  };
  const del = () => { set(s => ({ breaks: s.breaks.filter(x => x.id !== cur!.id) })); closeSheet(); toastLater('Mola silindi'); };
  return (
    <Sheet title="Düzenli mola" gap={20} right={cur ? <IB ic="trash" k="del" label="Molayı sil" onPress={del} /> : undefined} foot={<Btn glow t="Kaydet" onPress={save} />}>
      <Fld label="Mola adı" value={name} onChangeText={setName} />
      <View style={{ gap: 10 }}>
        <Cols><Fld flex label="Başlangıç" value={start} onChangeText={setStart} /><Fld flex label="Bitiş" value={end} onChangeText={setEnd} /></Cols>
        <Sm>Takvimde {mins} dk yer tutar</Sm>
      </View>
      <View style={{ gap: 10 }}>
        <Rt t="Hangi günler" s="Pazar kapalı olduğu için seçilemez" />
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {DN.map((d, i) => <DC key={i} sm b={d} on={days.includes(i)} dis={i === 6} onPress={() => setDays(days.includes(i) ? days.filter(x => x !== i) : [...days, i])} />)}
        </View>
      </View>
      <ORow t="Rezervasyon kapalı" s="Kişiler bu aralığı dolu görür" right={<Sw init label="Rezervasyon kapalı" />} />
      <Sm>Her hafta tekrar eder. Tek bir gün için takvimdeki + düğmesini kullan.</Sm>
    </Sheet>
  );
}

function NewBreak() {
  const C = useC();
  const [all, setAll] = useState(0);
  const [days, setDays] = useState([2]);
  const [why, setWhy] = useState('Öğle arası');
  const [start, setStart] = useState('12:30');
  const [end, setEnd] = useState('13:00');
  const D: [string, string][] = [['Pzt', '7'], ['Sal', '8'], ['Çar', '9'], ['Per', '10'], ['Cum', '11'], ['Cmt', '12'], ['Paz', '13']];
  const opts = all ? ['İzin günü', 'Tatil', 'Hastalık', 'Kişisel', 'Diğer'] : ['Öğle arası', 'Kahve arası', 'Toplantı', 'Kişisel', 'Diğer'];
  const save = () => {
    if (!days.length) { toast('Önce bir gün seç'); return; }
    const add = days.map(i => ({ k: dkey(new Date(2026, 8, 7 + i)), name: why, start: hhmm(start, 12.5), end: hhmm(end, 13), all: !!all }));
    set(s => ({ offs: [...s.offs, ...add] }));
    closeSheet(); toastLater(all ? 'Gün kapatıldı' : 'Mola eklendi');
  };
  return (
    <Sheet title="Mola ekle" gap={18} foot={<Btn glow t={all ? 'Günü kapat' : 'Molayı ekle'} onPress={save} />}>
      <Tiles cols={2} value={all} onChange={i => { setAll(i); setWhy(i ? 'İzin günü' : 'Öğle arası'); }} items={[['timer', 'Gün içinde ara', 'Saat aralığı'], ['umbrella', 'Tüm gün kapalı', 'İzin günü']]} />
      <View style={{ gap: 10 }}>
        <Rt t="Gün" s="Birden fazla seçebilirsin" />
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {D.map((d, i) => <DC key={i} a={d[0]} b={d[1]} on={days.includes(i)} dis={i === 6} onPress={() => setDays(days.includes(i) ? days.filter(x => x !== i) : [...days, i])} />)}
        </View>
      </View>
      {all ? null : <Cols><Fld flex label="Başlangıç" value={start} onChangeText={setStart} /><Fld flex label="Bitiş" value={end} onChangeText={setEnd} /></Cols>}
      <InCard>
        <GR t="Sebep" s="Takvimde bu isimle görünür" chev onPress={() => pick('Sebep', opts, why, setWhy)} right={<T s={13} w={700} c={C.muted}>{why}</T>} />
        <GR t="Sebebi kişiler görsün" s="Kapalıysa sadece dolu görünür" right={<Sw label="Sebebi kişiler görsün" />} />
        {all ? null : <Repeat init={0} sum0="Tekrarlanmaz" start="9 Eylül" />}
      </InCard>
    </Sheet>
  );
}

/* ================= paketler: Tekil ↔ Çoklu ================= */
const PAY: [string, string][] = [['cash', 'Nakit'], ['bank', 'Havale'], ['card2', 'Kart']];
const SES = ['4', '8', '12'], VAL = ['1 ay', '2 ay', '3 ay'];
function PackageSheet({ multi, p }: { multi: boolean; p: any }) {
  const cur = useStore(s => s.packages).find(x => x.id === p?.id);
  const editing = !!cur && (cur.kind === 'multi') === multi;
  const isNew = !cur;
  const DUR = multi ? ['30 dk', '60 dk', '90 dk'] : ['30 dk', '45 dk', '60 dk'];
  const [name, setName] = useState(p?.name ?? (editing ? cur!.name : multi ? '8 derslik paket' : 'Tek ders'));
  const [price, setPrice] = useState(editing ? cur!.price : multi ? '₺5.400' : '₺750');
  const [ses, setSes] = useState(editing && multi ? cur!.c1.replace('×', '') : '8');
  const [dur, setDur] = useState(editing && !multi ? cur!.c1.replace('′', '') + ' dk' : '60 dk');
  const [val, setVal] = useState('2 ay');
  const idx = (arr: string[], v: string) => arr.indexOf(v);
  const del = () =>
    openAction(multi ? 'Bu paket silinsin mi?' : 'Bu ders silinsin mi?', 'Paket tercihlerinden kalkar. Daha önce satın alanların hakları durur.', multi ? 'Paketi sil' : 'Dersi sil', true, () => {
      if (cur) set(s => ({ packages: s.packages.filter(x => x.id !== cur.id) }));
      closeSheet(); toastLater(multi ? 'Paket silindi' : 'Ders silindi');
    });
  const save = () => {
    closeSheet();
    if (p?.onSave) { p.onSave(name.trim() || 'Özel paket', price.trim() || '₺5.000'); return; }
    const n = parseInt(ses, 10) || 1, pr = num(price), mins = parseInt(dur, 10) || 60;
    const nm = name.trim() || (multi ? `${n} derslik paket` : 'Tek ders');
    const pk = multi
      ? { kind: 'multi' as const, c1: `${n}×`, c2: '', name: nm, sub: `ders başı ${tl(pr / n)} · ${val}`, price: tl(pr) }
      : { kind: 'single' as const, c1: `${mins}′`, c2: '', name: nm.includes('dk') ? nm : `${nm} · ${mins} dk`, sub: editing ? cur!.sub : 'Mola yok', price: tl(pr) };
    set(s => ({ packages: cur ? s.packages.map(x => (x.id === cur.id ? { ...x, ...pk } : x)) : [...s.packages, { id: nextId(), ...pk }] }));
    toastLater('Paket kaydedildi');
  };
  return (
    <Sheet title={multi ? 'Çoklu paket' : 'Tekil ders'} gap={18} right={isNew ? undefined : <IB ic="trash" k="del" label={multi ? 'Bu paketi sil' : 'Bu dersi sil'} onPress={del} />} foot={<Btn glow t="Kaydet" onPress={save} />}>
      <Tiles cols={2} value={multi ? 1 : 0} onChange={i => { if ((i === 1) !== multi) repSheet(i === 1 ? 'packageMulti' : 'packageSingle', p); }} items={[['user', 'Tekil ders', '1 seans'], ['layers', 'Çoklu paket', 'Birden fazla seans']]} />
      <Cols>
        <Fld flex label={multi ? 'Paket adı' : 'Ders adı'} value={name} onChangeText={setName} />
        <Fld flex label={multi ? 'Ücret / paket' : 'Ücret / ders'} value={price} onChangeText={setPrice} />
      </Cols>
      {multi ? <Blk lbl="Seans sayısı"><PChips items={SES} init={Math.max(0, idx(SES, ses))} cst="seans" cstInit={idx(SES, ses) < 0 ? `${ses} seans` : undefined} onChange={(_, l) => setSes(l)} /></Blk> : null}
      <Blk lbl={multi ? 'Seans süresi' : 'Ders süresi'}><PChips items={DUR} init={idx(DUR, dur) < 0 ? (multi ? 1 : 2) : idx(DUR, dur)} cst="dk" cstInit={idx(DUR, dur) < 0 ? dur : undefined} onChange={(_, l) => setDur(l)} /></Blk>
      {multi ? <Blk lbl="Geçerlilik · paket bu sürede kullanılmalı"><PChips items={VAL} init={1} cst="ay" onChange={(_, l) => setVal(l)} /></Blk> : null}
      <Blk lbl="Ödeme yöntemi · birden fazla"><Tiles items={PAY} multi init={[0, 1]} /></Blk>
      <InCard>
        {multi ? <GR t="Peşin ödeme" s="Paket başında tamamı alınır" right={<Sw init label="Peşin ödeme" />} /> : null}
        <GR t="Profilde göster" s="Paylaştığın sayfada görünür" right={<Sw init label="Profilde göster" />} />
        <RulesExp multi={multi} />
      </InCard>
    </Sheet>
  );
}

/* ================= Yeni ders ================= */
type PkSel = { name: string; badge: string; why: string; price: string; unit: string };
const PK_OWN: PkSel = { name: '8 derslik paket', badge: '8×', why: "Elif'in paketi · 5 ders kaldı", price: '₺675', unit: 'ders başı' };
const PK_BASE: PkSel = { name: 'Tek ders · 60 dk', badge: '60′', why: 'Temel paket', price: '₺750', unit: 'ders başı' };

function useSlide(open: boolean) {
  const { W } = useFrame();
  const v = useSharedValue(0);
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    v.value = withTiming(open ? 1 : 0, { duration: open ? 420 : 340, easing: ease });
    if (!open) { const t = setTimeout(() => setMounted(false), 360); return () => clearTimeout(t); }
  }, [open]);
  const over = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - v.value) * W }] }));
  const under = useAnimatedStyle(() => ({ transform: [{ translateX: -v.value * 0.3 * W }] }));
  const dim = useAnimatedStyle(() => ({ opacity: v.value * 0.1 }));
  return { mounted, over, under, dim };
}
// Listenin üstünde yüzen ana düğme (.ffab)
function Ffab({ children }: { children: React.ReactNode }) {
  const { bottom } = useFrame();
  return <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(30, bottom + 8) }}>{children}</View>;
}

function PeoplePanel({ sel, onBack, onDone }: { sel: string[]; onBack: () => void; onDone: (n: string[]) => void }) {
  const C = useC();
  const emp = useStore(s => s.emp);
  const people = useStore(s => s.people);
  const [on, setOn] = useState<string[]>(sel);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(false);
  const [nm, setNm] = useState('');
  const [fresh, setFresh] = useState<string[]>([]);
  const qq = q.toLocaleLowerCase('tr');
  const base = emp ? people.filter(p => fresh.includes(p.name)) : people.filter(p => !p.arch && !p.gone);
  const list = base.slice().sort((a, b) => (fresh.includes(b.name) ? 1 : 0) - (fresh.includes(a.name) ? 1 : 0) || a.name.localeCompare(b.name, 'tr')).filter(p => p.name.toLocaleLowerCase('tr').includes(qq));
  const save = () => {
    const n = nm.trim();
    if (!n) return;
    addPerson(n, 'Yeni kişi');
    setFresh([n, ...fresh]); setOn([...on, n]); setNm(''); setForm(false);
    toast(`${first(n)} eklendi`);
  };
  return (
    <View style={{ flex: 1 }}>
      <SheetH title="Kişi seç" onBack={onBack} right={<IB ic="check" k="p" label="Seçimi onayla" onPress={() => onDone(on)} />} />
      <View style={{ marginTop: 6, marginHorizontal: 16, height: 48, borderRadius: 12, backgroundColor: C.page, borderWidth: 1.5, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
        <Icon n="search" c={C.muted} />
        <TextInput value={q} onChangeText={setQ} accessibilityLabel="Kişi ara" placeholder="Kişi ara" placeholderTextColor={C.muted} selectionColor={C.accent} style={[{ flex: 1, minWidth: 0, fontFamily: ff(500), fontSize: 15, color: C.ink, padding: 0 }, noOutline]} />
      </View>
      <Grp t={`${on.length} kişi seçili`} style={{ paddingTop: 12 }} />
      <Scr pb={form ? 250 : 110}>
        {list.length === 0 ? <Sm style={{ textAlign: 'center', paddingTop: 30, paddingHorizontal: 30 }}>{emp ? 'Henüz kişi yok. Yeni kişi ekle ile hızlıca ekleyebilirsin.' : 'Bu aramada kişi yok.'}</Sm> : null}
        <List style={{ gap: 2 }}>
          {list.map(p => {
            const s = on.includes(p.name);
            return <Row key={p.id} left={<Av ini={p.ini} s={36} />} t={p.name} right={<Ck on={s} />} onPress={() => setOn(s ? on.filter(x => x !== p.name) : [...on, p.name])} style={{ minHeight: 56, backgroundColor: s ? C.tintSoft : C.card }} />;
          })}
        </List>
      </Scr>
      <Ffab>
        {form ? (
          <View style={{ gap: 8, backgroundColor: C.card, padding: 12, borderRadius: 18, boxShadow: C.shToast }}>
            <Inp autoFocus ph="Ad soyad" value={nm} onChangeText={setNm} onSubmitEditing={save} />
            <Inp ph="Telefon (isteğe bağlı)" keyboardType="phone-pad" />
            <Pair><Btn flex k="g" t="Vazgeç" onPress={() => setForm(false)} /><Btn flex t="Ekle" onPress={save} /></Pair>
          </View>
        ) : (
          <Btn ic="userPlus" t="Yeni kişi ekle" onPress={() => setForm(true)} style={{ boxShadow: C.shFloat }} />
        )}
      </Ffab>
    </View>
  );
}

function PkgPanel({ cur, who, onBack, onSel, onNew }: { cur: PkSel | null; who: string; onBack: () => void; onSel: (p: PkSel) => void; onNew: () => void }) {
  const C = useC();
  const emp = useStore(s => s.emp);
  const own = who === 'Elif Yıldırım';
  const row = (pk: PkSel, sub: string, right: React.ReactNode, isOwn?: boolean) => {
    const sel = !!cur && cur.name === pk.name && (isOwn ? cur.why === PK_OWN.why : cur.why !== PK_OWN.why);
    return <Row key={pk.name + sub} left={<View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}><T s={14} w={800}>{pk.badge}</T></View>} t={pk.name} s={sub} right={right} onPress={() => onSel(pk)} style={{ backgroundColor: isOwn ? C.tintSoft : C.page, borderWidth: 2, borderColor: sel ? C.ink : 'transparent', paddingVertical: 8, paddingHorizontal: 10 }} />;
  };
  const mk = (name: string, badge: string, price: string, unit = 'ders başı'): PkSel => ({ name, badge, why: 'Elle seçildi', price, unit });
  return (
    <View style={{ flex: 1 }}>
      <SheetH title="Paketler" onBack={onBack} />
      <Scr pb={110}>
        {emp ? <Sm style={{ textAlign: 'center', paddingTop: 30, paddingHorizontal: 30 }}>Henüz paket yok. Kişiye özel paket ile ilk paketini oluştur.</Sm> : (
          <>
            {own ? (
              <>
                <GrpS t="Elif'in paketleri" s="Satın aldığı ve ona özel paketler" pt={8} />
                <List>{row(PK_OWN, "Satın aldı · 24 Eyl'e kadar", <Tag k="a" t="5 kaldı" />, true)}</List>
              </>
            ) : null}
            <GrpS t="Tekil ders" pt={own ? 18 : 8} />
            <List>
              {row({ ...PK_BASE }, 'Takvimde 90 dk · 15 dk mola', <Amt b="₺750" />)}
              {row(mk('Tek ders · 90 dk', '90′', '₺1.125'), 'Mola yok', <Amt b="₺1.125" />)}
            </List>
            <GrpS t="Çoklu paket" />
            <List>
              {row(mk('8 derslik paket', '8×', '₺675'), 'ders başı ₺675 · 2 ay', <Amt b="₺5.400" />)}
              {row(mk('Aylık üyelik', '12×', '₺600'), 'ders başı ₺600 · 1 ay', <Amt b="₺7.200" />)}
            </List>
          </>
        )}
      </Scr>
      <Ffab><Btn ic="plus" t="Kişiye özel paket" onPress={onNew} style={{ boxShadow: C.shFloat }} /></Ffab>
    </View>
  );
}

function parseWhen(date: string, time: string): { d: Date; h: number } {
  const day = parseInt(date, 10);
  const lo = date.toLocaleLowerCase('tr');
  const mi = MN.findIndex(m => lo.includes(m.toLocaleLowerCase('tr').slice(0, 3)));
  const d = day > 0 && day < 32 ? new Date(2026, mi < 0 ? 8 : mi, day) : addD(TODAY, 1);
  const m = time.match(/(\d{1,2})[:.](\d{2})/);
  const h = m ? Math.min(21, Math.max(7, +m[1] + +m[2] / 60)) : 16;
  return { d, h };
}

function NewLesson({ p }: SP) {
  const C = useC();
  const emp = useStore(s => s.emp);
  const people = useStore(s => s.people);
  const [sel, setSel] = useState<string[]>(p?.n ? [p.n] : emp ? [] : ['Elif Yıldırım']);
  const auto = (n: string[]): PkSel => (n.length === 1 && n[0] === 'Elif Yıldırım' ? PK_OWN : PK_BASE);
  const [pk, setPk] = useState<PkSel | null>(emp ? null : auto(sel));
  const [date, setDate] = useState('10 Eyl Çar');
  const [time, setTime] = useState('16:00');
  const [loc, setLoc] = useState('Stüdyo');
  const [sub, setSub] = useState<'' | 'people' | 'pkgs'>('');
  const [last, setLast] = useState<'people' | 'pkgs'>('people');
  const s1 = useSlide(!!sub);
  const who = sel[0] || '';
  const open = (k: 'people' | 'pkgs') => { setLast(k); setSub(k); };
  const save = () => {
    const { d, h } = parseWhen(date, time);
    const pe = personByName(who);
    if (!pe) { toast('Önce bir kişi seç'); return; }
    const l: Lesson = [h, 60, pe.id, loc === 'Online' ? 'Online' : sel.length > 1 ? `Grup · ${sel.length} kişi` : 'Bireysel', 'w'];
    set(s => ({ extra: [...s.extra, { k: dkey(d), l }] }));
    closeSheet();
    toastLater('Ders eklendi');
  };
  const newPk = () =>
    openSheet('packageMulti', {
      isNew: true,
      name: `${first(who || 'Kişi')}'e özel paket`,
      onSave: (name: string, price: string) => { setPk({ name, badge: '8×', why: `${first(who || 'Kişi')}'e özel paket`, price, unit: 'paket' }); setSub(''); toastLater('Özel paket oluşturuldu', 400); },
    });
  const avs = sel.map(n => people.find(x => x.name === n)).filter(Boolean);
  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1 }, s1.under]}>
        <Sheet title="Yeni ders" gap={18} foot={<Btn glow t="Dersi ekle" onPress={save} />}>
          <Blk lbl="Kişiler">
            <Row
              onPress={() => open('people')}
              left={avs.length ? <View style={{ flexDirection: 'row' }}>{avs.slice(0, 3).map((x, i) => <View key={x!.id} style={{ marginLeft: i ? -10 : 0, borderRadius: 999, borderWidth: i ? 2 : 0, borderColor: C.page }}><Av ini={x!.ini} s={36} /></View>)}</View> : <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}><Icon n="userPlus" s={18} c={C.muted} /></View>}
              t={sel.length === 0 ? 'Kişi seç' : sel.length === 1 ? sel[0] : sel.length === 2 ? sel.map(first).join(', ') : `${sel.length} kişi`}
              chev
              style={{ backgroundColor: C.page, minHeight: 56 }}
            />
          </Blk>
          <Blk lbl="Zaman"><Cols><Fld flex label="Tarih" value={date} onChangeText={setDate} /><Fld flex label="Başlangıç" value={time} onChangeText={setTime} /></Cols></Blk>
          <Blk lbl="Ücret">
            {pk ? (
              <Row onPress={() => open('pkgs')} left={<View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}><T s={14} w={800}>{pk.badge}</T></View>} t={pk.name} s={pk.why}
                right={<View style={{ alignItems: 'flex-end', gap: 4 }}><T s={15} w={800}>{pk.price}</T><T s={12} c={C.muted}>{pk.unit}</T></View>} style={{ backgroundColor: C.tintSoft, minHeight: 60 }} />
            ) : (
              <Row onPress={() => open('pkgs')} left={<Pkb t="+" />} t="Paket yok" s="Ücret için paket oluştur" chev style={{ backgroundColor: C.page, minHeight: 60 }} />
            )}
            <Sm>Kişinin paketi varsa o, yoksa temel paket gelir. Süre paketten gelir.</Sm>
          </Blk>
          <InCard>
            <GR t="Konum" chev onPress={() => pick('Konum', ['Stüdyo', 'Online', 'Adres'], loc, setLoc)} right={<T s={13} w={700} c={C.muted}>{loc}</T>} />
            <Repeat init={2} sum0="Her hafta · bitiş yok" start="10 Eylül" />
            <GR t="Kişiye bildir" s="Ders saati ve ücret onayına gider" right={<Sw init label="Kişiye bildir" />} />
          </InCard>
          <Blk lbl="Not"><Inp area accessibilityLabel="Ders notu" ph="Ders için not ekle · sadece sen görürsün" /></Blk>
        </Sheet>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: -13, right: 0, bottom: 0, backgroundColor: '#000' }, s1.dim]} />
      </Animated.View>
      {s1.mounted ? (
        <Animated.View style={[{ position: 'absolute', left: 0, top: -13, right: 0, bottom: 0, paddingTop: 13, backgroundColor: C.card, boxShadow: '-12px 0px 30px rgba(18,24,38,0.12)' }, s1.over]}>
          {(sub || last) === 'people' ? (
            <PeoplePanel sel={sel} onBack={() => setSub('')} onDone={n => { setSel(n); if (!emp || n.length) setPk(auto(n)); setSub(''); }} />
          ) : (
            <PkgPanel cur={pk} who={who} onBack={() => setSub('')} onSel={x => { setPk(x); setSub(''); toastLater('Paket seçildi'); }} onNew={newPk} />
          )}
        </Animated.View>
      ) : null}
    </View>
  );
}

export const SHEET_MAP: Record<string, React.ComponentType<SP>> = {
  newLesson: NewLesson, newBreak: NewBreak, addContact: AddContact, editContact: EditContact, accountEdit: AccountEdit, breakNew: BreakNew,
  packageSingle: ({ p }: SP) => <PackageSheet multi={false} p={p} />, packageMulti: ({ p }: SP) => <PackageSheet multi p={p} />,
};
