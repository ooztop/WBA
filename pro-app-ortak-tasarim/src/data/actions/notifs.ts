// Bildirim eylemleri: okundu işaretleme.
import type { ID } from '../models';
import { notifsService } from '../services';
import { optimistic } from './optimistic';
import type { State } from '../../store';

export function markNotifsRead(ids: ID[]): Promise<boolean> {
  const set = new Set(ids);
  if (!ids.length) return Promise.resolve(true);
  return optimistic((s: State) => ({ notifs: s.notifs.map(n => (set.has(n.id) ? { ...n, read: true } : n)) }), () => notifsService.markRead(ids));
}
export function markAllNotifsRead(): Promise<boolean> {
  return optimistic((s: State) => ({ notifs: s.notifs.map(n => ({ ...n, read: true })) }), () => notifsService.markAllRead());
}
