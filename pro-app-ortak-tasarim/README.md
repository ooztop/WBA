# Pro App · Ortak Tasarım (React Native / Expo)

Wellness projesindeki **"Pro App - Ortak Tasarım (Prototip)"** sayfasının React Native karşılığı.
Kaynak dosyalar: `prototip/ortak-tasarim/prototip.html` (tıklanabilir prototip) ve `ortak-tasarim.dc.html` (tuval).

Sadece arayüz: API ve veritabanı yok, her şey bellekte çalışır (uygulamayı kapatınca sıfırlanır).

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
| `src/data.ts` | Demo verisi (kişiler, dersler, paketler) |
| `src/store.ts` | Durum ve gezinme (sayfa, panel, onay penceresi, bildirim balonu) |
| `src/ui.tsx` | Ortak bileşenler (bant, satır, çip, düğme, alan, anahtar…) |
| `src/layers.tsx` | Sayfa yığını, üst üste paneller, onay penceresi, alt bar |
| `src/Calendar.tsx` | Takvim: Gün ↔ Hafta ↔ Ay, + menüsü |
| `src/tabs.tsx` | Kişiler, Bildirimler, Hesabım |
| `src/screens1–3.tsx` | İtilen sayfalar |
| `src/sheets.tsx` | Alttan paneller (yeni ders, kişi seç, paketler, mola…) |
