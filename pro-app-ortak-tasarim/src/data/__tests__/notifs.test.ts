// Bildirim akışı testleri: tarih grupları, gizleme (görülenler), benzerleri gruplama, filtre, zaman yazısı.
import { buildFeed, isAction, notifTime, sectionOf, unreadCount } from '../notifs';
import type { Notif } from '../models';

const N = (id: string, kind: Notif['kind'], at: string, read = false, pid = '0'): Notif => ({ id, kind, pid, at, sub: '', read });

describe('sectionOf', () => {
  it('bugün, dün, son 7 gün, daha önce', () => {
    expect(sectionOf('2026-09-09T10:00')).toBe('Bugün');
    expect(sectionOf('2026-09-08T23:00')).toBe('Dün');
    expect(sectionOf('2026-09-03T08:00')).toBe('Bu hafta');
    expect(sectionOf('2026-09-02T08:00')).toBe('Daha önce');
  });
});

describe('notifTime', () => {
  it('bugün saat, dün "Dün", bu hafta gün adı, daha önce tarih', () => {
    expect(notifTime('2026-09-09T09:05')).toBe('09:05');
    expect(notifTime('2026-09-08T19:10')).toBe('Dün');
    expect(notifTime('2026-09-07T10:00')).toBe('Pzt');
    expect(notifTime('2026-09-01T10:00')).toBe('1 Eyl');
  });
});

describe('isAction', () => {
  it('ödeme bekleniyor ve paket bitmek üzere işlem bekler', () => {
    expect(isAction('payDue')).toBe(true);
    expect(isAction('pkgLow')).toBe(true);
    expect(isAction('paid')).toBe(false);
    expect(isAction('cancel')).toBe(false);
  });
});

describe('buildFeed', () => {
  it('okunmuş bilgi bildirimleri görülenlere iner, işlem bekleyenler okunmuş olsa da kalır', () => {
    const f = buildFeed([N('1', 'paid', '2026-09-09T10:00', true), N('2', 'payDue', '2026-09-07T10:00', true), N('3', 'cancel', '2026-09-09T11:00')], 'all');
    const shown = f.sections.flatMap(s => s.items.flatMap(i => i.list.map(n => n.id)));
    expect(shown.sort()).toEqual(['2', '3']);
    expect(f.seen.flatMap(i => i.list.map(n => n.id))).toEqual(['1']);
  });
  it('bölümler yeniden eskiye, içleri yeniden eskiye', () => {
    const f = buildFeed([N('a', 'cancel', '2026-09-01T10:00'), N('b', 'cancel', '2026-09-09T08:00'), N('c', 'paid', '2026-09-09T11:00')], 'all');
    expect(f.sections.map(s => s.label)).toEqual(['Bugün', 'Daha önce']);
    expect(f.sections[0].items.map(i => i.list[0].id)).toEqual(['c', 'b']);
  });
  it('aynı bölümde aynı türden iki ve fazlası tek grupta toplanır', () => {
    const f = buildFeed([N('1', 'paid', '2026-09-09T09:00'), N('2', 'paid', '2026-09-09T10:00'), N('3', 'paid', '2026-09-09T11:00'), N('4', 'cancel', '2026-09-09T10:30')], 'all');
    const items = f.sections[0].items;
    expect(items).toHaveLength(2);
    expect(items[0].list.map(n => n.id)).toEqual(['3', '2', '1']); // grup en yeni üyesinin yerinde
    expect(items[0].kind).toBe('paid');
    expect(items[1].list.map(n => n.id)).toEqual(['4']);
  });
  it('filtre: ödemeler yalnız ödeme türlerini, iptaller yalnız iptalleri gösterir', () => {
    const all = [N('1', 'paid', '2026-09-09T09:00'), N('2', 'payDue', '2026-09-09T10:00'), N('3', 'cancel', '2026-09-09T11:00'), N('4', 'added', '2026-09-09T12:00')];
    const ids = (k: Parameters<typeof buildFeed>[1]) => buildFeed(all, k).sections.flatMap(s => s.items.flatMap(i => i.list.map(n => n.id))).sort();
    expect(ids('pay')).toEqual(['1', '2']);
    expect(ids('cancel')).toEqual(['3']);
    expect(ids('req')).toEqual([]);
    expect(ids('all')).toEqual(['1', '2', '3', '4']);
  });
});

test('unreadCount okunmamışları sayar', () => {
  expect(unreadCount([N('1', 'paid', '2026-09-09T09:00'), N('2', 'paid', '2026-09-09T09:00', true)])).toBe(1);
});
