// Sayfalar 1: kişi detayı, dokümanlar (dosya önizleme, not), bildirim ayarları, profil paylaş, ödemeler
import React, { useState } from 'react';
import { View } from 'react-native';
import { go, openAction, openMenu, openSheet, person, pick, pop, tl, toast, toastLater, useC, useFrame, useStore } from './store';
import { TODAY } from './data';
import { iso } from './data/dates';
import { docLine, longDate, noteTitle, splitDocs } from './data/docs';
import type { Doc } from './data/models';
import { addDoc, removeDoc, saveDoc, usePref } from './data/actions';
import { copy, LINK, openUrl, share } from './device';
import { Av, Band, BandBack, Btn, Cols, Empty, FC, Fic, Fld, FloatFoot, Foot, Inp, GCard, GR, Grp, IB, Icon, Lbl, List, NavH, Pg, QR, Row, Rt, Scr, Seg, Sm, Stat, Sw, T, Tag, Tap, Val, type TagK } from './ui';

type SP = { p: any };

export const Db = ({ d, m }: { d: string; m: string }) => {
  const C = useC();
  return (
    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.page, alignItems: 'center', justifyContent: 'center' }}>
      <T s={17} w={800} style={{ lineHeight: 18 }}>{d}</T>
      <T s={10} w={800} ls={0.05} c={C.muted} style={{ lineHeight: 11, marginTop: 2 }}>{m}</T>
    </View>
  );
};
export const Amt = ({ b, bC, k, tag }: { b: string; bC?: string; k?: TagK; tag?: string }) => (
  <View style={{ alignItems: 'flex-end', gap: 4 }}>
    <T s={15} w={800} c={bC}>{b}</T>
    {k && tag ? <Tag k={k} t={tag} /> : null}
  </View>
);

function Contact({ p }: SP) {
  const C = useC();
  useStore(s => s.people);
  const x = person(p.i || '0'), debt = x.tag[0] === 'd', k = (parseInt(x.id, 10) || 0) % 20, pkg = x.tag[1] === 'Paket';
  const [tab, setTab] = useState(0);
  const [show, setShow] = useState(false);
  const phone = `+90 532 ${String(10 + k * 7).padStart(2, '0')} ${40 + k} ${String(k * 3).padStart(2, '0')}`;
  const reach = () => openMenu(x.name, [
    { label: 'Ara', onPress: () => setTimeout(() => openUrl(`tel:${phone.replace(/\s/g, '')}`, 'Aranıyor…'), 200) },
    { label: "WhatsApp'tan yaz", onPress: () => setTimeout(() => openUrl(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, 'WhatsApp açılıyor'), 200) },
    { label: 'Numarayı kopyala', onPress: () => setTimeout(() => copy(phone, 'Numara kopyalandı'), 200) },
  ]);
  const newL = () => openSheet('newLesson', { n: x.name });
  const les = (d: string, m: string, t: string, s: string, amt: string, tk: TagK, tg: string, aC?: string) => (
    <Row left={<Db d={d} m={m} />} t={t} s={s} right={<Amt b={amt} bC={aC} k={tk} tag={tg} />} onPress={() => go('lesson', undefined, { n: x.name })} />
  );
  return (
    <>
      <Band left={<BandBack />} right={<IB ic="edit" k="dk" label="Kişiyi düzenle" onPress={() => openSheet('editContact', { i: x.id })} />}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <Av ini={x.ini} lg />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <T s={22} w={800} lh={1.2} c={C.onDark} numberOfLines={1}>{x.name}</T>
            <Tap onPress={reach} label={phone} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon n="phone" s={16} c={C.onDarkMuted} />
              <T s={14} w={700} c={C.onDarkMuted}>{phone}</T>
            </Tap>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <Stat b="12" t="toplam ders" />
          <Stat style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: 2 }}>
              <T s={26} w={800} lh={1.1} c={C.onDark}>{show ? (debt ? '₺1.500' : '₺0') : '₺•••'}</T>
              <T s={13} c={C.onDarkMuted}>bekleyen</T>
            </View>
            <IB ic={show ? 'eyeOff' : 'eye'} k="dkq" label="Tutarı göster" onPress={() => setShow(!show)} />
          </Stat>
        </View>
      </Band>
      <Scr>
        {pkg ? (
          <FC>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Lbl t="Paket · 8 ders" /><Btn small k="g" t="Yenile" onPress={newL} /></View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}><T s={36} w={800} style={{ lineHeight: 38 }}>2</T><T s={15} w={700} c={C.muted}>ders kaldı</T></View>
            <Pg total={8} left={2} />
          </FC>
        ) : null}
        <Seg items={['Geçmiş', 'Gelecek']} sel={tab} onSel={setTab} />
        {tab === 0 ? (
          <>
            <Grp t="Eylül" />
            <List>{les('3', 'EYL', 'Bireysel · 60 dk', '09:00 · Kadıköy stüdyo', '₺750', debt ? 'd' : 's', debt ? 'Ödenmedi' : 'Ödendi', debt ? C.danger : undefined)}</List>
            <Grp t="Ağustos" />
            <List>
              {les('27', 'AĞU', 'Bireysel · 60 dk', '09:00 · Kadıköy stüdyo', '₺750', debt ? 'd' : 's', debt ? 'Ödenmedi' : 'Ödendi', debt ? C.danger : undefined)}
              {les('13', 'AĞU', 'Deneme dersi · 45 dk', '09:00 · Online', '₺0', 'n', 'Ücretsiz', C.muted)}
            </List>
          </>
        ) : (
          <>
            <Grp t="Bu hafta" />
            <List>{les('17', 'EYL', 'Bireysel · 60 dk', '09:00 · Kadıköy stüdyo', '₺750', 'i', 'Bekliyor')}</List>
            <Grp t="Önümüzdeki hafta" />
            <List>
              {les('24', 'EYL', 'Bireysel · 60 dk', '09:00 · Kadıköy stüdyo', '₺750', 'i', 'Bekliyor')}
              {les('27', 'EYL', 'Bireysel · 90 dk', '11:00 · Online', '₺1.125', 'i', 'Bekliyor')}
            </List>
          </>
        )}
      </Scr>
      <Foot>
        <Btn flex k="g" ic="folder" t="Dokümanlar" onPress={() => go('docs', undefined, { i: x.id })} />
        <Btn flex t="Ders ekle" onPress={newL} />
      </Foot>
    </>
  );
}

// Dokümanlar: kişinin dosyaları ve ders notları (veri katmanından)
function addMenu(pid: string) {
  const today = iso(TODAY);
  openMenu('Doküman ekle', [
    // Dosya ve kamera telefon izni ister; prototipte örnek bir dosya eklenir
    { label: 'Dosya seç', onPress: () => { void addDoc({ pid, kind: 'pdf', name: 'Yeni belge.pdf', date: today, size: '320 KB' }).then(d => d && toastLater('Dosya eklendi')); } },
    { label: 'Fotoğraf çek', onPress: () => { void addDoc({ pid, kind: 'image', name: 'Fotoğraf.jpg', date: today, size: '1,8 MB' }).then(d => d && toastLater('Fotoğraf eklendi')); } },
    { label: 'Not yaz', onPress: () => setTimeout(() => go('docNote', undefined, { pid }), 200) },
  ]);
}
const fileIc = (d: Doc): [TagK, string] => (d.signed ? ['s', 'fileCheck'] : d.kind === 'image' ? ['i', 'image'] : ['d', 'file']);

function Docs({ p }: SP) {
  const C = useC();
  const pid = String(p.i || '0');
  const x = person(pid);
  const all = useStore(s => s.docs);
  const { files, notes } = splitDocs(all, pid);
  const add = () => addMenu(pid);
  return (
    <>
      <NavH title={x.name} sub="Dokümanlar" right={<IB ic="plus" k="p" label="Doküman ekle" onPress={add} />} />
      {files.length + notes.length === 0 ? (
        <Empty ic="folder" t="Henüz doküman yok" sub={`${x.name.split(' ')[0]} ile ilgili dosyalar ve notlar burada toplanır.`}><Btn t="Doküman ekle" onPress={add} /></Empty>
      ) : (
        <Scr>
          {files.length ? (
            <>
              <Grp t={`Dosyalar · ${files.length}`} style={{ paddingTop: 12 }} />
              <List>
                {files.map(d => { const [k, ic] = fileIc(d); return (
                  <Row key={d.id} left={<Fic k={k} ic={ic} />} t={d.name} s={docLine(d)} right={d.signed ? <Tag k="s" t="İmzalı" /> : undefined} chev={!d.signed} onPress={() => go('docFile', undefined, { id: d.id })} />
                ); })}
              </List>
            </>
          ) : null}
          {notes.length ? (
            <>
              <Grp t={`Ders notları · ${notes.length}`} style={{ paddingTop: files.length ? 20 : 12 }} />
              <List>
                {notes.map(d => <Row key={d.id} left={<Fic k="n" ic="note" c={C.ink} />} t={d.name} s={docLine(d)} chev onPress={() => go('docNote', undefined, { id: d.id })} />)}
              </List>
            </>
          ) : null}
        </Scr>
      )}
    </>
  );
}

// Dosya önizleme: demo görünüm (gerçek dosya API ile gelir), bilgiler, Paylaş · Sil
function DocFile({ p }: SP) {
  const C = useC();
  const d = useStore(s => s.docs.find(x => x.id === p.id));
  if (!d) return <NavH title="Dosya" />;
  const del = () => openAction('Dosya silinsin mi?', 'Bu işlem geri alınamaz.', 'Dosyayı sil', true, () => { void removeDoc(d.id); pop(); toastLater('Dosya silindi'); });
  const line = (w: string) => <View style={{ height: 6, width: w as any, borderRadius: 3, backgroundColor: C.divider }} />;
  return (
    <>
      <NavH title={d.name} />
      <Scr>
        <View style={{ marginTop: 4, marginHorizontal: 16, borderRadius: 16, backgroundColor: C.card, overflow: 'hidden', aspectRatio: d.kind === 'image' ? 4 / 3 : 3 / 4, alignItems: 'center', justifyContent: 'center' }}
          accessibilityLabel={`${d.name} önizlemesi`}>
          {d.kind === 'image' ? (
            <View style={{ alignSelf: 'stretch', flex: 1, backgroundColor: C.infoTint, alignItems: 'center', justifyContent: 'center' }}><Icon n="image" s={48} c={C.info} /></View>
          ) : (
            <View style={{ alignSelf: 'stretch', flex: 1, padding: 28, gap: 12 }}>
              <View style={{ height: 10, width: '55%', borderRadius: 3, backgroundColor: C.border }} />
              {line('100%')}{line('92%')}{line('96%')}{line('70%')}
              <View style={{ height: 14 }} />
              {line('100%')}{line('88%')}{line('94%')}{line('60%')}
              {d.signed ? <View style={{ marginTop: 'auto', alignSelf: 'flex-end' }}><Tag k="s" t="İmzalı" /></View> : null}
            </View>
          )}
        </View>
        <GCard style={{ marginTop: 16 }}>
          <GR t="Eklenme" right={<T s={13} w={700} c={C.muted}>{longDate(d.date)}</T>} />
          {d.size ? <GR t="Boyut" right={<T s={13} w={700} c={C.muted}>{d.size}</T>} /> : null}
        </GCard>
      </Scr>
      <Foot>
        <Btn flex k="g" ic="share" t="Paylaş" onPress={() => share(d.name)} />
        <Btn flex k="x" ic="trash" t="Sil" onPress={del} />
      </Foot>
    </>
  );
}

// Ders notu: var olanı düzenle ya da yeni not yaz (p.pid)
function DocNote({ p }: SP) {
  const C = useC();
  const d = useStore(s => (p.id ? s.docs.find(x => x.id === p.id) : undefined));
  const [text, setText] = useState(d?.text ?? '');
  const [fh, setFh] = useState(0);
  const isNew = !p.id;
  const title = d?.name ?? noteTitle(iso(TODAY));
  const ok = isNew ? text.trim().length > 0 : text !== (d?.text ?? '');
  const save = async () => {
    if (isNew) { const r = await addDoc({ pid: String(p.pid), kind: 'note', name: title, date: iso(TODAY), text: text.trim() }); if (!r) return; }
    else if (!(await saveDoc(d!.id, { text }))) return;
    pop(); toastLater('Not kaydedildi');
  };
  const del = () => d && openAction('Not silinsin mi?', 'Bu işlem geri alınamaz.', 'Notu sil', true, () => { void removeDoc(d.id); pop(); toastLater('Not silindi'); });
  return (
    <View style={{ flex: 1, backgroundColor: C.card }}>
      <NavH title={title} right={isNew ? undefined : <IB ic="trash" k="del" label="Notu sil" onPress={del} />} />
      <Scr pb={16 + Math.max(0, fh - 30)}>
        <View style={{ paddingTop: 8, paddingHorizontal: 16 }}>
          <Inp area value={text} onChangeText={setText} ph="Bu derste neler yapıldı?" accessibilityLabel="Not" style={{ height: 240 }} autoFocus={isNew} />
        </View>
      </Scr>
      <FloatFoot bg={C.card} onH={setFh}><Btn glow t="Kaydet" off={!ok} onPress={save} /></FloatFoot>
    </View>
  );
}

function NotifPrefs() {
  const [quiet, setQuiet] = usePref('nt.quiet', true);
  const [v, setV] = usePref('nt.v', { rem: '1 sa önce', mail: 'Haftalık', sms: 'Kapalı' });
  const val = (k: keyof typeof v, title: string, opts: string[]) => <Val v={v[k]} onPress={() => pick(title, opts, v[k], x => setV({ ...v, [k]: x }))} />;
  return (
    <>
      <NavH title="Bildirim ayarları" />
      <Scr>
        <Grp t="Anlık bildirimler" style={{ paddingTop: 12 }} />
        <GCard>
          <GR t="Rezervasyon talebi" right={<Sw init pk="nt.req" label="Rezervasyon talebi" />} />
          <GR t="Ödeme hareketi" right={<Sw init pk="nt.pay" label="Ödeme hareketi" />} />
          <GR t="İptal ve erteleme" right={<Sw init pk="nt.can" label="İptal ve erteleme" />} />
          <GR t="Ders hatırlatması" right={val('rem', 'Ders hatırlatması', ['Kapalı', '15 dk önce', '1 sa önce', '1 gün önce'])} />
        </GCard>
        <Grp t="Sessiz saatler" style={{ paddingTop: 22 }} />
        <GCard style={{ paddingBottom: 14 }}>
          <View>
            <GR t="Sessiz saatler" s="Bu aralıkta sadece iptaller gelir" right={<Sw on={quiet} onChange={setQuiet} label="Sessiz saatler" />} />
            <View pointerEvents={quiet ? 'auto' : 'none'} style={{ opacity: quiet ? 1 : 0.35 }}>
              <Cols style={{ paddingTop: 4, paddingHorizontal: 14 }}><Fld flex label="Başlangıç" v="22:00" pk="nt.qs" /><Fld flex label="Bitiş" v="08:00" pk="nt.qe" /></Cols>
            </View>
          </View>
        </GCard>
        <Grp t="Diğer kanallar" style={{ paddingTop: 22 }} />
        <GCard>
          <GR t="E-posta özeti" right={val('mail', 'E-posta özeti', ['Kapalı', 'Günlük', 'Haftalık'])} />
          <GR t="SMS hatırlatma" s="Kişilere ders öncesi" right={val('sms', 'SMS hatırlatma', ['Kapalı', '1 sa önce', '1 gün önce'])} />
        </GCard>
      </Scr>
    </>
  );
}

function Share() {
  const C = useC();
  const { bottom } = useFrame();
  return (
    <View style={{ flex: 1, backgroundColor: C.card }}>
      <NavH title="Profilini paylaş" />
      <Scr>
        <View style={{ alignItems: 'center', paddingTop: 28, paddingHorizontal: 24 }}>
          <Av ini="DA" lg />
          <T s={22} w={800} lh={1.2} style={{ marginTop: 12 }}>Deniz Arslan</T>
          <T s={14} lh={1.45} c={C.muted} style={{ marginTop: 2 }}>Özel ders · Matematik · İstanbul</T>
          <View style={{ marginTop: 28, padding: 18, borderRadius: 24, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border }}><QR s={96} c={C.ink} /></View>
          <Sm style={{ marginTop: 14, textAlign: 'center' }}>Kişiler bu kodu okutup müsait saatlerini görür ve rezervasyon yapar.</Sm>
          <Tap onPress={() => copy(LINK, 'Bağlantı kopyalandı')} label="Bağlantıyı kopyala: pro.app/denizarslan" style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 999, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card, paddingHorizontal: 16 }}>
            <T s={15} w={700}>pro.app/denizarslan</T>
            <Icon n="copy" c={C.muted} />
          </Tap>
        </View>
      </Scr>
      <View style={{ flexDirection: 'row', gap: 8, paddingTop: 16, paddingHorizontal: 16, paddingBottom: Math.max(30, bottom + 8) }}>
        <Btn flex k="g" ic="nfc" t="NFC" onPress={() => toast('Telefonu yaklaştır')} />
        <Btn flex ic="share" t="Paylaş" onPress={() => share(`Benden ders almak için: ${LINK}`)} />
      </View>
    </View>
  );
}

function Payments() {
  const C = useC();
  const emp = useStore(s => s.emp);
  const debts = useStore(s => s.debts), paid = useStore(s => s.paid), collected = useStore(s => s.collected);
  const [mon, setMon] = useState('Eylül 2026');
  const wait = debts.reduce((n, d) => n + d.lessons.length * 750, 0);
  // Ay seçici: sağ üstte ince çerçeveli sade düğme; dokununca ay listesi açılır (demo: liste aya göre süzülmez)
  const MONTHS = ['Temmuz 2026', 'Ağustos 2026', 'Eylül 2026'];
  const month = (
    <Tap onPress={() => pick('Ay', MONTHS, mon, setMon)} label={`Ay: ${mon}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: C.sdark2 }}>
      <T s={14} w={800} c={C.onDark}>{mon}</T>
      <View style={{ transform: [{ rotate: '90deg' }] }}><Icon n="chevR" s={16} c={C.onDarkMuted} /></View>
    </Tap>
  );
  return (
    <>
      <Band left={<BandBack />} right={month}>
        <T s={24} w={800} lh={1.15} c={C.onDark}>{emp || !debts.length ? 'Bekleyen ödeme yok' : `${debts.length} ödeme bekliyor`}</T>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <Stat b={emp ? '₺0' : tl(collected)} t="tahsil edildi" />
          <Stat b={emp ? '₺0' : tl(wait)} t="bekliyor" />
        </View>
      </Band>
      {emp ? (
        <Empty ic="receipt" t="Bu ay tahsilat yok" sub="Aldığın ödemeler ve bekleyenler burada görünür." />
      ) : (
        <Scr>
          {debts.length ? (
            <>
              <Grp t={`Ödenmemiş · ${debts.length}`} style={{ paddingTop: 14 }} />
              <List>
                {debts.map(d => { const x = person(d.pid), a = d.lessons.length * 750; return <Row key={d.pid} left={<Av ini={x.ini} />} t={x.name} s={`${d.lessons.length} ders · ${d.note}`} right={<Amt b={tl(a)} bC={d.late ? C.danger : undefined} k={d.late ? 'd' : 'i'} tag={d.tag} />} onPress={() => go('payment', undefined, { i: d.pid })} />; })}
              </List>
            </>
          ) : null}
          <Grp t={`Tahsil edilen · ${paid.length}`} style={{ paddingTop: 18 }} />
          <List>{paid.map((r, i) => <Row key={i} left={<Av ini={r.ini} />} t={r.name} s={r.sub} right={<Amt b={tl(r.amt)} />} />)}</List>
        </Scr>
      )}
    </>
  );
}

export const S1: Record<string, React.ComponentType<SP>> = { contact: Contact, docs: Docs, docFile: DocFile, docNote: DocNote, notifPrefs: NotifPrefs, share: Share, payments: Payments };
export const BAND1 = ['contact', 'payments'];
