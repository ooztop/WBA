// Ders eylemleri: görünür gün aralığını servisten önbelleğe yükler (yalnız eksik günler); ders ekleme, iptal ve erteleme.
import { get, set, type State } from '../../store';
import { fromIso, iso } from '../dates';
import type { ID, Lesson } from '../models';
import { lessonsService } from '../services';
import { afterCall, optimistic } from './optimistic';

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

/* ---------- yazmalar ---------- */
const dayOf = (id: ID) => id.slice(0, 10);

// Dersi (kimliğinin gün önekine göre) önbellekten çıkarır
const without = (s: State, id: ID): Partial<State> => {
  const k = dayOf(id), list = s.lessons[k];
  return list ? { lessons: { ...s.lessons, [k]: list.filter(l => l.id !== id) } } : {};
};

// Dersleri yalnız yüklü günlerin önbelleğine ekler (yüklü olmayan gün zaten servisten tam gelir)
const withLessons = (s: State, ls: Lesson[]): Partial<State> => {
  const next = { ...s.lessons };
  ls.forEach(l => { if (s.loaded.has(l.date)) next[l.date] = [...(next[l.date] ?? []).filter(x => x.id !== l.id), l].sort((a, b) => a.h - b.h); });
  return { lessons: next };
};

// Bir günün derslerini servisten yeniden okuyup önbelleğe yazar (yüklüyse); talep onayı gibi servis tarafında ders ekleyen işlemlerden sonra kullanılır
export async function refreshDay(date: string): Promise<void> {
  const { epoch } = get();
  const res = await lessonsService.range(date, date);
  if (get().epoch !== epoch) return;
  set(s => (s.loaded.has(date) ? { lessons: { ...s.lessons, [date]: res[date] ?? [] } } : {}));
}

// Yeni ders(ler): servis kimlikleri verir, sonra önbelleğe girer ve takvim odağı o güne gider. Hata olursa null.
export async function addLessons(ls: Omit<Lesson, 'id'>[], focus: Date): Promise<Lesson[] | null> {
  return afterCall(() => lessonsService.create(ls), (made, s) => ({ ...withLessons(s, made), F: new Date(focus) }));
}

export function cancelLesson(id: ID): Promise<boolean> {
  return optimistic(s => without(s, id), () => lessonsService.cancel(id));
}

// Dersi yeni güne/saate taşır: eski saat hemen kalkar, yeni saat servis cevabıyla eklenir
export function rescheduleLesson(id: ID, to: { date: string; h: number }): Promise<boolean> {
  return optimistic(s => without(s, id), async () => {
    const moved = await lessonsService.reschedule(id, to);
    set(s => withLessons(s, [moved]));
  });
}
