// Kaynak anahtarı, hata türü ve tarih yardımcıları testleri.
import { sourceFor } from '../source';
import { notConnected } from '../errors';

test('API adresi yoksa her konu mock', () => {
  delete process.env.EXPO_PUBLIC_API_URL;
  expect(sourceFor('people')).toBe('mock');
});
test('DATA_SOURCE=mock her şeyi mock yapar', () => {
  process.env.EXPO_PUBLIC_API_URL = 'http://x';
  process.env.EXPO_PUBLIC_DATA_SOURCE = 'mock';
  expect(sourceFor('schedule')).toBe('mock');
  delete process.env.EXPO_PUBLIC_API_URL;
  delete process.env.EXPO_PUBLIC_DATA_SOURCE;
});
test('notConnected 501 fırlatır', () => {
  expect(() => notConnected()).toThrow(expect.objectContaining({ status: 501, code: 'NOT_CONNECTED' }));
});
