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
    // Tek temel paket olur: temel işaretli paket kaydedilince diğerlerinin işareti kalkar
    const unbase = (x: Pkg): Pkg => { const { base: _b, ...rest } = x; return rest; };
    m.update(d => {
      const list = full.base ? d.packages.map(x => (x.id === id ? x : unbase(x))) : d.packages;
      return { ...d, packages: exists ? list.map(x => (x.id === id ? full : x)) : [...list, full] };
    });
    return copy(full);
  },
  async remove(id: ID): Promise<void> {
    db('packages').update(d => ({ ...d, packages: d.packages.filter(p => p.id !== id) }));
  },
  // "Geri al" için silinen paketi özgün sırasına (index) geri koyar; index yoksa sona ekler.
  // Bu arada başka paket temel yapıldıysa geri gelen paketin temel işareti düşer.
  async restore(p: Pkg, index?: number): Promise<void> {
    db('packages').update(d => {
      if (d.packages.some(x => x.id === p.id)) return d;
      const { base: _b, ...plain } = copy(p);
      const back: Pkg = p.base && !d.packages.some(x => x.base) ? { ...plain, base: true } : plain;
      const list = d.packages.slice();
      list.splice(index === undefined ? list.length : Math.max(0, Math.min(index, list.length)), 0, back);
      return { ...d, packages: list };
    });
  },
  async setBase(id: ID): Promise<void> {
    db('packages').update(d => ({ ...d, packages: d.packages.map(p => { const { base: _b, ...rest } = p; return p.id === id ? { ...rest, base: true } : rest; }) }));
  },
};
