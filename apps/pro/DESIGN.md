---
name: Pro
description: Serbest çalışan eğitmen/danışman için takvim, kişi ve ödeme uygulaması — form dili 1b · Yumuşak
colors:
  ink: "#16181c"
  light-blue: "#cfe0fb"
  light-red: "#f8d8d4"
  white: "#ffffff"
  gray-100: "#f3f3f1"
  gray-600: "#6b6c70"
  text-on-fill-muted: "rgba(22,24,28,0.6)"
  text-on-ink-muted: "rgba(255,255,255,0.65)"
  divider: "rgba(0,0,0,0.07)"
typography:
  screen-title:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "17px"
    fontWeight: 800
  time:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "15px"
    fontWeight: 800
  button:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "15px"
    fontWeight: 700
  row-title:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "14.5px"
    fontWeight: 700
  body:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "13.5px"
    fontWeight: 500
    lineHeight: 1.5
  link:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "12px"
    fontWeight: 700
  caption:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "12px"
    fontWeight: 500
  badge:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "10.5px"
    fontWeight: 700
    letterSpacing: "0.06em"
  meta:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "10.5px"
    fontWeight: 500
  day-label:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "10px"
    fontWeight: 500
rounded:
  bar: "2px"
  icon: "16px"
  control: "20px"
  row: "22px"
  pill: "999px"
spacing:
  xxs: "2px"
  xs: "5px"
  sm: "6px"
  md: "12px"
  lg: "14px"
  xl: "16px"
  xxl: "18px"
  screen: "24px"
  header: "26px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "56px"
  button-primary-disabled:
    backgroundColor: "{colors.gray-100}"
    textColor: "{colors.gray-600}"
  badge-info:
    backgroundColor: "{colors.light-blue}"
    textColor: "{colors.ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: "6px 11px"
  badge-alert:
    backgroundColor: "{colors.light-red}"
    textColor: "{colors.ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: "6px 11px"
  icon-button:
    backgroundColor: "{colors.gray-100}"
    rounded: "{rounded.icon}"
    size: "42px"
  day-chip:
    backgroundColor: "{colors.gray-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 0"
  day-chip-marked:
    backgroundColor: "{colors.light-blue}"
  day-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  lesson-row:
    backgroundColor: "{colors.gray-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "16px 18px"
  tab-bar:
    backgroundColor: "{colors.white}"
    padding: "8px 30px 4px"
---

# Design System: Pro

Kod karşılığı: `src/theme/tokens.ts` (token'lar), `src/components/` (bileşenler). Değer değiştirirken ikisini birlikte güncelle.
Kaynak tasarım: Claude Design · `Pro App - Tasarım Sistemi.dc.html`, aday **1b · Yumuşak**.

## Overview

**Creative North Star: "Sakin defter"**

Sakin, profesyonel bir çalışma aracı: beyaz zemin, tek koyu marka rengi (mürekkep), sessiz tipografi, gölgesiz yüzeyler. Oval ama okunur; köşeler 16–22px, rozetler tam kapsül. Derinlik gölgeyle değil, beyaz zemin üstündeki açık gri dolgularla verilir. Ferah yoğunluk: satırlar arasında 12px, satır içinde 16/18px dolgu.

**Key Characteristics:**
- Tek vurgu rengi: mürekkep `#16181c`. Doygun mavi/kırmızı yok.
- Açık mavi ve açık kırmızı yalnız dolgu; üstlerindeki metin her zaman mürekkep.
- Yüzeyler düz; gölge yok.
- Arayüz dili Türkçe; rozetler BÜYÜK HARF (`tr-TR` kurallarıyla: ÖDENDİ, BEKLİYOR).

## Colors

Mürekkep + iki açık dolgu + beyaz/gri nötrler.

### Primary
- **Mürekkep** (#16181c): metin, birincil buton, seçili gün, dolu takvim bloğu, ders satırındaki varsayılan renk çizgisi.

### Secondary
- **Açık mavi** (#cfe0fb): müsait saat, onaylı rezervasyon, dersi olan gün, "ÖDENDİ" rozeti.

### Tertiary
- **Açık kırmızı** (#f8d8d4): ödenmemiş, iptal, dikkat; "BEKLİYOR" rozeti ve dikkat gerektiren satırın renk çizgisi.

### Neutral
- **Beyaz** (#ffffff): ekran zemini (1b'de ekran beyazdır).
- **Gri 100** (#f3f3f1): ders satırı, gün hücresi, ikon butonu dolgusu; pasif buton.
- **Gri 600** (#6b6c70): ikincil metin, pasif ikon, bağlantı metni.
- **Ayırıcı** (rgba(0,0,0,.07)): tab bar üst çizgisi, liste ayırıcıları.
- Dolgu üstü ikincil metin: açık mavi üstünde `rgba(22,24,28,.6)`, mürekkep üstünde `rgba(255,255,255,.65)`.

### Named Rules
**Renk Tek Başına Konuşmaz.** Durum her zaman kelimeyle de yazılır (ÖDENDİ / BEKLİYOR). Renk yalnızca destekler.

**Dolgu Kuralı.** Açık mavi ve açık kırmızı asla metin ya da ikon rengi olarak kullanılmaz; yalnızca arka plan ve ince renk çizgisi.

## Typography

**Font:** Plus Jakarta Sans (400/500/600/700/800), `@expo-google-fonts/plus-jakarta-sans`.
React Native'de ağırlık `fontWeight` ile değil, ağırlığa özel `fontFamily` ile seçilir (`fontFamily.bold` vb.).

**Character:** Geometrik, sıcak ve sessiz; başlıklar 800 ağırlıkta sıkı, gövde 500'de rahat.

### Hierarchy
- **Ekran başlığı** (800, 26px, 1.1, −0.025em): ekran üstü başlık ("Eylül 2026").
- **Bölüm başlığı** (800, 17px): "Bugün · 10 Eylül".
- **Saat** (800, 15px): ders satırında saat.
- **Buton** (700, 15px): birincil buton etiketi.
- **Satır başlığı** (700, 14.5px): kişi adı, satır başlığı.
- **Gövde** (500, 13.5px, 1.5): açıklama metni.
- **Bağlantı** (700, 12px, gri 600): "Günü düzenle ›".
- **Yardımcı** (500, 12px, gri 600): alt satırlar, başlık altı özet.
- **Rozet** (700, 10.5px, +0.06em, BÜYÜK HARF).
- **Meta** (500, 10.5px, gri 600): süre ("60 dk"), sekme etiketi (aktifken 700 + mürekkep).
- **Gün etiketi** (500, 10px): PZT, SAL …

## Layout

Hedef ekran 390×844 (iOS). Ekran yatay boşluğu 24px, ekran başlığı 26px. Dikey ritim: başlık → gün şeridi 18px, satırlar arası 12px, gün hücreleri arası 6px. Birincil buton ekranın altında, tab bar'ın hemen üstünde, tam genişlikte (başparmak bölgesi). Alt tab bar üç sekme: Takvim · Kişiler · Hesabım.

## Elevation & Depth

Düz sistem: gölge kullanılmaz. Derinlik, beyaz zemin üstündeki gri 100 dolgularla (tonal katman) ve tab bar'daki ince ayırıcıyla verilir.

**Düz Varsayılan Kuralı.** Yeni bir yüzey ayrışacaksa önce gri dolgu, sonra ayırıcı çizgi düşünülür; gölge eklenmez.

## Shapes

- Renk çizgisi 2px, ikon butonu 16px, gün hücresi ve birincil buton 20px, ders satırı 22px, rozet tam kapsül (999px).
- Köşeli (≤8px) yüzey yoktur; form dili "oval ama okunur".

## Components

- **Button** (`Button`): 56px yükseklik, 20px köşe, mürekkep dolgu, beyaz 700/15 etiket. Pasif: gri 100 dolgu, gri 600 etiket.
- **Badge** (`Badge`, `tone: info | alert`): açık mavi / açık kırmızı kapsül, mürekkep 700/10.5 BÜYÜK HARF, 6×11px dolgu.
- **IconButton** (`IconButton`): 42px kare, 16px köşe, gri 100 dolgu, 21px Heroicons çizgi ikon.
- **WeekStrip / DayChip**: eşit genişlikte hücreler, 6px aralık, 20px köşe. Sıradan gün gri 100; dersi olan gün açık mavi; seçili gün mürekkep dolgu + beyaz rakam.
- **LessonRow**: gri 100 dolgu, 22px köşe, 16/18px dolgu, 14px iç aralık. Sol uçta 3px renk çizgisi (varsayılan mürekkep, dikkat gerektiğinde açık kırmızı) → saat/süre → başlık/alt satır → rozet.
- **ScreenHeader**: ekran başlığı + yardımcı satır, sağda isteğe bağlı ikon butonu.
- **SectionHeader**: bölüm başlığı, sağda gri bağlantı ("… ›").
- **TabBar**: beyaz zemin, üstte ayırıcı; aktif sekme dolu (solid) ikon + 700 mürekkep etiket, pasif sekme çizgi (outline) ikon %60 opak + 500 gri etiket.
- **Dokunma geri bildirimi** (`PressableScale`): basılıyken ölçek 0.97, opaklık 0.85. Tüm dokunulabilir yüzeyler bunu kullanır.

İkonlar: Heroicons 2 (`react-native-heroicons`) — aktif durumda `solid`, diğer durumlarda `outline`.

## Do's and Don'ts

- **Do** durum renklerini yalnızca dolgu olarak kullan, metni mürekkepte tut.
- **Do** rozet metnini kelimeyle yaz; renge güvenme.
- **Do** yeni bileşende önce mevcut token'ları kullan; yeni değer gerekiyorsa `tokens.ts` ve bu dosyaya birlikte ekle.
- **Don't** doygun mavi (#2f4bd1 gibi eski taslak rengi) ya da doygun kırmızı kullanma.
- **Don't** gölge ekleme; ayrışmayı gri dolguyla sağla.
- **Don't** `fontWeight` ile ağırlık verme; ağırlığa özel `fontFamily` kullan.

## Henüz karara bağlanmayanlar

Claude Design'daki kapsam listesinde olan ama tasarımı henüz yapılmamış konular; tahmin edilmeden, tasarlandıkça bu dosyaya eklenecek:

- Input / form alanları
- Takvim ve müsaitlik renk mantığının saat ızgarası hali (hafta görünümü V2'deki ince renkli çizgiler dahil)
- Boş durum, yükleniyor, hata halleri
- Koyu tema
- Hareket ve geçiş kuralları (dokunma geri bildirimi dışında)
- Metin ve dil rehberi
