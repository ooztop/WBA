// Bellek içi mock veritabanı: demo verisi, cihazda (AsyncStorage) saklama ve eski v1 kaydından taşıma.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Brk, Choice, Debt, ID, Lesson, LessonRules, Notif, NotifPrefs, Off, PaidRow, Person, Pkg, Profile, Doc, Req, SupportMsg, WeekHours } from '../models';
import { iso, legacyKeyToIso } from '../dates';
import { baseLessons } from './lessonGen';
import { BREAKS0, OFFS0, COLLECTED0, DOCS0, DEBTS0, ME0, NOTIF0, NOTIFS0, PAID0, PACKAGES0, PEOPLE0, REQS0, RULES0, WEEK0 } from './seed';

type LessonMeta = { pk?: string; rep?: number; loc?: string; st?: Lesson['st'] };

export type MockData = {
  people: Person[]; packages: Pkg[]; extra: Lesson[]; cancelled: ID[]; breaks: Brk[]; offs: Off[];
  debts: Debt[]; paid: PaidRow[]; collected: number; me: Profile; week: WeekHours; rules: LessonRules;
  notif: NotifPrefs; reqs: Req[]; notifs: Notif[]; support: SupportMsg[]; docs: Doc[]; lessonMeta: Record<ID, LessonMeta>;
  // v1'den taşınan, week/rules/notif/lessonMeta'ya girmeyen ekran tercihleri (Görev 5'te store'a geri verilir)
  uiPrefs: Record<string, unknown>;
};

const KEY_V1 = 'pro-ortak-tasarim-v1';
const KEY_V2 = 'pro-ortak-tasarim-v2';
const SAVE_MS = 400;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const seed = (): MockData => clone({
  people: PEOPLE0, packages: PACKAGES0, extra: [], cancelled: [], breaks: BREAKS0, offs: OFFS0,
  debts: DEBTS0, paid: PAID0, collected: COLLECTED0, me: ME0, week: WEEK0, rules: RULES0,
  notif: NOTIF0, reqs: REQS0, notifs: NOTIFS0, support: [], docs: DOCS0, lessonMeta: {}, uiPrefs: {},
});

/* ---------- v1 kaydını taşıma ---------- */
type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
const num = (v: unknown, d: number) => (typeof v === 'number' ? v : d);

// v2 kaydı: eksik alanlar demo verisinden gelir. Eski biçimde talepler { b: boolean } idi:
// Burak'ın talebi kapatıldıysa (b: false) listeden düşer, bildirimler yoksa demo bildirimleri gelir.
function fromV2(saved: Rec): MockData {
  const out = { ...seed(), ...(saved as Partial<MockData>) };
  if (!Array.isArray(saved.reqs)) out.reqs = seed().reqs.filter(r => !(isRec(saved.reqs) && saved.reqs.b === false && r.id === 'r1'));
  if (!Array.isArray(saved.notifs)) out.notifs = seed().notifs;
  return out;
}

// Eski dkey ('2026-8-9') anahtarlı kaydı 'YYYY-MM-DD'ye çevirir; dersin saatini `${iso}|${h}|*` önekiyle eşler
function legacyLessonKey(k: string): string {
  const cut = k.lastIndexOf('|');
  return cut < 0 ? k : `${legacyKeyToIso(k.slice(0, cut))}|${k.slice(cut + 1)}|*`;
}
const choice = (v: unknown, d: Choice): Choice => (isRec(v) && typeof v.s === 'number' ? { s: v.s, c: typeof v.c === 'string' ? v.c : null } : d);

function migrateV1(old: Rec): MockData {
  const out = seed();
  if (Array.isArray(old.people)) out.people = old.people.filter(isRec).map(p => ({ ...p, id: String(p.id) }) as unknown as Person);
  if (Array.isArray(old.packages)) out.packages = old.packages.filter(isRec).map(p => ({ ...p, id: String(p.id) }) as unknown as Pkg);
  if (Array.isArray(old.breaks)) out.breaks = old.breaks.filter(isRec).map(b => ({ ...b, id: String(b.id) }) as unknown as Brk);
  if (Array.isArray(old.offs)) {
    out.offs = old.offs.filter(isRec).map((o, i) => ({
      id: `o${i + 1}`, date: legacyKeyToIso(str(o.k, '1970-0-1')), name: str(o.name, ''), start: num(o.start, 0), end: num(o.end, 0), ...(o.all ? { all: true } : {}),
    }));
  }
  if (Array.isArray(old.debts)) {
    out.debts = old.debts.filter(isRec).map(d => ({
      pid: String(d.pid), note: str(d.note, ''), tag: str(d.tag, ''), ...(d.late ? { late: true } : {}),
      lessons: arr(d.lessons).map(l => (Array.isArray(l) ? { when: str(l[0], ''), what: str(l[1], '') } : { when: '', what: '' })),
    }));
  }
  if (Array.isArray(old.paid)) {
    out.paid = old.paid.filter(isRec).map((p, i) => ({ id: `p${i + 1}`, ini: str(p.ini, ''), name: str(p.name, ''), sub: str(p.sub, ''), amt: num(p.amt, 0) }));
  }
  if (typeof old.collected === 'number') out.collected = old.collected;
  if (isRec(old.me)) out.me = { ad: str(old.me.ad, ''), soyad: str(old.me.soyad, ''), title: str(old.me.title, '') };
  if (isRec(old.reqs) && old.reqs.b === false) out.reqs = out.reqs.filter(r => r.id !== 'r1');

  // [saat, süre, kişi, tür, durum] + gün anahtarı → Lesson
  out.extra = arr(old.extra).filter(isRec).flatMap((e, n) => {
    const l = arr(e.l);
    if (typeof e.k !== 'string' || l.length < 5) return [];
    const date = legacyKeyToIso(e.k), h = num(l[0], 9);
    return [{ id: `${date}|${h}|m${n}`, date, h, dur: num(l[1], 60), pid: String(l[2]), type: str(l[3], 'Bireysel'), st: l[4] } as Lesson];
  });
  out.cancelled = arr(old.cancelled).filter((c): c is string => typeof c === 'string').map(legacyLessonKey);

  // prefs: wh.* / day.* → week, rule.* → rules, nt.* → notif, les.* → lessonMeta, kalanı uiPrefs
  const prefs = isRec(old.prefs) ? old.prefs : {};
  const rest: Record<string, unknown> = {};
  const notif: NotifPrefs = {}, meta: Record<ID, LessonMeta> = {};
  const rkeys: (keyof LessonRules)[] = ['window', 'freeCancel', 'startMin', 'gap'];
  Object.keys(prefs).forEach(k => {
    if (k.startsWith('wh.') || k.startsWith('day.')) return;
    const m = k.match(/^rule\.(\d)$/);
    if (m && rkeys[+m[1]]) { out.rules[rkeys[+m[1]]] = choice(prefs[k], out.rules[rkeys[+m[1]]]); return; }
    if (k.startsWith('nt.')) { notif[k.slice(3)] = prefs[k] as NotifPrefs[string]; return; }
    // Ders notu v1'de 'note.dkey|saat' anahtarlıydı; ders kimliğinin joker biçimine (`iso|saat|*`) çevrilir
    if (k.startsWith('note.')) { rest[`note.${legacyLessonKey(k.slice(5))}`] = prefs[k]; return; }
    if (k.startsWith('les.')) { if (isRec(prefs[k])) meta[legacyLessonKey(k.slice(4))] = prefs[k] as LessonMeta; return; }
    rest[k] = prefs[k];
  });
  out.week = [0, 1, 2, 3, 4, 5, 6].map(i => ({
    on: typeof prefs[`day.${i}.on`] === 'boolean' ? (prefs[`day.${i}.on`] as boolean) : i !== 6,
    s: str(prefs[`day.${i}.s`], str(prefs['wh.s'], '10:00')),
    e: str(prefs[`day.${i}.e`], i === 5 ? '14:00' : str(prefs['wh.e'], '18:00')),
  }));
  out.notif = notif;
  out.lessonMeta = meta;
  // Tema ve vurgu rengi v1'de üst düzey alandı; ekran tercihi olarak korunur
  if (old.dark !== undefined) rest.dark = old.dark;
  if (old.accent !== undefined) rest.accent = old.accent;
  out.uiPrefs = rest;
  return out;
}

/* ---------- veritabanı ---------- */
let cur: MockData = seed();
let empty = false;
let saveT: ReturnType<typeof setTimeout> | null = null;
const baseCache = new Map<string, Lesson[]>();

// Boş sayfa kipinde yalnız kayıt listeleri boşalır; ayarlar dolu kalır.
// Kip açıkken eklenen kişiler görünür kalır (eski Kişi seç paneli yeni eklenenleri gösterirdi).
let emptyBase = new Set<ID>();
const blank = (d: MockData): MockData => ({ ...d, people: d.people.filter(p => !emptyBase.has(p.id)), packages: [], extra: [], breaks: [], offs: [], debts: [], paid: [], collected: 0, reqs: [], notifs: [], docs: [] });

function scheduleSave() {
  if (saveT) clearTimeout(saveT);
  saveT = setTimeout(() => {
    saveT = null;
    if (empty) return; // boş kipteki geçici durum cihaza yazılmaz
    AsyncStorage.setItem(KEY_V2, JSON.stringify(cur)).catch(() => {});
  }, SAVE_MS);
}

const cancelledHit = (id: ID, cancelled: ID[]) => cancelled.some(c => (c.endsWith('|*') ? id.startsWith(c.slice(0, -1)) : c === id));

export const mockDb = {
  data(): MockData { return empty ? blank(cur) : cur; },
  update(fn: (d: MockData) => MockData): void {
    cur = fn(cur);
    scheduleSave();
  },
  async load(): Promise<void> {
    try {
      const v2 = await AsyncStorage.getItem(KEY_V2);
      if (v2) { cur = fromV2(JSON.parse(v2) as Rec); return; }
      const v1 = await AsyncStorage.getItem(KEY_V1);
      if (v1) {
        const old: unknown = JSON.parse(v1);
        if (isRec(old)) { cur = migrateV1(old); scheduleSave(); return; }
      }
    } catch {}
    cur = seed();
  },
  reset(): void {
    cur = seed();
    empty = false;
    scheduleSave();
  },
  setEmpty(on: boolean): void {
    if (on && !empty) emptyBase = new Set(cur.people.map(p => p.id));
    const leaving = empty && !on;
    empty = on;
    if (leaving) scheduleSave(); // kipteyken atlanan yazma şimdi yapılır
  },
  lessonsFor(d: Date): Lesson[] {
    if (empty) return [];
    const day = iso(d);
    let base = baseCache.get(day);
    if (!base) baseCache.set(day, (base = baseLessons(d)));
    const all = base.concat(cur.extra.filter(e => e.date === day)).sort((a, b) => a.h - b.h);
    return all
      .filter(l => !cancelledHit(l.id, cur.cancelled))
      .map(l => {
        const m = cur.lessonMeta[l.id] ?? cur.lessonMeta[`${day}|${l.h}|*`];
        return m ? { ...l, ...m } : { ...l };
      });
  },
};

// Yeni kayıtlar için benzersiz kimlik
let seq = 0;
export const newId = (prefix: string): ID => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;
