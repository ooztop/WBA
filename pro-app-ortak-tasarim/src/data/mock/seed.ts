// Demo verisi: bugünkü PEOPLE0, PACKAGES0 ve store'daki başlangıç değerleri; hafta saatleri ve ders kuralları varsayılanları.
import type { Brk, Debt, LessonRules, NotifPrefs, PaidRow, Person, Pkg, Profile, ReqState, TagKind, WeekHours } from '../models';

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
  ...RAW.map((p, i) => ({ id: String(i), ini: p[0], name: p[1], sub: p[2], tag: p[3], cat: p[4] })),
  { id: '100', ini: 'KT', name: 'Kerem Tunç', sub: "2 Temmuz'da arşivlendi", tag: ['n', 'Arşiv'], cat: '', arch: true },
  { id: '101', ini: 'NE', name: 'Nazlı Er', sub: "14 Ağustos'ta arşivlendi", tag: ['n', 'Arşiv'], cat: '', arch: true },
];

export const PACKAGES0: Pkg[] = [
  { id: '1', kind: 'single', c1: '60′', c2: '', name: 'Tek ders · 60 dk', sub: 'Takvimde 90 dk · 15 dk mola', price: '₺750', base: true },
  { id: '2', kind: 'single', c1: '90′', c2: '', name: 'Tek ders · 90 dk', sub: 'Mola yok', price: '₺1.125' },
  { id: '3', kind: 'multi', c1: '8×', c2: '', name: '8 derslik paket', sub: 'ders başı ₺675 · 2 ay', price: '₺5.400' },
  { id: '4', kind: 'multi', c1: '12×', c2: '', name: 'Aylık üyelik', sub: 'ders başı ₺600 · 1 ay', price: '₺7.200' },
];

export const BREAKS0: Brk[] = [
  { id: '1', name: 'Öğle molası', start: '12:30', end: '13:30', days: [0, 1, 2, 3, 4, 5] },
  { id: '2', name: 'Akşam arası', start: '17:00', end: '17:30', days: [1, 3] },
];

export const DEBTS0: Debt[] = [
  { pid: '1', lessons: [{ when: '27 Ağustos · 09:00', what: 'Bireysel · 60 dk' }, { when: '3 Eylül · 09:00', what: 'Bireysel · 60 dk' }], note: '6 gün gecikti', late: true, tag: 'Gecikti' },
  { pid: '6', lessons: [{ when: '8 Eylül · 10:30', what: 'Bireysel · 60 dk' }], note: 'vadesi yarın', tag: 'Yarın' },
];

export const PAID0: PaidRow[] = [
  { id: 'p1', ini: 'ZA', name: 'Zeynep Aydın', sub: '10 Eyl · Havale · aylık üyelik', amt: 5400 }, { id: 'p2', ini: 'EY', name: 'Elif Yıldırım', sub: '8 Eyl · Nakit · 4 ders', amt: 3000 },
  { id: 'p3', ini: 'CÖ', name: 'Can Öztürk', sub: '5 Eyl · Havale · 8 derslik paket', amt: 2500 }, { id: 'p4', ini: 'SD', name: 'Selin Demir', sub: '3 Eyl · Kart · 2 ders', amt: 1500 },
];

export const COLLECTED0 = 12400;
export const ME0: Profile = { ad: 'Deniz', soyad: 'Arslan', title: 'Özel ders · Matematik' };
export const REQS0: ReqState = { b: true, a: true };

// Çalışma saatleri varsayılanı: hafta içi 10:00–18:00, Cumartesi 10:00–14:00, Pazar kapalı (0 = Pazartesi)
export const WEEK0: WeekHours = [0, 1, 2, 3, 4, 5, 6].map(i => ({ on: i !== 6, s: '10:00', e: i === 5 ? '14:00' : '18:00' }));

// Ders kuralları varsayılanı: screens2.tsx'teki rule.0..3 `init` değerleri (rezervasyon 2 sa, ücretsiz iptal 2 sa, tam saat, mola 15 dk)
export const RULES0: LessonRules = {
  window: { s: 1, c: null }, freeCancel: { s: 1, c: null }, startMin: { s: 0, c: null }, gap: { s: 2, c: null },
};

export const NOTIF0: NotifPrefs = {};
