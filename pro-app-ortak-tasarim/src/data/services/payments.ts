// Ödemeler servisi (mock dalı): borçlar, ödenenler, tahsilat.
import type { Debt, ID, PaidRow, Person } from '../models';
import { newId } from '../mock/db';
import { copy, db } from './util';

export const paymentsService = {
  async debts(): Promise<Debt[]> { return copy(db('payments').data().debts); },
  async paid(): Promise<PaidRow[]> { return copy(db('payments').data().paid); },
  async collected(): Promise<number> { return db('payments').data().collected; },
  // Seçilen dersleri borçtan düşer; borcu biten kişinin etiketi "Tek ders" olur; tahsilat artar, ödenenlerin başına satır eklenir
  async collect(i: { pid: ID; lessonIdx: number[]; method: string; amount: number; name: string; ini: string }): Promise<void> {
    db('payments').update(d => {
      const debt = d.debts.find(x => x.pid === i.pid);
      const left = debt ? debt.lessons.filter((_, k) => !i.lessonIdx.includes(k)) : [];
      const debts = debt ? (left.length ? d.debts.map(x => (x.pid === i.pid ? { ...x, lessons: left } : x)) : d.debts.filter(x => x.pid !== i.pid)) : d.debts;
      const people = !left.length ? d.people.map(p => (p.id === i.pid && p.tag[0] === 'd' ? { ...p, tag: ['n', 'Tek ders'] as Person['tag'], cat: p.cat.replace('borc', '').trim() } : p)) : d.people;
      const row: PaidRow = { id: newId('p'), ini: i.ini, name: i.name, sub: `10 Eyl · ${i.method} · ${i.lessonIdx.length} ders`, amt: i.amount };
      return { ...d, debts, people, collected: d.collected + i.amount, paid: [row, ...d.paid] };
    });
  },
};
