// Paket eylemleri: kaydetme, silme, silmeyi geri alma ve temel paket seçimi.
import { get, toast } from '../../store';
import type { ID, Pkg } from '../models';
import { packagesService } from '../services';
import { afterCall, optimistic } from './optimistic';

const unbase = (p: Pkg): Pkg => { const { base: _b, ...rest } = p; return rest; };
// Temel işaretli paket eklenince/güncellenince diğerlerinin işareti kalkar (tek temel paket)
const clearOthers = (list: Pkg[], keep: Pkg): Pkg[] => (keep.base ? list.map(p => (p.id === keep.id ? p : unbase(p))) : list);
const upsert = (list: Pkg[], p: Pkg): Pkg[] => {
  const l = clearOthers(list, p);
  return l.some(x => x.id === p.id) ? l.map(x => (x.id === p.id ? p : x)) : [...l, p];
};

// id varsa var olan paketle birleştirip günceller (temel işareti korunur), yoksa yeni paket ekler
export async function savePackage(pk: Omit<Pkg, 'id'> & { id?: ID }): Promise<Pkg | null> {
  const cur = pk.id ? get().packages.find(x => x.id === pk.id) : undefined;
  if (cur) {
    const full: Pkg = { ...cur, ...pk, id: cur.id };
    return (await optimistic(s => ({ packages: upsert(s.packages, full) }), () => packagesService.save(full))) ? full : null;
  }
  return afterCall(() => packagesService.save(pk), (made, s) => ({ packages: upsert(s.packages, made) }));
}

// Paketi siler. quiet değilse "Geri al"lı bildirim gösterir; geri alma paketi özgün sırasına koyar.
export async function removePackage(pk: Pkg, quiet = false): Promise<boolean> {
  const index = get().packages.findIndex(p => p.id === pk.id);
  const ok = await optimistic(s => ({ packages: s.packages.filter(p => p.id !== pk.id) }), () => packagesService.remove(pk.id));
  if (ok && !quiet) toast(`${pk.name} silindi`, 'Geri al', () => restorePackage(pk, index));
  return ok;
}

// Silinen paketi geri koyar (index: eski sırası)
export function restorePackage(pk: Pkg, index?: number): Promise<boolean> {
  return optimistic(s => {
    if (s.packages.some(p => p.id === pk.id)) return {};
    const back = pk.base && s.packages.some(p => p.base) ? unbase(pk) : pk;
    const list = s.packages.slice();
    list.splice(index === undefined ? list.length : Math.max(0, Math.min(index, list.length)), 0, back);
    return { packages: list };
  }, () => packagesService.restore(pk, index));
}

export async function setBasePackage(id: ID): Promise<boolean> {
  const ok = await optimistic(s => ({ packages: s.packages.map(p => (p.id === id ? { ...p, base: true } : unbase(p))) }), () => packagesService.setBase(id));
  if (ok) toast('Temel paket güncellendi');
  return ok;
}
