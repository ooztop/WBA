// Servislerin ortak yardımcıları: kaynak denetimi ve kopya alma.
import type { Topic } from '../models';
import { notConnected } from '../errors';
import { mockDb } from '../mock/db';
import { sourceFor } from '../source';

// Konu API'ye çevrilmişse ama henüz bağlanmamışsa 501 fırlatır; değilse mock veritabanını verir.
export function db(topic: Topic) {
  if (sourceFor(topic) === 'api') notConnected();
  return mockDb;
}

// Ekrana iç nesne sızmasın diye derin kopya verir.
export const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
