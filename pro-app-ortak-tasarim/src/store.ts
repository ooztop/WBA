// Uygulamanın tamamı bellekte çalışır: API ya da veritabanı yok.
import { createContext, useContext, useSyncExternalStore } from 'react';
import { makeMutable, type SharedValue } from 'react-native-reanimated';
import { colors, type Accent, type Colors } from './theme';
import { PEOPLE0, PACKAGES0, TODAY, type Person, type Pkg, type Extra } from './data';

export type Route = { key: number; id: string; p: any; prog: SharedValue<number>; closing?: boolean };
export type SheetR = { key: number; id: string; p: any; closing?: boolean; swap?: boolean };
export type ActRow = { label: string; icon?: string; danger?: boolean; check?: boolean; big?: boolean; onPress?: () => void };
export type ActionS = { key: number; kind: 'dlg' | 'ass'; title: string; msg?: string; rows: ActRow[] };
export type ToastS = { key: number; msg: string; undo?: string; onUndo?: () => void };

type State = {
  dark: boolean; accent: Accent; emp: boolean; tab: number; F: Date;
  stack: Route[]; sheets: SheetR[]; action: ActionS | null; toast: ToastS | null;
  people: Person[]; packages: Pkg[]; extra: Extra[]; cancelled: string[]; menu: boolean;
};

let state: State = {
  dark: false, accent: 'blue', emp: false, tab: 0, F: new Date(TODAY),
  stack: [], sheets: [], action: null, toast: null,
  people: PEOPLE0, packages: PACKAGES0, extra: [], cancelled: [], menu: false,
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
export const person = (id: number): Person => state.people.find(p => p.id === id) || state.people[id % 20] || state.people[0];
export const personByName = (n: string) => state.people.find(p => p.name === n);
export function addPerson(name: string, sub = ''): Person {
  const ex = personByName(name);
  if (ex) return ex;
  const ini = name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr');
  const p: Person = { id: 200 + K++, ini, name, sub, tag: ['n', 'Tek ders'], cat: '' };
  set(s => ({ people: [...s.people, p] }));
  return p;
}
export const patchPerson = (id: number, patch: Partial<Person>) =>
  set(s => ({ people: s.people.map(p => (p.id === id ? { ...p, ...patch } : p)) }));
