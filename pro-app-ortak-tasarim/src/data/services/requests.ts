// Talepler servisi (mock dalı): demo talepleri.
import type { Lesson, ReqState } from '../models';
import { copy, db } from './util';

export const requestsService = {
  async get(): Promise<ReqState> { return copy(db('requests').data().reqs); },
  // 'b' (Burak'ın talebi): 12 Eylül 18:00 dersi takvime eklenir; ders zaten varsa ikinci kez eklenmez
  async accept(id: 'b'): Promise<void> {
    db('requests').update(d => {
      const reqs = { ...d.reqs, [id]: false };
      const date = '2026-09-12';
      if (d.extra.some(e => e.date === date && e.h === 18)) return { ...d, reqs };
      const l: Lesson = { id: `${date}|18|req`, date, h: 18, dur: 60, pid: '6', type: 'Bireysel', st: 'w' };
      return { ...d, reqs, extra: [...d.extra, l] };
    });
  },
  async reject(id: 'b'): Promise<void> { db('requests').update(d => ({ ...d, reqs: { ...d.reqs, [id]: false } })); },
};
