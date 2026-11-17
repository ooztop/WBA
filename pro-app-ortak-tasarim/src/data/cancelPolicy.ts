// Ders iptalinde ödeme/paket seçenekleri ve varsayılanı.
// Varsayılan kuralı uygular; uzman her durumda başka bir seçeneği seçebilir.
import type { Choice } from './models';
import { fromIso } from './dates';
import { NOW_H, TODAY } from './mock/lessonGen';

export const CANCEL_REASONS = ['Ben iptal ediyorum', 'Kişi gelemiyor', 'Hava / mekân'] as const;
export type CancelReason = (typeof CANCEL_REASONS)[number];

export const PK_OPTS = ['Pakete geri ekle', 'Paketten düş'];
export const PAID_OPTS = ['İade et', 'İade etme', 'Ücretsiz ders ver'];
export const UNPAID_OPTS = ['Ücret alınmasın', 'Ücret alınsın'];

export type CancelInput = { pk: boolean; paid: boolean; reason: string; hoursLeft: number; freeH: number };
export type CancelOptions = { title: string; opts: string[]; def: string; late: boolean };

export function cancelOptions({ pk, paid, reason, hoursLeft, freeH }: CancelInput): CancelOptions {
  // Geç iptal: sadece kişi gelemiyorsa ve ücretsiz iptal süresi geçmişse
  const late = reason === 'Kişi gelemiyor' && hoursLeft < freeH;
  if (pk) return { title: 'Paket', opts: PK_OPTS, def: late ? 'Paketten düş' : 'Pakete geri ekle', late };
  if (paid) return { title: 'Ödeme', opts: PAID_OPTS, def: late ? 'İade etme' : 'İade et', late };
  return { title: 'Ücret', opts: UNPAID_OPTS, def: late ? 'Ücret alınsın' : 'Ücret alınmasın', late };
}

// Sonuç ekranında seçimin geçmiş zaman hâli
export const cancelResult: Record<string, string> = {
  'Pakete geri ekle': 'Pakete geri eklendi',
  'Paketten düş': 'Paketten düştü',
  'İade et': 'İade edildi',
  'İade etme': 'İade edilmedi',
  'Ücretsiz ders ver': 'Ücretsiz ders verildi',
  'Ücret alınmasın': 'Ücret alınmadı',
  'Ücret alınsın': 'Borca yazıldı',
};

// Ders kurallarındaki "Ücretsiz iptal süresi" (rule.1): hazır değerler 2 / 4 / 24 saat, ya da özel değer
const FREE_H = [2, 4, 24];
export function freeCancelHours(v: unknown): number {
  const r = v as Partial<Choice> | null | undefined;
  if (r && typeof r.c === 'string') {
    const n = parseFloat(r.c.replace(',', '.'));
    if (Number.isFinite(n) && n >= 0) return n;
  }
  if (r && typeof r.s === 'number' && FREE_H[r.s] !== undefined) return FREE_H[r.s];
  return 4;
}

// Dersin başlamasına kaç saat var (demo "şimdi"sine göre)
export function hoursUntil(date: string, h: number): number {
  const days = Math.round((+fromIso(date) - +TODAY) / 864e5);
  return days * 24 + h - NOW_H;
}
