import { cancelOptions, freeCancelHours, hoursUntil } from '../cancelPolicy';

const base = { pk: false, paid: true, hoursLeft: 30, freeH: 4 };

describe('cancelOptions', () => {
  it('paketli derste: pakete geri ekle / paketten düş, varsayılan pakete geri ekle', () => {
    const o = cancelOptions({ ...base, pk: true, reason: 'Ben iptal ediyorum' });
    expect(o.opts).toEqual(['Pakete geri ekle', 'Paketten düş']);
    expect(o.def).toBe('Pakete geri ekle');
    expect(o.late).toBe(false);
  });
  it('paketsiz ödenmiş derste: iade et / iade etme / ücretsiz ders ver, varsayılan iade et', () => {
    const o = cancelOptions({ ...base, reason: 'Hava / mekân' });
    expect(o.opts).toEqual(['İade et', 'İade etme', 'Ücretsiz ders ver']);
    expect(o.def).toBe('İade et');
  });
  it('paketsiz ödenmemiş derste: ücret alınmasın / alınsın', () => {
    const o = cancelOptions({ ...base, paid: false, reason: 'Ben iptal ediyorum' });
    expect(o.opts).toEqual(['Ücret alınmasın', 'Ücret alınsın']);
    expect(o.def).toBe('Ücret alınmasın');
  });
  it('kişi gelemiyor, süre geçmemiş: geç sayılmaz', () => {
    const o = cancelOptions({ ...base, pk: true, reason: 'Kişi gelemiyor', hoursLeft: 5 });
    expect(o.late).toBe(false);
    expect(o.def).toBe('Pakete geri ekle');
  });
  it('kişi gelemiyor, süre geçmiş: varsayılanlar kişinin aleyhine', () => {
    expect(cancelOptions({ ...base, pk: true, reason: 'Kişi gelemiyor', hoursLeft: 2 }).def).toBe('Paketten düş');
    expect(cancelOptions({ ...base, reason: 'Kişi gelemiyor', hoursLeft: 2 }).def).toBe('İade etme');
    const u = cancelOptions({ ...base, paid: false, reason: 'Kişi gelemiyor', hoursLeft: 2 });
    expect(u.def).toBe('Ücret alınsın');
    expect(u.late).toBe(true);
  });
  it('uzmanın kendi iptalinde süreye bakılmaz', () => {
    expect(cancelOptions({ ...base, pk: true, reason: 'Ben iptal ediyorum', hoursLeft: 1 }).late).toBe(false);
  });
});

describe('freeCancelHours', () => {
  it('hazır değerler', () => {
    expect(freeCancelHours({ s: 0, c: null })).toBe(2);
    expect(freeCancelHours({ s: 2, c: null })).toBe(24);
  });
  it('özel değer', () => expect(freeCancelHours({ s: 3, c: '6' })).toBe(6));
  it('kayıt yoksa 4 saat', () => expect(freeCancelHours(undefined)).toBe(4));
});

describe('hoursUntil', () => {
  it('yarın aynı saatteki ders 24 saat sonra', () => expect(hoursUntil('2026-09-10', 12.6)).toBeCloseTo(24));
  it('bugün 14:00 dersi 1,4 saat sonra', () => expect(hoursUntil('2026-09-09', 14)).toBeCloseTo(1.4));
});
