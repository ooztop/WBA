// İzin günleri (takvimden eklenen tek seferlik izin / molalar): yaklaşanlar ve liste satırı yazıları.
import type { Off } from './models';
import { fromIso } from './dates';

const MN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DL = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const p2 = (n: number) => String(n).padStart(2, '0');
const hm = (x: number) => `${p2(Math.floor(x))}:${p2(Math.round((x % 1) * 60))}`;

// Bugün ve sonrası; tarihe, aynı günde başlangıç saatine göre
export function upcomingOffs(all: Off[], todayIso: string): Off[] {
  return all.filter(o => o.date >= todayIso).sort((a, b) => (a.date === b.date ? a.start - b.start : a.date < b.date ? -1 : 1));
}

export const offTitle = (s: string) => { const d = fromIso(s); return `${d.getDate()} ${MN[d.getMonth()]} ${DL[d.getDay()]}`; };
export const offLine = (o: Off) => `${offHours(o)} · ${o.name}`;

// Liste satırı: solda tarih rozeti ("15 / EYL"), altta "Salı · Tüm gün"
const MS = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];
export const offBadge = (s: string) => { const d = fromIso(s); return { d: String(d.getDate()), m: MS[d.getMonth()] }; };
export const offHours = (o: Off) => (o.all ? 'Tüm gün' : `${hm(o.start)} – ${hm(o.end)}`);
export const offSub = (o: Off) => `${DL[fromIso(o.date).getDay()]} · ${offHours(o)}`;
