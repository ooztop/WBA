// Paketler servisi (mock dalı).
import type { ID, Pkg } from '../models';
import { newId } from '../mock/db';
import { copy, db } from './util';

export const packagesService = {
  async list(): Promise<Pkg[]> {
    return copy(db('packages').data().packages);
  },
  // id varsa günceller, yoksa yeni paket ekler
  async save(p: Omit<Pkg, 'id'> & { id?: ID }): Promise<Pkg> {
    const m = db('packages');
    const id = p.id ?? newId('k');
    const full: Pkg = { ...p, id };
    const exists = m.data().packages.some(x => x.id === id);
    m.update(d => ({ ...d, packages: exists ? d.packages.map(x => (x.id === id ? full : x)) : [...d.packages, full] }));
    return copy(full);
  },
  async remove(id: ID): Promise<void> {
    db('packages').update(d => ({ ...d, packages: d.packages.filter(p => p.id !== id) }));
  },
  // "Geri al" için silinen paketi geri koyar
  async restore(p: Pkg): Promise<void> {
    db('packages').update(d => (d.packages.some(x => x.id === p.id) ? d : { ...d, packages: [...d.packages, copy(p)] }));
  },
  async setBase(id: ID): Promise<void> {
    db('packages').update(d => ({ ...d, packages: d.packages.map(p => { const { base: _b, ...rest } = p; return p.id === id ? { ...rest, base: true } : rest; }) }));
  },
};
