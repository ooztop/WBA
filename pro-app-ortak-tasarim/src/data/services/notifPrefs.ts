// Bildirim tercihleri servisi (mock dalı).
import type { NotifPrefs } from '../models';
import { copy, db } from './util';

export const notifPrefsService = {
  async get(): Promise<NotifPrefs> { return copy(db('notifPrefs').data().notif); },
  async save(p: NotifPrefs): Promise<void> { db('notifPrefs').update(d => ({ ...d, notif: copy(p) })); },
};
