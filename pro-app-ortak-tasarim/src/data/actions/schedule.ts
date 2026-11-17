// Takvim eylemleri: düzenli molalar ve izin günleri.
import { get } from '../../store';
import type { Brk, ID, Off } from '../models';
import { scheduleService } from '../services';
import { afterCall, optimistic } from './optimistic';

// id varsa var olan molayı günceller, yoksa ekler
export async function saveBreak(b: Omit<Brk, 'id'> & { id?: ID }): Promise<Brk | null> {
  if (b.id && get().breaks.some(x => x.id === b.id)) {
    const full: Brk = { ...b, id: b.id };
    return (await optimistic(s => ({ breaks: s.breaks.map(x => (x.id === full.id ? full : x)) }), () => scheduleService.saveBreak(full))) ? full : null;
  }
  return afterCall(() => scheduleService.saveBreak(b), (made, s) => ({ breaks: [...s.breaks, made] }));
}

export function removeBreak(id: ID): Promise<boolean> {
  return optimistic(s => ({ breaks: s.breaks.filter(b => b.id !== id) }), () => scheduleService.removeBreak(id));
}

// Molanın bir günde geçerli olup olmadığını değiştirir (0 = Pazartesi)
export async function toggleBreakDay(id: ID, day: number, on: boolean): Promise<boolean> {
  const cur = get().breaks.find(b => b.id === id);
  if (!cur) return false;
  const days = on ? (cur.days.includes(day) ? cur.days : [...cur.days, day]) : cur.days.filter(d => d !== day);
  const next: Brk = { ...cur, days };
  return optimistic(s => ({ breaks: s.breaks.map(b => (b.id === id ? next : b)) }), () => scheduleService.saveBreak(next));
}

export function addOffs(o: Omit<Off, 'id'>[]): Promise<Off[] | null> {
  return afterCall(() => scheduleService.addOffs(o), (made, s) => ({ offs: [...s.offs, ...made] }));
}
