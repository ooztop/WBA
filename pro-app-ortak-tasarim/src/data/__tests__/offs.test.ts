// İzin günleri: yaklaşanlar, satır yazıları, silme ve geri alma.
import { mockDb } from '../mock/db';
import { offBadge, offHours, offLine, offSub, offTitle, upcomingOffs } from '../offs';
import type { Off } from '../models';
import { scheduleService } from '../services';

beforeEach(() => { jest.useFakeTimers(); mockDb.reset(); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

const O = (id: string, date: string, x: Partial<Off> = {}): Off => ({ id, date, name: 'Tatil', start: 10, end: 18, all: true, ...x });

test('yaklaşan izinler bugünden itibaren, tarihe ve saate göre sıralı', () => {
  const all = [O('a', '2026-09-20'), O('b', '2026-09-08'), O('c', '2026-09-15', { all: false, start: 14, end: 15 }), O('d', '2026-09-15', { all: false, start: 9, end: 10 }), O('e', '2026-09-09')];
  expect(upcomingOffs(all, '2026-09-09').map(o => o.id)).toEqual(['e', 'd', 'c', 'a']);
});
test('satır yazıları', () => {
  expect(offTitle('2026-09-15')).toBe('15 Eylül Salı');
  expect(offLine(O('a', '2026-09-15'))).toBe('Tüm gün · Tatil');
  expect(offLine(O('a', '2026-09-15', { all: false, start: 12.5, end: 13.5, name: 'Öğle arası' }))).toBe('12:30 – 13:30 · Öğle arası');
});
test('demo verisinde bir yaklaşan izin günü var', async () => {
  expect(upcomingOffs(await scheduleService.listOffs(), '2026-09-09').length).toBeGreaterThan(0);
});
test('removeOff siler, restoreOff aynı kimlikle geri koyar', async () => {
  const [o] = await scheduleService.listOffs();
  await scheduleService.removeOff(o.id);
  expect((await scheduleService.listOffs()).some(x => x.id === o.id)).toBe(false);
  await scheduleService.restoreOff(o);
  expect((await scheduleService.listOffs()).find(x => x.id === o.id)).toEqual(o);
});
test('liste satırı: tarih rozeti ve gün · saat', () => {
  expect(offBadge('2026-09-15')).toEqual({ d: '15', m: 'EYL' });
  expect(offSub(O('a', '2026-09-15'))).toBe('Salı · Tüm gün');
  expect(offSub(O('a', '2026-09-16', { all: false, start: 12.5, end: 13.5 }))).toBe('Çarşamba · 12:30 – 13:30');
  expect(offHours(O('a', '2026-09-15'))).toBe('Tüm gün');
});
