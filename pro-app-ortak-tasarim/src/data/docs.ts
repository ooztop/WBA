// Dokümanlar: kişiye göre dosya / not ayırma, liste satırı yazısı, yeni not başlığı.
import type { Doc, ID } from './models';
import { fromIso } from './dates';

const MS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const MN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const newest = (a: Doc, b: Doc) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export function splitDocs(all: Doc[], pid: ID) {
  const mine = all.filter(d => d.pid === pid).sort(newest);
  return { files: mine.filter(d => d.kind !== 'note'), notes: mine.filter(d => d.kind === 'note') };
}

export const shortDate = (s: string) => { const d = fromIso(s); return `${d.getDate()} ${MS[d.getMonth()]}`; };
export const longDate = (s: string) => { const d = fromIso(s); return `${d.getDate()} ${MN[d.getMonth()]} ${d.getFullYear()}`; };

// Dosyada "1,2 MB · 28 Ağu", notta metnin ilk satırı
export function docLine(d: Doc): string {
  if (d.kind === 'note') return (d.text ?? '').split('\n')[0].trim() || 'Boş not';
  return d.size ? `${d.size} · ${shortDate(d.date)}` : shortDate(d.date);
}

export const noteTitle = (s: string) => { const d = fromIso(s); return `${d.getDate()} ${MN[d.getMonth()]} notu`; };
