// Makbuz: toplamlar ve paylaşılan metin.
import { receiptSums, receiptText, type Receipt } from '../receipt';

const R: Receipt = {
  from: 'Deniz Arslan', title: 'Özel ders · Matematik', to: 'Mert Kaya', date: '2026-09-09', method: 'Havale / EFT',
  lines: [{ when: '3 Eylül · 16:00', what: 'Bireysel · 60 dk', amt: 750 }, { when: '5 Eylül · 16:00', what: 'Bireysel · 60 dk', amt: 750 }],
  paid: 1500,
};

test('tam ödemede kalan borç yok', () => {
  expect(receiptSums(R)).toEqual({ sum: 1500, paid: 1500, rest: 0 });
});
test('eksik ödemede kalan borç yazılır', () => {
  expect(receiptSums({ ...R, paid: 1000 })).toEqual({ sum: 1500, paid: 1000, rest: 500 });
});
test('paylaşılan metin kişiyi, dersleri ve tutarı içerir', () => {
  const t = receiptText({ ...R, paid: 1000 });
  expect(t).toContain('Makbuz · Deniz Arslan');
  expect(t).toContain('Mert Kaya · 9 Eylül 2026');
  expect(t).toContain('3 Eylül · 16:00 · Bireysel · 60 dk · ₺750');
  expect(t).toContain('Alınan: ₺1.000 (Havale / EFT)');
  expect(t).toContain('Kalan borç: ₺500');
});
test('tam ödemede kalan borç satırı yok', () => {
  expect(receiptText(R)).not.toContain('Kalan borç');
});

import { paidRowReceipt, lessonReceipt } from '../receipt';
import type { Lesson, PaidRow, Pkg } from '../models';

const ME = { from: 'Deniz Arslan', title: 'Özel ders · Matematik' };
const pkgs: Pkg[] = [
  { id: '1', kind: 'single', c1: '', c2: '', name: 'Tek ders · 60 dk', sub: '', price: '₺750', base: true },
  { id: '3', kind: 'multi', c1: '8×', c2: '', name: '8 derslik paket', sub: '', price: '₺5.400' },
];

test('Ödemeler satırından makbuz: tarih, yöntem, ne ve tutar', () => {
  const row: PaidRow = { id: 'p2', ini: 'EY', name: 'Elif Yıldırım', sub: '8 Eyl · Nakit · 4 ders', amt: 3000 };
  const r = paidRowReceipt(row, ME);
  expect(r).toMatchObject({ to: 'Elif Yıldırım', date: '2026-09-08', method: 'Nakit', paid: 3000 });
  expect(r.lines).toEqual([{ when: '8 Eylül', what: '4 ders', amt: 3000 }]);
});

const L = (x: Partial<Lesson> = {}): Lesson => ({ id: 'l1', date: '2026-09-09', h: 9, dur: 60, type: 'Bireysel', pid: '0', st: 'ok', ...x } as Lesson);

test('paketli dersin makbuzu paketin satın alındığı ödeme', () => {
  const paid: PaidRow[] = [{ id: 'p3', ini: 'EY', name: 'Elif Yıldırım', sub: '2 Eyl · Havale · 8 derslik paket', amt: 5400 }];
  const r = lessonReceipt(L(), 'Elif Yıldırım', '8 derslik paket', pkgs, paid, ME);
  expect(r).toMatchObject({ date: '2026-09-02', method: 'Havale', paid: 5400 });
  expect(r.lines).toEqual([{ when: '2 Eylül', what: '8 derslik paket', amt: 5400 }]);
});
test('paket ödemesi kayıtlı değilse paket fiyatıyla örnek makbuz', () => {
  const r = lessonReceipt(L(), 'Elif Yıldırım', '8 derslik paket', pkgs, [], ME);
  expect(r).toMatchObject({ method: 'Havale / EFT', paid: 5400 });
  expect(r.lines[0].what).toBe('8 derslik paket');
});
test('tek dersin makbuzu o ders ve ders fiyatı', () => {
  const r = lessonReceipt(L({ dur: 60 }), 'Mert Kaya', 'Tek ders · 60 dk', pkgs, [], ME);
  expect(r).toMatchObject({ to: 'Mert Kaya', date: '2026-09-09', method: 'Nakit', paid: 750 });
  expect(r.lines).toEqual([{ when: '9 Eylül · 09:00', what: 'Bireysel · 60 dk', amt: 750 }]);
});
