// Demo ders üreteci: aynı gün için hep aynı dersleri üretir (data.ts'teki baseLessons'ın taşınmış hali).
import type { Lesson, LessonStatus } from '../models';
import { iso } from '../dates';

// Demo verisi bu güne göre kurulu
export const TODAY = new Date(2026, 8, 9);
export const NOW_H = 12.6;

const HRS = [9, 10.5, 12, 14, 16, 17.5, 19];
const TYN = ['Bireysel', 'Grup', 'Online', 'Deneme dersi'];
const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const wd = (d: Date) => (d.getDay() + 6) % 7; // 0 = Pazartesi

type Raw = [number, number, number, string, LessonStatus];
const toLesson = (day: string, i: number, [h, dur, pid, type, st]: Raw): Lesson => ({ id: `${day}|${h}|${i}`, date: day, h, dur, pid: String(pid), type, st });

export function baseLessons(d: Date): Lesson[] {
  const day = iso(d);
  if (same(d, TODAY)) {
    const t: Raw[] = [[9, 60, 0, 'Bireysel', 'ok'], [11.5, 60, 1, 'Grup · 3 kişi', 'no'], [14, 60, 3, 'Online', 'nx'], [19, 60, 5, 'Grup', 'w']];
    return t.map((r, i) => toLesson(day, i, r));
  }
  let h = ((d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) * 2654435761) % 4294967296;
  const r = () => (h = (h * 1103515245 + 12345) % 2147483648) / 2147483648;
  let n = Math.floor(r() * 4);
  if (wd(d) === 6) n = 0;
  if (wd(d) === 5) n = Math.min(n, 1);
  const hs = HRS.slice().sort(() => r() - 0.5).slice(0, n).sort((a, b) => a - b);
  const past = d < TODAY;
  // Perşembe (yarın) dersleri peşin ödenmiş: ödenmiş ve henüz başlamamış dersi (iptal/iade akışı) denemek için
  const prepaid = same(d, new Date(2026, 8, 10));
  const out = hs.map((x, i) => toLesson(day, i, [x, [45, 60, 60, 60][Math.floor(r() * 4)], Math.floor(r() * 8), TYN[Math.floor(r() * 4)], past ? (r() < 0.8 ? 'ok' : 'no') : prepaid ? 'ok' : 'w']));
  // Perşembenin ilk dersi paketli: paketli derste iptal (pakete geri ekle / paketten düş) denensin
  if (prepaid && out[0]) out[0] = { ...out[0], type: 'Bireysel', pk: '8 derslik paket' };
  return out;
}
