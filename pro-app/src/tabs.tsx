// Sekme kökleri: Kişiler, Bildirimler, Hesabım (Takvim ayrı dosyada)
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View, Platform } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { TRA, type Person } from './data';
import { closeAction, go, openAction, openMenu, openSheet, patchPerson, push, set, get, toast, toastLater, useC, useFrame, useStore } from './store';
import { ff } from './theme';
import { Av, Body, Btn, Empt, HL, Icon, Note, RBtn, RHead, Row, Rows, Sh, T, Tap, type SV } from './ui';

/* ---------- QR (prototipteki sahte desen) ---------- */
export function QR({ s, c = '#16171A' }: { s: number; c?: string }) {
  const cells = useMemo(() => {
    let h = 7;
    const r = () => (h = (h * 9301 + 49297) % 233280) / 233280;
    const out: [number, number][] = [];
    for (let y = 0; y < 25; y++)
      for (let x = 0; x < 25; x++) {
        const f = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17);
        const on = f
          ? (x % 6 === 0 || y % 6 === 0 || x === 24 || y === 24 || (x % 24 > 1 && x % 24 < 5 && y % 24 > 1 && y % 24 < 5) || (x > 19 && x < 23 && y > 1 && y < 5) || (x > 1 && x < 5 && y > 19 && y < 23)) && !((x === 1 || x === 5 || x === 19 || x === 23) && !(y % 6 === 0))
          : r() > 0.52;
        if (on) out.push([x, y]);
      }
    return out;
  }, []);
  const u = s / 25;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {cells.map(([x, y], i) => <Rect key={i} x={x * u} y={y * u} width={u + 0.3} height={u + 0.3} fill={c} />)}
    </Svg>
  );
}

/* ---------- Kişiler ---------- */
const FILTERS: [string, string][] = [['Tümü', 'hepsi'], ['Üyeler', 'uye'], ['Bu hafta', 'hafta'], ['Borçlu', 'borc'], ['Arşiv', 'arsiv']];

function Contacts() {
  const C = useC();
  const { tbh } = useFrame();
  const emp = useStore(s => s.emp);
  const all = useStore(s => s.people);
  const [q, setQ] = useState('');
  const [f, setF] = useState('hepsi');
  const sc = useRef<SV>(null);
  const ys = useRef<Record<string, number>>({}).current;
  const base = useRef(0);
  const people = all.filter(p => !p.gone);
  const active = people.filter(p => !p.arch);

  if (emp)
    return (
      <>
        <RHead title="Kişiler" sub="Henüz kişi yok" right={<RBtn ic="person_add" label="Kişi ekle" onPress={() => openSheet('addContact')} />} />
        <Body pb={110}>
          <Empt ic="group" t="Henüz kişi yok" sub="İlk kişini ekle ya da profil bağlantını paylaş. QR ile gelenler burada görünür.">
            <Btn t="Kişi ekle" h={44} fs={15} onPress={() => openSheet('addContact')} style={{ marginHorizontal: 0, marginBottom: 0 }} />
            <Btn t="Profilini paylaş" k="o" h={44} fs={15} onPress={() => go('share')} style={{ marginHorizontal: 0, marginBottom: 0 }} />
          </Empt>
        </Body>
      </>
    );

  const qq = q.toLocaleLowerCase('tr').trim();
  const vis = (f === 'arsiv' ? people.filter(p => p.arch) : active.filter(p => f === 'hepsi' || p.cat.split(' ').includes(f))).filter(p => !qq || p.name.toLocaleLowerCase('tr').includes(qq));
  const groups: Record<string, Person[]> = {};
  if (f !== 'arsiv') vis.slice().sort((a, b) => a.name.localeCompare(b.name, 'tr')).forEach(p => { const L = p.name[0].toLocaleUpperCase('tr'); (groups[L] = groups[L] || []).push(p); });
  const letters = Object.keys(groups).sort((a, b) => TRA.indexOf(a) - TRA.indexOf(b));
  const jump = (L: string) => {
    const i0 = TRA.indexOf(L);
    const h = letters.find(x => TRA.indexOf(x) >= i0) || letters[letters.length - 1];
    if (h && ys[h] != null) sc.current?.scrollTo({ y: base.current + ys[h], animated: true });
  };
  const head = (t: string, key: string) => (
    <View key={key} style={{ paddingTop: 12, paddingLeft: 18, paddingBottom: 4, borderBottomWidth: HL, borderBottomColor: C.sep, marginRight: 18 }}>
      <T s={13} w={600} c={C.t2}>{t}</T>
    </View>
  );
  return (
    <>
      <RHead title="Kişiler" sub={`${active.length} aktif kişi`} right={<RBtn ic="person_add" label="Kişi ekle" onPress={() => openSheet('addContact')} />} />
      <Body pb={tbh + 24} scrollRef={sc}>
        <View style={{ paddingHorizontal: 18, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, borderRadius: 10, backgroundColor: C.fill, paddingHorizontal: 10 }}>
            <Icon n="search" s={19} f={0} c={C.t3} />
            <TextInput value={q} onChangeText={setQ} placeholder="Kişi ara" placeholderTextColor={C.t3} selectionColor={C.a} style={[{ flex: 1, fontFamily: ff(500), fontSize: 15, color: C.t, padding: 0, minWidth: 0 }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null]} />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 18, paddingBottom: 6 }}>
          {FILTERS.map(x => {
            const on = f === x[1];
            return (
              <Pressable key={x[1]} onPress={() => setF(x[1])} accessibilityRole="button" accessibilityState={{ selected: on }} style={{ paddingVertical: 6, paddingHorizontal: 11, borderRadius: 99, backgroundColor: on ? C.t : C.fill }}>
                <T s={13} w={500} c={on ? C.bg : C.t}>{x[0]}</T>
              </Pressable>
            );
          })}
        </ScrollView>
        <View onLayout={e => { base.current = e.nativeEvent.layout.y; }}>
          {letters.map(L => (
            <View key={L} onLayout={e => { ys[L] = e.nativeEvent.layout.y; }}>
              {head(L, L)}
              <Rows>
                {groups[L].map(p => <Row key={p.id} av={[p.ini, p.ci, 36]} t={p.name} onPress={() => go('contact', undefined, { i: p.id })} />)}
              </Rows>
            </View>
          ))}
          {f === 'arsiv' && vis.length ? (
            <>
              {head('Arşivdekiler', 'a')}
              <Rows>
                {vis.map(p => (
                  <Row
                    key={p.id}
                    av={[p.ini, p.ci, 36]}
                    t={p.name}
                    tC={C.t2}
                    x={
                      <Tap onPress={() => { patchPerson(p.id, { arch: false }); toast('Kişi geri alındı'); }} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, backgroundColor: C.fill }}>
                        <T s={13} w={500} c={C.a}>Geri al</T>
                      </Tap>
                    }
                  />
                ))}
              </Rows>
            </>
          ) : null}
        </View>
        {vis.length ? null : <Note t="Bu filtrede kişi yok." style={{ textAlign: 'center', paddingTop: 30 }} />}
      </Body>
      {f !== 'arsiv' && !qq ? (
        <View style={{ position: 'absolute', right: 1, top: 196, bottom: tbh + 14, justifyContent: 'center', alignItems: 'center' }}>
          {TRA.map(L => (
            <Pressable key={L} onPress={() => jump(L)} hitSlop={{ left: 8, right: 2 }}>
              <T s={10} w={700} c={C.a} style={{ lineHeight: 13, paddingHorizontal: 4 }}>{L}</T>
            </Pressable>
          ))}
        </View>
      ) : null}
    </>
  );
}

/* ---------- Bildirimler ---------- */
function Notifs() {
  const C = useC();
  const { tbh } = useFrame();
  const emp = useStore(s => s.emp);
  const right = <RBtn ic="settings" label="Bildirim ayarları" onPress={() => go('notifPrefs')} />;
  if (emp)
    return (
      <>
        <RHead title="Bildirimler" sub="Yeni bildirim yok" right={right} />
        <Body pb={110}><Empt ic="notifications" t="Bildirim yok" sub="Rezervasyon talepleri, ödemeler ve iptaller burada görünür." /></Body>
      </>
    );
  const nr = (ini: string, c: number, t: string, sub: string, v: string, on: () => void) => (
    <Row av={[ini, c, 40]} t={t} s={sub} x={<T s={13} c={C.t2}>{v}</T>} onPress={on} />
  );
  return (
    <>
      <RHead title="Bildirimler" sub="2 rezervasyon talebi bekliyor" right={right} />
      <Body pb={tbh + 24}>
        <Sh t="Bugün" />
        <Rows>
          {nr('BŞ', 2, 'Yeni rezervasyon talebi', 'Burak Şahin · 12 Eyl 18:00', '24 dk', () => go('request', undefined, {}))}
          {nr('AK', 3, 'Talep çakışıyor', 'Ayşe Koç · grup dersiyle aynı saat', '1 sa', () => go('request', undefined, { c: 1 }))}
          {nr('EY', 0, 'Yeni saat onaylandı', 'Elif Yıldırım · 12 Eyl 18:00', '3 sa', () => go('rsAccepted', undefined, { n: 'Elif Yıldırım' }))}
        </Rows>
        <Sh t="Bu hafta" />
        <Rows>
          {nr('MK', 1, 'Ödeme bekleniyor', 'Mert Kaya tarafından · ₺1.500', 'Pzt', () => go('payment', undefined, { i: 1 }))}
          {nr('SD', 1, 'Ders iptal edildi', 'Selin Demir · 8 Eyl 19:00', 'Pzt', () => go('cancelled', undefined, { n: 'Selin Demir', k: 1, nb: 1 }))}
          {nr('CÖ', 0, 'Paket bitmek üzere', 'Can Öztürk · 2 ders kaldı', 'Paz', () => go('contact', undefined, { i: 4 }))}
        </Rows>
      </Body>
    </>
  );
}

/* ---------- Hesabım ---------- */
export function logout() {
  openAction('Çıkış yapılsın mı?', 'Takvimin ve kişilerin sunucuda kalır. Tekrar giriş yaptığında her şey yerinde olur.', 'Çıkış yap', true, () => go('login'));
}
function acctMenu() {
  const s = get();
  openMenu('Hesap', [
    { icon: 'help', label: 'Yardım ve destek', onPress: () => setTimeout(() => push('help'), 250) },
    // Prototipteki "Koyu tema" ve "Boş sayfa" düğmelerinin uygulama içi karşılığı
    { icon: s.dark ? 'light_mode' : 'dark_mode', label: s.dark ? 'Açık tema' : 'Koyu tema', onPress: () => set({ dark: !s.dark }) },
    { icon: 'inbox', label: s.emp ? 'Dolu sayfa' : 'Boş sayfa', onPress: () => set({ emp: !s.emp }) },
    { icon: 'logout', label: 'Çıkış yap', onPress: () => setTimeout(logout, 250) },
  ]);
}

function Account() {
  const C = useC();
  const { tbh } = useFrame();
  const act = (ic: string, t: string, msg: string, f: 0 | 1, first?: boolean) => (
    <Tap onPress={() => toast(msg)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, borderTopWidth: first ? 0 : HL, borderTopColor: C.sep }}>
      <Icon n={ic} s={19} f={f} c={C.a} />
      <T s={14} w={500} c={C.a} numberOfLines={1}>{t}</T>
    </Tap>
  );
  return (
    <>
      <RHead title="Hesabım" sub="Profil, ödemeler ve ayarlar" right={<RBtn ic="more_horiz" s={22} label="Diğer" onPress={acctMenu} />} />
      <Body pb={tbh + 24}>
        <View style={{ marginTop: 6, marginHorizontal: 18, borderRadius: 20, backgroundColor: C.pbg, overflow: 'hidden' }}>
          <Tap fx="bg" onPress={() => openSheet('accountEdit')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: HL, borderBottomColor: C.sep }}>
            <Av ini="DA" ci={2} s={44} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T s={17} w={600} ls={-0.01}>Deniz Arslan</T>
              <T s={12.5} c={C.t2} style={{ marginTop: 1 }}>Özel ders · İstanbul</T>
            </View>
            <View style={{ width: 34, height: 34, borderRadius: 99, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Icon n="edit" s={17} c={C.a} /></View>
          </Tap>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, paddingHorizontal: 16 }}>
            <Tap onPress={() => go('share')} label="Profilini paylaş" style={{ backgroundColor: '#fff', padding: 7, borderRadius: 12 }}><QR s={96} /></Tap>
            <View style={{ flex: 1, minWidth: 0 }}>
              {act('link', 'Bağlantıyı kopyala', 'Bağlantı kopyalandı', 0, true)}
              {act('nfc', 'NFC ile paylaş', 'Telefonu yaklaştır', 1)}
            </View>
          </View>
        </View>
        <View style={{ height: 8 }} />
        <Rows><Row ic="receipt_long" t="Ödemeler" chev onPress={() => go('payments')} /></Rows>
        <Sh t="Ayarlar" />
        <Rows>
          <Row ic="schedule" t="Takvim ayarlarım" v="10:00 – 18:00" chev onPress={() => go('calendarPrefs')} />
          <Row ic="gavel" t="Ders kuralları" chev onPress={() => go('rules')} />
          <Row ic="sell" t="Paket tercihleri" v="4 paket" chev onPress={() => go('pricing')} />
        </Rows>
      </Body>
    </>
  );
}

export function RootTab({ tab }: { tab: number }) {
  const C = useC();
  const { top } = useFrame();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: top }}>
      {tab === 1 ? <Contacts /> : tab === 2 ? <Notifs /> : <Account />}
    </View>
  );
}
