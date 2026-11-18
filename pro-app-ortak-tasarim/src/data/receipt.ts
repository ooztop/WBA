// Makbuz: ödeme al ekranında seçilen derslerden toplamlar ve paylaşılacak düz metin.
import { longDate } from './docs';
import type { Lesson, PaidRow, Pkg } from './models';
import { lessonPrice, parseTl } from './price';

export type ReceiptLine = { when: string; what: string; amt: number };
export type Receipt = { from: string; title: string; to: string; date: string; method: string; lines: ReceiptLine[]; paid: number };

const tl = (n: number) => '₺' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function receiptSums(r: Receipt) {
  const sum = r.lines.reduce((a, l) => a + l.amt, 0);
  return { sum, paid: r.paid, rest: Math.max(0, sum - r.paid) };
}

export function receiptText(r: Receipt): string {
  const { rest } = receiptSums(r);
  return [
    `Makbuz · ${r.from}`,
    `${r.to} · ${longDate(r.date)}`,
    '',
    ...r.lines.map(l => `${l.when} · ${l.what} · ${tl(l.amt)}`),
    '',
    `Alınan: ${tl(r.paid)} (${r.method})`,
    ...(rest > 0 ? [`Kalan borç: ${tl(rest)}`] : []),
  ].join('\n');
}

/* ---------- makbuzu kayıttan kurma ---------- */

const MS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const MN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const YEAR = 2026; // demo yılı (TODAY ile aynı); API'ye geçince ödeme kaydının kendi tarihi gelir
const p2 = (n: number) => String(n).padStart(2, '0');
type Me = { from: string; title: string };

// "8 Eyl" → '2026-09-08'
function shortToIso(s: string): string {
  const [d, m] = s.trim().split(' ');
  return `${YEAR}-${p2(MS.indexOf(m) + 1)}-${p2(Number(d))}`;
}
const longDay = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MN[m - 1]}`; };

// Ödemeler'deki satır: "8 Eyl · Nakit · 4 ders"
export function paidRowReceipt(row: PaidRow, me: Me): Receipt {
  const [d, method, what] = row.sub.split(' · ');
  const date = shortToIso(d);
  return { ...me, to: row.name, date, method: method || 'Nakit', lines: [{ when: longDay(date), what: what || 'Ödeme', amt: row.amt }], paid: row.amt };
}

// Ödenmiş dersin makbuzu: paketli derste paketin satın alındığı ödeme, tek derste dersin kendisi
export function lessonReceipt(l: Lesson, name: string, pkName: string, pkgs: Pkg[], paid: PaidRow[], me: Me): Receipt {
  if (/paket/i.test(pkName)) {
    const row = paid.find(r => r.name === name && r.sub.includes(pkName));
    if (row) return paidRowReceipt(row, me);
    const amt = parseTl(pkgs.find(p => p.name === pkName)?.price ?? '') || 0;
    return { ...me, to: name, date: '2026-09-02', method: 'Havale / EFT', lines: [{ when: '2 Eylül', what: pkName, amt }], paid: amt };
  }
  const amt = lessonPrice(l.dur, pkgs);
  const h = `${p2(Math.floor(l.h))}:${p2(Math.round((l.h % 1) * 60))}`;
  return { ...me, to: name, date: l.date, method: 'Nakit', lines: [{ when: `${longDay(l.date)} · ${h}`, what: `${l.type} · ${l.dur} dk`, amt }], paid: amt };
}
