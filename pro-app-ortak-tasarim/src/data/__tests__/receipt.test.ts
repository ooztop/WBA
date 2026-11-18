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
