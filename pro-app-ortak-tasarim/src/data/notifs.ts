// Bildirim akışı: tarih grupları, görülenleri gizleme, benzerleri gruplama ve filtre.
// Kurallar:
// - İşlem bekleyen bildirimler (ödeme bekleniyor, paket bitmek üzere) okunmuş olsa da listede kalır.
// - Okunmuş diğer bildirimler en alttaki "Görülenler"e iner.
// - Aynı tarih grubunda aynı türden 2+ bildirim tek satırda toplanır.
import type { Notif, NotifKind } from './models';
import { fromIso } from './dates';
import { TODAY } from './mock/lessonGen';

export type NotifFilter = 'all' | 'req' | 'pay' | 'cancel';
export type SectionLabel = 'Bugün' | 'Dün' | 'Bu hafta' | 'Daha önce';
export type FeedItem = { key: string; kind: NotifKind; list: Notif[] }; // list.length > 1 ise grup
export type Feed = { sections: { label: SectionLabel; items: FeedItem[] }[]; seen: FeedItem[] };

const DN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const ACTION: NotifKind[] = ['payDue', 'pkgLow'];
export const isAction = (k: NotifKind) => ACTION.includes(k);

const FILTER: Record<NotifFilter, NotifKind[]> = {
  all: ['payDue', 'pkgLow', 'paid', 'cancel', 'rsOk', 'added'],
  req: [],
  pay: ['payDue', 'paid'],
  cancel: ['cancel'],
};
export const inFilter = (k: NotifKind, f: NotifFilter) => FILTER[f].includes(k);

// Kaç gün önce (demo "bugün"üne göre)
const daysAgo = (at: string) => Math.round((+TODAY - +fromIso(at.slice(0, 10))) / 864e5);

export function sectionOf(at: string): SectionLabel {
  const d = daysAgo(at);
  return d <= 0 ? 'Bugün' : d === 1 ? 'Dün' : d <= 6 ? 'Bu hafta' : 'Daha önce';
}

// Satırın sağındaki zaman: bugün saat, dün "Dün", bu hafta gün adı, daha önce "3 Eyl"
export function notifTime(at: string): string {
  const d = daysAgo(at), x = fromIso(at.slice(0, 10));
  if (d <= 0) return at.slice(11, 16);
  if (d === 1) return 'Dün';
  if (d <= 6) return DN[(x.getDay() + 6) % 7];
  return `${x.getDate()} ${MS[x.getMonth()]}`;
}

export const unreadCount = (ns: Notif[]) => ns.filter(n => !n.read).length;

// Yeniden eskiye sıralı listeyi, aynı türleri ilk görüldükleri yerde toplayarak gruplar
function group(ns: Notif[]): FeedItem[] {
  const out: FeedItem[] = [];
  const at = new Map<NotifKind, FeedItem>();
  for (const n of ns) {
    const g = at.get(n.kind);
    if (g) g.list.push(n);
    else { const it = { key: n.id, kind: n.kind, list: [n] }; at.set(n.kind, it); out.push(it); }
  }
  return out;
}

const ORDER: SectionLabel[] = ['Bugün', 'Dün', 'Bu hafta', 'Daha önce'];

export function buildFeed(ns: Notif[], f: NotifFilter): Feed {
  const xs = ns.filter(n => inFilter(n.kind, f)).sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const shown = xs.filter(n => !n.read || isAction(n.kind));
  const seen = xs.filter(n => n.read && !isAction(n.kind));
  const sections = ORDER.map(label => ({ label, items: group(shown.filter(n => sectionOf(n.at) === label)) })).filter(s => s.items.length);
  return { sections, seen: group(seen) };
}

