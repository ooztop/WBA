// Doküman eylemleri: ekleme (kimlik servisten gelir), not metnini kaydetme, silme.
import type { Doc, ID } from '../models';
import { docsService } from '../services';
import { afterCall, optimistic } from './optimistic';
import type { State } from '../../store';

export function addDoc(d: Omit<Doc, 'id'>): Promise<Doc | null> {
  return afterCall(() => docsService.create(d), (doc, s: State) => ({ docs: [...s.docs, doc] }));
}
export function saveDoc(id: ID, patch: Partial<Omit<Doc, 'id' | 'pid'>>): Promise<boolean> {
  return optimistic((s: State) => ({ docs: s.docs.map(d => (d.id === id ? { ...d, ...patch } : d)) }), () => docsService.update(id, patch));
}
export function removeDoc(id: ID): Promise<boolean> {
  return optimistic((s: State) => ({ docs: s.docs.filter(d => d.id !== id) }), () => docsService.remove(id), 'Silinemedi. Tekrar dene.');
}
