// Tarih anahtarı yardımcıları: 'YYYY-MM-DD' biçimi ve eski dkey dönüşümü.
const p2 = (n: number) => String(n).padStart(2, '0');

// Yerel tarihten 'YYYY-MM-DD'
export const iso = (d: Date): string => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

// 'YYYY-MM-DD' → yerel gece yarısı
export function fromIso(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Eski dkey ('2026-8-9', ay 0'dan başlar) → '2026-09-09'
export function legacyKeyToIso(k: string): string {
  const [y, m, d] = k.split('-').map(Number);
  return `${y}-${p2(m + 1)}-${p2(d)}`;
}
