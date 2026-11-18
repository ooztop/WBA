// Ödeme eylemleri: ödeme al (borç, kişi etiketi, ödenenler ve tahsilat birlikte değiştiği için önbellek servisten yenilenir).
import { paymentsService, peopleService } from '../services';
import { afterCall } from './optimistic';
import { refreshDay } from './lessons';
import type { CollectIn } from '../services/payments';

// Ödenen derslerin günleri tazelenir (takvimde ve ders detayında "Ödendi" görünsün)
export async function collectPayment(i: CollectIn): Promise<boolean> {
  const r = await afterCall(async () => {
    await paymentsService.collect(i);
    if (!i.part) await Promise.all([...new Set((i.lessonIds ?? []).map(id => id.slice(0, 10)))].map(day => refreshDay(day).catch(() => {})));
    const [debts, paid, collected, people] = await Promise.all([paymentsService.debts(), paymentsService.paid(), paymentsService.collected(), peopleService.list()]);
    return { debts, paid, collected, people };
  }, r => r);
  return r !== null;
}
