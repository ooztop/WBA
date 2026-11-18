// Ödemeler servisi (mock dalı): borçlar, ödenenler, tahsilat.
import type { Debt, ID, PaidRow, Person } from '../models';
import { newId } from '../mock/db';
import { copy, db } from './util';

export type CollectIn = { pid: ID; lessonIdx: number[]; lessonIds?: ID[]; method: string; amount: number; name: string; ini: string; part?: boolean };

export const paymentsService = {
  async debts(): Promise<Debt[]> { return copy(db('payments').data().debts); },
  async paid(): Promise<PaidRow[]> { return copy(db('payments').data().paid); },
  async collected(): Promise<number> { return db('payments').data().collected; },
  // Ödeme kaydı. Tam ödemede: seçilen borç dersleri düşer, seçilen dersler (lessonIds ve borçtaki lessonId'ler) "ödendi" olur,
  // borcu biten kişinin etiketi "Tek ders" olur. Eksik ödemede (part): borç ve dersler olduğu gibi kalır.
  // Her iki durumda tahsilat artar, ödenenlerin başına satır eklenir.
  async collect(i: CollectIn): Promise<void> {
    db('payments').update(d => {
      const row = (n: string): PaidRow => ({ id: newId('p'), ini: i.ini, name: i.name, sub: `10 Eyl · ${i.method} · ${n}`, amt: i.amount });
      if (i.part) return { ...d, collected: d.collected + i.amount, paid: [row('kısmi ödeme'), ...d.paid] };
      const debt = d.debts.find(x => x.pid === i.pid);
      const left = debt ? debt.lessons.filter((_, k) => !i.lessonIdx.includes(k)) : [];
      const debts = debt ? (left.length ? d.debts.map(x => (x.pid === i.pid ? { ...x, lessons: left } : x)) : d.debts.filter(x => x.pid !== i.pid)) : d.debts;
      const people = !left.length ? d.people.map(p => (p.id === i.pid && p.tag[0] === 'd' ? { ...p, tag: ['n', 'Tek ders'] as Person['tag'], cat: p.cat.replace('borc', '').trim() } : p)) : d.people;
      const ids = new Set([...(i.lessonIds ?? []), ...(debt ? i.lessonIdx.map(k => debt.lessons[k]?.lessonId).filter((x): x is ID => !!x) : [])]);
      const lessonMeta = { ...d.lessonMeta };
      ids.forEach(id => { lessonMeta[id] = { ...lessonMeta[id], st: 'ok' }; });
      const n = new Set([...i.lessonIdx.map(k => `d${k}`), ...(i.lessonIds ?? [])]).size;
      return { ...d, debts, people, lessonMeta, collected: d.collected + i.amount, paid: [row(`${n} ders`), ...d.paid] };
    });
  },
};
