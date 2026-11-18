// Eylem testleri: iyimser güncelleme, geri alma, aralıklı ders yükleme ve açılış.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, set } from '../../store';
import { optimistic } from '../actions/optimistic';
import { boot, reloadAll, setEmptyMode } from '../actions/boot';
import { ensureLessons } from '../actions/lessons';
import { docsService, lessonsService, peopleService } from '../services';
import { addDoc, removeDoc, saveDoc } from '../actions/docs';
import { mockDb } from '../mock/db';
import type { Person } from '../models';

const x: Person = { id: 'x1', ini: 'XX', name: 'Xavier X', sub: '', tag: ['n', 'Tek ders'], cat: '' };

beforeEach(async () => {
  jest.useFakeTimers();
  mockDb.reset();
  jest.clearAllTimers();
  await AsyncStorage.clear();
  jest.useRealTimers();
  // önbelleği sıfırla (boot başka testte doldurmuş olabilir)
  set({ people: [], lessons: {}, loaded: new Set(), toast: null, emp: false, epoch: 0 });
});
afterEach(() => { jest.restoreAllMocks(); jest.clearAllTimers(); });

test('optimistic başarılıysa değişiklik kalır', async () => {
  const ok = await optimistic(s => ({ people: [...s.people, x] }), () => Promise.resolve());
  expect(ok).toBe(true);
  expect(get().people).toEqual([x]);
});

test('hata olursa önbelleği geri alır', async () => {
  const before = get().people;
  const ok = await optimistic(s => ({ people: [...s.people, x] }), () => Promise.reject(new Error('ağ')));
  expect(ok).toBe(false);
  expect(get().people).toBe(before);
  expect(get().toast?.msg).toBe('Kaydedilemedi. Tekrar dene.');
});

test('optimistic özel hata iletisini kullanır ve yalnız dokunduğu alanı geri alır', async () => {
  set({ collected: 5 });
  const ok = await optimistic(s => ({ people: [...s.people, x] }), async () => { set({ collected: 9 }); throw new Error('ağ'); }, 'Kişi eklenemedi');
  expect(ok).toBe(false);
  expect(get().people).toEqual([]);
  expect(get().collected).toBe(9);
  expect(get().toast?.msg).toBe('Kişi eklenemedi');
});

test('ensureLessons aynı aralığı iki kez istemez', async () => {
  const spy = jest.spyOn(lessonsService, 'range');
  await Promise.all([ensureLessons('2026-09-07', '2026-09-13'), ensureLessons('2026-09-07', '2026-09-13')]);
  expect(spy).toHaveBeenCalledTimes(1);
  await ensureLessons('2026-09-07', '2026-09-13');
  expect(spy).toHaveBeenCalledTimes(1);
  expect(get().loaded.has('2026-09-10')).toBe(true);
});

test('ensureLessons yalnız yüklenmemiş günleri ister', async () => {
  await ensureLessons('2026-09-07', '2026-09-09');
  const spy = jest.spyOn(lessonsService, 'range');
  await ensureLessons('2026-09-08', '2026-09-11');
  expect(spy).toHaveBeenCalledWith('2026-09-10', '2026-09-11');
});

test('boot sonrası bugünün dersleri önbellekte', async () => {
  await boot();
  expect(get().lessons['2026-09-09'].map(l => l.h)).toEqual([9, 11.5, 14, 19]);
  expect(get().people).toHaveLength(22);
  expect(get().packages).toHaveLength(4);
  expect(get().debts).toHaveLength(2);
  expect(get().collected).toBe(12400);
});

test('boş kipte önbellek boşalır, kapatınca demo verisi döner', async () => {
  await boot();
  await setEmptyMode(true);
  expect(get().emp).toBe(true);
  expect([get().people, get().packages, get().debts, get().paid, get().lessons['2026-09-09']].every(l => l.length === 0)).toBe(true);
  await setEmptyMode(false);
  expect(get().lessons['2026-09-09']).toHaveLength(4);
  expect(get().people).toHaveLength(22);
});

test('reloadAll önbelleği baştan yükler', async () => {
  await boot();
  set({ people: [] });
  await reloadAll();
  expect(get().people).toHaveLength(22);
});

test('hızlı açıp kapatınca eski yükleme sonucu atılır', async () => {
  await boot();
  const real = peopleService.list.bind(peopleService);
  // ilk (boş kip) yükleme geç döner ve boş liste getirir; araya giren Dolu sayfa yüklemesi kazanmalı
  jest.spyOn(peopleService, 'list').mockImplementationOnce(() => new Promise(res => setTimeout(() => res([]), 50)));
  const a = setEmptyMode(true);
  const b = setEmptyMode(false);
  jest.spyOn(peopleService, 'list').mockImplementation(real);
  await Promise.all([a, b]);
  await new Promise(r => setTimeout(r, 80));
  expect(get().emp).toBe(false);
  expect(get().people).toHaveLength(22);
});
test('boş kipten dönerken dersler kişilerden önce önbelleğe gelmez (takvim çökmesin)', async () => {
  await boot();
  await setEmptyMode(true);
  let peopleAtRange = -1;
  const realRange = lessonsService.range.bind(lessonsService);
  jest.spyOn(lessonsService, 'range').mockImplementation(async (a, b) => { if (peopleAtRange < 0) peopleAtRange = get().people.length; return realRange(a, b); });
  await setEmptyMode(false);
  expect(peopleAtRange).toBeGreaterThan(0);
});

test('doküman ekle / kaydet / sil önbelleği ve servisi birlikte günceller', async () => {
  set({ docs: [] });
  const d = await addDoc({ pid: '0', kind: 'note', name: '9 Eylül notu', date: '2026-09-09', text: '' });
  expect(get().docs.map(x => x.id)).toEqual([d!.id]);
  await saveDoc(d!.id, { text: 'Merhaba' });
  expect(get().docs[0].text).toBe('Merhaba');
  expect((await docsService.list()).find(x => x.id === d!.id)?.text).toBe('Merhaba');
  await removeDoc(d!.id);
  expect(get().docs).toEqual([]);
  expect((await docsService.list()).some(x => x.id === d!.id)).toBe(false);
});
