// Ödeme eylemleri: ödeme al (borç, kişi etiketi, ödenenler ve tahsilat birlikte değiştiği için önbellek servisten yenilenir).
import type { ID } from '../models';
import { paymentsService, peopleService } from '../services';
import { afterCall } from './optimistic';

export async function collectPayment(i: { pid: ID; lessonIdx: number[]; method: string; amount: number; name: string; ini: string }): Promise<boolean> {
  const r = await afterCall(async () => {
    await paymentsService.collect(i);
    const [debts, paid, collected, people] = await Promise.all([paymentsService.debts(), paymentsService.paid(), paymentsService.collected(), peopleService.list()]);
    return { debts, paid, collected, people };
  }, r => r);
  return r !== null;
}
