// Dersler servisi (mock dalı): gün aralığı okuma, ekleme, iptal, taşıma.
import type { ID, Lesson } from '../models';
import { addDays } from './dateUtil';
import { fromIso, iso } from '../dates';
import { newId } from '../mock/db';
import { copy, db } from './util';

export const lessonsService = {
  // from..to (dahil) her gün için anahtar döner, boş günler []
  async range(from: string, to: string): Promise<Record<string, Lesson[]>> {
    const m = db('lessons');
    const out: Record<string, Lesson[]> = {};
    for (let d = fromIso(from); iso(d) <= to; d = addDays(d, 1)) out[iso(d)] = copy(m.lessonsFor(d));
    return out;
  },
  async create(ls: Omit<Lesson, 'id'>[]): Promise<Lesson[]> {
    const m = db('lessons');
    const made = ls.map(l => ({ ...l, id: `${l.date}|${l.h}|${newId('n')}` }));
    m.update(d => ({ ...d, extra: [...d.extra, ...made] }));
    return copy(made);
  },
  async cancel(id: ID): Promise<void> {
    db('lessons').update(d => (d.extra.some(e => e.id === id)
      ? { ...d, extra: d.extra.filter(e => e.id !== id) }
      : { ...d, cancelled: d.cancelled.includes(id) ? d.cancelled : [...d.cancelled, id] }));
  },
  // Eski saati kaldırır, yeni saate ekler; ödendi/ödenmedi durumu korunur, diğerleri 'w' olur
  async reschedule(id: ID, to: { date: string; h: number }): Promise<Lesson> {
    const m = db('lessons');
    const old = m.lessonsFor(fromIso(id.slice(0, 10))).find(l => l.id === id);
    if (!old) throw new Error(`Ders bulunamadı: ${id}`);
    const next: Lesson = { ...old, id: `${to.date}|${to.h}|${newId('n')}`, date: to.date, h: to.h, st: old.st === 'ok' || old.st === 'no' ? old.st : 'w' };
    await lessonsService.cancel(id);
    m.update(d => ({ ...d, extra: [...d.extra, next] }));
    return copy(next);
  },
};
