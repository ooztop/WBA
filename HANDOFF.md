# Devir notu (yeni oturumda önce bunu oku)

Son güncelleme: 17 Kasım 2026

## Kullanıcı ve proje
- Kullanıcı Türkçe konuşuyor; açıklamaları sade Türkçe ile yap.
- **Pro App:** serbest çalışan uzmanlar (psikolog, PT, diyetisyen, eğitmen) için uygulama. Arayüz Türkçe.
  Kurum ve Mekân ekranları kapsam dışı.
- Mobil: React Native (Expo). Web paneli ayrıca prototip olarak var. Tanıtım sitesi sonra yapılacak.
- Backend'i **Emre** yazıyor: `EmreTuygan/WBA` reposu, `backend/` (Express + Prisma).

## Dallar
- **`main`: bütün güncel iş burada. Bundan sonra burada çalış.**
  Kullanıcıdan GitHub'da `main`'i varsayılan dal yapması istendi (17 Kasım).
- `claude/pro-prototip`: `main`'in kaynağı. Artık güncellenmiyor.
- `claude/happy-ramanujan-alnfwy`: eski varsayılan dal, yalnızca skill'leri içeriyor.
- `claude/pro-design-system`: eski Expo denemesi (`apps/pro`, 28 Eylül). Kullanıcının kararıyla `main`'e alınmadı.

## Klasörler
| Yol | Ne |
|---|---|
| `pro-app-ortak-tasarim/` | **Güncel mobil uygulama** ("Ortak Tasarım", Expo). Veri katmanı burada. README'sini oku. |
| `pro-app-ortak-tasarim/src/data/README.md` | Hangi konunun hangi backend ucuna bağlanacağını gösteren tablo |
| `prototip/ortak-tasarim/` | Wellness artifact'indeki Ortak Tasarım sayfalarının kopyası: `prototip.html` (tıklanabilir) ve `ortak-tasarim.dc.html` (tuval) |
| `pro-app/` | Eski Final 2 prototipinin Expo karşılığı (16 Kasım). Ortak Tasarım bunun yerini aldı. |
| `prototip/app.html` | Mobil prototip Final 2. Durumu `prototip/DEVAM-NOTU.md`'de yazıyor. |
| `prototip/web.html` | Uzman web paneli prototipi. Durumu `prototip/WEB-DEVAM-NOTU.md`'de yazıyor. |
| `prototip/TASARIM-SISTEMI-v4.md` | Final 2'nin tasarım kuralları (Instrument Sans, mavi #2F4BD1) |
| `docs/superpowers/plans/2026-11-17-veri-katmani.md` | Veri katmanı planı. Görev 1–7 yapıldı. |
| `docs/EMRE-BACKEND-NOTU.md` | Emre'ye yazılan backend notu: istekler ve sorular |

## Asıl tasarım kaynağı: "Wellness" artifact'i
**https://claude.ai/artifact/UZCaeJcrvg4NQoAKfoaM5M**
Kullanıcı 17 Kasım'da bunu "asıl kaynağımız" olarak belirledi. Claude Design projesi 12 Kasım'da buraya taşındı.
Tasarım soruları ve değişiklikler önce buradan okunur. Repodaki `prototip/` dosyaları bu sayfaların kopyasıdır.

- Sayfa listesi artifact'te `project/compat.json` dosyasında. Sayfaları Artifact aracının `read` eylemine `path` vererek oku.
- Mobil için esas sayfalar:
  - "Pro App - Ortak Tasarım": `project/Kişiler - Ortak Tasarım.dc.html`, tuval.
    Repodaki kopyası `prototip/ortak-tasarim/ortak-tasarim.dc.html`.
  - "Pro App - Ortak Tasarım (Prototip)": `project/Pro App - Prototip.html`.
    Repodaki kopyası `prototip/ortak-tasarim/prototip.html`.
  - 17 Kasım'da ikisinin de repodaki kopyayla birebir aynı olduğu doğrulandı.
- Web: "Pro App - Web Paneli v3" (`project/Pro App - Web Paneli v3.dc.html`).
  Repodaki `prototip/web-v3.dc.html` bundan **farklı**; web'e dönülünce artifact'teki sürüm esas alınır.
- Diğer sayfalar (Final, Web Paneli v1/v2, Eski Tasarım, Eski Kurum Ekranları) eski hâller; sadece referans.
- Ortak Tasarım, v4'ten farklı olarak Manrope yazı tipini ve 3 vurgu rengini (Pro mavisi / Turuncu / Mor) kullanıyor.
  Koddaki karşılığı `pro-app-ortak-tasarim/src/theme.ts`.

Diğer artifact'ler (claude.ai, yardımcı):
- Pro App Önizleme
- Pro App
- Ortak Tasarım Sistemi Wellbeing
- Design System
- WBA Platform – Product & Backend Requirements

## Zaman çizelgesi
- **28 Eyl:** Skill'ler (`.claude/skills/`, kaynaklar `SOURCES.md`'de) ve `CLAUDE.md` eklendi.
- **29 Eyl – 4 Eki:** Mobil prototip geliştirildi: Tasarım Sistemi v3/v4, Final 1, Final 2 (kullanıcının el yazısı notlarından).
- **5 – 18 Eki:** Web paneli prototipi yapıldı (iskelet B: sol menü + ana alan + sağ detay paneli).
- **16 Kas:**
  - Final 2'nin Expo karşılığı (`pro-app/`) yazıldı.
  - Ardından Ortak Tasarım (`pro-app-ortak-tasarim/`) yazıldı: takvim (Gün/Hafta/Ay), kişiler, paketler, ödemeler, talepler, molalar, erteleme, tekrar. Veriler cihazda saklanıyor.
- **17 Kas:**
  - Veri katmanı kuruldu: modeller, mock veritabanı, konu başına servisler, önbellek, iyimser eylemler ve geri alma, testler.
  - Emre'ye backend notu yazıldı.
  - Bütün işler `main`'de toplandı.

## Mevcut durum
- Uygulama tamamen sahte (mock) veriyle çalışıyor; hiçbir konu henüz API'ye bağlı değil.
- Backend'de hazır olan uçlar:
  - çalışma saatleri (`/availability`)
  - izin günleri (`/availability/exceptions`)
  - ders kuralları (`/appointment-defaults`)
  - kişiler (`/clients`)
  - tekil ders fiyatları (`/offerings`)
- Backend'de olmayanlar: dersler API'si, ödemeler, rezervasyon talepleri, profil, isimli molalar, çoklu paket ve üyelik, giriş ve yetki.
- Backend notu (`docs/EMRE-BACKEND-NOTU.md`) Emre'ye gönderildi (17 Kasım). Cevabı henüz yok; yeni oturumda kullanıcıya sor.

## Sıradaki adımlar
1. **API'ye bağlama (Plan 2).** Plan dosyasının sonundaki "kapsam dışı" bölümünde yazıyor.
   - Önce `src/data/api.ts` (`apiFetch`) yazılır.
   - Sonra hazır olan uçlar için adaptörler yazılır: availability, exceptions, appointment-defaults, clients, offerings.
   - Ardından `src/data/source.ts`'te o konular `'api'` yapılır.
   - Ön koşullar:
     - `EmreTuygan/WBA` reposuna erişim (`add_repo`)
     - backend'in bu ortamda Docker ile ayağa kaldırılıp uçların denenmesi
2. **Repo birleştirme kararı:** yeni tasarım, Emre'nin reposundaki `mobile/` klasörünün yerine mi geçecek, yanına mı eklenecek? Bu karar Emre ile verilecek.
3. **Final 2 notlarından açık kalanlar** (`prototip/DEVAM-NOTU.md`): güne özel ders kuralları ile genel kurallar arasındaki çelişki ve düzenli molada başlangıç/bitiş tarihi.
4. **Tanıtım sitesi:** henüz başlanmadı.

## Verilen kararlar
- Skill'ler yalnızca orijinal GitHub depolarından alındı; TikTok'taki "DM us" paketleri kullanılmadı.
- Claude-Mem, Observer, UI/UX Pro Max, Brandkit kurulmadı. Hafıza için `CLAUDE.md` ve bu dosya kullanılıyor.
- Takvimde haftanın ilk günü Pazartesi (`0 = Pazartesi … 6 = Pazar`).
- Web panelinde yalnızca Hafta ve Ay görünümü var; ‹ › ve "Bugün" gezinme düğmeleri yok.
- Kullanıcı kalabalık ve büyük arayüz sevmiyor; açıklama yazısı ve bilgi notu az olmalı.
