// Sayfalar 2: takvim ayarları, gün sayfası, ders kuralları, paket tercihleri, yardım (destek formu, SSS, koşullar), hesabı sil
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { DL, DN, TODAY, hm, type Pkg } from './data';
import type { ID } from './data/models';
import { daysText, go, hhmm, openSheet, pickTime, pop, toast, toastLater, useC, useFrame, useStore } from './store';
import { removePackage, sendSupport, setBasePackage, toggleBreakDay, usePref } from './data/actions';
import { offBadge, offSub, upcomingOffs } from './data/offs';
import { iso } from './data/dates';
import { canSend, FAQ, faqById, SUPPORT_TOPICS, TERMS } from './data/help';
import { openUrl } from './device';
import { ff } from './theme';
import { Box, Btn, Chip, Cols, Empty, FC, Fic, FloatFoot, Fld, GCard, GR, Row, IB, Icon, Inote, Inp, Lbl, List, Lnk, NavH, noOutline, PChips, PickBox, Rt, Scr, Sm, Sw, SwipeAct, T, Tag, Tap } from './ui';
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
  const offs = upcomingOffs(useStore(s => s.offs), iso(TODAY));
  const prefs = useStore(s => s.prefs);
  const DEF = `${prefs['wh.s'] ?? '10:00'} – ${prefs['wh.e'] ?? '18:00'}`;
  // Çalışma saatleri saat seçiciyle (elle yazılmaz); başlangıç bitişten önce olmalı
  const [ws, setWs] = usePref('wh.s', '10:00');
  const [we, setWe] = usePref('wh.e', '18:00');
  const H = [0, 1, 2, 3, 4, 5, 6].map(i => ((prefs[`day.${i}.on`] ?? i !== 6) ? `${prefs[`day.${i}.s`] ?? prefs['wh.s'] ?? '10:00'} – ${prefs[`day.${i}.e`] ?? (i === 5 ? '14:00' : prefs['wh.e'] ?? '18:00')}` : null));
  return (
    <>
      <NavH title="Takvim ayarlarım" />
      <Scr>
        <GrpS t="Çalışma saatleri" pt={8} />
        <View style={{ backgroundColor: C.card, borderRadius: 16, marginHorizontal: 16, paddingTop: 12, paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
          <Sm>Her gün için varsayılan. Günlere özel ayar aşağıda.</Sm>
          <Cols>
            <PickBox label="Başlangıç" ic="clock" v={ws} onPress={() => pickTime(hhmm(ws, 10), h => { if (h >= hhmm(we, 18)) { toast('Başlangıç, bitişten önce olmalı'); return; } setWs(hm(h)); })} />
            <PickBox label="Bitiş" ic="clock" v={we} onPress={() => pickTime(hhmm(we, 18), h => { if (h <= hhmm(ws, 10)) { toast('Bitiş, başlangıçtan sonra olmalı'); return; } setWe(hm(h)); })} />
          </Cols>
        </View>
        <GrpS t="Düzenli molalar" pb={4} right={<IB ic="plus" k="p" s={36} label="Mola ekle" onPress={() => openSheet('breakNew')} />} />
        {emp || !breaks.length ? (
          <View style={{ marginHorizontal: 16, padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.border }}><Sm style={{ textAlign: 'center' }}>Düzenli mola yok. + ile ekleyebilirsin.</Sm></View>
        ) : (
          <GCard>
            {breaks.map(b => <GR key={b.id} t={b.name} s={`${b.start} – ${b.end} · ${daysText(b.days)}`} chev onPress={() => openSheet('breakNew', { id: b.id })} />)}
          </GCard>
        )}
        {offs.length ? (
          <>
            <GrpS t="İzin günleri" />
            <List>
              {offs.map(o => <Row key={o.id} left={<OffBadge date={o.date} />} t={o.name} s={offSub(o)} chev onPress={() => openSheet('offEdit', { id: o.id })} />)}
            </List>
          </>
        ) : null}
        <GrpS t="Günler" s="Özel ayar için güne dokun" />
        <GCard>
          {DN.map((g, i) => {
            // Varsayılandan farklı gün (saat ya da gün kuralı) mavi; varsayılanla aynı olanlar gri; kapalı gün soluk
            const own = !!H[i] && (H[i] !== DEF || i === 5);
            return (
            <GR key={i} chev onPress={() => go('dayRule', undefined, { g: i })} style={i === 5 ? undefined : { minHeight: 52 }}>
              <T s={15} w={800} c={H[i] ? C.ink : C.muted} style={{ width: 40 }}>{g}</T>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <T s={15} w={own ? 700 : 500} lh={1.35} c={own ? C.accent : C.muted}>{H[i] || 'Kapalı'}</T>
                {i === 5 ? <T s={13} lh={1.4} c={C.muted} numberOfLines={1}>10 geçe başlar · akşam arası yok</T> : null}
              </View>
            </GR>
            );
          })}
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
// Paket kutucuğu: k='soft' açık mavi, k='base' (temel paket) dolu mavi
export const Pkb = ({ t, k }: { t: string; k?: 'soft' | 'base' }) => {
  const C = useC();
  const bg = k === 'base' ? C.accent : k === 'soft' ? C.tint : C.page;
  const fg = k === 'base' ? C.onAccent : k === 'soft' ? C.accentInk : C.ink;
  return <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><T s={14} w={800} c={fg}>{t}</T></View>;
};
function SwipeRow({ pk, onStar, onDel, onOpen }: { pk: Pkg; onStar: () => void; onDel: () => void; onOpen: () => void }) {
  const C = useC();
  return (
    <SwipeAct onRight={onStar} onLeft={onDel} onPress={onOpen} rightLabel="★ Temel yap" leftLabel="Sil" bg={pk.base ? C.tintSoft : C.card}>
      <Pkb t={pk.c1} k={pk.base ? 'base' : 'soft'} />
      <Rt t={pk.name} s={pk.sub} />
      <Amt b={pk.price} bC={pk.base ? C.accent : undefined} k={pk.base ? 'a' : undefined} tag={pk.base ? 'Temel' : undefined} />
    </SwipeAct>
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
          <GR left={<Fic k="n" ic="chat" c={C.ink} />} t="Destek ekibine yaz" s="Uygulama içi mesaj" chev onPress={() => go('support')} />
          <GR left={<Fic k="n" ic="phone" c={C.ink} />} t="WhatsApp'tan sor" s="Hafta içi 09:00 – 19:00" chev onPress={() => openUrl('https://wa.me/908500000000', 'WhatsApp açılıyor')} />
        </GCard>
        <GrpS t="Sık sorulanlar" />
        <GCard>
          {FAQ.map(f => (
            <GR key={f.id} chev onPress={() => go('faq', undefined, { id: f.id })}><T s={15} w={700} lh={1.35} style={{ flex: 1 }}>{f.q}</T></GR>
          ))}
        </GCard>
        <GCard style={{ marginTop: 18 }}>
          <GR t="Uygulama sürümü" right={<T s={13} w={700} c={C.muted}>2.4.1</T>} />
          <GR t="Kullanım koşulları" chev onPress={() => go('terms')} />
        </GCard>
      </Scr>
    </>
  );
}

// Destek ekibine yaz: konu çipleri + mesaj; mesaj boşken Gönder pasif
function Support() {
  const C = useC();
  const [topic, setTopic] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [fh, setFh] = useState(0);
  const send = async () => {
    setBusy(true);
    const ok = await sendSupport(topic ?? 'Diğer', text);
    setBusy(false);
    if (ok) { pop(); toastLater('Mesajın iletildi. Yanıt e-postana gelir.'); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.card }}>
      <NavH title="Destek ekibine yaz" />
      <Scr pb={16 + Math.max(0, fh - 30)}>
        <View style={{ paddingTop: 8, paddingHorizontal: 16, gap: 18 }}>
          <Fld label="Konu">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SUPPORT_TOPICS.map(t => <Chip key={t} t={t} on={topic === t} onPress={() => setTopic(topic === t ? null : t)} />)}
            </View>
          </Fld>
          <Fld label="Mesaj">
            <Inp area value={text} onChangeText={setText} ph="Ne konuda yardım istiyorsun?" style={{ height: 160 }} />
          </Fld>
        </View>
      </Scr>
      <FloatFoot bg={C.card} onH={setFh}><Btn glow t="Gönder" off={!canSend(text) || busy} onPress={send} /></FloatFoot>
    </View>
  );
}

// Sık sorulan bir sorunun cevabı; altta ilgili ekrana bağlantı ve destek satırı
function FaqPage({ p }: SP) {
  const C = useC();
  const f = faqById(p?.id) ?? FAQ[0];
  return (
    <>
      <NavH title="Sık sorulanlar" />
      <Scr>
        <View style={{ paddingTop: 8, paddingHorizontal: 22, gap: 12 }}>
          <T s={22} w={800} lh={1.25}>{f.q}</T>
          {f.a.map(x => <T key={x} s={15} w={500} lh={1.5} c={C.ink}>{x}</T>)}
          {f.link ? <View style={{ alignSelf: 'flex-start', marginTop: 2 }}><Lnk t={`${f.link.t} ›`} onPress={() => go(f.link!.to)} /></View> : null}
        </View>
        <GCard style={{ marginTop: 28 }}>
          <GR left={<Fic k="n" ic="chat" c={C.ink} />} t="Destek ekibine yaz" s="Cevap işe yaramadı mı?" chev onPress={() => go('support')} />
        </GCard>
      </Scr>
    </>
  );
}

// Kullanım koşulları: başlıklı düz metin
function Terms() {
  const C = useC();
  return (
    <>
      <NavH title="Kullanım koşulları" />
      <Scr>
        <View style={{ paddingTop: 8, paddingHorizontal: 22, gap: 22 }}>
          {TERMS.map(s => (
            <View key={s.h} style={{ gap: 8 }}>
              <T s={17} w={800} lh={1.3}>{s.h}</T>
              {s.p.map(x => <T key={x} s={15} w={500} lh={1.5} c={C.ink}>{x}</T>)}
            </View>
          ))}
        </View>
      </Scr>
    </>
  );
}

// İzin günü tarih rozeti: gün ve ay, vurgu renginde
function OffBadge({ date }: { date: string }) {
  const C = useC();
  const b = offBadge(date);
  return (
    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' }}>
      <T s={17} w={800} c={C.accentInk} style={{ lineHeight: 18 }}>{b.d}</T>
      <T s={10} w={800} ls={0.05} c={C.accentInk} style={{ lineHeight: 11, marginTop: 2 }}>{b.m}</T>
    </View>
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
              <GR chev onPress={() => go('payment', undefined, { i: '1' })}>
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

export const S2: Record<string, React.ComponentType<SP>> = { calendarPrefs: CalendarPrefs, dayRule: DayRule, rules: Rules, pricing: Pricing, help: Help, support: Support, faq: FaqPage, terms: Terms, deleteAccount: DeleteAccount };
