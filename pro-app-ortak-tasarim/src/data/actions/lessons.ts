// Ders eylemleri: görünür gün aralığını servisten önbelleğe yükler (yalnız eksik günler).
import { get, set } from '../../store';
import { fromIso, iso } from '../dates';
import { lessonsService } from '../services';

// Süren istekler: aynı gün için ikinci istek açılmaz, mevcut isteğe beklenir
const inflight = new Map<string, Promise<void>>();

export function resetInflight() { inflight.clear(); }

// from..to (dahil, 'YYYY-MM-DD') arasında önbellekte olmayan günleri ister
export async function ensureLessons(from: string, to: string): Promise<void> {
  const { loaded, epoch } = get();
  const missing: string[] = [], waits: Promise<void>[] = [];
  for (let d = fromIso(from); iso(d) <= to; d.setDate(d.getDate() + 1)) {
    const k = iso(d);
    if (loaded.has(k)) continue;
    const p = inflight.get(k);
    if (p) waits.push(p); else missing.push(k);
  }
  if (missing.length) {
    const req = lessonsService.range(missing[0], missing[missing.length - 1])
      .then(res => {
        // Boş sayfa / sıfırlama araya girdiyse eski sonuç atılır
        if (get().epoch !== epoch) return;
        set(s => ({
          lessons: { ...s.lessons, ...Object.fromEntries(missing.map(k => [k, res[k] ?? []])) },
          loaded: new Set([...s.loaded, ...missing]),
        }));
      })
      .finally(() => { missing.forEach(k => { if (inflight.get(k) === req) inflight.delete(k); }); });
    missing.forEach(k => inflight.set(k, req));
    waits.push(req);
  }
  await Promise.all(waits);
}
