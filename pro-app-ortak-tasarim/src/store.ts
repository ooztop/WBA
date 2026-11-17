// Ekran durumu (sekme, sayfa yığını, paneller, bildirim) ve servislerden gelen verinin önbelleği.
import { createContext, useContext, useSyncExternalStore } from 'react';
import { makeMutable, type SharedValue } from 'react-native-reanimated';
import { colors, type Accent, type Colors } from './theme';
import { TODAY, initials } from './data';
import type { Brk, Debt, ID, Lesson, Off, PaidRow, Person, Pkg, Profile, ReqState } from './data/models';

export type Route = { key: number; id: string; p: any; prog: SharedValue<number>; closing?: boolean };
export type SheetR = { key: number; id: string; p: any; closing?: boolean; swap?: boolean };
export type ActRow = { label: string; icon?: string; danger?: boolean; check?: boolean; big?: boolean; onPress?: () => void };
export type ActionS = { key: number; kind: 'dlg' | 'ass'; title: string; msg?: string; rows: ActRow[] };
export type PickerS = { key: number; kind: 'date'; value: Date; onPick: (d: Date) => void } | { key: number; kind: 'time'; value: number; min: number; onPick: (h: number) => void };
// Takvimde boş saate dokununca açılan Ekle menüsü: hangi gün/saat için
export type SlotMenu = { d: number; h: number; title: string; onDay?: () => void };
export type ToastS = { key: number; msg: string; undo?: string; onUndo?: () => void };

export type State = {
  dark: boolean; accent: Accent; emp: boolean; tab: number; F: Date;
  stack: Route[]; sheets: SheetR[]; action: ActionS | null; toast: ToastS | null; picker: PickerS | null;
  people: Person[]; packages: Pkg[]; extra: Lesson[]; cancelled: ID[]; menu: boolean | SlotMenu;
  breaks: Brk[]; offs: Off[]; debts: Debt[]; paid: PaidRow[]; collected: number; me: Profile;
  prefs: Record<string, any>; reqs: ReqState;
  // Gün başına ders önbelleği (anahtar 'YYYY-MM-DD'), yüklenen günler ve yeniden yükleme sayacı
  lessons: Record<string, Lesson[]>; loaded: Set<string>; epoch: number;
};

let state: State = {
  dark: false, accent: 'blue', emp: false, tab: 0, F: new Date(TODAY),
  stack: [], sheets: [], action: null, toast: null, picker: null,
  people: [], packages: [], extra: [], cancelled: [], menu: false,
  breaks: [], offs: [], debts: [], paid: [], collected: 0,
  me: { ad: '', soyad: '', title: '' },
  prefs: {}, reqs: { b: false, a: false },
  lessons: {}, loaded: new Set(), epoch: 0,
};
const subs = new Set<() => void>();
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const get = () => state;
export function set(p: Partial<State> | ((s: State) => Partial<State>)) {
  state = { ...state, ...(typeof p === 'function' ? p(state) : p) };
  subs.forEach(f => f());
}
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(sub, () => sel(state), () => sel(state));
}
export const useC = (): Colors => colors(useStore(s => s.dark), useStore(s => s.accent));

// Ekran ölçüleri (web'de telefon çerçevesi, cihazda gerçek güvenli alanlar)
export type FrameT = { W: number; H: number; top: number; bottom: number; tbh: number; framed: boolean };
export const FrameCtx = createContext<FrameT>({ W: 360, H: 764, top: 44, bottom: 0, tbh: 86, framed: false });
export const useFrame = () => useContext(FrameCtx);

let K = 1;
const liveTop = () => { const s = state.stack; for (let i = s.length - 1; i >= 0; i--) if (!s[i].closing) return s[i]; return null; };

/* ---------- gezinme ---------- */
export function push(id: string, p: any = {}) {
  set(s => ({ stack: [...s.stack, { key: K++, id, p, prog: makeMutable(0) }] }));
}
export function removeRoute(key: number) {
  set(s => ({ stack: s.stack.filter(r => r.key !== key) }));
}
export function pop() {
  const t = liveTop();
  if (t) set(s => ({ stack: s.stack.map(r => (r.key === t.key ? { ...r, closing: true } : r)) }));
}
export function go(id: string, mode?: string, p: any = {}) {
  const old = liveTop();
  push(id, p);
  if (mode === 'rep' && old) setTimeout(() => removeRoute(old.key), 420);
}
export function popAll() {
  const t = liveTop();
  if (!t) return;
  set(s => ({ stack: s.stack.filter(r => r.key === t.key).map(r => ({ ...r, closing: true })) }));
}
export function setTab(i: number) {
  set({ stack: [], tab: i });
  closeAllSheets();
}
export function home() {
  if (state.tab !== 0) setTab(0); else popAll();
}

/* ---------- paneller (üst üste açılabilir) ---------- */
export function openSheet(id: string, p: any = {}) {
  set(s => ({ sheets: [...s.sheets, { key: K++, id, p }] }));
}
export function closeSheet() {
  const live = state.sheets.filter(x => !x.closing);
  const t = live[live.length - 1];
  if (t) set(s => ({ sheets: s.sheets.map(x => (x.key === t.key ? { ...x, closing: true } : x)) }));
}
export function closeAllSheets() {
  if (state.sheets.some(x => !x.closing)) set(s => ({ sheets: s.sheets.map(x => ({ ...x, closing: true })) }));
}
// Üstteki paneli kapatıp yerine başkasını aç (Tekil ↔ Çoklu gibi)
export function repSheet(id: string, p: any = {}) {
  const live = state.sheets.filter(x => !x.closing);
  const t = live[live.length - 1];
  set(s => ({ sheets: [...s.sheets.filter(x => x.key !== t?.key), { key: K++, id, p, swap: true }] }));
}
export function removeSheet(key: number) {
  set(s => ({ sheets: s.sheets.filter(x => x.key !== key) }));
}

/* ---------- onay penceresi / alttan menü / seçim ---------- */
export function closeAction() { if (state.action) set({ action: null }); }
export function openAction(title: string, msg: string, okText: string, danger: boolean, fn: () => void) {
  set({ action: { key: K++, kind: 'dlg', title, msg, rows: [{ label: okText, danger, onPress: fn }] } });
}
export function openMenu(title: string, rows: ActRow[]) {
  set({ action: { key: K++, kind: 'ass', title, rows } });
}
export function pick(title: string, options: string[], cur: string, onPick: (v: string) => void) {
  set({ action: { key: K++, kind: 'ass', title, rows: options.map(o => ({ label: o, check: o === cur, onPress: () => onPick(o) })) } });
}

export function toast(msg: string, undo?: string, onUndo?: () => void) {
  set({ toast: { key: K++, msg, undo, onUndo } });
}
export const toastLater = (msg: string, ms = 300, undo?: string, onUndo?: () => void) => setTimeout(() => toast(msg, undo, onUndo), ms);

/* ---------- veri ---------- */
export const person = (id: ID): Person => state.people.find(p => p.id === id) || state.people[(parseInt(id, 10) || 0) % 20] || state.people[0];
export const personByName = (n: string) => state.people.find(p => p.name === n);
export function addPerson(name: string, sub = ''): Person {
  const ex = personByName(name);
  if (ex) return ex;
  const p: Person = { id: String(200 + K++), ini: initials(name), name, sub, tag: ['n', 'Tek ders'], cat: '' };
  set(s => ({ people: [...s.people, p] }));
  return p;
}
export const patchPerson = (id: ID, patch: Partial<Person>) =>
  set(s => ({ people: s.people.map(p => (p.id === id ? { ...p, ...patch } : p)) }));

/* ---------- yardımcılar ---------- */
export const nextId = () => K++;
export const tl = (n: number) => '₺' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const num = (t: string) => parseInt(t.replace(/[^0-9]/g, ''), 10) || 0;
export const hhmm = (t: string, def: number) => { const m = t.match(/(\d{1,2})[:.](\d{2})/); return m ? +m[1] + +m[2] / 60 : def; };
const DNS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const daysText = (d: number[]) => {
  const x = d.slice().sort((a, b) => a - b);
  if (!x.length) return 'Gün seçilmedi';
  const run = x.every((v, i) => i === 0 || v === x[i - 1] + 1);
  return run && x.length > 2 ? `${DNS[x[0]]} – ${DNS[x[x.length - 1]]}` : x.map(i => DNS[i]).join(', ');
};
// Ödeme al: seçilen dersleri borçtan düş, tahsilata ekle
export function collect(pid: ID, name: string, ini: string, idx: number[], method: string, amount: number) {
  set(s => {
    const d = s.debts.find(x => x.pid === pid);
    const left = d ? d.lessons.filter((_, i) => !idx.includes(i)) : [];
    const debts = d ? (left.length ? s.debts.map(x => (x.pid === pid ? { ...x, lessons: left } : x)) : s.debts.filter(x => x.pid !== pid)) : s.debts;
    const people = !left.length ? s.people.map(p => (p.id === pid && p.tag[0] === 'd' ? { ...p, tag: ['n', 'Tek ders'] as [any, string], cat: p.cat.replace('borc', '').trim() } : p)) : s.people;
    return { debts, people, collected: s.collected + amount, paid: [{ id: `p${K++}`, ini, name, sub: `10 Eyl · ${method} · ${idx.length} ders`, amt: amount }, ...s.paid] };
  });
}

/* ---------- ayarlar: ekrandan çıkınca da kalır ---------- */
export const setPref = (k: string, v: any) => set(s => ({ prefs: { ...s.prefs, [k]: v } }));
export function usePref<T>(k: string, d: T): [T, (v: T) => void] {
  const v = useStore(s => s.prefs[k]);
  return [v === undefined ? d : v, x => setPref(k, x)];
}

/* ---------- tarih ve saat seçici ---------- */
export const pickDate = (value: Date, onPick: (d: Date) => void) => set({ picker: { key: K++, kind: 'date', value, onPick } });
export const pickTime = (value: number, onPick: (h: number) => void) => set({ picker: { key: K++, kind: 'time', value, min: lessonMin(), onPick } });
export const closePicker = () => { if (state.picker) set({ picker: null }); };
// Ders başlama dakikası (Ders kuralları): dersler her saatin bu dakikasında başlar.
// Tam saat → 0, 15 geçe → 15 (16:15, 17:15 …), 30 geçe → 30 (16:30, 17:30 …) ya da özel değer
export function lessonMin(): number {
  const r = state.prefs['rule.2'];
  if (!r) return 0;
  if (r.c) return Math.min(55, Math.max(0, parseInt(r.c, 10) || 0));
  return [0, 15, 30][r.s] ?? 0;
}
// Verilen saati kurala uydur: o saatin başlama dakikası (ör. 14,7 → 14:30)
export const snapLesson = (h: number) => Math.floor(h) + lessonMin() / 60;
