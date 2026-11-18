// Bildirimler servisi (mock dalı): bildirim listesi ve okundu işaretleme.
import type { ID, Notif } from '../models';
import { copy, db } from './util';

export const notifsService = {
  async list(): Promise<Notif[]> { return copy(db('notifs').data().notifs); },
  async markRead(ids: ID[]): Promise<void> {
    const set = new Set(ids);
    db('notifs').update(d => ({ ...d, notifs: d.notifs.map(n => (set.has(n.id) ? { ...n, read: true } : n)) }));
  },
  async markAllRead(): Promise<void> { db('notifs').update(d => ({ ...d, notifs: d.notifs.map(n => ({ ...n, read: true })) })); },
};
