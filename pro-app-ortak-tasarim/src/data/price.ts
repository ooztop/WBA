// Ders fiyatı: Paket tercihlerindeki tek ders fiyatlarından (süreye uyan; yoksa temel tek ders; o da yoksa ₺750).
import type { Pkg } from './models';

export const parseTl = (s: string) => Number((s || '').replace(/[^\d]/g, '')) || 0;
export const durOf = (what: string) => { const m = what.match(/(\d+)\s*dk/); return m ? +m[1] : 60; };

export function lessonPrice(dur: number, pkgs: Pkg[]): number {
  const singles = pkgs.filter(p => p.kind === 'single');
  const exact = singles.find(p => new RegExp(`\\b${dur}\\s*dk`).test(p.name));
  const base = singles.find(p => p.base) ?? singles[0];
  return parseTl((exact ?? base)?.price ?? '') || 750;
}
