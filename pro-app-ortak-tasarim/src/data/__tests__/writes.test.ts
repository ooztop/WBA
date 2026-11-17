// Eylem testleri (yazmalar): önbellek, servis ve cihazda kalıcılık birlikte doğrulanır.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, set } from '../../store';
import {
  acceptRequest, addLessons, addOffs, addPerson, boot, cancelLesson, collectPayment, counterRequest, modelsToPrefs, prefsToModels, lessonNoteKey,
  reloadAll, rejectRequest, removeBreak, removePackage, rescheduleLesson, restorePackage, saveBreak, savePackage, saveProfile, setBasePackage,
  setDark, setPref, toggleBreakDay, updatePerson,
} from '../actions';
import { lessonsService, packagesService, paymentsService, peopleService, requestsService, scheduleService } from '../services';
import { mockDb } from '../mock/db';
import { RULES0, WEEK0 } from '../mock/seed';
import type { NotifPrefs } from '../models';

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

beforeEach(async () => {
  jest.useFakeTimers();
  mockDb.reset();
  jest.clearAllTimers();
  await AsyncStorage.clear();
  set({ people: [], lessons: {}, loaded: new Set(), toast: null, emp: false, epoch: 0, prefs: {} });
  await boot();
});
afterEach(() => { jest.restoreAllMocks(); jest.clearAllTimers(); jest.useRealTimers(); });

/* ---------- paketler ---------- */
test('paket silme geri alınınca servis de geri yükler', async () => {
  const pk = get().packages[1];
  await removePackage(pk);
  expect((await packagesService.list()).some(p => p.id === pk.id)).toBe(false);
  await get().toast!.onUndo!();
  expect((await packagesService.list()).some(p => p.id === pk.id)).toBe(true);
  expect(get().packages.some(p => p.id === pk.id)).toBe(true);
});
test('paket geri alınınca eski sırasına döner (önbellek ve servis)', async () => {
  const ids = get().packages.map(p => p.id);
  await removePackage(get().packages[1]);
  expect(get().packages.map(p => p.id)).toEqual([ids[0], ...ids.slice(2)]);
  await get().toast!.onUndo!();
  expect(get().packages.map(p => p.id)).toEqual(ids);
  expect((await packagesService.list()).map(p => p.id)).toEqual(ids);
});
test('restorePackage ilk sıraya da geri koyar', async () => {
  const ids = get().packages.map(p => p.id);
  const first = get().packages[0];
  await removePackage(first, true);
  await restorePackage(first, 0);
  expect((await packagesService.list()).map(p => p.id)).toEqual(ids);
});
test('removePackage sessiz kipte uyarı göstermez', async () => {
  await removePackage(get().packages[0], true);
  expect(get().toast).toBeNull();
});
test('paket kaydet: yeni eklenir, var olan güncellenir, temel bayrağı korunur', async () => {
  const base = get().packages.find(p => p.base)!;
  await savePackage({ id: base.id, kind: base.kind, c1: base.c1, c2: base.c2, name: 'Yeni ad', sub: base.sub, price: base.price });
  expect(get().packages.find(p => p.id === base.id)).toMatchObject({ name: 'Yeni ad', base: true });
  const made = await savePackage({ kind: 'single', c1: '45′', c2: '', name: 'Tek ders · 45 dk', sub: 'Mola yok', price: '₺600' });
  expect(get().packages.some(p => p.id === made!.id)).toBe(true);
  expect((await packagesService.list()).some(p => p.id === made!.id && p.name === 'Tek ders · 45 dk')).toBe(true);
});
test('setBasePackage tek temel paket bırakır ve temel paket uyarısını gösterir', async () => {
  const other = get().packages.find(p => !p.base)!;
  await setBasePackage(other.id);
  expect(get().packages.filter(p => p.base).map(p => p.id)).toEqual([other.id]);
  expect((await packagesService.list()).filter(p => p.base).map(p => p.id)).toEqual([other.id]);
  expect(get().toast?.msg).toBe('Temel paket güncellendi');
});
test('hata olursa paket silme geri alınır', async () => {
  const before = get().packages;
  jest.spyOn(packagesService, 'remove').mockRejectedValueOnce(new Error('ağ'));
  await removePackage(before[0]);
  expect(get().packages).toBe(before);
  expect(get().toast?.msg).toBe('Kaydedilemedi. Tekrar dene.');
});

/* ---------- kişiler ---------- */
test('addPerson önbelleğe ve servise ekler; aynı ad ikinci kez eklenmez', async () => {
  const p = await addPerson('Ayşe Kaya', 'Yeni kişi');
  expect(get().people.some(x => x.id === p.id)).toBe(true);
  expect((await peopleService.list()).some(x => x.id === p.id)).toBe(true);
  const again = await addPerson('Ayşe Kaya');
  expect(again.id).toBe(p.id);
  expect(get().people.filter(x => x.name === 'Ayşe Kaya')).toHaveLength(1);
});
test('kişi arşivle ve geri al servise yazılır', async () => {
  const x = get().people[3];
  await updatePerson(x.id, { arch: true });
  expect(get().people.find(p => p.id === x.id)?.arch).toBe(true);
  expect((await peopleService.list()).find(p => p.id === x.id)?.arch).toBe(true);
  await updatePerson(x.id, { arch: false, gone: false });
  expect((await peopleService.list()).find(p => p.id === x.id)?.arch).toBe(false);
});
test('hata olursa kişi güncellemesi geri alınır', async () => {
  const x = get().people[3];
  jest.spyOn(peopleService, 'update').mockRejectedValueOnce(new Error('ağ'));
  await updatePerson(x.id, { name: 'Başka' });
  expect(get().people.find(p => p.id === x.id)?.name).toBe(x.name);
  expect(get().toast?.msg).toBe('Kaydedilemedi. Tekrar dene.');
});

/* ---------- dersler ---------- */
test('addLessons önbelleğe ve servise yazar, odağı taşır, yenilemede kalır', async () => {
  const made = await addLessons([{ date: '2026-09-10', h: 18, dur: 60, pid: '6', type: 'Bireysel', st: 'w', pk: 'X' }], new Date(2026, 8, 10));
  expect(made).toHaveLength(1);
  expect(get().lessons['2026-09-10'].some(l => l.id === made![0].id)).toBe(true);
  expect(get().F).toEqual(new Date(2026, 8, 10));
  await reloadAll();
  expect(get().lessons['2026-09-10'].find(l => l.id === made![0].id)).toMatchObject({ h: 18, pk: 'X' });
});
test('cancelLesson dersi önbellekten ve servisten kaldırır', async () => {
  const l = get().lessons['2026-09-09'][0];
  await cancelLesson(l.id);
  expect(get().lessons['2026-09-09'].some(x => x.id === l.id)).toBe(false);
  await reloadAll();
  expect(get().lessons['2026-09-09'].some(x => x.id === l.id)).toBe(false);
});
test('hata olursa iptal geri alınır', async () => {
  const l = get().lessons['2026-09-09'][0];
  jest.spyOn(lessonsService, 'cancel').mockRejectedValueOnce(new Error('ağ'));
  await cancelLesson(l.id);
  expect(get().lessons['2026-09-09'].some(x => x.id === l.id)).toBe(true);
  expect(get().toast?.msg).toBe('Kaydedilemedi. Tekrar dene.');
});
test('rescheduleLesson eski saati kaldırır, yeni saate ekler', async () => {
  const l = get().lessons['2026-09-09'][0];
  await rescheduleLesson(l.id, { date: '2026-09-11', h: 18 });
  expect(get().lessons['2026-09-09'].some(x => x.id === l.id)).toBe(false);
  expect(get().lessons['2026-09-11'].some(x => x.h === 18 && x.pid === l.pid)).toBe(true);
  await reloadAll();
  expect(get().lessons['2026-09-11'].some(x => x.h === 18 && x.pid === l.pid)).toBe(true);
  expect(get().lessons['2026-09-09'].some(x => x.id === l.id)).toBe(false);
});

/* ---------- talepler ---------- */
test('acceptRequest b: talep kapanır, 12 Eylül 18:00 dersi takvime girer', async () => {
  await acceptRequest('b');
  expect(get().reqs.b).toBe(false);
  expect(get().lessons['2026-09-12'].some(l => l.h === 18 && l.pid === '6')).toBe(true);
  await reloadAll();
  expect(get().reqs.b).toBe(false);
  expect(get().lessons['2026-09-12'].some(l => l.h === 18 && l.pid === '6')).toBe(true);
});
test('rejectRequest ve counterRequest talebi kapatır, servise yazar', async () => {
  await rejectRequest('b');
  await counterRequest('a');
  expect(get().reqs).toEqual({ b: false, a: false });
  expect(await requestsService.get()).toEqual({ b: false, a: false });
});
test('hata olursa talep durumu geri alınır', async () => {
  jest.spyOn(requestsService, 'reject').mockRejectedValueOnce(new Error('ağ'));
  await rejectRequest('a');
  expect(get().reqs.a).toBe(true);
});

/* ---------- molalar, izinler ---------- */
test('mola kaydet, gün aç/kapat, sil', async () => {
  const b = await saveBreak({ name: 'Çay', start: '15:00', end: '15:15', days: [0] });
  expect(get().breaks.some(x => x.id === b!.id)).toBe(true);
  await saveBreak({ ...b!, name: 'Çay arası' });
  expect(get().breaks.find(x => x.id === b!.id)?.name).toBe('Çay arası');
  await toggleBreakDay(b!.id, 2, true);
  expect((await scheduleService.listBreaks()).find(x => x.id === b!.id)?.days).toEqual([0, 2]);
  await toggleBreakDay(b!.id, 0, false);
  expect(get().breaks.find(x => x.id === b!.id)?.days).toEqual([2]);
  await removeBreak(b!.id);
  expect(get().breaks.some(x => x.id === b!.id)).toBe(false);
  expect((await scheduleService.listBreaks()).some(x => x.id === b!.id)).toBe(false);
});
test('addOffs izin günlerini önbelleğe ve servise ekler', async () => {
  const made = await addOffs([{ date: '2026-09-21', name: 'İzin günü', start: 0, end: 24, all: true }]);
  expect(get().offs.map(o => o.id)).toContain(made![0].id);
  expect((await scheduleService.listOffs()).map(o => o.id)).toContain(made![0].id);
});

/* ---------- ödeme, profil ---------- */
test('collectPayment ödemeler ekranının önbelleğini günceller', async () => {
  const before = get().collected;
  await collectPayment({ pid: '6', name: 'Burak Şahin', ini: 'BŞ', lessonIdx: [0], method: 'Nakit', amount: 750 });
  expect(get().debts.some(d => d.pid === '6')).toBe(false);
  expect(get().collected).toBe(before + 750);
  expect(get().paid[0]).toMatchObject({ name: 'Burak Şahin', amt: 750 });
  expect(get().people.find(p => p.id === '6')?.tag[0]).toBe('n');
  expect(await paymentsService.collected()).toBe(before + 750);
});
test('saveProfile önbelleğe ve servise yazar', async () => {
  await saveProfile({ ad: 'Ada', soyad: 'Lovelace', title: 'Matematik' });
  expect(get().me.ad).toBe('Ada');
  await reloadAll();
  expect(get().me.soyad).toBe('Lovelace');
});

/* ---------- ayarlar ---------- */
test('setPref wh.s haftalık saatlere yazılır', async () => {
  setPref('wh.s', '09:30');
  expect(get().prefs['wh.s']).toBe('09:30');
  jest.advanceTimersByTime(500);
  await flush();
  expect((await scheduleService.getWeek())[0].s).toBe('09:30');
});
test('setPref ardışık yazmaları tek kayıtta birleştirir', async () => {
  const spy = jest.spyOn(scheduleService, 'saveWeek');
  setPref('wh.s', '09:00'); setPref('wh.e', '17:00'); setPref('day.6.on', true);
  jest.advanceTimersByTime(499);
  expect(spy).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  await flush();
  expect(spy).toHaveBeenCalledTimes(1);
  expect((await scheduleService.getWeek())[6]).toEqual({ on: true, s: '09:00', e: '17:00' });
});
test('setPref rule. ve nt. önekleri ilgili servise gider, diğerleri yalnız cihazda kalır', async () => {
  setPref('rule.2', { s: 2, c: null });
  setPref('nt.can', false);
  setPref('foo', 'bar');
  expect(mockDb.data().uiPrefs.foo).toBe('bar');
  jest.advanceTimersByTime(500);
  await flush();
  expect(mockDb.data().rules.startMin).toEqual({ s: 2, c: null });
  expect(mockDb.data().notif.can).toBe(false);
  expect('foo' in mockDb.data().notif).toBe(false);
});
test('setPref hata verirse önbellek geri alınır', async () => {
  jest.spyOn(scheduleService, 'saveWeek').mockRejectedValueOnce(new Error('ağ'));
  setPref('wh.s', '09:30');
  jest.advanceTimersByTime(500);
  await flush();
  expect(get().prefs['wh.s']).toBeUndefined();
  expect(get().toast?.msg).toBe('Kaydedilemedi. Tekrar dene.');
});
test('prefsToModels ∘ modelsToPrefs kimliktir', () => {
  const week = WEEK0.map(d => ({ ...d }));
  week[0] = { on: true, s: '09:00', e: '17:00' };
  week[1] = { on: true, s: '09:00', e: '17:00' };
  week[2] = { on: false, s: '08:00', e: '17:00' };
  week[5] = { on: true, s: '09:00', e: '13:00' };
  week[6] = { on: true, s: '11:00', e: '15:00' };
  const rules = { ...RULES0, startMin: { s: 2, c: null }, window: { s: 0, c: '5 sa' } };
  const notif: NotifPrefs = { can: false, qs: '23:00', v: { rem: '1 gün önce', mail: 'Kapalı', sms: 'Kapalı' } };
  expect(prefsToModels(modelsToPrefs(week, rules, notif))).toEqual({ week, rules, notif });
  // demo verisi ekran varsayılanlarıyla aynı: hiçbir tercih üretilmez
  expect(modelsToPrefs(WEEK0, RULES0, {})).toEqual({});
  expect(prefsToModels({})).toEqual({ week: WEEK0, rules: RULES0, notif: {} });
});
test('açılışta çalışma saatleri ve kurallar tercihlere geri verilir', async () => {
  setPref('wh.s', '09:30');
  setPref('rule.2', { s: 1, c: null });
  setPref('foo', 'bar');
  jest.advanceTimersByTime(500);
  await flush();
  jest.advanceTimersByTime(400);
  await flush();
  set({ prefs: {} });
  await boot();
  expect(get().prefs['wh.s']).toBe('09:30');
  expect(get().prefs['rule.2']).toEqual({ s: 1, c: null });
  expect(get().prefs.foo).toBe('bar');
});
test('tema seçimi cihazda saklanır ve açılışta geri gelir', async () => {
  setDark(true);
  jest.advanceTimersByTime(400);
  await flush();
  set({ dark: false });
  await boot();
  expect(get().dark).toBe(true);
});
test('lessonNoteKey tam kimlikli ya da v1 joker anahtarlı notu bulur', () => {
  const l = { id: '2026-09-09|9|0', date: '2026-09-09', h: 9 };
  expect(lessonNoteKey({}, l)).toBe('note.2026-09-09|9|0');
  expect(lessonNoteKey({ 'note.2026-09-09|9|*': 'eski' }, l)).toBe('note.2026-09-09|9|*');
  expect(lessonNoteKey({ 'note.2026-09-09|9|*': 'eski', 'note.2026-09-09|9|0': 'yeni' }, l)).toBe('note.2026-09-09|9|0');
});
