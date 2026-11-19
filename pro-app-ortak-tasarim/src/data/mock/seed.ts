// Demo verisi: bugünkü PEOPLE0, PACKAGES0 ve store'daki başlangıç değerleri; hafta saatleri ve ders kuralları varsayılanları.
import type { Brk, Debt, Doc, Off, LessonRules, Notif, NotifPrefs, PaidRow, Person, Pkg, Profile, Req, TagKind, WeekHours } from '../models';

const RAW: [string, string, string, [TagKind, string], string][] = [
  ['EY', 'Elif Yıldırım', 'Sonraki: 17 Eyl · 09:00', ['a', 'Paket'], 'hafta'], ['MK', 'Mert Kaya', 'Sonraki: 18 Eyl · 11:30', ['d', '₺1.500 borç'], 'borc hafta'],
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

// Takvimden eklenmiş yaklaşan izin günü (Takvim ayarlarım › İzin günleri)
export const OFFS0: Off[] = [{ id: 'o1', date: '2026-09-15', name: 'Tatil', start: 10, end: 18, all: true }];

export const BREAKS0: Brk[] = [
  { id: '1', name: 'Öğle molası', start: '12:30', end: '13:30', days: [0, 1, 2, 3, 4, 5] },
  { id: '2', name: 'Akşam arası', start: '17:00', end: '17:30', days: [1, 3] },
];

export const DEBTS0: Debt[] = [
  { pid: '1', lessons: [{ when: '27 Ağustos · 09:00', what: 'Bireysel · 60 dk' }, { when: '3 Eylül · 09:00', what: 'Bireysel · 60 dk' }], note: '6 gün gecikti', late: true, tag: 'Gecikti' },
  { pid: '6', lessons: [{ when: '8 Eylül · 10:30', what: 'Bireysel · 60 dk' }], note: 'vadesi yarın', tag: 'Yarın' },
];

// Eylül'de tahsil edilenler (yeniden eskiye). Fiyatlar PACKAGES0 ile aynı: tek ders ₺750, 8 derslik paket ₺5.400 (2 taksit), aylık üyelik ₺7.200.
// Elif'in 8 derslik paketi Temmuz'da alındı (24 Eyl'e kadar geçerli, 5 ders kaldı); Eylül listesinde yok.
export const PAID0: PaidRow[] = [
  { id: 'p1', ini: 'CÖ', name: 'Can Öztürk', sub: '5 Eyl · Havale · 8 derslik paket · 2. taksit', amt: 2700 },
  { id: 'p2', ini: 'SD', name: 'Selin Demir', sub: '3 Eyl · Kart · 2 ders', amt: 1500 },
  { id: 'p3', ini: 'BA', name: 'Berk Aksoy', sub: '2 Eyl · Nakit · 1 ders', amt: 750 },
  { id: 'p4', ini: 'ZA', name: 'Zeynep Aydın', sub: '1 Eyl · Havale · aylık üyelik', amt: 7200 },
];

export const COLLECTED0 = 12150; // PAID0 toplamı
export const ME0: Profile = { ad: 'Deniz', soyad: 'Arslan', title: 'Özel ders · Matematik' };
// Bekleyen rezervasyon talepleri (kişi kimlikleri PEOPLE0 sırası: 2 Deniz, 6 Burak, 9 Cansu)
export const REQS0: Req[] = [
  { id: 'r1', pid: '6', date: '2026-09-12', h: 18, dur: 60, type: 'Bireysel', price: '₺750', left: 22, note: 'Sınavım var, mümkünse konu tekrarına ağırlık verebilir miyiz?' },
  { id: 'r2', pid: '2', date: '2026-09-11', h: 10, dur: 60, type: 'Online', price: '₺750', left: 20 },
  { id: 'r3', pid: '9', date: '2026-09-14', h: 9, dur: 60, type: 'Bireysel', price: '₺750', left: 9 },
];

// Bildirimler (bugün 9 Eylül 12:36). Okunmuş bilgi bildirimleri "Görülenler"e iner; ödeme bekleniyor / paket bitmek üzere hep görünür.
const NT: [string, Notif['kind'], string, string, string, boolean][] = [
  ['n1', 'rsOk', '0', '2026-09-09T09:24', '12 Eyl 18:00', false],
  ['n2', 'paid', '3', '2026-09-09T11:05', '₺750 · Havale', false],
  ['n3', 'paid', '4', '2026-09-09T11:40', '₺5.400 · 8 derslik paket', false],
  ['n4', 'paid', '5', '2026-09-09T12:10', '₺750 · Kart', false],
  ['n5', 'cancel', '5', '2026-09-08T19:10', '8 Eyl 19:00', true],
  ['n6', 'added', '11', '2026-09-08T16:00', '21 Eyl 12:00 · Bireysel', true],
  ['n7', 'payDue', '1', '2026-09-07T10:00', '₺1.500 · 2 ders', true],
  ['n8', 'cancel', '9', '2026-09-07T08:30', '10 Eyl 14:00', false],
  ['n9', 'pkgLow', '4', '2026-09-06T18:00', '2 ders kaldı', false],
  ['n10', 'rsOk', '2', '2026-09-03T15:20', '5 Eyl 10:00', true],
  ['n11', 'paid', '7', '2026-09-02T10:00', '₺7.200 · Aylık üyelik', true],
  ['n12', 'paid', '0', '2026-09-01T09:30', '₺5.400 · 8 derslik paket', true],
  ['n13', 'added', '6', '2026-09-01T14:00', '20 Eyl 10:30 · Bireysel', true],
];
export const NOTIFS0: Notif[] = NT.map(([id, kind, pid, at, sub, read]) => ({ id, kind, pid, at, sub, read }));

// Çalışma saatleri varsayılanı: hafta içi 10:00–18:00, Cumartesi 10:00–14:00, Pazar kapalı (0 = Pazartesi)
export const WEEK0: WeekHours = [0, 1, 2, 3, 4, 5, 6].map(i => ({ on: i !== 6, s: '10:00', e: i === 5 ? '14:00' : '18:00' }));

// Ders kuralları varsayılanı: screens2.tsx'teki rule.0..3 `init` değerleri (rezervasyon 2 sa, ücretsiz iptal 2 sa, tam saat, mola 15 dk)
export const RULES0: LessonRules = {
  window: { s: 1, c: null }, freeCancel: { s: 1, c: null }, startMin: { s: 0, c: null }, gap: { s: 2, c: null },
};

export const NOTIF0: NotifPrefs = {};

// Her etkin kişiye aynı demo dokümanları: 3 dosya, 2 ders notu
export const DOCS0: Doc[] = PEOPLE0.filter(p => !p.arch).flatMap(p => [
  { id: `d${p.id}-1`, pid: p.id, kind: 'pdf', name: 'Beslenme programı.pdf', date: '2026-08-28', size: '1,2 MB' },
  { id: `d${p.id}-2`, pid: p.id, kind: 'image', name: 'Ölçüm sonuçları.jpg', date: '2026-08-20', size: '840 KB' },
  { id: `d${p.id}-3`, pid: p.id, kind: 'pdf', name: 'Onam formu.pdf', date: '2026-08-13', signed: true },
  { id: `d${p.id}-4`, pid: p.id, kind: 'note', name: '3 Eylül dersi', date: '2026-09-03', text: 'Konu tekrarı yapıldı, ödev verildi.' },
  { id: `d${p.id}-5`, pid: p.id, kind: 'note', name: '27 Ağustos dersi', date: '2026-08-27', text: 'Hedefler belirlendi.' },
] as Doc[]);
