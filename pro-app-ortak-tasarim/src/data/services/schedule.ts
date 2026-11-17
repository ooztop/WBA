// Takvim ayarları servisi (mock dalı): çalışma saatleri, molalar, kapalı saatler.
import type { Brk, ID, Off, WeekHours } from '../models';
import { newId } from '../mock/db';
import { copy, db } from './util';

export const scheduleService = {
  async getWeek(): Promise<WeekHours> { return copy(db('schedule').data().week); },
  async saveWeek(w: WeekHours): Promise<void> { db('schedule').update(d => ({ ...d, week: copy(w) })); },
  async listBreaks(): Promise<Brk[]> { return copy(db('schedule').data().breaks); },
  // id varsa günceller, yoksa ekler
  async saveBreak(b: Omit<Brk, 'id'> & { id?: ID }): Promise<Brk> {
    const m = db('schedule');
    const full: Brk = { ...b, id: b.id ?? newId('b') };
    const exists = m.data().breaks.some(x => x.id === full.id);
    m.update(d => ({ ...d, breaks: exists ? d.breaks.map(x => (x.id === full.id ? full : x)) : [...d.breaks, full] }));
    return copy(full);
  },
  async removeBreak(id: ID): Promise<void> { db('schedule').update(d => ({ ...d, breaks: d.breaks.filter(b => b.id !== id) })); },
  async listOffs(): Promise<Off[]> { return copy(db('schedule').data().offs); },
  async addOffs(o: Omit<Off, 'id'>[]): Promise<Off[]> {
    const made = o.map(x => ({ ...x, id: newId('o') }));
    db('schedule').update(d => ({ ...d, offs: [...d.offs, ...made] }));
    return copy(made);
  },
};
