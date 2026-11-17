// Ayar eylemleri: ekran tercihleri (prefs) önbelleği, ilgili servislere gecikmeli kayıt, tema ve ders notu anahtarı.
import type { Accent } from '../../theme';
import { get, set, toast, useStore } from '../../store';
import type { Choice, LessonRules, NotifPrefs, WeekHours } from '../models';
import { mockDb } from '../mock/db';
import { RULES0, WEEK0 } from '../mock/seed';
import { notifPrefsService, rulesService, scheduleService } from '../services';

type Prefs = Record<string, unknown>;
const SAVE_MS = 500;
const RKEYS: (keyof LessonRules)[] = ['window', 'freeCancel', 'startMin', 'gap'];

const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
const choice = (v: unknown, d: Choice): Choice => {
  const r = v as { s?: unknown; c?: unknown } | null | undefined;
  return r && typeof r === 'object' && typeof r.s === 'number' ? { s: r.s, c: typeof r.c === 'string' ? r.c : null } : d;
};
const sameChoice = (a: Choice, b: Choice) => a.s === b.s && a.c === b.c;

// Ekran tercihleri → servis modelleri. wh.s / wh.e tüm günlerin varsayılanıdır, day.N.* o güne özeldir.
export function prefsToModels(prefs: Prefs): { week: WeekHours; rules: LessonRules; notif: NotifPrefs } {
  const week: WeekHours = [0, 1, 2, 3, 4, 5, 6].map(i => ({
    on: typeof prefs[`day.${i}.on`] === 'boolean' ? (prefs[`day.${i}.on`] as boolean) : WEEK0[i].on,
    s: str(prefs[`day.${i}.s`], str(prefs['wh.s'], WEEK0[i].s)),
    e: str(prefs[`day.${i}.e`], i === 5 ? WEEK0[5].e : str(prefs['wh.e'], WEEK0[i].e)),
  }));
  const rules = { ...RULES0 };
  RKEYS.forEach((k, n) => { rules[k] = choice(prefs[`rule.${n}`], RULES0[k]); });
  const notif: NotifPrefs = {};
  Object.keys(prefs).forEach(k => { if (k.startsWith('nt.')) notif[k.slice(3)] = prefs[k] as NotifPrefs[string]; });
  return { week, rules, notif };
}

// Servis modelleri → ekran tercihleri. Yalnız varsayılandan farklı değerler üretilir (demo verisi için boş), böylece ekranlar bugünkü gibi çalışır.
export function modelsToPrefs(week: WeekHours, rules: LessonRules, notif: NotifPrefs): Prefs {
  const out: Prefs = {};
  const bs = week[0].s, be = week[0].e;
  if (bs !== WEEK0[0].s) out['wh.s'] = bs;
  if (be !== WEEK0[0].e) out['wh.e'] = be;
  week.forEach((d, i) => {
    if (d.on !== WEEK0[i].on) out[`day.${i}.on`] = d.on;
    if (d.s !== bs) out[`day.${i}.s`] = d.s;
    if (d.e !== (i === 5 ? WEEK0[5].e : be)) out[`day.${i}.e`] = d.e;
  });
  RKEYS.forEach((k, n) => { if (!sameChoice(rules[k], RULES0[k])) out[`rule.${n}`] = { s: rules[k].s, c: rules[k].c }; });
  Object.keys(notif).forEach(k => { out[`nt.${k}`] = notif[k]; });
  return out;
}

// Anahtar önekine göre hangi servise kaydedileceği (yoksa yalnız cihazda kalır)
type Group = 'week' | 'rules' | 'notif';
const groupOf = (k: string): Group | null => (k.startsWith('wh.') || k.startsWith('day.') ? 'week' : k.startsWith('rule.') ? 'rules' : k.startsWith('nt.') ? 'notif' : null);

// Bekleyen kayıtlar: grup başına zamanlayıcı ve hata olursa dönülecek ilk değerler
const pending = new Map<Group, { timer: ReturnType<typeof setTimeout>; before: Map<string, unknown> }>();

async function flush(g: Group, before: Map<string, unknown>) {
  const { week, rules, notif } = prefsToModels(get().prefs);
  try {
    if (g === 'week') await scheduleService.saveWeek(week);
    else if (g === 'rules') await rulesService.save(rules);
    else await notifPrefsService.save(notif);
  } catch {
    set(s => {
      const prefs = { ...s.prefs };
      before.forEach((v, k) => { if (v === undefined) delete prefs[k]; else prefs[k] = v; });
      return { prefs };
    });
    toast('Kaydedilemedi. Tekrar dene.');
  }
}

// Tercihi hemen önbelleğe yazar; wh./day./rule./nt. anahtarları 500 ms sonra ilgili servise, diğerleri cihaza kaydedilir
export function setPref(k: string, v: unknown): void {
  const prev = get().prefs[k];
  set(s => ({ prefs: { ...s.prefs, [k]: v } }));
  const g = groupOf(k);
  if (!g) { mockDb.update(d => ({ ...d, uiPrefs: { ...d.uiPrefs, [k]: v } })); return; }
  const old = pending.get(g);
  const before = old?.before ?? new Map<string, unknown>();
  if (!before.has(k)) before.set(k, prev);
  if (old) clearTimeout(old.timer);
  pending.set(g, { before, timer: setTimeout(() => { pending.delete(g); void flush(g, before); }, SAVE_MS) });
}

export function usePref<T>(k: string, d: T): [T, (v: T) => void] {
  const v = useStore(s => s.prefs[k]);
  return [v === undefined ? d : (v as T), x => setPref(k, x)];
}

// Tema seçimleri cihazda saklanır (açılışta boot geri yükler)
export function setDark(dark: boolean): void {
  set({ dark });
  mockDb.update(d => ({ ...d, uiPrefs: { ...d.uiPrefs, dark } }));
}
export function setAccent(accent: Accent): void {
  set({ accent });
  mockDb.update(d => ({ ...d, uiPrefs: { ...d.uiPrefs, accent } }));
}

// Ders notunun tercih anahtarı: tam kimlikli not varsa o, yoksa v1'den taşınan `iso|saat|*` notu, yoksa yeni not için tam kimlik
export function lessonNoteKey(prefs: Prefs, l: { id: string; date: string; h: number }): string {
  const own = `note.${l.id}`, wild = `note.${l.date}|${l.h}|*`;
  return prefs[own] === undefined && prefs[wild] !== undefined ? wild : own;
}
