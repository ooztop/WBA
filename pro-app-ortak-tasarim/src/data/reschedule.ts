// Erteleme ekranındaki gün şeridi: takvimden seçilen gün ve saat şeridin içine yerleşir,
// böylece seçim ayrı bir çubuk yerine şeritte ve saatlerde seçili görünür.
export type SlotDay = { d: Date; times: string[] };
export type Picked = { d: Date; h: number };

const p2 = (n: number) => String(n).padStart(2, '0');
export const hhmmOf = (h: number) => `${p2(Math.floor(h))}:${p2(Math.round((h % 1) * 60))}`;
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function stripDays(base: SlotDay[], cus: Picked | null): { days: SlotDay[]; sel: { di: number; si: number } | null } {
  if (!cus) return { days: base, sel: null };
  const t = hhmmOf(cus.h);
  const i = base.findIndex(x => sameDay(x.d, cus.d));
  let days: SlotDay[];
  if (i >= 0) {
    // Gün şeritte: saati o günün saatlerine ekle (sıralı, tekrarsız)
    days = base.map((x, j) => (j === i ? { ...x, times: [...new Set([...x.times, t])].sort() } : x));
  } else {
    // Gün şeritte değil: tarih sırasına sok; en sondaysa ilk gün, değilse son gün düşer (şerit 6 gün kalır)
    const all = [...base, { d: cus.d, times: [t] }].sort((a, b) => +a.d - +b.d);
    const k = all.findIndex(x => sameDay(x.d, cus.d));
    days = k === all.length - 1 ? all.slice(1) : all.slice(0, base.length);
  }
  const di = days.findIndex(x => sameDay(x.d, cus.d));
  return { days, sel: { di, si: days[di].times.indexOf(t) } };
}
