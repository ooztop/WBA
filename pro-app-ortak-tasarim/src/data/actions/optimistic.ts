// İyimser güncelleme: önbelleği hemen değiştirir, servisi çağırır, hata olursa geri alır ve uyarı gösterir.
import { get, set, toast, type State } from '../../store';

// apply hemen set edilir; call reddedilirse yalnız apply'ın dokunduğu alanlar önceki değerine döner.
export async function optimistic(apply: (s: State) => Partial<State>, call: () => Promise<unknown>, fail?: string): Promise<boolean> {
  const before = get();
  const patch = apply(before);
  const prev: Partial<State> = {};
  (Object.keys(patch) as (keyof State)[]).forEach(k => { (prev as Record<string, unknown>)[k] = before[k]; });
  set(patch);
  try {
    await call();
    return true;
  } catch {
    set(prev);
    toast(fail ?? 'Kaydedilemedi. Tekrar dene.');
    return false;
  }
}
