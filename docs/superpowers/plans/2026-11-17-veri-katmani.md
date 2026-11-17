# Veri Katmanı (Ortak Tasarım uygulaması) Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Amaç:** `pro-app-ortak-tasarim` uygulamasında ekranlarla veri arasına bir katman koymak: ekranlar veriyi yalnızca **servisler** ve **eylemler** üzerinden alıp yazsın. Bugün bütün veri sahte (mock) kalacak, görünüş ve davranış değişmeyecek. Sonraki planda Emre'nin hazır API'leri konu konu bağlanacak.

**Mimari:**
- `src/store.ts` yalnızca **ekran durumunu** (sekme, sayfa yığını, paneller, bildirim balonu, tema) ve sunucudan/mock'tan gelen verinin **önbelleğini** tutar.
- Veri `src/data/` altında üç katmandan geçer: **servis** (konu başına; `source.ts` anahtarına göre mock ya da API), **mock veritabanı** (bugünkü demo verisi ve cihazda saklama), **eylemler** (ekranların çağırdığı yazma işlemleri: önce önbelleği iyimser günceller, servisi çağırır, hata olursa geri alır ve uyarı gösterir).
- Ekranlar `useStore(s => s.people)` gibi okumaya devam eder. Yazmak için `set()` yerine eylem çağırırlar.

**Teknoloji:** Expo SDK 58, React Native 0.88, TypeScript strict, AsyncStorage. Testler için jest + jest-expo (yalnızca devDependency).

**Kaynak:** Bu plan, 17 Kasım 2026'daki oturumda alınan kararlara dayanır (ayrı bir spec dosyası yok):
- Backend'e yeni tasarım (`pro-app-ortak-tasarim`) bağlanacak (seçenek A).
- Veri katmanı, `EmreTuygan/WBA` reposundaki `mobile/src/config/dataSource.ts` ve `mobile/src/config/api.ts` örnek alınarak kurulacak.
- Backend'in durumu `EmreTuygan/WBA` reposunda `docs/API-IHTIYACLARI.md` dosyasında.

## Genel Kısıtlar

- Görünüş ve davranış değişmez. Her ekran, işten önceki ekran görüntüsüyle aynı kalmalı.
- Yeni çalışma zamanı paketi eklenmez. Yalnız devDependency eklenir: `jest@~30.5.2`, `jest-expo@~58.0.11`, `@types/jest@30.0.0`.
- TypeScript `strict`. `any` yalnızca bugünkü kodda zaten bulunan yerlerde kalabilir. Yeni kodda kullanılmaz.
- Ekran dosyaları (`src/*.tsx`) `src/data/mock/` klasöründen hiçbir şey import etmez.
- Ekran dosyaları, veri alanlarına (`people`, `packages`, `lessons`, `breaks`, `offs`, `debts`, `paid`, `collected`, `me`, `reqs`) `set()` ile yazmaz.
- Kod içi açıklamalar Türkçe yazılır. Her yeni dosyanın başında, dosyanın sorumluluğunu anlatan kısa bir Türkçe yorum bulunur.
- Kimlikler (`id`, `pid`) her modelde `string` tipindedir, çünkü backend UUID kullanıyor.
- Tarih anahtarı `YYYY-MM-DD` biçimindedir (`iso(d)`). Bugünkü `dkey` (0'dan başlayan ay) yalnız eski kaydı taşımak için okunur.
- Haftanın günü: `0 = Pazartesi … 6 = Pazar` (bugünkü `wd()` ile ve backend'in `weekday` alanıyla aynı).
- Commit mesajları Türkçe ve Conventional Commits biçimindedir (`feat:`, `refactor:`, `test:`).

## İnceleme Odağı

1. **Eski kayıt:** Uygulamayı daha önce kullanmış birinin `pro-ortak-tasarim-v1` anahtarıyla cihazda saklanan dersleri, kişileri ve ayarları yeni sürümde aynen geri gelmeli. Test: Görev 2, `v1 kaydını taşır`.
2. **Hata olunca geri alma:** Servis hata verirse (ileride ağ kopması) ekranda yapılan değişiklik geri alınmalı ve "Kaydedilemedi" uyarısı çıkmalı. Değişiklik sessizce "kaydedilmiş gibi" kalmamalı. Test: Görev 5, `hata olursa önbelleği geri alır`.
3. **Geri al:** Paket silme ve kişi arşivleme gibi işlemlerdeki "Geri al" düğmesi taşımadan sonra da çalışmalı ve geri alınan kayıt servise de geri yazılmalı. Test: Görev 6, `paket silme geri alınınca servis de geri yükler`.
4. **Takvimde uzak tarih:** Ay görünümünde aylarca ileri ya da geri hızla kaydırınca günler boş görünüp sonra dolmamalı (mock'ta anında dolmalı). Aynı gün için aynı anda iki kez yükleme yapılmamalı. Test: Görev 5, `ensureLessons aynı aralığı iki kez istemez`.
5. **Boş sayfa kipi:** Hesabım ⋯ › Boş sayfa açıldığında bütün listeler (dersler, kişiler, paketler, borçlar) boş görünmeli. Kapatınca demo verisi geri gelmeli. Test: Görev 2, `boş kipte her liste boş döner`.

---

## Dosya Yapısı

```
pro-app-ortak-tasarim/
  jest.config.js                  (yeni) jest-expo ön ayarı, AsyncStorage mock'u
  src/data/
    models.ts                     (yeni) uygulama modelleri: Person, Lesson, Pkg, Brk, Off, Debt, PaidRow, WeekHours, LessonRules, NotifPrefs, Profile, ReqState
    source.ts                     (yeni) konu başına 'mock' | 'api' anahtarı, sourceFor()
    errors.ts                     (yeni) ApiError, notConnected()
    dates.ts                      (yeni) iso(), fromIso(), eski dkey → iso dönüşümü
    mock/
      seed.ts                     (yeni) demo verisi (data.ts'teki PEOPLE0, PACKAGES0 ve store.ts'teki başlangıç değerleri buraya taşınır)
      lessonGen.ts                (yeni) data.ts'teki baseLessons üreteci (aynı tohum, aynı sonuç)
      db.ts                       (yeni) bellek içi mock veritabanı + AsyncStorage'da saklama + v1'den taşıma
    services/
      people.ts packages.ts lessons.ts schedule.ts rules.ts notifPrefs.ts payments.ts requests.ts profile.ts
      index.ts                    barrel
    actions/
      optimistic.ts               (yeni) iyimser güncelleme yardımcısı
      people.ts packages.ts lessons.ts schedule.ts payments.ts requests.ts profile.ts settings.ts
      boot.ts                     (yeni) açılışta önbelleği servislerden doldurur
      index.ts                    barrel
    __tests__/                    servis, mock db, eylem testleri ve ekran yazma koruması
  src/store.ts                    (değişir) veri sahipliği, kalıcılık ve collect/addPerson/patchPerson çıkar; önbellek alanları kalır
  src/data.ts                     (değişir) yalnız biçim yardımcıları kalır (DN, MN, hm, addD, same, wd, mon, initials …)
  src/Calendar.tsx, screens1-3.tsx, sheets.tsx, tabs.tsx, layers.tsx, ui.tsx, App.tsx   (değişir) okumalar aynı kalır, yazmalar eylemlere geçer
```

---

### Görev 1: Modeller, kaynak anahtarı ve test altyapısı

**Dosyalar:**
- Oluştur: `src/data/models.ts`, `src/data/source.ts`, `src/data/errors.ts`, `src/data/dates.ts`, `jest.config.js`
- Değiştir: `package.json` (devDependencies ve `"test": "jest"` betiği)
- Test: `src/data/__tests__/source.test.ts`, `src/data/__tests__/dates.test.ts`

**Arayüzler (sonraki görevler bunları kullanır):**
```ts
// models.ts
export type ID = string;
export type TagKind = 'a' | 'i' | 's' | 'd' | 'n';
export type Person = { id: ID; ini: string; name: string; sub: string; tag: [TagKind, string]; cat: string; arch?: boolean; gone?: boolean };
export type LessonStatus = 'ok' | 'no' | 'nx' | 'w';
export type Lesson = { id: ID; date: string; h: number; dur: number; pid: ID; type: string; st: LessonStatus; pk?: string; rep?: number; loc?: string };
export type Pkg = { id: ID; kind: 'single' | 'multi'; c1: string; c2: string; name: string; sub: string; price: string; base?: boolean };
export type Brk = { id: ID; name: string; start: string; end: string; days: number[] };
export type Off = { id: ID; date: string; name: string; start: number; end: number; all?: boolean };
export type DebtLesson = { lessonId?: ID; when: string; what: string };
export type Debt = { pid: ID; lessons: DebtLesson[]; note: string; late?: boolean; tag: string };
export type PaidRow = { id: ID; ini: string; name: string; sub: string; amt: number };
export type DayHours = { on: boolean; s: string; e: string };          // 'HH:mm'
export type WeekHours = DayHours[];                                     // uzunluk 7, 0 = Pazartesi
export type Choice = { s: number; c: string | null };                   // hazır değer sırası ya da özel değer (bugünkü rule.N şekli)
export type LessonRules = { window: Choice; freeCancel: Choice; startMin: Choice; gap: Choice };
export type NotifPrefs = Record<string, boolean | string>;              // anahtarlar bugünkü nt.* son ekleri: can, pay, req, qs, qe, quiet, v
export type Profile = { ad: string; soyad: string; title: string };
export type ReqState = { b: boolean; a: boolean };                      // demo talepleri; gerçek model backend'de talepler gelince
export type Topic = 'people' | 'lessons' | 'packages' | 'schedule' | 'rules' | 'notifPrefs' | 'payments' | 'requests' | 'profile';

// source.ts
export const DATA_SOURCE: Record<Topic, 'mock' | 'api'>;  // bu planda hepsi 'mock'
export function sourceFor(t: Topic): 'mock' | 'api';     // EXPO_PUBLIC_API_URL boşsa ya da EXPO_PUBLIC_DATA_SOURCE === 'mock' ise her zaman 'mock'

// errors.ts
export class ApiError extends Error { status: number; code?: string }
export function notConnected(): never;                    // ApiError { status: 501, code: 'NOT_CONNECTED' }

// dates.ts
export function iso(d: Date): string;                     // '2026-09-09'
export function fromIso(s: string): Date;                 // yerel gece yarısı
export function legacyKeyToIso(k: string): string;        // '2026-8-9' → '2026-09-09'
```

- [ ] **Adım 1: Paketleri kur**

Çalıştır: `npx expo install -- --save-dev jest@~30.5.2 jest-expo@~58.0.11 @types/jest@30.0.0`. Ardından `package.json`'a `"test": "jest"` betiğini ekle. `jest.config.js` dosyası `preset: 'jest-expo'` kullanır ve `setupFiles` ile `@react-native-async-storage/async-storage/jest/async-storage-mock` dosyasını AsyncStorage mock'u olarak yükler.

- [ ] **Adım 2: Başarısız testleri yaz**

```ts
test('API adresi yoksa her konu mock', () => {
  delete process.env.EXPO_PUBLIC_API_URL;
  expect(sourceFor('people')).toBe('mock');
});
test('DATA_SOURCE=mock her şeyi mock yapar', () => {
  process.env.EXPO_PUBLIC_API_URL = 'http://x';
  process.env.EXPO_PUBLIC_DATA_SOURCE = 'mock';
  expect(sourceFor('schedule')).toBe('mock');
});
test('notConnected 501 fırlatır', () => {
  expect(() => notConnected()).toThrow(expect.objectContaining({ status: 501, code: 'NOT_CONNECTED' }));
});
test('iso / legacyKeyToIso', () => {
  expect(iso(new Date(2026, 8, 9))).toBe('2026-09-09');
  expect(legacyKeyToIso('2026-8-9')).toBe('2026-09-09');
  expect(iso(fromIso('2026-12-31'))).toBe('2026-12-31');
});
```

- [ ] **Adım 3: `npm test` çalıştır.** Beklenen sonuç: FAIL (modüller yok).
- [ ] **Adım 4: Dört dosyayı yukarıdaki imzalarla yaz.** `sourceFor`, ortam değişkenlerini her çağrıda okur (testlerin değiştirebilmesi için).
- [ ] **Adım 5: `npm test` ve `npx tsc --noEmit` çalıştır.** Beklenen sonuç: PASS, tip hatası yok.
- [ ] **Adım 6: Commit.** Mesaj: `feat(veri): modeller, kaynak anahtarı ve test altyapısı`

---

### Görev 2: Mock veritabanı (demo verisi ve cihazda saklama)

**Dosyalar:**
- Oluştur: `src/data/mock/seed.ts`, `src/data/mock/lessonGen.ts`, `src/data/mock/db.ts`
- Test: `src/data/__tests__/mockDb.test.ts`

**Arayüzler:**
```ts
// lessonGen.ts — data.ts'teki baseLessons'ın aynısı; kimlik `${iso}|${h}|${i}`, pid String(sayı)
export function baseLessons(d: Date): Lesson[];
export const TODAY: Date; export const NOW_H: number;   // data.ts'ten taşınır, data.ts yeniden dışa aktarır

// db.ts
export type MockData = {
  people: Person[]; packages: Pkg[]; extra: Lesson[]; cancelled: ID[]; breaks: Brk[]; offs: Off[];
  debts: Debt[]; paid: PaidRow[]; collected: number; me: Profile; week: WeekHours; rules: LessonRules;
  notif: NotifPrefs; reqs: ReqState; lessonMeta: Record<ID, { pk?: string; rep?: number; loc?: string }>;
};
export const mockDb: {
  data(): MockData;                        // boş kipte listeler boş, ayarlar dolu döner
  update(fn: (d: MockData) => MockData): void;   // değiştirir ve 400 ms sonra 'pro-ortak-tasarim-v2' anahtarına yazar
  load(): Promise<void>;                   // v2'yi okur; yoksa v1'i okuyup taşır; o da yoksa seed
  reset(): void;                           // seed'e döner (Verileri sıfırla)
  setEmpty(on: boolean): void;             // Boş sayfa kipi
  lessonsFor(d: Date): Lesson[];           // baseLessons + extra − cancelled, saate göre sıralı
};
```

`seed.ts` dosyası bugünkü değerleri birebir taşır: `PEOPLE0` (kimlikler `String(id)`), `PACKAGES0`, store'daki `breaks`, `debts`, `paid`, `collected: 12400`, `me`, `reqs`. Ayrıca bugün kodda varsayılan olarak duran değerlerden `week` ve `rules` üretilir:
- Hafta içi 10:00–18:00, Cumartesi 10:00–14:00, Pazar kapalı.
- Kurallar: `rule.N` önayarları `{ s: 1, c: null }` gibi, `screens2.tsx:120-123` satırlarındaki `ini` değerleri.

v1 taşıma kuralları:
- `extra` → `Lesson`: tarih `legacyKeyToIso(k)` ile çevrilir, kimlik yeni üretilir.
- `cancelled`: `"dkey|h"` biçimi → `"iso|h|*"` önekiyle eşleşen ders kimliği.
- `prefs['wh.*' | 'day.*']` → `week`, `prefs['rule.*']` → `rules`, `prefs['nt.*']` → `notif`, `prefs['les.*']` → `lessonMeta`.
- Geri kalan `prefs` anahtarları olduğu gibi `uiPrefs` olarak bırakılır ve Görev 5'te store'a geri verilir.

- [ ] **Adım 1: Başarısız testleri yaz**

```ts
test('seed bugünkü demo verisini verir', () => {
  mockDb.reset();
  expect(mockDb.data().people).toHaveLength(22);
  expect(mockDb.lessonsFor(TODAY).map(l => l.h)).toEqual([9, 11.5, 14, 19]);
});
test('üreteç kararlı: aynı gün aynı dersler', () => {
  const d = new Date(2026, 9, 14);
  expect(mockDb.lessonsFor(d)).toEqual(mockDb.lessonsFor(d));
});
test('boş kipte her liste boş döner', () => {
  mockDb.setEmpty(true);
  const d = mockDb.data();
  expect([d.people, d.packages, d.debts, d.paid, mockDb.lessonsFor(TODAY)].every(x => x.length === 0)).toBe(true);
  mockDb.setEmpty(false);
  expect(mockDb.data().people.length).toBeGreaterThan(0);
});
test('v1 kaydını taşır', async () => {
  await AsyncStorage.setItem('pro-ortak-tasarim-v1', JSON.stringify({
    extra: [{ k: '2026-8-10', l: [18, 60, 6, 'Bireysel', 'w'] }],
    prefs: { 'wh.s': '09:00', 'rule.2': { s: 2, c: null }, 'nt.can': false },
  }));
  await mockDb.load();
  expect(mockDb.lessonsFor(new Date(2026, 8, 10)).some(l => l.h === 18 && l.pid === '6')).toBe(true);
  expect(mockDb.data().week[0].s).toBe('09:00');
  expect(mockDb.data().rules.startMin).toEqual({ s: 2, c: null });
  expect(mockDb.data().notif.can).toBe(false);
});
test('update cihaza yazar ve load geri okur', async () => { /* update → jest.advanceTimersByTime(400) → reset → load → değer geri gelmiş */ });
```

- [ ] **Adım 2: `npm test -- mockDb` çalıştır.** Beklenen sonuç: FAIL.
- [ ] **Adım 3: Üç dosyayı yaz.** `baseLessons` gövdesi `src/data.ts:38-50` satırlarından olduğu gibi kopyalanır. Yalnız dönüş tipi `Lesson` nesnesi olur. `data.ts`'teki eski `lessons()` ve `cache` bu görevde silinmez, Görev 5'te silinir.
- [ ] **Adım 4: `npm test` ve `npx tsc --noEmit` çalıştır.** Beklenen sonuç: PASS.
- [ ] **Adım 5: Commit.** Mesaj: `feat(veri): mock veritabanı, demo verisi ve v1 taşıma`

---

### Görev 3: Servisler

**Dosyalar:**
- Oluştur: `src/data/services/{people,packages,lessons,schedule,rules,notifPrefs,payments,requests,profile,index}.ts`
- Test: `src/data/__tests__/services.test.ts`

**Arayüzler:** Her servis, `sourceFor(konu) === 'api'` ise `notConnected()` çağırır, değilse `mockDb` üzerinde çalışır. Bütün fonksiyonlar `Promise` döner, ekrana kopya verir ve iç nesneyi dışarı sızdırmaz.

```ts
peopleService:   list(): Promise<Person[]>; create(i: { name: string; sub?: string }): Promise<Person>; update(id: ID, p: Partial<Omit<Person, 'id'>>): Promise<Person>;
packagesService: list(): Promise<Pkg[]>; save(p: Omit<Pkg, 'id'> & { id?: ID }): Promise<Pkg>; remove(id: ID): Promise<void>; restore(p: Pkg): Promise<void>; setBase(id: ID): Promise<void>;
lessonsService:  range(from: string, to: string): Promise<Record<string, Lesson[]>>;   // her gün için anahtar, boş günler []
                 create(ls: Omit<Lesson, 'id'>[]): Promise<Lesson[]>; cancel(id: ID): Promise<void>;
                 reschedule(id: ID, to: { date: string; h: number }): Promise<Lesson>;
scheduleService: getWeek(): Promise<WeekHours>; saveWeek(w: WeekHours): Promise<void>;
                 listBreaks(): Promise<Brk[]>; saveBreak(b: Omit<Brk, 'id'> & { id?: ID }): Promise<Brk>; removeBreak(id: ID): Promise<void>;
                 listOffs(): Promise<Off[]>; addOffs(o: Omit<Off, 'id'>[]): Promise<Off[]>;
rulesService:    get(): Promise<LessonRules>; save(r: LessonRules): Promise<void>;
notifPrefsService: get(): Promise<NotifPrefs>; save(p: NotifPrefs): Promise<void>;
paymentsService: debts(): Promise<Debt[]>; paid(): Promise<PaidRow[]>; collected(): Promise<number>;
                 collect(i: { pid: ID; lessonIdx: number[]; method: string; amount: number; name: string; ini: string }): Promise<void>;
requestsService: get(): Promise<ReqState>; accept(id: 'b' | 'a'): Promise<void>; reject(id: 'b' | 'a'): Promise<void>; counter(id: 'a'): Promise<void>;
profileService:  get(): Promise<Profile>; save(p: Profile): Promise<void>;
```

`paymentsService.collect`, bugünkü `store.ts:146-154` satırlarındaki `collect` mantığının aynısıdır: seçilen dersler borçtan düşülür, borcu biten kişinin etiketi "Tek ders" olur, tahsilat toplamı artar ve ödenenler listesinin başına satır eklenir.

`requestsService.accept('b')`, bugün `screens3.tsx:16` satırında yapılan işi yapar: 9 Eylül 18:00'e Burak Şahin (pid `'6'`) için bir ders ekler ve talebi kapatır. Ders zaten varsa ikinci kez eklemez.

- [ ] **Adım 1: Başarısız testleri yaz**

```ts
beforeEach(() => mockDb.reset());
test('create sonra list yeni kişiyi içerir', async () => {
  const p = await peopleService.create({ name: 'Ada Lovelace' });
  expect((await peopleService.list()).find(x => x.id === p.id)?.ini).toBe('AL');
});
test('aynı adla ikinci kez eklemek mevcut kişiyi döner', async () => {
  const a = await peopleService.create({ name: 'Elif Yıldırım' });
  expect(a.id).toBe('0');
});
test('range her günü anahtar olarak döner', async () => {
  const r = await lessonsService.range('2026-09-07', '2026-09-13');
  expect(Object.keys(r)).toHaveLength(7);
  expect(r['2026-09-09'].map(l => l.h)).toEqual([9, 11.5, 14, 19]);
});
test('cancel dersi aralıktan çıkarır', async () => { /* 2026-09-09'un ilk dersini iptal et → range'de 3 ders kalır */ });
test('reschedule eskiyi kaldırır yeniyi ekler, durum (ok/no) korunur', async () => { /* … */ });
test('setBase tek temel paket bırakır', async () => {
  await packagesService.setBase('3');
  expect((await packagesService.list()).filter(p => p.base).map(p => p.id)).toEqual(['3']);
});
test('collect tüm borç ödenince kişiyi borçtan çıkarır', async () => {
  await paymentsService.collect({ pid: '1', lessonIdx: [0, 1], method: 'Nakit', amount: 1500, name: 'Mert Kaya', ini: 'MK' });
  expect((await paymentsService.debts()).some(d => d.pid === '1')).toBe(false);
  expect(await paymentsService.collected()).toBe(13900);
  expect((await peopleService.list()).find(p => p.id === '1')?.tag).toEqual(['n', 'Tek ders']);
});
test('accept iki kez çağrılınca tek ders ekler', async () => { /* … */ });
test('api seçiliyse notConnected', async () => {
  process.env.EXPO_PUBLIC_API_URL = 'http://x';
  jest.spyOn(source, 'sourceFor').mockReturnValue('api');
  await expect(peopleService.list()).rejects.toMatchObject({ code: 'NOT_CONNECTED' });
});
```

- [ ] **Adım 2: `npm test -- services` çalıştır.** Beklenen sonuç: FAIL.
- [ ] **Adım 3: Servisleri yukarıdaki imzalarla yaz.** `services/index.ts` hepsini dışa aktarır.
- [ ] **Adım 4: `npm test` ve `npx tsc --noEmit` çalıştır.** Beklenen sonuç: PASS.
- [ ] **Adım 5: Commit.** Mesaj: `feat(veri): konu başına servisler (mock dalı)`

---

### Görev 4: Ekran modelini yeni tiplere geçir (kimlik string, ders nesne)

Bu görev ekranlardaki **okuma** tarafını yeni modellere uydurur. Veri hâlâ eski yoldan gelir. Amaç, sonraki görevde yalnızca kaynağın değişmesi.

**Dosyalar:**
- Değiştir: `src/store.ts` (`State` içindeki veri tipleri `models.ts`'ten gelir; `Lesson` tuple yerine nesne; `extra: Lesson[]`; `cancelled: ID[]`), `src/data.ts` (`lessons()` yeni `Lesson` döndürür; tipler `models.ts`'ten yeniden dışa aktarılır), `src/Calendar.tsx` (5 yerde `l[0]…l[4]` → `l.h, l.dur, l.pid, l.type, l.st`), `src/screens3.tsx` (7 yer), `person(id: ID)` çağrıları, `lesMeta(lk)` → `l.pk / l.rep / l.loc`.
- Test: tip denetimi ve ekran görüntüsü karşılaştırması

- [ ] **Adım 1: Referans ekran görüntülerini al.** `scripts/shots.js` dosyasını yaz. Playwright ile `http://localhost:8081` açılır, 430×900 boyutunda ve sırayla şu ekranların görüntüsü alınır:
  1. Takvim Gün
  2. Hafta
  3. Ay
  4. Kişiler
  5. Kişi detayı (Elif)
  6. Bildirimler
  7. Hesabım
  8. Paket tercihleri
  9. Takvim ayarlarım
  10. Ödemeler
  11. Yeni ders paneli

  Görüntüler `scripts/shots/before/` klasörüne kaydedilir. Bu klasör `.gitignore`'a eklenir. Görev 4'e başlamadan, değişiklik yapılmamış kodla çalıştırılır.
- [ ] **Adım 2: Tipleri değiştir ve `npx tsc --noEmit` çalıştır.** Beklenen sonuç: Calendar, screens3 ve sheets dosyalarında hatalar. Tip denetimi, değişmesi gereken her yeri gösterir.
- [ ] **Adım 3: Hataları gider ve `npx tsc --noEmit` çalıştır.** Beklenen sonuç: hata yok.
- [ ] **Adım 4: `node scripts/shots.js after` çalıştır.** Betik `after/` görüntülerini `before/` ile bayt bayt karşılaştırır (`Buffer.equals`) ve farklı olanların adını yazar. Fark çıkan ekrana gözle bakılır. Beklenen sonuç: 11 ekran aynı. Demo saati sabit (`NOW_H`) olduğu için zamana bağlı fark beklenmez.
- [ ] **Adım 5: Commit.** Mesaj: `refactor(veri): ekranlar yeni modelleri kullanıyor (string kimlik, ders nesnesi)`

---

### Görev 5: Önbellek, iyimser eylemler ve açılış

**Dosyalar:**
- Oluştur: `src/data/actions/optimistic.ts`, `src/data/actions/boot.ts`, `src/data/actions/lessons.ts`, `src/data/actions/index.ts`
- Değiştir: `src/store.ts` (`hydrate`, `KEEP`, `FRESH`, `resetData`, `collect`, `addPerson`, `patchPerson` çıkar; `lessons: Record<string, Lesson[]>` ve `loaded: Set<string>` eklenir), `App.tsx` (`hydrate()` yerine `boot()`), `src/Calendar.tsx` (`lessons(d, …)` yerine `useStore(s => s.lessons[iso(d)] ?? [])`, görünür aralık için `ensureLessons`), `src/data.ts` (`lessons`, `cache`, `PEOPLE0`, `PACKAGES0`, `PKG`, `TODAY` tanımları silinir; `TODAY` lessonGen'den yeniden dışa aktarılır)
- Test: `src/data/__tests__/actions.test.ts`

**Arayüzler:**
```ts
// optimistic.ts
export function optimistic(apply: (s: State) => Partial<State>, call: () => Promise<unknown>, fail?: string): Promise<boolean>;
//   apply hemen set edilir; call reddedilirse yalnız apply'ın dokunduğu alanlar önceki değerine döner, toast(fail ?? 'Kaydedilemedi. Tekrar dene.'), false döner.
// boot.ts
export function boot(): Promise<void>;     // mockDb.load → bütün servislerin get/list sonuçları store'a; uiPrefs → prefs; bugünün ±6 haftası ensureLessons
export function reloadAll(): Promise<void>; // Boş sayfa ve Verileri sıfırla sonrası
// lessons.ts
export function ensureLessons(from: string, to: string): Promise<void>; // yalnız yüklenmemiş günleri ister; aynı anda süren isteği tekrar başlatmaz
```

Takvimin görünür aralığı şöyle hesaplanır:
- Gün ve Hafta görünümünde: odak haftası ±2 hafta.
- Ay görünümünde: görünen ay ±1 ay.

Kaydırma bitince (`F` değişince) `ensureLessons` çağrılır.

- [ ] **Adım 1: Başarısız testleri yaz**

```ts
test('optimistic başarılıysa değişiklik kalır', async () => { /* people'a ekle, call resolve → state'te var */ });
test('hata olursa önbelleği geri alır', async () => {
  const before = get().people;
  const ok = await optimistic(s => ({ people: [...s.people, x] }), () => Promise.reject(new Error('ağ')));
  expect(ok).toBe(false);
  expect(get().people).toBe(before);
  expect(get().toast?.msg).toBe('Kaydedilemedi. Tekrar dene.');
});
test('ensureLessons aynı aralığı iki kez istemez', async () => {
  const spy = jest.spyOn(lessonsService, 'range');
  await Promise.all([ensureLessons('2026-09-07', '2026-09-13'), ensureLessons('2026-09-07', '2026-09-13')]);
  expect(spy).toHaveBeenCalledTimes(1);
});
test('boot sonrası bugünün dersleri önbellekte', async () => {
  await boot();
  expect(get().lessons['2026-09-09'].map(l => l.h)).toEqual([9, 11.5, 14, 19]);
});
```

- [ ] **Adım 2: `npm test -- actions` çalıştır.** Beklenen sonuç: FAIL.
- [ ] **Adım 3: Kodu yaz ve store/App/Calendar değişikliklerini yap.** Boş sayfa anahtarı (`tabs.tsx` içindeki `set({ emp })`) bu görevde `mockDb.setEmpty(v)` ve ardından `reloadAll()` çağırır. `emp` alanı yalnızca boş-hâl metinleri için store'da kalır.
- [ ] **Adım 4: `npm test`, `npx tsc --noEmit` ve `node scripts/shots.js after` çalıştır.** Beklenen sonuç: testler PASS ve 11 ekran `before` ile aynı.
- [ ] **Adım 5: Commit.** Mesaj: `feat(veri): önbellek, iyimser eylemler ve açılış yüklemesi`

---

### Görev 6: Ekranlardaki bütün yazmaları eylemlere taşı

**Dosyalar:**
- Oluştur: `src/data/actions/{people,packages,schedule,payments,requests,profile,settings}.ts`
- Değiştir: `src/sheets.tsx`, `src/screens1.tsx`, `src/screens2.tsx`, `src/screens3.tsx`, `src/tabs.tsx`, `src/ui.tsx` (`setPref` → `settings.setPref`)
- Test: `src/data/__tests__/writes.test.ts`, `src/data/__tests__/screenGuard.test.ts`

Bugünkü yazma noktaları ve karşılık gelen eylemler:

| Bugün | Eylem |
|---|---|
| `sheets.tsx:483` yeni ders(ler) ekle | `addLessons(ls: Omit<Lesson,'id'>[], focus: Date)` |
| `screens3.tsx:104` ertele | `rescheduleLesson(id, to)` |
| `screens3.tsx:134` iptal | `cancelLesson(id)` |
| `screens3.tsx:16`, `:176`, `:206`; `tabs.tsx:112` talepler | `acceptRequest / rejectRequest / counterRequest` |
| `sheets.tsx` `addPerson`, `patchPerson`; `tabs.tsx` `patchPerson` (arşiv) | `addPerson(name, sub?) : Promise<Person>`, `updatePerson(id, patch)` |
| `screens2.tsx:179-180`, `sheets.tsx:291,302` paketler | `savePackage`, `removePackage(pk)` (Geri al → `restorePackage(pk)`), `setBasePackage(id)` |
| `screens2.tsx:88`, `sheets.tsx:214,217` molalar | `saveBreak`, `removeBreak`, `toggleBreakDay(id, day, on)` |
| `sheets.tsx:253` izin günleri | `addOffs` |
| `screens3.tsx` `collect(...)` | `collectPayment(...)` |
| `sheets.tsx` `set({ me })` | `saveProfile` |
| `ui.tsx` `setPref(k, v)` | `settings.setPref(k, v)` |

`settings.setPref(k, v)` şöyle çalışır:
- `prefs` önbelleğini hemen günceller.
- Anahtar önekine göre ilgili servise 500 ms gecikmeyle kaydeder: `wh.` ve `day.` → `scheduleService.saveWeek`, `rule.` → `rulesService.save`, `nt.` → `notifPrefsService.save`.
- Diğer anahtarlar yalnızca cihazda kalır.
- Dönüşümler, `src/data/actions/settings.ts` içindeki iki saf fonksiyonla yapılır: `prefsToModels(prefs)` ve `modelsToPrefs(week, rules, notif)`.

- [ ] **Adım 1: Başarısız testleri yaz**

```ts
test('paket silme geri alınınca servis de geri yükler', async () => {
  const pk = get().packages[1];
  await removePackage(pk);
  expect((await packagesService.list()).some(p => p.id === pk.id)).toBe(false);
  await get().toast!.onUndo!();
  expect((await packagesService.list()).some(p => p.id === pk.id)).toBe(true);
  expect(get().packages.some(p => p.id === pk.id)).toBe(true);
});
test('setPref wh.s haftalık saatlere yazılır', async () => {
  jest.useFakeTimers(); setPref('wh.s', '09:30'); jest.advanceTimersByTime(500); await flush();
  expect((await scheduleService.getWeek())[0].s).toBe('09:30');
});
test('prefsToModels ∘ modelsToPrefs kimliktir', () => { /* seed week/rules/notif → prefs → modeller aynı */ });
test('collectPayment ödemeler ekranının önbelleğini günceller', async () => { /* debts, paid, collected */ });
test('ekranlar veri alanına set() ile yazmaz', () => {
  const bad = /set\(\s*(s\s*=>\s*\(\s*)?\{\s*(people|packages|lessons|extra|cancelled|breaks|offs|debts|paid|collected|me|reqs)\s*:/;
  for (const f of ['Calendar', 'screens1', 'screens2', 'screens3', 'sheets', 'tabs', 'layers', 'ui'])
    expect(fs.readFileSync(`src/${f}.tsx`, 'utf8')).not.toMatch(bad);
});
test('ekranlar mock klasörünü import etmez', () => { /* src/*.tsx içinde "data/mock" geçmez */ });
```

- [ ] **Adım 2: `npm test -- writes screenGuard` çalıştır.** Beklenen sonuç: FAIL (koruma testi bugünkü yazmaları yakalar).
- [ ] **Adım 3: Eylemleri yaz ve tablodaki her yazma noktasını eylem çağrısına çevir.** Bildirim balonu metinleri ve "Geri al" davranışı aynen korunur.
- [ ] **Adım 4: `npm test`, `npx tsc --noEmit` ve `node scripts/shots.js after` çalıştır.** Beklenen sonuç: PASS ve 11 ekran aynı.
- [ ] **Adım 5: Elle tarayıcıda deneme.** Sırayla şunlar denenir:
  1. Yeni ders ekle.
  2. Dersi ertele.
  3. Dersi iptal et.
  4. Talebi onayla.
  5. Kişi ekle.
  6. Kişiyi arşivle, ardından Geri al.
  7. Paket sil, ardından Geri al.
  8. Mola ekle.
  9. İzin günü ekle.
  10. Ödeme al.
  11. Çalışma saatini değiştir.
  12. Sayfayı yenile: her değişiklik yerinde olmalı.
  13. Boş sayfa: aç ve kapat.
  14. Verileri sıfırla.

  Beklenen sonuç: her biri bugünkü gibi çalışır.
- [ ] **Adım 6: Commit.** Mesaj: `refactor(veri): ekran yazmaları eylemlere taşındı`

---

### Görev 7: Belgeler ve teslim

**Dosyalar:**
- Değiştir: `pro-app-ortak-tasarim/README.md` ("Veri katmanı" bölümü: katmanlar, yeni bir konuyu API'ye bağlamanın 3 adımı, dosya tablosu güncellemesi)
- Oluştur: `src/data/README.md` (konu → servis → mock alanı → backend ucu tablosu; şu an hepsi mock)

- [ ] **Adım 1: README'leri yaz.** Konu → backend ucu eşlemesi şöyledir:

  | Konu | Backend ucu | Durum |
  |---|---|---|
  | schedule.week | `GET/PUT /availability` | hazır |
  | schedule.offs | `/availability/exceptions` | hazır |
  | rules | `/appointment-defaults` | hazır |
  | people | `/clients` | hazır |
  | packages | `/offerings` ve `/prices` | kısmen hazır |
  | lessons, payments, requests, profile, notifPrefs | — | yok |

- [ ] **Adım 2: Son doğrulama.** `npm test`, `npx tsc --noEmit` ve `npx expo start --web` çalıştırılıp konsolda hata olmadığına bakılır.
- [ ] **Adım 3: Commit ve push.** Mesaj: `docs(veri): veri katmanı belgeleri`. Push: `git push -u origin claude/pro-prototip`

---

## Bu planın kapsamı dışında (sonraki planlar)

1. **API'ye bağlama (Plan 2):**
   - `src/data/api.ts` (`apiFetch`, `mobile/src/config/api.ts` kopyası).
   - Adaptörler: availability ↔ `WeekHours`, exceptions ↔ `Off`, appointment-defaults ↔ `LessonRules`, clients ↔ `Person`, offerings/prices ↔ `Pkg`.
   - Konu anahtarları sırayla `'api'` yapılır.
   - Ön koşul: backend bu ortamda Docker ile ayağa kaldırılıp uçlar denenmiş olmalı.
2. **Emre'ye gidecek backend notu:** dersler/rezervasyon API'si, giriş, `Client.email` benzersizliği, isimli molalar, paket ve üyelik, ödemeler, `.env` dosyasının repodan çıkarılması.
3. **Repo birleştirme:** Yeni tasarımın `EmreTuygan/WBA` reposundaki `mobile/` klasörünün yerine geçmesi ya da yanına eklenmesi. Bu karar Emre ile verilecek.
