import type { TyKey } from './theme';

export const DN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const D1 = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
export const DL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const MN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const MS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export const TY: TyKey[] = ['b', 'g', 'o', 'd'];
const HRS = [9, 10.5, 12, 14, 16, 17.5, 19];

// Demo verisi bu güne göre kurulu
export const TODAY = new Date(2026, 8, 9);
export const NOW_H = 12.6;

export const p2 = (n: number) => String(n).padStart(2, '0');
export const hm = (x: number) => `${p2(Math.floor(x))}:${p2(Math.round((x % 1) * 60))}`;
export const addD = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
export const wd = (d: Date) => (d.getDay() + 6) % 7;
export const mon = (d: Date) => addD(d, -wd(d));
export const dkey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
export const first = (n: string) => n.split(' ')[0];
export const initials = (n: string) => n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr');

// [saat, süre dk, tür, kişi id, ödeme durumu]
export type Lesson = [number, number, TyKey, number, 'ok' | 'no' | 'w'];
export type Extra = { k: string; l: Lesson };

function baseLessons(d: Date): Lesson[] {
  if (same(d, TODAY)) return [[9, 60, 'b', 0, 'ok'], [11.5, 90, 'g', 1, 'no'], [14, 60, 'o', 2, 'w'], [19, 60, 'g', 5, 'w']];
  let h = ((d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) * 2654435761) % 4294967296;
  const r = () => (h = (h * 1103515245 + 12345) % 2147483648) / 2147483648;
  let n = Math.floor(r() * 4);
  if (wd(d) === 6) n = 0;
  if (wd(d) === 5) n = Math.min(n, 1);
  const hs = HRS.slice().sort(() => r() - 0.5).slice(0, n).sort((a, b) => a - b);
  const past = d < TODAY;
  return hs.map(x => [x, [45, 60, 60, 90][Math.floor(r() * 4)], TY[Math.floor(r() * 4)], Math.floor(r() * 8), past ? (r() < 0.8 ? 'ok' : 'no') : 'w'] as Lesson);
}

const cache = new Map<string, Lesson[]>();
export function lessons(d: Date, emp: boolean, extra: Extra[], cancelled: string[]): Lesson[] {
  if (emp) return [];
  const k = dkey(d);
  let b = cache.get(k);
  if (!b) cache.set(k, (b = baseLessons(d)));
  let out = b;
  if (extra.length) out = out.concat(extra.filter(e => e.k === k).map(e => e.l)).sort((x, y) => x[0] - y[0]);
  if (cancelled.length) out = out.filter(l => !cancelled.includes(`${k}|${l[0]}`));
  return out;
}

export type TagKind = 'a' | 'red' | 'gray' | 'ok';
export type Person = { id: number; ini: string; name: string; sub: string; tag: [TagKind, string]; ci: number; cat: string; arch?: boolean; gone?: boolean };

const RAW: [string, string, string, [TagKind, string], number][] = [
  ['EY', 'Elif Yıldırım', 'Sonraki: 17 Eyl · 09:00', ['a', 'AYLIK'], 0], ['MK', 'Mert Kaya', 'Sonraki: 18 Eyl · 11:30', ['red', '₺1.500 borç'], 1],
  ['DA', 'Deniz Arslan', 'Sonraki: 19 Eyl · 14:00', ['gray', 'TEK DERS'], 2], ['ZA', 'Zeynep Aydın', 'Tam zamanlı üyelik', ['ok', 'ÜYE'], 3],
  ['CÖ', 'Can Öztürk', '8 derslik paket · 2 kaldı', ['a', 'PAKET'], 0], ['SD', 'Selin Demir', 'Sonraki: 16 Eyl · 19:00', ['a', 'AYLIK'], 1],
  ['BŞ', 'Burak Şahin', 'Sonraki: 20 Eyl · 10:30', ['gray', 'TEK DERS'], 2], ['AK', 'Ayşe Koç', 'Tam zamanlı üyelik', ['ok', 'ÜYE'], 3],
  ['BA', 'Berk Aksoy', '', ['gray', 'TEK DERS'], 1], ['CY', 'Cansu Yılmaz', '', ['gray', 'TEK DERS'], 2], ['ÇE', 'Çağla Er', '', ['gray', 'TEK DERS'], 3],
  ['EK', 'Emre Kılıç', '', ['gray', 'TEK DERS'], 0], ['GT', 'Gizem Tan', '', ['gray', 'TEK DERS'], 1], ['HÖ', 'Hakan Öz', '', ['gray', 'TEK DERS'], 2],
  ['İD', 'İrem Doğan', '', ['gray', 'TEK DERS'], 3], ['KA', 'Kaan Arı', '', ['gray', 'TEK DERS'], 0], ['NY', 'Nil Yücel', '', ['gray', 'TEK DERS'], 1],
  ['OK', 'Onur Kaya', '', ['gray', 'TEK DERS'], 2], ['ÖS', 'Özge Sarı', '', ['gray', 'TEK DERS'], 3], ['TB', 'Tolga Bulut', '', ['gray', 'TEK DERS'], 0],
];
const CATS = ['uye hafta', 'borc hafta', 'hafta', 'uye', '', 'uye hafta', 'hafta', 'uye', 'hafta', 'uye', '', 'hafta', 'uye', '', 'hafta', '', 'uye', '', 'hafta', ''];

export const PEOPLE0: Person[] = [
  ...RAW.map((p, i) => ({ id: i, ini: p[0], name: p[1], sub: p[2], tag: p[3], ci: p[4], cat: CATS[i] })),
  { id: 100, ini: 'KT', name: 'Kerem Tunç', sub: '', tag: ['gray', 'TEK DERS'], ci: 1, cat: '', arch: true },
  { id: 101, ini: 'NE', name: 'Nazlı Er', sub: '', tag: ['gray', 'TEK DERS'], ci: 2, cat: '', arch: true },
];

export const TRA = 'A B C Ç D E F G H I İ J K L M N O Ö P R S Ş T U Ü V Y Z #'.split(' ');

export type Pkg = { id: number; kind: 'single' | 'multi'; c1: string; c2: string; name: string; sub: string; price: string; base?: boolean };
export const PACKAGES0: Pkg[] = [
  { id: 1, kind: 'single', c1: '60', c2: 'dk', name: 'Tek ders', sub: 'Takvimde 90 dk · 15 dk mola', price: '₺750', base: true },
  { id: 2, kind: 'single', c1: '90', c2: 'dk', name: 'Tek ders', sub: 'Mola yok', price: '₺1.125' },
  { id: 3, kind: 'multi', c1: '8×', c2: '', name: '8 derslik paket', sub: 'ders başı ₺675 · 2 ay', price: '₺5.400' },
  { id: 4, kind: 'multi', c1: '12×', c2: '', name: 'Aylık üyelik', sub: 'ders başı ₺600 · 1 ay', price: '₺7.200' },
];

// Yeni ders → ücret kartı: [rozet, fiyat, temel mi]
export const PKG: Record<string, [string, string, number]> = {
  '8 derslik paket': ['8×', '₺675', 0],
  'Tek ders · 60 dk': ['60', '₺750', 1],
  'Tek ders · 90 dk': ['90', '₺1.125', 0],
  'Aylık üyelik': ['12×', '₺600', 0],
};
