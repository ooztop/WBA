// Doküman servisi (mock dalı): kişilerin dosyaları ve ders notları.
import type { Doc, ID } from '../models';
import { copy, db } from './util';

let n = 0;
export const docsService = {
  async list(): Promise<Doc[]> { return copy(db('docs').data().docs ?? []); },
  async create(d: Omit<Doc, 'id'>): Promise<Doc> {
    const doc: Doc = { ...copy(d), id: `d${Date.now().toString(36)}${(n++).toString(36)}` };
    db('docs').update(x => ({ ...x, docs: [...(x.docs ?? []), doc] }));
    return copy(doc);
  },
  async update(id: ID, patch: Partial<Omit<Doc, 'id' | 'pid'>>): Promise<void> {
    db('docs').update(x => ({ ...x, docs: (x.docs ?? []).map(d => (d.id === id ? { ...d, ...copy(patch) } : d)) }));
  },
  async remove(id: ID): Promise<void> {
    db('docs').update(x => ({ ...x, docs: (x.docs ?? []).filter(d => d.id !== id) }));
  },
};
