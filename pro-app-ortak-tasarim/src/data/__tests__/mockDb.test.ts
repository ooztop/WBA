// Mock veritabanı testleri: demo verisi, boş kip, v1 taşıma ve cihazda saklama.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockDb } from '../mock/db';
import { TODAY } from '../mock/lessonGen';

// Saklama zamanlayıcısı testler arasında sızmasın diye sahte zamanlayıcı kullanılır.
beforeEach(async () => {
  jest.useFakeTimers();
  mockDb.reset();
  jest.clearAllTimers();
  await AsyncStorage.clear();
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('seed bugünkü demo verisini verir', () => {
  mockDb.reset();
  expect(mockDb.data().people).toHaveLength(22);
  expect(mockDb.lessonsFor(TODAY).map(l => l.h)).toEqual([9, 11.5, 14, 19]);
});
test('üreteç kararlı: aynı gün aynı dersler', () => {
  const d = new Date(2026, 9, 14);
  expect(mockDb.lessonsFor(d)).toEqual(mockDb.lessonsFor(d));
});
test('boş kipte her liste boş döner', () => {
  mockDb.setEmpty(true);
  const d = mockDb.data();
  expect([d.people, d.packages, d.debts, d.paid, mockDb.lessonsFor(TODAY)].every(x => x.length === 0)).toBe(true);
  mockDb.setEmpty(false);
  expect(mockDb.data().people.length).toBeGreaterThan(0);
});
test('v1 kaydını taşır', async () => {
  await AsyncStorage.setItem('pro-ortak-tasarim-v1', JSON.stringify({
    extra: [{ k: '2026-8-10', l: [18, 60, 6, 'Bireysel', 'w'] }],
    prefs: { 'wh.s': '09:00', 'rule.2': { s: 2, c: null }, 'nt.can': false, 'les.2026-8-10|18': { pk: 'X' }, 'foo': 1 },
  }));
  await mockDb.load();
  expect(mockDb.lessonsFor(new Date(2026, 8, 10)).some(l => l.h === 18 && l.pid === '6')).toBe(true);
  expect(mockDb.data().week[0].s).toBe('09:00');
  expect(mockDb.data().rules.startMin).toEqual({ s: 2, c: null });
  expect(mockDb.data().notif.can).toBe(false);
  expect(mockDb.data().uiPrefs).toEqual({ foo: 1 });
});
test('v1 iptal kaydı "dkey|h" ders kimliğiyle eşleşir', async () => {
  const before = mockDb.lessonsFor(TODAY)[0];
  await AsyncStorage.setItem('pro-ortak-tasarim-v1', JSON.stringify({ cancelled: [`2026-8-9|${before.h}`] }));
  await mockDb.load();
  expect(mockDb.lessonsFor(TODAY).map(l => l.h)).toEqual([11.5, 14, 19]);
});
test('update cihaza yazar ve load geri okur', async () => {
  mockDb.update(d => ({ ...d, collected: 777 }));
  jest.advanceTimersByTime(400);
  await Promise.resolve();
  mockDb.reset();
  jest.clearAllTimers();
  expect(mockDb.data().collected).toBe(12400);
  await mockDb.load();
  expect(mockDb.data().collected).toBe(777);
});

test('boş kipte eklenen kişi görünür, demo kişiler görünmez; kapatınca hepsi döner', () => {
  mockDb.setEmpty(true);
  mockDb.update(d => ({ ...d, people: [...d.people, { id: 'n1', ini: 'YK', name: 'Yeni Kişi', sub: '', tag: ['n', 'Tek ders'], cat: '' }] }));
  expect(mockDb.data().people.map(p => p.name)).toEqual(['Yeni Kişi']);
  mockDb.setEmpty(false);
  expect(mockDb.data().people).toHaveLength(23);
  mockDb.setEmpty(true);
  expect(mockDb.data().people).toHaveLength(0);
});
