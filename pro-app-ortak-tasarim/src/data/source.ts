// Konu başına veri kaynağı anahtarı: 'mock' ya da 'api'.
import type { Topic } from './models';

// Bu planda bütün konular mock. API bağlandıkça konu konu 'api' yapılır.
export const DATA_SOURCE: Record<Topic, 'mock' | 'api'> = {
  people: 'mock', lessons: 'mock', packages: 'mock', schedule: 'mock', rules: 'mock',
  notifPrefs: 'mock', payments: 'mock', requests: 'mock', profile: 'mock', notifs: 'mock', support: 'mock',
};

// Ortam değişkenleri her çağrıda okunur (testler değiştirebilsin diye).
export function sourceFor(t: Topic): 'mock' | 'api' {
  if (!process.env.EXPO_PUBLIC_API_URL) return 'mock';
  if (process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock') return 'mock';
  return DATA_SOURCE[t];
}
