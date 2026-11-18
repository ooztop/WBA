// Sekme kökleri: Kişiler, Bildirimler, Hesabım (Takvim ayrı dosyada)
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { TRA, first, type Person } from './data';
import { get, go, openAction, openMenu, openSheet, person, push, toast, toastLater, useC, useFrame, useStore } from './store';
import { copy, LINK } from './device';
import { acceptReq, rejectReq, reqWhen } from './screens3';
import { markNotifsRead, resetDemo, setAccent, setDark, setEmptyMode, updatePerson } from './data/actions';
import { buildFeed, inFilter, notifTime, unreadCount, type FeedItem, type NotifFilter } from './data/notifs';
import type { Notif, NotifKind } from './data/models';
import { ff } from './theme';
import { Av, Band, Btn, Chip, Empty, FC, Fic, GCard, GR, Grp, IB, Icon, Lbl, List, noOutline, QR, Row, Rt, Scr, Sm, SwipeAct, T, Tag, Tap, type SV, type TagK } from './ui';

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
                    right={p.arch ? <Btn small k="g" t="Geri al" onPress={() => { void updatePerson(p.id, { arch: false }); toast('Kişi geri alındı'); }} /> : undefined} />
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
// Bildirimin sağında yalnız zaman (etiket yok)
const Ntime = ({ t }: { t: string }) => {
  const C = useC();
  return <T s={12} w={700} c={C.muted}>{t}</T>;
};

// Bildirim türlerinin görünümü: ikon, renk, tek ve grup başlığı
const NK: Record<NotifKind, { ic: string; k: TagK; t: string; g: (n: number) => string }> = {
  payDue: { ic: 'card', k: 'd', t: 'Ödeme bekleniyor', g: n => `${n} ödeme bekleniyor` },
  pkgLow: { ic: 'box', k: 'w', t: 'Paket bitmek üzere', g: n => `${n} paket bitmek üzere` },
  paid: { ic: 'cash', k: 's', t: 'Ödeme alındı', g: n => `${n} ödeme alındı` },
  cancel: { ic: 'calX', k: 'd', t: 'Ders iptal edildi', g: n => `${n} ders iptal edildi` },
  rsOk: { ic: 'calCheck', k: 's', t: 'Yeni saat onaylandı', g: n => `${n} yeni saat onaylandı` },
  added: { ic: 'calPlus', k: 'i', t: 'Ders eklendi', g: n => `${n} ders eklendi` },
};

// Bildirime dokununca okundu sayılır ve ilgili ekran açılır
function openNotif(n: Notif) {
  void markNotifsRead([n.id]);
  const name = person(n.pid).name;
  if (n.kind === 'payDue') go('payment', undefined, { i: n.pid });
  else if (n.kind === 'pkgLow' || n.kind === 'added') go('contact', undefined, { i: n.pid });
  else if (n.kind === 'paid') go('payments');
  else if (n.kind === 'cancel') go('cancelled', undefined, { n: name, k: 1 });
  else go('rsAccepted', undefined, { n: name });
}

function NRow({ n, indent }: { n: Notif; indent?: boolean }) {
  return <Row left={<Fic k={NK[n.kind].k} ic={NK[n.kind].ic} />} t={NK[n.kind].t} s={`${person(n.pid).name} · ${n.sub}`} right={<Ntime t={notifTime(n.at)} />} onPress={() => openNotif(n)} style={indent ? { marginLeft: 20 } : undefined} />;
}
// Tek bildirim ya da benzerlerin grubu. Grup tek kart: dokununca kartın içinde kişiler sade satırlar olarak açılır.
function NItem({ it }: { it: FeedItem }) {
  const C = useC();
  const [open, setOpen] = useState(false);
  if (it.list.length === 1) return <NRow n={it.list[0]} />;
  const top = it.list[0];
  const names = it.list.map(n => first(person(n.pid).name)).join(', ');
  return (
    <View style={{ backgroundColor: C.card, borderRadius: 12, overflow: 'hidden' }}>
      <Row left={<Fic k={NK[it.kind].k} ic={NK[it.kind].ic} />} t={NK[it.kind].g(it.list.length)} s={open ? undefined : names}
        right={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ntime t={notifTime(top.at)} /><View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}><Icon n="chevR" s={18} c={C.muted} /></View></View>}
        onPress={() => setOpen(o => !o)} />
      {open ? it.list.map(n => (
        <Tap key={n.id} onPress={() => openNotif(n)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 12, paddingRight: 14, paddingVertical: 10, minHeight: 60, borderTopWidth: 1, borderTopColor: C.divider }}>
          {/* Avatar, üstteki ikonla aynı sütunda (44 px) */}
          <View style={{ width: 44, alignItems: 'center' }}><Av ini={person(n.pid).ini} s={38} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T s={14} w={700} numberOfLines={1}>{person(n.pid).name}</T>
            <T s={13} c={C.muted} numberOfLines={1}>{n.sub}</T>
          </View>
          <T s={12} w={700} c={C.muted}>{notifTime(n.at)}</T>
        </Tap>
      )) : null}
    </View>
  );
}

function Notifs() {
  const C = useC();
  const { tbh } = useFrame();
  const emp = useStore(s => s.emp);
  const reqs = useStore(s => s.reqs);
  const notifs = useStore(s => s.notifs);
  const [f, setF] = useState<NotifFilter>('all');
  const [seenOpen, setSeenOpen] = useState(false);
  const gear = <IB ic="settings" k="dk" label="Bildirim ayarları" onPress={() => go('notifPrefs')} />;
  if (emp || (!reqs.length && !notifs.length))
    return (
      <>
        <Band lbl="Bildirimler" right={gear}><T2 t="Yeni bildirim yok" sub="Bekleyen talep ya da ödeme yok" /></Band>
        <Empty ic="bell" t="Bildirim yok" sub="Rezervasyon talepleri, ödemeler ve iptaller burada görünür." style={{ paddingBottom: tbh + 24 }} />
      </>
    );
  const unread = unreadCount(notifs);
  const feed = buildFeed(notifs, f);
  // En acil talep (yanıt için en az süre kalan) büyük kartta, diğerleri satır
  const rq = [...reqs].sort((a, b) => a.left - b.left);
  const showReqs = (f === 'all' || f === 'req') && rq.length > 0;
  const cnt = (k: NotifFilter) => notifs.filter(n => !n.read && inFilter(n.kind, k)).length;
  const FILTERS: [string, NotifFilter, number][] = [['Tümü', 'all', 0], ['Talepler', 'req', rq.length], ['Ödemeler', 'pay', cnt('pay')], ['İptaller', 'cancel', cnt('cancel')]];
  const nothing = !showReqs && !feed.sections.length && !feed.seen.length;
  return (
    <>
      <Band lbl="Bildirimler" right={gear}><T2 t={rq.length ? `${rq.length} talep bekliyor` : 'Bekleyen talep yok'} sub={unread ? `${unread} okunmamış bildirim` : 'Hepsi okundu'} /></Band>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 4 }}>
          {FILTERS.map(x => <Chip key={x[1]} t={x[0]} cn={x[2] ? String(x[2]) : undefined} on={f === x[1]} onPress={() => setF(x[1])} />)}
        </ScrollView>
      </View>
      <Scr pb={tbh + 24}>
        {showReqs ? (
          <>
            <FC>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Lbl t="Yeni talep" /><T s={13} w={800} c={C.accentInk}>{rq[0].left} sa kaldı</T></View>
              <Tap onPress={() => go('request', undefined, { id: rq[0].id })} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Av ini={person(rq[0].pid).ini} lg />
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <T s={22} w={800} lh={1.2} numberOfLines={1}>{person(rq[0].pid).name}</T>
                  <T s={14} lh={1.45} c={C.muted} numberOfLines={1}>{reqWhen(rq[0])} · {rq[0].type} {rq[0].dur} dk</T>
                </View>
              </Tap>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Btn k="x" t="Reddet" onPress={() => rejectReq(rq[0])} style={{ width: 112, paddingHorizontal: 8 }} />
                <Btn flex t="Onayla" onPress={() => acceptReq(rq[0])} />
              </View>
            </FC>
            {rq.length > 1 ? (
              <>
              <List style={{ paddingTop: 8 }}>
                {rq.slice(1).map(r => (
                  <SwipeAct key={r.id} onRight={() => acceptReq(r)} onLeft={() => rejectReq(r)} onPress={() => go('request', undefined, { id: r.id })} rightLabel="✓ Onayla" leftLabel="Reddet">
                    <Av ini={person(r.pid).ini} />
                    <Rt t={person(r.pid).name} s={reqWhen(r)} />
                    <T s={12} w={800} c={C.accentInk}>{r.left} sa kaldı</T>
                  </SwipeAct>
                ))}
              </List>
              </>
            ) : null}
          </>
        ) : null}
        {f === 'req' && !rq.length ? <Sm style={{ textAlign: 'center', paddingTop: 32 }}>Bekleyen talep yok</Sm> : null}
        {feed.sections.map(sec => (
          <View key={sec.label}>
            <Grp t={sec.label} />
            <List>{sec.items.map(it => <NItem key={it.key} it={it} />)}</List>
          </View>
        ))}
        {feed.seen.length ? (
          <>
            <Tap onPress={() => setSeenOpen(o => !o)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingHorizontal: 16, paddingBottom: 6, minHeight: 44 }}>
              <Lbl t={`Görülenler · ${feed.seen.reduce((a, it) => a + it.list.length, 0)}`} />
              <View style={{ transform: [{ rotate: seenOpen ? '-90deg' : '90deg' }] }}><Icon n="chevR" s={18} c={C.muted} /></View>
            </Tap>
            {seenOpen ? <List>{feed.seen.map(it => <NItem key={it.key} it={it} />)}</List> : null}
          </>
        ) : null}
        {nothing && f !== 'req' ? <Sm style={{ textAlign: 'center', paddingTop: 32 }}>Burada bildirim yok</Sm> : null}
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
