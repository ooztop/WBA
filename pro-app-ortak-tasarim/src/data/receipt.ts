// Makbuz: ödeme al ekranında seçilen derslerden toplamlar ve paylaşılacak düz metin.
import { longDate } from './docs';

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
