// Tarih anahtarı yardımcıları testi.
import { iso, fromIso, legacyKeyToIso } from '../dates';

test('iso / legacyKeyToIso', () => {
  expect(iso(new Date(2026, 8, 9))).toBe('2026-09-09');
  expect(legacyKeyToIso('2026-8-9')).toBe('2026-09-09');
  expect(iso(fromIso('2026-12-31'))).toBe('2026-12-31');
});
