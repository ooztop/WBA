// Destek servisi (mock dalı): destek ekibine gönderilen mesajları saklar.
import type { SupportMsg } from '../models';
import { canSend } from '../help';
import { copy, db } from './util';

let n = 0;
export const supportService = {
  async send(m: { topic: string; text: string }): Promise<SupportMsg> {
    if (!canSend(m.text)) throw new Error('Mesaj boş');
    const msg: SupportMsg = { id: `s${Date.now().toString(36)}${(n++).toString(36)}`, topic: m.topic, text: m.text.trim(), at: new Date().toISOString() };
    db('support').update(d => ({ ...d, support: [...(d.support ?? []), msg] }));
    return copy(msg);
  },
};
