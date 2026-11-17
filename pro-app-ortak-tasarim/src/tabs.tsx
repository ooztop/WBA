// Sekme kökleri: Kişiler, Bildirimler, Hesabım (Takvim ayrı dosyada)
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { TRA, type Person } from './data';
import { get, go, openAction, openMenu, openSheet, push, toast, toastLater, useC, useFrame, useStore } from './store';
import { copy, LINK } from './device';
import { acceptReq } from './screens3';
import { rejectRequest, resetDemo, setAccent, setDark, setEmptyMode, updatePerson } from './data/actions';
import { ff } from './theme';
import { Av, Band, Btn, Chip, Empty, FC, Fic, GCard, GR, Grp, IB, Icon, Lbl, List, noOutline, QR, Row, Rt, Scr, Sm, T, Tag, Tap, type SV } from './ui';

const T2 = ({ t, sub }: { t: string; sub?: string }) => {
  const C = useC();
  return (
    <>
      <T s={24} w={800} lh={1.15} c={C.onDark}>{t}</T>
      {sub ? <Sm c={C.onDarkMuted} style={{ marginTop: 4 }}>{sub}</Sm> : null}
    </>
  );
};

/* ---------- Kişiler ---------- */
function Contacts() {
  const C = useC();
  const { tbh } = useFrame();
  const emp = useStore(s => s.emp);
  const all = useStore(s => s.people);
  const [q, setQ] = useState('');
  const [f, setF] = useState('hepsi');
  const sc = useRef<SV>(null);
  const ys = useRef<Record<string, number>>({}).current;
  const people = all.filter(p => !p.gone), active = people.filter(p => !p.arch);

  if (emp)
    return (
      <>
        <Band lbl="Kişiler"><T2 t="Henüz kişi yok" /></Band>
        <Empty ic="users" t="İlk kişini ekle" sub="Kişi ekle ya da profil bağlantını paylaş. QR ile gelenler burada görünür." style={{ paddingBottom: tbh + 24 }}>
          <Btn t="Kişi ekle" onPress={() => openSheet('addContact')} />
          <Btn k="g" t="Profilini paylaş" onPress={() => go('share')} />
        </Empty>
      </>
    );

  const n = (c: string) => active.filter(p => p.cat.split(' ').includes(c)).length;
  const FILTERS: [string, string, string?][] = [['Tümü', 'hepsi'], ['Üyeler', 'uye', String(n('uye'))], ['Bu hafta', 'hafta', String(n('hafta'))], ['Borçlu', 'borc', String(n('borc'))], ['Arşiv', 'arsiv']];
  const qq = q.toLocaleLowerCase('tr').trim();
  const vis = (f === 'arsiv' ? people.filter(p => p.arch) : active.filter(p => f === 'hepsi' || p.cat.split(' ').includes(f))).filter(p => !qq || p.name.toLocaleLowerCase('tr').includes(qq));
  const groups: Record<string, Person[]> = {};
  vis.slice().sort((a, b) => a.name.localeCompare(b.name, 'tr')).forEach(p => { const L = p.name[0].toLocaleUpperCase('tr'); (groups[L] = groups[L] || []).push(p); });
  const letters = Object.keys(groups).sort((a, b) => TRA.indexOf(a) - TRA.indexOf(b));
  return (
    <>
      <Band lbl="Kişiler" right={<IB ic="userPlus" k="p" label="Kişi ekle" onPress={() => openSheet('addContact')} />}>
        <T2 t={`${active.length} aktif kişi`} sub={`Bu hafta ${n('hafta')} kişiyle dersin var`} />
      </Band>
      <View style={{ marginTop: 16, marginHorizontal: 16, height: 48, borderRadius: 12, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
        <Icon n="search" c={C.muted} />
        <TextInput value={q} onChangeText={setQ} accessibilityLabel="Kişi ara" placeholder="Kişi ara" placeholderTextColor={C.muted} selectionColor={C.accent} style={[{ flex: 1, minWidth: 0, fontFamily: ff(500), fontSize: 15, color: C.ink, padding: 0 }, noOutline]} />
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 4 }}>
          {FILTERS.map(x => <Chip key={x[1]} t={x[0]} cn={x[2]} on={f === x[1]} onPress={() => setF(x[1])} />)}
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>
        <Scr pb={tbh + 24} scrollRef={sc}>
          {letters.map(L => (
            <View key={L} onLayout={e => { ys[L] = e.nativeEvent.layout.y; }}>
              <Grp t={L} style={{ paddingRight: 36 }} />
              <List style={{ paddingRight: 36 }}>
                {groups[L].map(p => (
                  <Row key={p.id} left={<Av ini={p.ini} />} t={p.name} s={p.sub} onPress={p.arch ? undefined : () => go('contact', undefined, { i: p.id })}
                    right={p.arch ? <Btn small k="g" t="Geri al" onPress={() => { void updatePerson(p.id, { arch: false }); toast('Kişi geri alındı'); }} /> : <Tag k={p.tag[0]} t={p.tag[1]} />} />
                ))}
              </List>
            </View>
          ))}
          {vis.length ? null : <Sm style={{ textAlign: 'center', paddingTop: 40 }}>Bu filtrede kişi yok.</Sm>}
        </Scr>
        {letters.length > 1 ? (
          <View accessibilityLabel="Harf dizini" style={{ position: 'absolute', right: 2, top: 8, alignItems: 'center' }}>
            {letters.map(L => (
              <Pressable key={L} onPress={() => sc.current?.scrollTo({ y: ys[L] ?? 0, animated: true })} hitSlop={{ left: 6, right: 2 }} accessibilityLabel={`${L} harfine git`}>
                <T s={11} w={800} lh={1.3} c={C.info} style={{ paddingVertical: 2, paddingHorizontal: 8 }}>{L}</T>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </>
  );
}

/* ---------- Bildirimler ---------- */
const Ntime = ({ t, k, tag }: { t: string; k: 'a' | 'i' | 's' | 'd' | 'n'; tag: string }) => {
  const C = useC();
  return <View style={{ alignItems: 'flex-end', gap: 4 }}><T s={12} w={700} c={C.muted}>{t}</T><Tag k={k} t={tag} /></View>;
};
function Notifs() {
  const C = useC();
  const { tbh } = useFrame();
  const emp = useStore(s => s.emp);
  const gear = <IB ic="settings" k="dk" label="Bildirim ayarları" onPress={() => go('notifPrefs')} />;
  if (emp)
    return (
      <>
        <Band lbl="Bildirimler" right={gear}><T2 t="Yeni bildirim yok" sub="Bekleyen talep ya da ödeme yok" /></Band>
        <Empty ic="bell" t="Bildirim yok" sub="Rezervasyon talepleri, ödemeler ve iptaller burada görünür." style={{ paddingBottom: tbh + 24 }} />
      </>
    );
  const reqs = useStore(s => s.reqs), nReq = (reqs.b ? 1 : 0) + (reqs.a ? 1 : 0);
  const reject = () => openAction('Talep reddedilsin mi?', 'Kişiye nazik bir ret bildirimi gider, ön ödeme iade edilir.', 'Talebi reddet', true, () => { void rejectRequest('b'); go('requestRejected', undefined, { n: 'Burak Şahin' }); });
  return (
    <>
      <Band lbl="Bildirimler" right={gear}><T2 t={nReq ? `${nReq} talep bekliyor` : 'Bekleyen talep yok'} sub={`Bugün ${1 + nReq} yeni bildirim`} /></Band>
      <Scr pb={tbh + 24}>
        {reqs.b ? (
        <FC>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Lbl t="Yeni talep" /><T s={13} w={800} c={C.accentInk}>22 sa kaldı</T></View>
          <Tap onPress={() => go('request', undefined, {})} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Av ini="BŞ" lg />
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <T s={22} w={800} lh={1.2} numberOfLines={1}>Burak Şahin</T>
              <T s={14} lh={1.45} c={C.muted} numberOfLines={1}>12 Eyl · 18:00 · Bireysel 60 dk</T>
            </View>
          </Tap>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn k="x" t="Reddet" onPress={reject} style={{ width: 112, paddingHorizontal: 8 }} />
            <Btn flex t="Onayla" onPress={() => { acceptReq(); go('requestAccepted', undefined, { n: 'Burak Şahin' }); }} />
          </View>
        </FC>
        ) : null}
        <Grp t="Bugün" />
        <List>
          {reqs.a ? <Row left={<Fic k="d" ic="calX" />} t="Talep çakışıyor" s="Ayşe Koç · grup dersiyle aynı saat" right={<Ntime t="1 sa" k="d" tag="Çakışma" />} onPress={() => go('request', undefined, { c: 1 })} /> : null}
          <Row left={<Fic k="s" ic="calCheck" />} t="Yeni saat onaylandı" s="Elif Yıldırım · 12 Eyl 18:00" right={<Ntime t="3 sa" k="s" tag="Onaylandı" />} onPress={() => go('rsAccepted', undefined, { n: 'Elif Yıldırım' })} />
        </List>
        <Grp t="Bu hafta" />
        <List>
          <Row left={<Fic k="i" ic="card" />} t="Ödeme bekleniyor" s="Mert Kaya · ₺1.500" right={<Ntime t="Pzt" k="d" tag="Ödenmedi" />} onPress={() => go('payment', undefined, { i: 1 })} />
          <Row left={<Fic k="d" ic="calX" />} t="Ders iptal edildi" s="Selin Demir · 8 Eyl 19:00" right={<Ntime t="Pzt" k="d" tag="İptal" />} onPress={() => go('cancelled', undefined, { n: 'Selin Demir', k: 1 })} />
          <Row left={<Fic k="a" ic="box" />} t="Paket bitmek üzere" s="Can Öztürk · 2 ders kaldı" right={<Ntime t="Paz" k="a" tag="Yenile" />} onPress={() => go('contact', undefined, { i: 4 })} />
        </List>
      </Scr>
    </>
  );
}

/* ---------- Hesabım ---------- */
export function logout() {
  openAction('Çıkış yapılsın mı?', 'Takvimin ve kişilerin sunucuda kalır. Tekrar giriş yaptığında her şey yerinde olur.', 'Çıkış yap', true, () => go('login'));
}
const ACN = { blue: 'Pro mavisi', orange: 'Turuncu', purple: 'Mor' } as const;
function acctMenu() {
  const s = get();
  const next = s.accent === 'blue' ? 'orange' : s.accent === 'orange' ? 'purple' : 'blue';
  openMenu('Hesap', [
    { label: 'Yardım ve destek', onPress: () => setTimeout(() => push('help'), 200) },
    // Prototipin üstündeki ayar düğmelerinin (vurgu, tema, boş sayfa) uygulama içi karşılığı
    { label: `Vurgu rengi: ${ACN[next]}`, onPress: () => setAccent(next) },
    { label: s.dark ? 'Açık tema' : 'Koyu tema', onPress: () => setDark(!s.dark) },
    { label: s.emp ? 'Dolu sayfa' : 'Boş sayfa', onPress: () => { void setEmptyMode(!s.emp); } },
    { label: 'Verileri sıfırla', onPress: () => setTimeout(() => openAction('Veriler sıfırlansın mı?', 'Eklediğin dersler, kişiler, paketler ve ayarlar silinir; demo verisi geri gelir.', 'Sıfırla', true, () => { void resetDemo(); toastLater('Veriler sıfırlandı'); }), 200) },
    { label: 'Çıkış yap', danger: true, onPress: () => setTimeout(logout, 200) },
  ]);
}

function Account() {
  const C = useC();
  const nPk = useStore(s => s.packages.length), me = useStore(s => s.me), prefs = useStore(s => s.prefs);
  const { tbh } = useFrame();
  const gr = (ic: string, t: string, to: string, v?: string) => (
    <GR left={<Fic k="n" ic={ic} c={C.ink} />} t={t} right={v ? <T s={13} w={700} c={C.muted}>{v}</T> : null} chev onPress={() => go(to)} />
  );
  return (
    <>
      <Band lbl="Hesabım" right={<IB ic="dots" k="dk" label="Diğer: Yardım ve destek, Çıkış yap" onPress={acctMenu} />}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 }}>
          <Av ini={((me.ad[0] || '') + (me.soyad[0] || '')).toLocaleUpperCase('tr')} lg />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <T s={22} w={800} lh={1.2} c={C.onDark} numberOfLines={1}>{me.ad} {me.soyad}</T>
            <T s={14} lh={1.45} c={C.onDarkMuted}>Özel ders · İstanbul</T>
          </View>
          <IB ic="edit" k="dk" label="Hesabı düzenle" onPress={() => openSheet('accountEdit')} style={{ marginRight: 2 }} />
        </View>
      </Band>
      <Scr pb={tbh + 24}>
        <FC>
          <Lbl t="Profilini paylaş" />
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'stretch' }}>
            <View style={{ backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 16, padding: 10 }}><QR s={96} c={C.ink} /></View>
            <View style={{ flex: 1, minWidth: 0, gap: 8, justifyContent: 'center' }}>
              <Btn small k="g" ic="link" t="Bağlantıyı kopyala" onPress={() => copy(LINK, 'Bağlantı kopyalandı')} style={{ justifyContent: 'flex-start' }} />
              <Btn small k="g" ic="nfc" t="NFC ile paylaş" onPress={() => toast('Telefonu yaklaştır')} style={{ justifyContent: 'flex-start' }} />
            </View>
          </View>
          <Btn t="Profilini paylaş" onPress={() => go('share')} />
        </FC>
        <GCard style={{ marginTop: 12 }}>
          {gr('receipt', 'Ödemeler', 'payments')}
          {gr('clock', 'Takvim ayarlarım', 'calendarPrefs', `${prefs['wh.s'] ?? '10:00'} – ${prefs['wh.e'] ?? '18:00'}`)}
          {gr('gavel', 'Ders kuralları', 'rules')}
          {gr('tag', 'Paket tercihleri', 'pricing', `${nPk} paket`)}
        </GCard>
      </Scr>
    </>
  );
}

export function RootTab({ tab }: { tab: number }) {
  const C = useC();
  return <View style={{ flex: 1, backgroundColor: C.page }}>{tab === 1 ? <Contacts /> : tab === 2 ? <Notifs /> : <Account />}</View>;
}
