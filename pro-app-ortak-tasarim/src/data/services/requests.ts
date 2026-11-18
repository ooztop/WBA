// Talepler servisi (mock dalı): bekleyen rezervasyon talepleri.
import type { ID, Lesson, Req } from '../models';
import { copy, db } from './util';

export const requestsService = {
  async list(): Promise<Req[]> { return copy(db('requests').data().reqs); },
  // Onaylanan talep listeden düşer, dersi takvime eklenir (aynı saatte zaten varsa ikinci kez eklenmez)
  async accept(id: ID): Promise<void> {
    db('requests').update(d => {
      const r = d.reqs.find(x => x.id === id);
      const reqs = d.reqs.filter(x => x.id !== id);
      if (!r) return { ...d, reqs };
      if (d.extra.some(e => e.date === r.date && e.h === r.h && e.pid === r.pid)) return { ...d, reqs };
      const l: Lesson = { id: `${r.date}|${r.h}|req${r.id}`, date: r.date, h: r.h, dur: r.dur, pid: r.pid, type: r.type, st: 'w' };
      return { ...d, reqs, extra: [...d.extra, l] };
    });
  },
  async reject(id: ID): Promise<void> { db('requests').update(d => ({ ...d, reqs: d.reqs.filter(x => x.id !== id) })); },
};
