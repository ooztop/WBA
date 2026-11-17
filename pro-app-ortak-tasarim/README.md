# Pro App · Ortak Tasarım (React Native / Expo)

Wellness projesindeki **"Pro App - Ortak Tasarım (Prototip)"** sayfasının React Native karşılığı.
Kaynak dosyalar: `prototip/ortak-tasarim/prototip.html` (tıklanabilir prototip) ve `ortak-tasarim.dc.html` (tuval).

Henüz backend'e bağlı değil: veriler sahte (mock) veritabanından gelir ve cihazda saklanır (uygulama kapanıp açılınca geri gelir). Backend'e geçiş için veri katmanı hazır: aşağıdaki "Veri katmanı" bölümü.

## Çalıştırma

```bash
cd pro-app-ortak-tasarim
npm install
npx expo start
```

- Telefonda: Expo Go ile QR kodu okut.
- Tarayıcıda: `npx expo start --web` (geniş ekranda 390×844 telefon çerçevesi içinde görünür).

Vurgu rengi (Pro mavisi / Turuncu / Mor), koyu tema ve "Boş sayfa" hâli: Hesabım → sağ üst ⋯ menüsü.

## Dosyalar

| Dosya | Ne |
|---|---|
| `App.tsx` | Kabuk: çerçeve, katman sırası |
| `src/theme.ts` | Renkler (açık/koyu × 3 vurgu), Manrope |
| `src/icons.ts` | Prototipteki çizgi ikonlar (otomatik üretildi) |
| `src/data.ts` | Tarih ve metin biçim yardımcıları (gün/ay adları, saat yazımı) |
| `src/data/` | Veri katmanı: modeller, servisler, eylemler, sahte veritabanı (ayrıntı: `src/data/README.md`) |
| `src/store.ts` | Ekran durumu ve gezinme (sayfa, panel, onay penceresi, bildirim balonu) + verinin önbelleği |
| `src/ui.tsx` | Ortak bileşenler (bant, satır, çip, düğme, alan, anahtar…) |
| `src/layers.tsx` | Sayfa yığını, üst üste paneller, onay penceresi, alt bar |
| `src/Calendar.tsx` | Takvim: Gün ↔ Hafta ↔ Ay, + menüsü |
| `src/tabs.tsx` | Kişiler, Bildirimler, Hesabım |
| `src/screens1–3.tsx` | İtilen sayfalar |
| `src/sheets.tsx` | Alttan paneller (yeni ders, kişi seç, paketler, mola…) |

## Veri katmanı

Ekranlar veriye doğrudan dokunmaz:

- **Okuma:** ekran, `useStore(s => s.people)` gibi store'daki önbellekten okur. Önbelleği açılışta `boot()` doldurur; takvim görünen tarih aralığının derslerini `ensureLessons()` ile ister.
- **Yazma:** ekran, `src/data/actions` içindeki bir eylemi çağırır (`addLessons`, `collectPayment`, `removePackage`…). Eylem önbelleği hemen günceller, servisi çağırır; servis hata verirse değişikliği geri alır ve "Kaydedilemedi. Tekrar dene." uyarısı gösterir.
- **Servis:** konu başına bir dosya (`src/data/services`). `src/data/source.ts`'teki anahtara göre sahte veritabanını (`src/data/mock`) ya da backend'i kullanır. Şu an her konu `mock`.

Bir koruma testi (`src/data/__tests__/screenGuard.test.ts`) ekranların veri alanlarına `set()` ile yazmasını ve `src/data/mock`'u import etmesini engeller.

### Bir konuyu backend'e bağlamak (3 adım)

1. Servis dosyasındaki `api` dalını yaz: backend ucunu çağır (`apiFetch`, bkz. Plan 2).
2. Backend cevabını uygulama modeline (`src/data/models.ts`) çeviren küçük bir çevirici (adaptör) ekle ve testle.
3. `src/data/source.ts`'te o konuyu `'api'` yap. Ekranlara dokunulmaz.

### Testler

```bash
npm test
npx tsc --noEmit
```
