# Pro App (React Native / Expo)

`prototip/app.html` prototipinin React Native karşılığı. Tasarım kuralları: `prototip/TASARIM-SISTEMI-v4.md`.

Sadece arayüz: API ve veritabanı yok, her şey bellekte çalışır (uygulamayı kapatınca sıfırlanır).

## Çalıştırma

```bash
cd pro-app
npm install
npx expo start
```

- Telefonda: Expo Go ile QR kodu okut.
- Tarayıcıda: `npx expo start --web` (geniş ekranda telefon çerçevesi içinde görünür).

Koyu tema ve "Boş sayfa" hâli: Hesabım → sağ üst ⋯ menüsü.

## Dosyalar

| Dosya | Ne |
|---|---|
| `App.tsx` | Kabuk: çerçeve, katman sırası |
| `src/theme.ts` | Renkler (açık/koyu), yazı tipi |
| `src/data.ts` | Demo verisi (kişiler, dersler, paketler) |
| `src/store.ts` | Durum ve gezinme (push/pop, panel, onay penceresi, bildirim balonu) |
| `src/ui.tsx` | Ortak bileşenler (bölüm, çip, anahtar, alan, buton, liste…) |
| `src/layers.tsx` | Ekran yığını, alttan panel, onay penceresi, alt bar |
| `src/Calendar.tsx` | Takvim: Gün ↔ Hafta ↔ Ay |
| `src/tabs.tsx` | Kişiler, Bildirimler, Hesabım |
| `src/screens.tsx` | İtilen ekranlar |
| `src/sheets.tsx` | Alttan paneller |
| `src/icons.ts` | Material Symbols Rounded ikon yolları (otomatik üretildi) |
