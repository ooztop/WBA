// Servis testleri: mock dalı üzerinden konu başına okuma/yazma davranışı.
import { mockDb } from '../mock/db';
import { DATA_SOURCE } from '../source';
import { lessonsService, packagesService, paymentsService, peopleService, profileService, requestsService, rulesService, scheduleService, notifPrefsService } from '../services';

beforeEach(() => {
  jest.useFakeTimers();
  mockDb.reset();
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('create sonra list yeni kişiyi içerir', async () => {
  const p = await peopleService.create({ name: 'Ada Lovelace' });
  expect((await peopleService.list()).find(x => x.id === p.id)?.ini).toBe('AL');
});
test('aynı adla ikinci kez eklemek mevcut kişiyi döner', async () => {
  const a = await peopleService.create({ name: 'Elif Yıldırım' });
  expect(a.id).toBe('0');
});
test('list iç nesneyi sızdırmaz', async () => {
  const l = await peopleService.list();
  l[0].name = 'Değişti';
  expect((await peopleService.list())[0].name).toBe('Elif Yıldırım');
});
test('update kişiyi günceller', async () => {
  const p = await peopleService.update('0', { arch: true });
  expect(p.arch).toBe(true);
  expect((await peopleService.list())[0].arch).toBe(true);
});
test('range her günü anahtar olarak döner', async () => {
  const r = await lessonsService.range('2026-09-07', '2026-09-13');
  expect(Object.keys(r)).toHaveLength(7);
  expect(r['2026-09-09'].map(l => l.h)).toEqual([9, 11.5, 14, 19]);
});
test('cancel dersi aralıktan çıkarır', async () => {
  const first = (await lessonsService.range('2026-09-09', '2026-09-09'))['2026-09-09'][0];
  await lessonsService.cancel(first.id);
  const r = await lessonsService.range('2026-09-09', '2026-09-09');
  expect(r['2026-09-09']).toHaveLength(3);
  expect(r['2026-09-09'].some(l => l.id === first.id)).toBe(false);
});
test('create ders ekler', async () => {
  const [l] = await lessonsService.create([{ date: '2026-09-10', h: 18, dur: 60, pid: '6', type: 'Bireysel', st: 'w' }]);
  const r = await lessonsService.range('2026-09-10', '2026-09-10');
  expect(r['2026-09-10'].some(x => x.id === l.id && x.h === 18)).toBe(true);
});
test('reschedule eskiyi kaldırır yeniyi ekler, durum (ok/no) korunur', async () => {
  const [a] = (await lessonsService.range('2026-09-09', '2026-09-09'))['2026-09-09']; // 09:00, ok
  expect(a.st).toBe('ok');
  const n = await lessonsService.reschedule(a.id, { date: '2026-09-11', h: 15 });
  expect(n).toMatchObject({ date: '2026-09-11', h: 15, st: 'ok', pid: a.pid });
  expect((await lessonsService.range('2026-09-09', '2026-09-09'))['2026-09-09'].some(l => l.id === a.id)).toBe(false);
  expect((await lessonsService.range('2026-09-11', '2026-09-11'))['2026-09-11'].some(l => l.id === n.id)).toBe(true);
  // bekleyen ders yeniden planlanınca 'w' kalır
  const w = (await lessonsService.range('2026-09-09', '2026-09-09'))['2026-09-09'].find(l => l.st === 'nx')!;
  expect((await lessonsService.reschedule(w.id, { date: '2026-09-11', h: 16 })).st).toBe('w');
});
test('setBase tek temel paket bırakır', async () => {
  await packagesService.setBase('3');
  expect((await packagesService.list()).filter(p => p.base).map(p => p.id)).toEqual(['3']);
});
test('paket kaydet, sil, geri yükle', async () => {
  const p = await packagesService.save({ kind: 'single', c1: '45′', c2: '', name: 'Tek ders · 45 dk', sub: '', price: '₺600' });
  expect((await packagesService.list()).some(x => x.id === p.id)).toBe(true);
  await packagesService.remove(p.id);
  expect((await packagesService.list()).some(x => x.id === p.id)).toBe(false);
  await packagesService.restore(p);
  expect((await packagesService.list()).some(x => x.id === p.id)).toBe(true);
  await packagesService.save({ ...p, price: '₺650' });
  expect((await packagesService.list()).find(x => x.id === p.id)?.price).toBe('₺650');
});
test('collect tüm borç ödenince kişiyi borçtan çıkarır', async () => {
  await paymentsService.collect({ pid: '1', lessonIdx: [0, 1], method: 'Nakit', amount: 1500, name: 'Mert Kaya', ini: 'MK' });
  expect((await paymentsService.debts()).some(d => d.pid === '1')).toBe(false);
  expect(await paymentsService.collected()).toBe(13900);
  expect((await peopleService.list()).find(p => p.id === '1')?.tag).toEqual(['n', 'Tek ders']);
  expect((await paymentsService.paid())[0]).toMatchObject({ name: 'Mert Kaya', amt: 1500, sub: '10 Eyl · Nakit · 2 ders' });
});
test('collect kısmi ödemede borç kalır', async () => {
  await paymentsService.collect({ pid: '1', lessonIdx: [0], method: 'Havale', amount: 750, name: 'Mert Kaya', ini: 'MK' });
  expect((await paymentsService.debts()).find(d => d.pid === '1')?.lessons).toHaveLength(1);
  expect((await peopleService.list()).find(p => p.id === '1')?.tag[0]).toBe('d');
});
test('accept iki kez çağrılınca tek ders ekler', async () => {
  await requestsService.accept('b');
  await requestsService.accept('b');
  const r = await lessonsService.range('2026-09-12', '2026-09-12');
  expect(r['2026-09-12'].filter(l => l.h === 18 && l.pid === '6')).toHaveLength(1);
  expect((await requestsService.get()).b).toBe(false);
});
test('reject ve counter talebi kapatır', async () => {
  await requestsService.reject('b');
  await requestsService.counter('a');
  expect(await requestsService.get()).toEqual({ b: false, a: false });
});
test('takvim, kural, bildirim ve profil kaydı', async () => {
  const w = await scheduleService.getWeek();
  w[0].s = '08:00';
  await scheduleService.saveWeek(w);
  expect((await scheduleService.getWeek())[0].s).toBe('08:00');
  const b = await scheduleService.saveBreak({ name: 'Çay', start: '15:00', end: '15:15', days: [0] });
  expect((await scheduleService.listBreaks()).some(x => x.id === b.id)).toBe(true);
  await scheduleService.removeBreak(b.id);
  expect((await scheduleService.listBreaks()).some(x => x.id === b.id)).toBe(false);
  const [o] = await scheduleService.addOffs([{ date: '2026-09-20', name: 'İzin', start: 9, end: 12 }]);
  expect((await scheduleService.listOffs()).map(x => x.id)).toContain(o.id);
  const rules = await rulesService.get();
  await rulesService.save({ ...rules, gap: { s: 0, c: null } });
  expect((await rulesService.get()).gap).toEqual({ s: 0, c: null });
  await notifPrefsService.save({ can: false });
  expect(await notifPrefsService.get()).toEqual({ can: false });
  await profileService.save({ ad: 'A', soyad: 'B', title: 'C' });
  expect(await profileService.get()).toEqual({ ad: 'A', soyad: 'B', title: 'C' });
});
test('api seçiliyse notConnected', async () => {
  process.env.EXPO_PUBLIC_API_URL = 'http://x';
  DATA_SOURCE.people = 'api';
  try {
    await expect(peopleService.list()).rejects.toMatchObject({ code: 'NOT_CONNECTED' });
  } finally {
    DATA_SOURCE.people = 'mock';
    delete process.env.EXPO_PUBLIC_API_URL;
  }
});
