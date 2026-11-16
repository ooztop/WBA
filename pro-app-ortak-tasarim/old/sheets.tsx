// Alttan açılan paneller (prototipteki SH) ve panel içi ikinci ekranlar
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { DN, first, MN, PKG, TODAY, addD, dkey, type Lesson } from './data';
import { addPerson, closeSheet, get, openAction, patchPerson, person, personByName, pick, pop, push, set, toast, toastLater, useC, useFrame, useStore } from './store';
import { EASE, ff } from './theme';
import { Av, Body, BPair, Btn, Cbtn, Check, Chips, Empt, Expand, Fld, Foot, HL, Icon, Inp, NavRow, NavS, Note, Obox, RepBlock, Row, Rows, RulesBody, Sdiv, Sec, T, Tap, Tiles, Tog, Two, VBtn } from './ui';
import { PkBadge } from './screens';

type SP = { p: any };
const ease = Easing.bezier(...EASE);
const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;
const roomy = { paddingBottom: 18 };

/* ---------- panel içinde sağdan kayan ikinci ekran ---------- */
function useSlide(open: boolean) {
  const { W } = useFrame();
  const v = useSharedValue(0);
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    v.value = withTiming(open ? 1 : 0, { duration: 360, easing: ease });
    if (!open) { const t = setTimeout(() => setMounted(false), 380); return () => clearTimeout(t); }
  }, [open]);
  const over = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - v.value) * W }] }));
  const under = useAnimatedStyle(() => ({ transform: [{ translateX: -v.value * 0.3 * W }], opacity: 1 - v.value * 0.6 }));
  return { mounted, over, under };
}
const Over = ({ st, children }: { st: any; children: React.ReactNode }) => {
  const C = useC();
  return <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, paddingTop: 14, backgroundColor: C.sheet }, st]}>{children}</Animated.View>;
};
const SubNav = ({ title, onBack, onOk }: { title: string; onBack: () => void; onOk?: () => void }) => {
  const C = useC();
  return <NavRow left={<Cbtn ic="chevron_left" onPress={onBack} label="Geri" />} mid={<T s={17} w={600} c={C.a}>{title}</T>} right={onOk ? <Cbtn ic="check" ok onPress={onOk} label="Tamam" /> : null} />;
};
// Listenin üstünde yüzen ana buton
function FloatBtn({ children }: { children: React.ReactNode }) {
  const { bottom } = useFrame();
  return <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 8, paddingHorizontal: 18, paddingBottom: Math.max(30, bottom) }}>{children}</View>;
}

/* ================= Yeni ders ================= */
type PkSel = { name: string; why?: string };

function PkCardInner({ pk, who }: { pk: PkSel; who: string }) {
  const C = useC();
  const d = PKG[pk.name] || ['60', '₺750', 0];
  const why = pk.why ?? (pk.name === '8 derslik paket' && who === 'Elif Yıldırım' ? "Elif'in paketi · 5 ders kaldı" : d[2] ? '★ Temel paket' : 'Elle seçildi');
  const on = !!d[2] || why.includes('paketi');
  const dk = /\d+$/.test(d[0]);
  return (
    <>
      <PkBadge c1={d[0]} c2={dk ? 'dk' : ''} on={on} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <T s={15} w={570} numberOfLines={1}>{pk.name}</T>
        <T s={12.5} w={on ? 500 : 400} c={on ? C.a : C.t2} style={{ marginTop: 1 }} numberOfLines={1}>{why}</T>
      </View>
      <T s={15} w={600}>{d[1]}</T>
      <Icon n="chevron_right" s={20} f={0} c={C.a} />
    </>
  );
}

function PeoplePicker({ sel, onBack, onDone }: { sel: string[]; onBack: () => void; onDone: (names: string[]) => void }) {
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
    <>
      <SubNav title="Kişi seç" onBack={onBack} onOk={() => onDone(on)} />
      <View style={{ paddingTop: 2, paddingHorizontal: 18, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, borderRadius: 10, backgroundColor: C.fill, paddingHorizontal: 10 }}>
          <Icon n="search" s={19} f={0} c={C.t3} />
          <TextInput value={q} onChangeText={setQ} placeholder="Kişi ara" placeholderTextColor={C.t3} selectionColor={C.a} style={[{ flex: 1, fontFamily: ff(500), fontSize: 15, color: C.t, padding: 0, minWidth: 0 }, noOutline]} />
        </View>
        <T s={12.5} c={C.t2} style={{ marginTop: 8 }}>{on.length} kişi seçili</T>
      </View>
      <Body pb={form ? 190 : 90}>
        {list.length === 0 && emp ? <Empt ic="group" t="Henüz kişi yok" sub="Yeni kişi ekle ile hızlıca ekleyebilirsin." /> : null}
        <Rows>
          {list.map(p => (
            <Row key={p.id} av={[p.ini, p.ci, 36]} t={p.name} s={fresh.includes(p.name) ? 'Yeni kişi' : undefined} x={<Check on={on.includes(p.name)} />} onPress={() => setOn(on.includes(p.name) ? on.filter(x => x !== p.name) : [...on, p.name])} />
          ))}
        </Rows>
      </Body>
      <FloatBtn>
        {form ? (
          <View style={{ backgroundColor: C.sheet, borderRadius: 16, padding: 10, gap: 8, boxShadow: '0px 8px 28px rgba(0,0,0,0.14)' }}>
            <Inp autoFocus ph="Ad soyad" value={nm} onChangeText={setNm} onSubmitEditing={save} />
            <Inp ph="Telefon (isteğe bağlı)" keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn pair k="o" h={42} t="Vazgeç" onPress={() => setForm(false)} />
              <Btn pair h={42} t="Ekle" onPress={save} />
            </View>
          </View>
        ) : (
          <Btn t="Yeni kişi ekle" ic="person_add" h={46} onPress={() => setForm(true)} style={{ marginHorizontal: 0, marginBottom: 0, boxShadow: '0px 6px 18px rgba(47,75,209,0.28)' }} />
        )}
      </FloatBtn>
    </>
  );
}

function PkgList({ cur, who, onBack, onSel, onNew }: { cur: string; who: string; onBack: () => void; onSel: (n: string, own?: boolean) => void; onNew: () => void }) {
  const C = useC();
  const emp = useStore(s => s.emp);
  const own = who === 'Elif Yıldırım';
  const row = (n: string, c1: string, c2: string, sub: string, price: string, isOwn?: boolean) => (
    <Tap key={n + sub} fx="bg" onPress={() => onSel(n, isOwn)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12 }}>
      <PkBadge c1={c1} c2={c2} on={!!PKG[n][2] || isOwn} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <T s={15} w={570}>{n.split(' · ')[0]}</T>
        <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>{sub}</T>
      </View>
      <T s={15} w={600} c={isOwn ? C.a : C.t}>{price}</T>
      {n === cur && (isOwn || !own) ? <Icon n="check_circle" s={20} c={C.a} /> : null}
    </Tap>
  );
  const box = (kids: React.ReactNode[], ownBox?: boolean) => (
    <View style={{ marginHorizontal: 18, borderWidth: ownBox ? 1.5 : 1, borderColor: ownBox ? C.a : C.sep, backgroundColor: ownBox ? C.pbg : undefined, borderRadius: 14, overflow: 'hidden' }}>
      {kids.map((k, i) => <View key={i} style={{ borderTopWidth: i ? HL : 0, borderTopColor: C.sep }}>{k}</View>)}
    </View>
  );
  return (
    <>
      <SubNav title="Paketler" onBack={onBack} />
      <Body pb={90}>
        {emp ? (
          <Empt ic="sell" t="Henüz paket yok" sub="Kişiye özel paket ile ilk paketini oluştur." />
        ) : (
          <>
            {own ? (
              <>
                <Sec ic="star" t="Elif'in paketleri" sub="Satın aldığı ve ona özel paketler" />
                {box([row('8 derslik paket', '8×', '', "Satın aldı · 24 Eyl'e kadar", '5 kaldı', true)], true)}
                <Sdiv />
              </>
            ) : null}
            <Sec ic="person" t="Tekil ders" sub="Tek seanslık dersler" />
            {box([row('Tek ders · 60 dk', '60', 'dk', 'Takvimde 90 dk · 15 dk mola', '₺750'), row('Tek ders · 90 dk', '90', 'dk', 'Mola yok', '₺1.125')])}
            <Sdiv />
            <Sec ic="stacks" t="Çoklu paket" sub="Birden fazla seans, tek ödeme" />
            {box([row('8 derslik paket', '8×', '', 'ders başı ₺675 · 2 ay', '₺5.400'), row('Aylık üyelik', '12×', '', 'ders başı ₺600 · 1 ay', '₺7.200')])}
          </>
        )}
      </Body>
      <FloatBtn><Btn t="Kişiye özel paket" ic="person" h={46} onPress={onNew} style={{ marginHorizontal: 0, marginBottom: 0, boxShadow: '0px 6px 18px rgba(47,75,209,0.28)' }} /></FloatBtn>
    </>
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
  const [sel, setSel] = useState<string[]>(p?.n ? [p.n] : emp ? [] : ['Elif Yıldırım']);
  const auto = (names: string[]): PkSel => ({ name: names.length === 1 && names[0] === 'Elif Yıldırım' ? '8 derslik paket' : 'Tek ders · 60 dk' });
  const [pk, setPk] = useState<PkSel | null>(emp ? null : auto(sel));
  const [date, setDate] = useState('10 Eylül Çar');
  const [time, setTime] = useState('16:00');
  const [loc, setLoc] = useState('Stüdyo');
  const [sub, setSub] = useState<'' | 'people' | 'pkgs'>('');
  const [sub2, setSub2] = useState(false);
  const [last, setLast] = useState<'people' | 'pkgs'>('people');
  const s1 = useSlide(!!sub), s2 = useSlide(sub2);
  const who = sel[0] || '';
  const open = (k: 'people' | 'pkgs') => { setLast(k); setSub(k); };
  const [np, setNp] = useState({ name: '', price: '₺ 750' });

  const save = () => {
    const { d, h } = parseWhen(date, time);
    const pe = personByName(who);
    if (pe) {
      const l: Lesson = [h, 60, loc === 'Online' ? 'o' : sel.length > 1 ? 'g' : 'b', pe.id, 'w'];
      set(s => ({ extra: [...s.extra, { k: dkey(d), l }] }));
    }
    closeSheet();
    toastLater('Ders eklendi', 250);
  };
  const saveNew = () => {
    const nm = np.name.trim() || `${first(who || 'Kişi')}'e özel`;
    PKG[nm] = ['60', np.price.replace(/\s/g, '') || '₺750', 0];
    setPk({ name: nm, why: `${first(who || 'Kişi')}'e özel paket` });
    setSub2(false); setSub('');
    toastLater('Özel paket oluşturuldu');
  };
  const people = useStore(s => s.people);
  const avs = sel.slice(0, 3).map(n => people.find(x => x.name === n)).filter(Boolean);

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1 }, s1.under]}>
        <NavS title="Yeni ders" blue onOk={save} />
        <Body>
          <Sec
            ic="group"
            t="Kişiler"
            onPress={() => open('people')}
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flexDirection: 'row' }}>
                  {avs.map((x, i) => <View key={x!.id} style={{ marginLeft: i ? -8 : 0, borderRadius: 99, borderWidth: 2, borderColor: C.sheet }}><Av ini={x!.ini} ci={x!.ci} s={24} /></View>)}
                </View>
                <T s={14} w={500}>{sel.length === 0 ? 'Seç' : sel.length === 1 ? sel[0] : sel.length === 2 ? sel.map(first).join(', ') : `${sel.length} kişi`}</T>
                <Icon n="chevron_right" s={22} f={0} c={C.a} />
              </View>
            }
          />
          <Sdiv style={{ marginTop: 6 }} />
          <Sec ic="event" t="Zaman" />
          <Two><Fld bare label="Tarih" value={date} onChangeText={setDate} /><Fld bare label="Başlangıç" value={time} onChangeText={setTime} /></Two>
          <Sdiv />
          <Sec ic="payments" t="Ücret" sub="Kişinin paketi varsa o, yoksa temel paket gelir" />
          <Tap fx="bg" onPress={() => open('pkgs')} style={{ marginHorizontal: 18, borderWidth: 1, borderColor: C.sep, borderRadius: 14, paddingVertical: 11, paddingLeft: 12, paddingRight: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {pk ? <PkCardInner pk={pk} who={sel.length === 1 ? who : ''} /> : (
              <>
                <PkBadge icon="add" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T s={15} w={570}>Paket yok</T>
                  <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>Ücret için paket oluştur</T>
                </View>
                <Icon n="chevron_right" s={22} f={0} c={C.a} />
              </>
            )}
          </Tap>
          <Sdiv />
          <Sec ic="location_on" t="Konum" sub="Dersin yapılacağı yer" right={<VBtn v={loc} onPress={() => pick('Konum', ['Stüdyo', 'Online', 'Adres'], loc, setLoc)} />} />
          <Sdiv />
          <RepBlock what="Ders" init={2} sum="Her hafta · bitiş yok" />
          <Sdiv />
          <Sec ic="send" t="Kişiye bildir" sub="Ders saati ve ücret onayına gider" right={<Tog init />} />
          <View style={{ height: 24 }} />
        </Body>
      </Animated.View>
      {s1.mounted ? (
        <Over st={[s1.over]}>
          <Animated.View style={[{ flex: 1 }, s2.under]}>
            {(sub || last) === 'people' ? (
              <PeoplePicker sel={sel} onBack={() => setSub('')} onDone={names => { setSel(names); if (!emp || names.length) setPk(auto(names)); setSub(''); }} />
            ) : (
              <PkgList cur={pk?.name || ''} who={who} onBack={() => setSub('')} onSel={n => { setPk({ name: n }); setSub(''); }} onNew={() => { setNp({ name: `${first(who || 'Kişi')}'e özel`, price: '₺ 750' }); setSub2(true); }} />
            )}
          </Animated.View>
        </Over>
      ) : null}
      {s2.mounted ? (
        <Over st={[s2.over]}>
          <SubNav title="Yeni paket" onBack={() => setSub2(false)} onOk={saveNew} />
          <Body>
            <View style={{ height: 6 }} />
            <Sec ic="person" t={`Sadece ${first(who || 'Kişi')}'e özel`} sub="Paket listende görünmez" right={<Tog init />} />
            <SingleBody name={np.name} price={np.price} onName={v => setNp({ ...np, name: v })} onPrice={v => setNp({ ...np, price: v })} />
          </Body>
        </Over>
      ) : null}
    </View>
  );
}

/* ================= Mola ekle ================= */
function NewBreak() {
  const [m, setM] = useState(0);
  const [why, setWhy] = useState('Öğle arası');
  const C = useC();
  return (
    <>
      <NavS title="Mola ekle" blue toast="Mola eklendi" />
      <Body>
        <View style={{ height: 6 }} />
        <Tiles cols={2} value={m} onChange={setM} items={[['snooze', 'Gün içinde ara', 'Saat aralığı'], ['beach_access', 'Tüm gün kapalı', 'İzin günü']]} />
        <Sdiv />
        <Sec ic="calendar_month" t="Gün" sub="Birden fazla seçebilirsin" />
        <Chips
          items={['Pzt 7', 'Sal 8', 'Çar 9', 'Per 10', 'Cum 11', 'Cmt 12', 'Paz 13']}
          multi
          init={[2]}
          cols={7}
          off={[6]}
          render={(x, on, col) => (
            <>
              <T s={11} c={col} style={{ opacity: 0.75 }}>{x.split(' ')[0]}</T>
              <T s={15} w={600} c={col}>{x.split(' ')[1]}</T>
            </>
          )}
        />
        {m === 0 ? (
          <>
            <Sdiv />
            <Sec ic="schedule" t="Saat" />
            <Two><Fld bare label="Başlangıç" v="12:30" /><Fld bare label="Bitiş" v="13:00" /></Two>
          </>
        ) : null}
        <Sdiv />
        <Sec ic="edit_note" t="Sebep" sub="Takvimde bu isimle görünür" right={<VBtn v={why} onPress={() => pick('Sebep', ['Öğle arası', 'Kahve arası', 'Toplantı', 'Kişisel', 'Diğer'], why, setWhy)} />} />
        <Sdiv />
        <Sec ic="visibility" t="Sebebi kişiler görsün" sub="Kapalıysa sadece dolu görünür" right={<Tog />} />
        {m === 0 ? (
          <>
            <Sdiv />
            <RepBlock what="Mola" init={0} sum="Tekrarlanmaz" />
          </>
        ) : null}
        <View style={{ height: 24 }} />
      </Body>
    </>
  );
}

/* ================= kişi formları ================= */
function PkForm({ name }: { name: string }) {
  const C = useC();
  return (
    <View style={{ paddingTop: 12, marginTop: 12, borderTopWidth: HL, borderTopColor: C.sep }}>
      <Fld bare label="Paket adı" v={name} style={{ flex: undefined, paddingBottom: 10 }} />
      <T s={12.5} w={500} c={C.t2} style={{ marginBottom: 6 }}>Seans sayısı</T>
      <Chips items={['Tek ders', '4', '8', '12']} init={2} blue={false} style={{ paddingHorizontal: 0, paddingBottom: 10 }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Fld bare label="Seans süresi" v="60 dk" />
        <Fld bare label="Paket ücreti" v="₺ 5.000" />
      </View>
    </View>
  );
}
function PkObox({ t, s, name }: { t: string; s: string; name: string }) {
  const C = useC();
  const [o, setO] = useState(false);
  return (
    <Obox t={t} s={s} right={<Tap onPress={() => setO(!o)} label="Özel paket" style={{ width: 26, height: 26, borderRadius: 99, backgroundColor: C.aSoft, alignItems: 'center', justifyContent: 'center' }}><Icon n={o ? 'remove' : 'add'} s={18} c={C.a} /></Tap>}>
      {o ? <PkForm name={name} /> : null}
    </Obox>
  );
}
const Rehber = () => {
  const C = useC();
  return <Tap onPress={() => toast('Rehber açılıyor')} hit={8}><T s={13.5} w={600} c={C.a}>Rehber</T></Tap>;
};

function AddContact() {
  const C = useC();
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const save = () => {
    const n = `${ad.trim()} ${soyad.trim()}`.trim();
    if (!n) { toast('Önce bir ad yaz'); return; }
    addPerson(n);
    closeSheet();
    toastLater('Kişi eklendi', 250);
  };
  return (
    <>
      <NavS title="Yeni kişi" onOk={save} />
      <Body>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 28 }}>
          <Tap onPress={() => toast('Fotoğraf seç')} label="Fotoğraf ekle" style={{ width: 54, height: 54, borderRadius: 99, backgroundColor: C.fill, alignItems: 'center', justifyContent: 'center' }}><Icon n="add_a_photo" s={21} c={C.t2} /></Tap>
          <View>
            <T s={15} w={570}>Fotoğraf ekle</T>
            <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>İsteğe bağlı · rehberden de alabilirsin</T>
          </View>
        </View>
        <Two style={roomy}><Fld bare label="Ad" ph="Ad" value={ad} onChangeText={setAd} /><Fld bare label="Soyad" ph="Soyad" value={soyad} onChangeText={setSoyad} /></Two>
        <Fld label="Telefon" ph="+90 5•• ••• ••••" keyboardType="phone-pad" pr={74} right={<Rehber />} style={roomy} />
        <Fld label="E-posta" ph="İsteğe bağlı" keyboardType="email-address" autoCapitalize="none" style={roomy} />
        <Fld label="Not" area ph="Örn. salı ve perşembe uygun" style={roomy} />
        <View style={{ height: 8 }} />
        <PkObox t="Özel paket tanımla" s="Bu kişiye özel fiyat veya paket" name="Özel paket" />
        <Obox t="Profilimi paylaş" s="Kişiye rezervasyon bağlantısı gönder" init />
      </Body>
    </>
  );
}

function EditContact({ p }: SP) {
  const C = useC();
  const x = person(p.i || 0), n = x.name.split(' ');
  const gone = (patch: { arch?: boolean; gone?: boolean }, msg: string) => {
    patchPerson(x.id, patch);
    closeSheet(); pop();
    toastLater(msg, 300, 'Geri al', () => patchPerson(x.id, { arch: false, gone: false }));
  };
  return (
    <>
      <NavS title="Kişiyi düzenle" toast="Değişiklikler kaydedildi" />
      <Body>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 12, paddingHorizontal: 18, paddingBottom: 20 }}>
          <Av ini={x.ini} ci={x.ci} s={54} />
          <View>
            <Tap onPress={() => toast('Fotoğraf seç')}><T s={15} w={570} c={C.a}>Fotoğrafı değiştir</T></Tap>
            <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>İsteğe bağlı · rehberden de alabilirsin</T>
          </View>
        </View>
        <Two><Fld bare label="Ad" v={n[0]} /><Fld bare label="Soyad" v={n.slice(1).join(' ')} /></Two>
        <Fld label="Telefon" v="+90 532 000 00 00" keyboardType="phone-pad" pr={74} right={<Rehber />} />
        <Fld label="E-posta" v={`${n[0].toLocaleLowerCase('tr')}@ornek.com`} keyboardType="email-address" autoCapitalize="none" />
        <Fld label="Not" area v="Ödemeleri ay sonunda toplu yapıyor" />
        <PkObox t="Özel paket" s="8 derslik paket · ₺5.000" name="8 derslik paket" />
        <Obox t="Ödeme hatırlatması" s="Borç 7 günü geçince otomatik mesaj" init />
      </Body>
      <Foot line={false} pt={8}>
        <BPair>
          <Btn pair k="o" t="Arşivle" onPress={() => openAction(`${x.name} arşivlensin mi?`, 'Kişiler listesinden kalkar, gelecek dersleri iptal edilir. Ders geçmişi ve ödeme kaydı durur.', 'Arşivle', false, () => gone({ arch: true }, `${x.name} arşivlendi`))} />
          <Btn pair k="dsoft" t="Kişiyi sil" onPress={() => openAction(`${x.name} silinsin mi?`, 'Tüm ders kaydı ve ödeme geçmişi kalıcı olarak silinir.', 'Kişiyi sil', true, () => gone({ gone: true }, `${x.name} silindi`))} />
        </BPair>
      </Foot>
    </>
  );
}

function AccountEdit() {
  const C = useC();
  return (
    <>
      <NavS title="Hesabı düzenle" blue toast="Değişiklikler kaydedildi" />
      <Body>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 12, paddingHorizontal: 18, paddingBottom: 20 }}>
          <Av ini="DA" ci={2} s={54} />
          <View>
            <Tap onPress={() => toast('Fotoğraf seç')}><T s={15} w={570} c={C.a}>Fotoğrafı değiştir</T></Tap>
            <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>Profilinde görünür</T>
          </View>
        </View>
        <Two style={roomy}><Fld bare label="Ad" v="Deniz" /><Fld bare label="Soyad" v="Arslan" /></Two>
        <Fld label="Ünvan / iş kolu" v="Özel ders · Matematik" style={roomy} />
        <Fld label="Telefon" v="+90 532 440 16 28" keyboardType="phone-pad" pr={44} right={<Icon n="verified" s={19} c={C.ok} />} style={roomy} />
        <Fld label="Web sitesi" v="denizarslan.com" autoCapitalize="none" style={roomy} />
        <Fld label="Hakkımda" area v="10 yıldır lise ve üniversite hazırlık dersleri veriyorum." style={roomy} />
        <Sdiv style={{ marginTop: 0 }} />
        <Sec ic="public" t="Profil herkese açık" sub="QR ile gelenler randevu alabilir" right={<Tog init />} />
      </Body>
      <Foot line={false} pt={8}>
        <BPair><Btn pair k="dsoft" t="Hesabı sil" onPress={() => { closeSheet(); setTimeout(() => push('deleteAccount'), 200); }} /></BPair>
      </Foot>
    </>
  );
}

function BreakNew() {
  const { bottom } = useFrame();
  return (
    <>
      <NavS title="Düzenli mola" />
      <Body>
        <Sec ic="snooze" t="Mola adı" sub="Takvimde bu isimle görünür" />
        <Fld v="Kahve arası" accessibilityLabel="Mola adı" style={{ paddingBottom: 0 }} />
        <Sdiv />
        <Sec ic="schedule" t="Saat" sub="Takvimde 30 dk yer tutar" />
        <Two><Fld bare label="Başlangıç" v="15:00" /><Fld bare label="Bitiş" v="15:30" /></Two>
        <Sdiv />
        <Sec ic="event_repeat" t="Hangi günler" sub="Pazar kapalı olduğu için seçilemez" />
        <Chips items={DN} multi init={[0, 1, 2, 3, 4]} cols={7} off={[6]} />
        <Sdiv />
        <Sec ic="event_busy" t="Rezervasyon kapalı" sub="Kişiler bu aralığı dolu görür" right={<Tog init />} />
      </Body>
      <Note t="Her hafta tekrar eder. Tek bir gün için takvimdeki + butonunu kullan." style={{ paddingTop: 10, paddingBottom: Math.max(30, bottom) }} />
    </>
  );
}

/* ================= paketler: Tekil ↔ Çoklu ================= */
const PAY: [string, string][] = [['payments', 'Nakit'], ['account_balance', 'Havale'], ['credit_card', 'Kart']];
const Unit = ({ t }: { t: string }) => {
  const C = useC();
  return <T s={13.5} w={500} c={C.t3}>{t}</T>;
};

function SingleBody({ name, price, onName, onPrice }: { name?: string; price?: string; onName?: (v: string) => void; onPrice?: (v: string) => void }) {
  return (
    <>
      <Sdiv />
      <Sec ic="sell" t="Ders" sub="Kişilerin göreceği ad ve ücret" />
      <Two style={{ paddingBottom: 0 }}>
        {onName ? <Fld bare value={name} onChangeText={onName} accessibilityLabel="Ders adı" /> : <Fld bare v="Tek ders" accessibilityLabel="Ders adı" />}
        {onPrice ? <Fld bare value={price} onChangeText={onPrice} accessibilityLabel="Ücret" pr={60} right={<Unit t="/ ders" />} /> : <Fld bare v="₺ 750" accessibilityLabel="Ücret" pr={60} right={<Unit t="/ ders" />} />}
      </Two>
      <Sdiv />
      <Sec ic="timer" t="Ders süresi" />
      <Chips items={['30 dk', '45 dk', '60 dk']} init={2} cols={4} cst="dk" />
      <Sdiv />
      <Sec ic="payments" t="Ödeme yöntemi" sub="Bu derste kabul ettiklerin" />
      <Tiles items={PAY} multi init={[0, 1]} />
      <Sdiv />
      <Sec ic="visibility" t="Profilde göster" sub="Paylaştığın sayfada görünür" right={<Tog init />} />
      <Sdiv />
      <Expand ic="gavel" t="Ders kuralları" sub="Genel kurallar geçerli" subOn="Bu pakete özel · genel ayarı ezer">
        <RulesBody win="Dersten en geç kaç saat önce" cancel="Bu süreden sonra ücret alınır" />
      </Expand>
      <View style={{ height: 10 }} />
    </>
  );
}
function MultiBody() {
  return (
    <>
      <Sdiv />
      <Sec ic="sell" t="Paket" sub="Kişilerin göreceği ad ve toplam ücret" />
      <Two style={{ paddingBottom: 0 }}>
        <Fld bare v="8 derslik paket" accessibilityLabel="Paket adı" />
        <Fld bare v="₺ 5.400" accessibilityLabel="Paket ücreti" pr={62} right={<Unit t="/ paket" />} />
      </Two>
      <Note t="Ders başı ₺675 · tek derse göre %10 indirim" style={{ paddingTop: 8, paddingBottom: 0 }} />
      <Sdiv />
      <Sec ic="stacks" t="Seans sayısı" />
      <Chips items={['4', '8', '12']} init={1} cols={4} cst="seans" />
      <Sdiv />
      <Sec ic="timer" t="Seans süresi" />
      <Chips items={['30 dk', '60 dk', '90 dk']} init={1} cols={4} cst="dk" />
      <Sdiv />
      <Sec ic="hourglass_empty" t="Geçerlilik" sub="Paket bu sürede kullanılmalı" />
      <Chips items={['1 ay', '2 ay', '3 ay']} init={1} cols={4} cst="ay" />
      <Sdiv />
      <Sec ic="payments" t="Ödeme yöntemi" sub="Bu pakette kabul ettiklerin" />
      <Tiles items={PAY} multi init={[0, 1]} />
      <Sdiv />
      <Sec ic="credit_score" t="Peşin ödeme" sub="Paket başında tamamı alınır" right={<Tog init />} />
      <Sdiv />
      <Sec ic="visibility" t="Profilde göster" sub="Paylaştığın sayfada görünür" right={<Tog init />} />
      <Sdiv />
      <Expand ic="gavel" t="Ders kuralları" sub="Genel kurallar geçerli" subOn="Bu pakete özel · genel ayarı ezer">
        <RulesBody win="Seanstan en geç kaç saat önce" cancel="Bu süreden sonra seans düşer" />
      </Expand>
      <View style={{ height: 10 }} />
    </>
  );
}

function PackageSheet({ multi0 }: { multi0: boolean }) {
  const [multi, setMulti] = useState(multi0);
  const [shown, setShown] = useState(multi0);
  const v = useSharedValue(1);
  const sw = (m: boolean) => {
    if (m === multi) return;
    setMulti(m);
    v.value = withTiming(0, { duration: 140 });
    setTimeout(() => { setShown(m); v.value = withDelay(30, withTiming(1, { duration: 380, easing: ease })); }, 150);
  };
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * (multi === shown ? 14 : -6) }] }));
  return (
    <>
      <NavS title={multi ? 'Çoklu paket' : 'Tekil ders'} blue />
      <Body>
        <View style={{ height: 6 }} />
        <Tiles cols={2} value={multi ? 1 : 0} onChange={i => sw(i === 1)} items={[['person', 'Tekil ders', '1 seans'], ['stacks', 'Çoklu paket', 'Birden fazla seans']]} />
        <Animated.View style={st}>{shown ? <MultiBody /> : <SingleBody />}</Animated.View>
      </Body>
      <Foot line={false} pt={8}>
        <BPair><Btn pair k="dsoft" t={multi ? 'Bu paketi sil' : 'Bu dersi sil'} onPress={() => { closeSheet(); toastLater(multi ? 'Paket silindi' : 'Ders silindi', 250); }} /></BPair>
      </Foot>
    </>
  );
}

export const SHEET_MAP: Record<string, React.ComponentType<SP>> = {
  newLesson: NewLesson, newBreak: NewBreak, addContact: AddContact, editContact: EditContact, accountEdit: AccountEdit, breakNew: BreakNew,
  packageSingle: () => <PackageSheet multi0={false} />, packageMulti: () => <PackageSheet multi0 />,
};
