
export const DN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const D1 = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
export const DL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const MN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const MS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
// Demo verisi bu güne göre kurulu (tanım data/mock/lessonGen.ts'te)
import { TODAY, NOW_H } from './data/mock/lessonGen';
export { TODAY, NOW_H };

export const p2 = (n: number) => String(n).padStart(2, '0');
export const hm = (x: number) => `${p2(Math.floor(x))}:${p2(Math.round((x % 1) * 60))}`;
export const addD = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
export const wd = (d: Date) => (d.getDay() + 6) % 7;
export const mon = (d: Date) => addD(d, -wd(d));
export const dkey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
export const first = (n: string) => n.split(' ')[0];
export const initials = (n: string) => n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr');

// Ders, kişi ve paket tipleri uygulama modellerinden gelir (data/models.ts)
import type { ID, Lesson } from './data/models';
export type { Lesson, Person, Pkg, TagKind } from './data/models';

// Geçici (Görev 5'te kalkar): eski yoldan gün dersleri; demo üreteç + eklenenler − iptaller
export { PEOPLE0, PACKAGES0 } from './data/mock/seed';
import { baseLessons } from './data/mock/lessonGen';
import { iso } from './data/dates';

const cache = new Map<string, Lesson[]>();
export function lessons(d: Date, emp: boolean, extra: Lesson[], cancelled: ID[]): Lesson[] {
  if (emp) return [];
  const k = iso(d);
  let b = cache.get(k);
  if (!b) cache.set(k, (b = baseLessons(d)));
  let out = b;
  if (extra.length) out = out.concat(extra.filter(e => e.date === k)).sort((x, y) => x.h - y.h);
  if (cancelled.length) out = out.filter(l => !cancelled.includes(l.id));
  return out;
}

export const TRA = 'A B C Ç D E F G H I İ J K L M N O Ö P R S Ş T U Ü V Y Z #'.split(' ');

// Yeni ders → ücret kartı: [rozet, fiyat, temel mi]
export const PKG: Record<string, [string, string, number]> = {
  '8 derslik paket': ['8×', '₺675', 0],
  'Tek ders · 60 dk': ['60', '₺750', 1],
  'Tek ders · 90 dk': ['90', '₺1.125', 0],
  'Aylık üyelik': ['12×', '₺600', 0],
};
