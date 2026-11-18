// Yardım ve destek: SSS içeriği, destek formu kuralı ve destek servisi.
import { mockDb } from '../mock/db';
import { canSend, FAQ, faqById, SUPPORT_TOPICS, TERMS } from '../help';
import { supportService } from '../services';

beforeEach(() => { jest.useFakeTimers(); mockDb.reset(); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

test('boş ya da yalnız boşluk olan mesaj gönderilemez', () => {
  expect(canSend('')).toBe(false);
  expect(canSend('   \n ')).toBe(false);
  expect(canSend('Ödeme kaydı görünmüyor')).toBe(true);
});
test('konular Ödeme · Takvim · Hesap · Diğer', () => {
  expect(SUPPORT_TOPICS).toEqual(['Ödeme', 'Takvim', 'Hesap', 'Diğer']);
});
test('her SSS benzersiz kimlikli, cevaplı ve faqById ile bulunur', () => {
  expect(new Set(FAQ.map(f => f.id)).size).toBe(FAQ.length);
  for (const f of FAQ) {
    expect(f.a.length).toBeGreaterThan(0);
    expect(faqById(f.id)).toBe(f);
  }
  expect(faqById('yok')).toBeUndefined();
});
test('kullanım koşulları bölümleri başlıklı ve dolu', () => {
  expect(TERMS.length).toBeGreaterThan(2);
  for (const s of TERMS) { expect(s.h).toBeTruthy(); expect(s.p.length).toBeGreaterThan(0); }
});
test('destek mesajı kaydedilir; metin kırpılır', async () => {
  const m = await supportService.send({ topic: 'Ödeme', text: '  Ödeme kaydı görünmüyor  ' });
  expect(m.text).toBe('Ödeme kaydı görünmüyor');
  expect(m.id).toBeTruthy();
  expect(mockDb.data().support.map(x => x.id)).toEqual([m.id]);
});
test('boş destek mesajı reddedilir', async () => {
  await expect(supportService.send({ topic: 'Diğer', text: '  ' })).rejects.toThrow();
  expect(mockDb.data().support).toEqual([]);
});
