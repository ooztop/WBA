// Ekran koruması: ekranlar veri alanlarına set() ile yazmaz ve mock klasörünü import etmez.
// @types/node yok: yalnız kullanılan işlev için dar bir tip verilir
const fs = jest.requireActual('fs') as { readFileSync(path: string, enc: string): string };

const FILES = ['Calendar', 'screens1', 'screens2', 'screens3', 'sheets', 'tabs', 'layers', 'ui'];
const src = (f: string) => fs.readFileSync(`src/${f}.tsx`, 'utf8');

test('ekranlar veri alanına set() ile yazmaz', () => {
  const bad = /set\(\s*(s\s*=>\s*\(\s*)?\{\s*(people|packages|lessons|extra|cancelled|breaks|offs|debts|paid|collected|me|reqs|notifs|prefs|dark|accent)\s*:/;
  for (const f of FILES) expect([f, src(f).match(bad)?.[0]]).toEqual([f, undefined]);
});
test('ekranlar store içindeki kaldırılmış yazma yardımcılarını kullanmaz', () => {
  for (const f of FILES) expect([f, /\b(collect|patchPerson)\(/.test(src(f))]).toEqual([f, false]);
});
test('ekranlar mock klasörünü import etmez', () => {
  for (const f of [...FILES, 'App']) {
    const text = f === 'App' ? fs.readFileSync('App.tsx', 'utf8') : src(f);
    expect([f, /data\/mock/.test(text)]).toEqual([f, false]);
  }
});
test('ekranlar kişi kimliğini sayı olarak geçmez (kimlikler string)', () => {
  for (const f of FILES) expect([f, src(f).match(/\{\s*i:\s*\d/)?.[0]]).toEqual([f, undefined]);
});
