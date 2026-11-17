import { stripDays, type SlotDay } from '../reschedule';

const D = (n: number) => new Date(2026, 8, n);
const base: SlotDay[] = [10, 11, 12, 14, 15, 16].map(n => ({ d: D(n), times: ['10:00', '14:00'] }));

describe('stripDays', () => {
  it('takvim seçimi yoksa şerit aynen kalır', () => {
    const r = stripDays(base, null);
    expect(r.days).toBe(base);
    expect(r.sel).toBeNull();
  });
  it('seçilen gün şeritteyse o güne saat eklenir ve seçili olur', () => {
    const r = stripDays(base, { d: D(11), h: 19 });
    expect(r.days.map(x => x.d.getDate())).toEqual([10, 11, 12, 14, 15, 16]);
    expect(r.days[1].times).toEqual(['10:00', '14:00', '19:00']);
    expect(r.sel).toEqual({ di: 1, si: 2 });
  });
  it('seçilen saat zaten varsa tekrar eklenmez', () => {
    const r = stripDays(base, { d: D(11), h: 14 });
    expect(r.days[1].times).toEqual(['10:00', '14:00']);
    expect(r.sel).toEqual({ di: 1, si: 1 });
  });
  it('şeritten sonraki bir gün seçilirse en sona eklenir, ilk gün düşer', () => {
    const r = stripDays(base, { d: D(24), h: 18 });
    expect(r.days.map(x => x.d.getDate())).toEqual([11, 12, 14, 15, 16, 24]);
    expect(r.days[5].times).toEqual(['18:00']);
    expect(r.sel).toEqual({ di: 5, si: 0 });
  });
  it('şerit arasındaki boş bir gün seçilirse sıraya girer, son gün düşer', () => {
    const r = stripDays(base, { d: D(13), h: 9 });
    expect(r.days.map(x => x.d.getDate())).toEqual([10, 11, 12, 13, 14, 15]);
    expect(r.sel).toEqual({ di: 3, si: 0 });
  });
});
