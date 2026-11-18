import { durOf, lessonPrice, parseTl } from '../price';
import type { Pkg } from '../models';

const P = (id: string, name: string, price: string, kind: Pkg['kind'] = 'single', base = false): Pkg => ({ id, kind, c1: '', c2: '', name, sub: '', price, base });
const pkgs = [P('1', 'Tek ders · 60 dk', '₺750', 'single', true), P('2', 'Tek ders · 90 dk', '₺1.125'), P('3', '8 derslik paket', '₺5.400', 'multi')];

test('parseTl binlik noktalı tutarı sayıya çevirir', () => {
  expect(parseTl('₺1.125')).toBe(1125);
  expect(parseTl('₺750')).toBe(750);
  expect(parseTl('')).toBe(0);
});
test('durOf "Bireysel · 90 dk" metninden süreyi alır', () => {
  expect(durOf('Bireysel · 90 dk')).toBe(90);
  expect(durOf('Grup')).toBe(60);
});
test('lessonPrice süreye uyan tek ders fiyatını, yoksa temel tek dersi verir', () => {
  expect(lessonPrice(90, pkgs)).toBe(1125);
  expect(lessonPrice(60, pkgs)).toBe(750);
  expect(lessonPrice(45, pkgs)).toBe(750);
  expect(lessonPrice(60, [])).toBe(750);
});
