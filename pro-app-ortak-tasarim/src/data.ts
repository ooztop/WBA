
export const DN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const D1 = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
export const DL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const MN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const MS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
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

// [saat, süre dk, kişi id, tür yazısı, durum]  durum: ok ödendi · no ödenmedi · nx sıradaki · w bekliyor
export type Lesson = [number, number, number, string, 'ok' | 'no' | 'nx' | 'w'];
export type Extra = { k: string; l: Lesson };
const TYN = ['Bireysel', 'Grup', 'Online', 'Deneme dersi'];

function baseLessons(d: Date): Lesson[] {
  if (same(d, TODAY)) return [[9, 60, 0, 'Bireysel', 'ok'], [11.5, 60, 1, 'Grup · 3 kişi', 'no'], [14, 60, 3, 'Online', 'nx'], [19, 60, 5, 'Grup', 'w']];
  let h = ((d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) * 2654435761) % 4294967296;
  const r = () => (h = (h * 1103515245 + 12345) % 2147483648) / 2147483648;
  let n = Math.floor(r() * 4);
  if (wd(d) === 6) n = 0;
  if (wd(d) === 5) n = Math.min(n, 1);
  const hs = HRS.slice().sort(() => r() - 0.5).slice(0, n).sort((a, b) => a - b);
  const past = d < TODAY;
  return hs.map(x => [x, [45, 60, 60, 60][Math.floor(r() * 4)], Math.floor(r() * 8), TYN[Math.floor(r() * 4)], past ? (r() < 0.8 ? 'ok' : 'no') : 'w'] as Lesson);
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

export type TagKind = 'a' | 'i' | 's' | 'd' | 'n';
export type Person = { id: number; ini: string; name: string; sub: string; tag: [TagKind, string]; cat: string; arch?: boolean; gone?: boolean };

const RAW: [string, string, string, [TagKind, string], string][] = [
  ['EY', 'Elif Yıldırım', 'Sonraki: 17 Eyl · 09:00', ['i', 'Aylık'], 'hafta'], ['MK', 'Mert Kaya', 'Sonraki: 18 Eyl · 11:30', ['d', '₺1.500 borç'], 'borc hafta'],
  ['DA', 'Deniz Arslan', 'Sonraki: 19 Eyl · 14:00', ['n', 'Tek ders'], 'hafta'], ['ZA', 'Zeynep Aydın', 'Tam zamanlı üyelik', ['s', 'Üye'], 'uye hafta'],
  ['CÖ', 'Can Öztürk', '8 derslik paket · 2 kaldı', ['a', 'Paket'], 'hafta'], ['SD', 'Selin Demir', 'Sonraki: 16 Eyl · 19:00', ['i', 'Aylık'], 'hafta'],
  ['BŞ', 'Burak Şahin', 'Sonraki: 20 Eyl · 10:30', ['n', 'Tek ders'], 'hafta'], ['AK', 'Ayşe Koç', 'Tam zamanlı üyelik', ['s', 'Üye'], 'uye hafta'],
  ['BA', 'Berk Aksoy', 'Son ders: 2 Eyl', ['n', 'Tek ders'], ''], ['CY', 'Cansu Yılmaz', 'Son ders: 29 Ağu', ['n', 'Tek ders'], ''], ['ÇE', 'Çağla Er', 'Son ders: 21 Ağu', ['n', 'Tek ders'], ''],
  ['EK', 'Emre Kılıç', 'Sonraki: 21 Eyl · 12:00', ['n', 'Tek ders'], 'hafta'], ['GT', 'Gizem Tan', 'Tam zamanlı üyelik', ['s', 'Üye'], 'uye'], ['HÖ', 'Hakan Öz', 'Son ders: 14 Ağu', ['n', 'Tek ders'], ''],
  ['İD', 'İrem Doğan', 'Son ders: 26 Ağu', ['n', 'Tek ders'], ''], ['KA', 'Kaan Arı', 'Son ders: 8 Ağu', ['n', 'Tek ders'], ''], ['NY', 'Nil Yücel', 'Tam zamanlı üyelik', ['s', 'Üye'], 'uye'],
  ['OK', 'Onur Kaya', 'Son ders: 1 Eyl', ['n', 'Tek ders'], ''], ['ÖS', 'Özge Sarı', 'Son ders: 30 Tem', ['n', 'Tek ders'], ''], ['TB', 'Tolga Bulut', 'Son ders: 4 Eyl', ['n', 'Tek ders'], ''],
];

export const PEOPLE0: Person[] = [
  ...RAW.map((p, i) => ({ id: i, ini: p[0], name: p[1], sub: p[2], tag: p[3], cat: p[4] })),
  { id: 100, ini: 'KT', name: 'Kerem Tunç', sub: "2 Temmuz'da arşivlendi", tag: ['n', 'Arşiv'], cat: '', arch: true },
  { id: 101, ini: 'NE', name: 'Nazlı Er', sub: "14 Ağustos'ta arşivlendi", tag: ['n', 'Arşiv'], cat: '', arch: true },
];

export const TRA = 'A B C Ç D E F G H I İ J K L M N O Ö P R S Ş T U Ü V Y Z #'.split(' ');

export type Pkg = { id: number; kind: 'single' | 'multi'; c1: string; c2: string; name: string; sub: string; price: string; base?: boolean };
export const PACKAGES0: Pkg[] = [
  { id: 1, kind: 'single', c1: '60′', c2: '', name: 'Tek ders · 60 dk', sub: 'Takvimde 90 dk · 15 dk mola', price: '₺750', base: true },
  { id: 2, kind: 'single', c1: '90′', c2: '', name: 'Tek ders · 90 dk', sub: 'Mola yok', price: '₺1.125' },
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
