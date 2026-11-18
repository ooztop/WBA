# Devir notu (yeni oturumda önce bunu oku)

Son güncelleme: 18 Kasım 2026

## Kullanıcı ve proje
- Kullanıcı Türkçe konuşuyor; açıklamaları sade Türkçe ile yap.
- **Pro App:** serbest çalışan uzmanlar (psikolog, PT, diyetisyen, eğitmen) için uygulama. Arayüz Türkçe.
  Kurum ve Mekân ekranları kapsam dışı.
- Mobil: React Native (Expo). Web paneli ayrıca prototip olarak var. Tanıtım sitesi sonra yapılacak.
- Backend'i **Emre** yazıyor: `EmreTuygan/WBA` reposu, `backend/` (Express + Prisma).

## Dallar
- **`main`: bütün güncel iş burada. Bundan sonra burada çalış.**
  Kullanıcıdan GitHub'da `main`'i varsayılan dal yapması istendi (17 Kasım).
  Oturum kendine `claude/...` adlı bir dal açsa da iş `main`'e işlenip gönderilir; o dallar eski kalır.
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
- Web: "Pro App - Web Paneli v3" (`project/Pro App - Web Paneli v3.dc.html`).
  Repodaki `prototip/web-v3.dc.html` bundan **farklı**; web'e dönülünce artifact'teki sürüm esas alınır.
- Diğer sayfalar (Final, Web Paneli v1/v2, Eski Tasarım, Eski Kurum Ekranları) eski hâller; sadece referans.
  Kullanıcı bazen bunlardan örnek gösterir: Kişiler harf dizini "Pro App - Final"den alındı (18 Kasım).
- Ortak Tasarım, v4'ten farklı olarak Manrope yazı tipini ve 3 vurgu rengini (Pro mavisi / Turuncu / Mor) kullanıyor.
  Koddaki karşılığı `pro-app-ortak-tasarim/src/theme.ts`.

**Eşitleme durumu:** Uygulamadaki bütün tasarım değişiklikleri Wellness'a işlendi; son sürüm 78 (18 Kasım, Ödeme al ve Ödemeler).
18 Kasım'da iki mobil sayfanın repodaki kopyalarla birebir aynı olduğu doğrulandı.
Sürüm geçmişi: 74 (17 Kasım tasarım turu), 75 (mavi çipler, paket vurguları), 77 (bildirimler, harf dizini, Hesabım, Takvim ayarlarım), 78 (Ödeme al, Ödemeler).

Prototip ile uygulama arasındaki bilinen farklar:
- Ders detayı örneği gelecekteki bir ders (10 Eylül Perşembe). Tuvalde ayrıca "29b Geçmiş ders" çizimi var: yalnızca "Ödeme al".
- "Takvimden seç" prototipte yalnızca uyarı gösterir; tarih/saat seçici yalnızca uygulamada var.
- Ödeme sonucu ekranı (40) prototipte sabit örnek gösterir.

Tuvalin çalışma ortamı (support.js) bu bulut ortamında unpkg.com'a erişemediği için yerelde renksiz görünür.
Kontrol için `<script src="./support.js">` satırı çıkarılmış bir kopya açılıp düzen kontrol edilebilir.

## Tıklanabilir önizleme: "Pro App Önizleme" artifact'i
**https://claude.ai/artifact/K2nhCwHFhxXKNP6jfkxu47**
- Kullanıcı uygulamayı burada deniyor. Bulut ortamında iOS simülatörü yok; önizleme paneli de kullanıcının uygulamasında görünmüyor.
- `pro-app-ortak-tasarim`'in web sürümü, tek HTML dosyasına paketlenmiş hâli.
- Her tasarım değişikliğinden sonra güncellenir. Adımlar (`pro-app-ortak-tasarim` klasöründe):
  1. `npx expo export --platform web --output-dir <geçici klasör>`
  2. `node scripts/onizleme.js <geçici klasör> <çıktı.html>`
  3. Çıktıyı Artifact aracıyla bu URL'ye yayınla (`url` + `file_path`).
- Değişikliği göstermeden önce Playwright ile ekran görüntüsü alıp kontrol et, kullanıcıya görüntüyü gönder.

Diğer artifact'ler (claude.ai, yardımcı):
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
- **17 Kas · tasarım turu** (kullanıcıyla ekran ekran, önizlemede denenerek):
  - **Ders iptal ekranı:** Sebep ve ödeme/paket tek kartta satır olarak; mesaj altta, isteğe bağlı.
    Üstte mat pembe "İptal edilecek ders" kutusu (`C.dangerSoft`); altta dolu kırmızı, beyaz yazılı düğme (`Btn k="xf"`).
  - **İptal kuralları** (`src/data/cancelPolicy.ts`, testli):
    - Sebepler: Ben iptal ediyorum, Kişi gelemiyor, Hava / mekân ("Diğer" kullanıcı isteğiyle kaldırıldı).
    - Paketli ders: Pakete geri ekle / Paketten düş.
    - Paketsiz, ödenmiş ders: İade et / İade etme / Ücretsiz ders ver.
    - Paketsiz, ödenmemiş ders: Ücret alınmasın / Ücret alınsın.
    - "Kişi gelemiyor" + ücretsiz iptal süresi (Ders kuralları `rule.1`) geçmişse varsayılan kişinin aleyhine
      (Paketten düş / İade etme / Ücret alınsın) ve "Ücretsiz iptal süresi geçti" notu. Uzman yine istediğini seçebilir.
  - **Ders detayı:** Başlamış (geçmiş ya da devam eden) derste İptal et / Dersi ertele yok (`lessonStarted`).
    Ödenmemişse tek bir "Ödeme al", ödenmişse alt düğme yok.
  - **Alt düğme çubuğu (`Foot`):** Beyaz zemin ve üst çizgi kaldırıldı.
  - **Erteleme ekranı:**
    - Eski/Yeni kutusu duruyor. Yeni tarihte ay da yazıyor; ok eski tarihin hemen yanında.
    - Günler kutusuz şerit (takvimin hafta şeridi gibi), saatler çerçevesiz açık gri çipler.
    - "Takvimden seç" başlığın sağında, vurgu mavisinde. Tarih, ardından saat seçici açar.
      Seçim şeride ve saatlere yerleşir (`src/data/reschedule.ts`, testli); geçmiş saat seçilemez.
    - Kullanıcı tek liste / kart düzenli bir taslağı beğenmedi; bu ekranın genel düzeni korunmalı.
  - **Kişiler listesi:** Sağdaki Üye / Tek ders / Paket etiketleri kaldırıldı.
  - **Demo verisi:** Perşembe 10 Eylül dersleri ödenmiş; o günün ilk dersi (Can, 12:00) paketli.
    Erteleme şeridindeki gün adları düzeltildi; Pazar (kapalı) listeden çıktı.
  - Paket tercihleri vurguları ve seçili çiplerin mavi olması ("Verilen kararlar"da).
  - **Alt düğme alanı yüzüyor** (`FloatFoot`, prototipteki gibi): içerik altından akıp silikleşir, en altta kesilmez.
- **18 Kas:**
  - Çakışan rezervasyon talebi uygulamadan ve veriden kaldırıldı.
  - **Bildirimler yeniden yapıldı** (ayrıntı "Verilen kararlar"da). Bildirimler ve birden çok talep veri katmanına taşındı.
    "Paket bitmek üzere" turuncu: temaya uyarı rengi `warn` / `warnTint`, etiket türü `w`.
  - **Kişiler:** harf dizini Final'deki gibi (tam alfabe, liste alanında dikey ortada, 10 pt, vurgu mavisi).
  - **Hesabım:** satır sağındaki değerler ("10:00 – 18:00", "4 paket") mavi.
  - **Takvim ayarlarım:** mola "+" düğmesi mavi; varsayılandan farklı gün (Cmt) mavi, "Özel" etiketi yok;
    çalışma saatleri saat seçiciyle (`PickBox` ortak bileşen), başlangıç bitişten önce olmalı.
  - **Ödeme al:** açıldığı ders seçili gelir, kişinin diğer borç dersleri seçimsiz altında; fiyat Paket tercihlerindeki
    tek ders fiyatından (`src/data/price.ts`, testli). "Alınan tutar" kutusu yerine "Tutarı değiştir"; eksikse "₺X borç olarak kalır",
    eksik ödemede borç ve dersler olduğu gibi kalır. Ödenen ders takvimde "Ödendi" olur. Ödemeler ekranındaki "+" kaldırıldı.
  - **Ödemeler:** ay seçici sağ üstte ince çerçeveli "Eylül 2026 ⌄" düğmesi, dokununca ay listesi (kapsüllü ve oklu hâller beğenilmedi).
    Liste henüz aya göre süzülmüyor (demo verisi aylara ayrılmamış).
  - 18 Kasım'daki her şey Wellness'a işlendi (sürüm 77 ve 78).

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
- Testler: `npm test` ile 115 test geçiyor; `npx tsc --noEmit` temiz.
- Uygulamanın "şimdi"si demo için sabit: 9 Eylül 2026, 12:36 (`TODAY`, `NOW_H`; `src/data/mock/lessonGen.ts`).
  API'ye geçince gerçek saate bağlanmalı.

Kullanıcıya sorulmuş, cevabı beklenen tasarım soruları:
- Üyelik (Aylık üyelik) derslerinin iptalinde ne çıksın? Şu an paketsiz tek ders gibi davranıyor.
- Kişiler listesinde isim altındaki "Tam zamanlı üyelik" / "8 derslik paket · 2 kaldı" yazıları ve "Üyeler" filtresi kalsın mı?
- Ders detayındaki "Kadıköy stüdyo ↗" gibi bağlantılar da koyu lacivert yerine vurgu mavisi olsun mu?
- Henüz yapılmamış derslerde demo ders notu ("Türev konusunu bitirdik…") dolu geliyor; kaldırılsın mı?
- Kişiler listesi Final'deki gibi renkli avatarlı (mavi / mor / yeşil / turuncu) ve düz satırlı olsun mu? (Şimdilik yalnız harf dizini alındı.)
- Sağında gri değer yazısı olan diğer satırlar da (iptal ekranındaki Sebep vb.) Hesabım'daki gibi mavi olsun mu?
- Takvim ayarlarım için önerilen ama seçilmeyenler: yaklaşan izin günlerinin listesi (izinler şu an görülemiyor / silinemiyor)
  ve aynı saatli günlerin tek satırda toplanması. Kullanıcı yalnız saat seçiciyi istedi; bunlar sonraya kalabilir.

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
- Tasarım değişikliklerinde çalışma şekli: önce ekran görüntüsü, belirsizse kısa soru, gerekirse 2 taslak yan yana;
  seçilen uygulanır, test edilir, `main`'e gönderilir ve önizleme güncellenir. Taslak kod commit edilmez.
- Kırmızı yalnızca iptal / silme gibi geri dönüşsüz işler için; erteleme gri / mavi kalır.
- **Seçili çipler vurgu mavisinde** (`Chip`, `PChips` ✎ özel değer, erteleme saat çipleri), bütün uygulamada.
  Gün seçimleri (takvim, tarih seçici, erteleme şeridi, mola günleri `DC`) ve onay kutuları siyah kalır:
  takvimde "seçili gün siyah, bugün mavi" kararı var. (v4 kuralı "Seçili çip mavi" ile de uyumlu.)
  İstisna: paket panelindeki Seans sayısı, Ders/Seans süresi ve Geçerlilik çipleri siyah (`PChips dark`).
- Bölüm başlıkları (`GrpS`) gri kalır; tek ekranda mavi denendi, beğenilmedi (tutarsız ve "dokunulabilir" gibi duruyor).
- Paket tercihleri: paket kutucukları açık mavi, temel paket dolu mavi ve fiyatı mavi.
- Ders kurallarına ikon kutusu eklenmesi denendi, istenmedi.
- Takvim ayarlarım: açıklama yazıları ("Her gün için varsayılan…", "Özel ayar için güne dokun") ve mola satırları
  olduğu gibi kalsın (sadeleştirme taslağı istenmedi); saat seçicinin altındaki "Dersler tam saatte başlar" yazısı da kalsın.
- Hesabım satırlarının sağındaki değerler mavi.
- Turuncu yalnız uyarı için (şimdilik "Paket bitmek üzere"); kırmızı ödeme bekleniyor / iptal.
- **Çakışan rezervasyon talebi yok** (kullanıcı kararı, 18 Kasım): uygulamadan ve veriden kaldırıldı.
- **Bildirimler (18 Kasım):**
  - Talepler: en acil (yanıt için en az süre kalan) büyük kart; diğerleri kaydırmalı satır (sağa: onayla, sola: reddet; `SwipeAct`, paket satırlarıyla aynı). Birden çok talep (`Req[]`).
  - Filtre çipleri (Tümü · Talepler · Ödemeler · İptaller). İstenmeyenler: ikon köşesindeki okunmadı noktası, "Tümünü okundu say", kaydırma ipucu notu, sağdaki durum etiketleri (İptal, Yenile, Ödendi…); sağda yalnız zaman.
  - Aynı gün grubunda aynı türden 2+ bildirim tek kart ("3 ödeme alındı"); dokununca kişiler aynı kartın içinde sade satırlar olarak açılır (ayrı kartlar istenmedi).
  - Okunmuş bilgi bildirimleri kapalı "Görülenler"e iner; işlem bekleyenler (ödeme bekleniyor, paket bitmek üzere) ve talepler hiç gizlenmez.
  - Önceliğe göre ayrıştırma yok; liste tarihe göre (Bugün, Dün, Bu hafta, Daha önce).
  - Kurallar `src/data/notifs.ts` (testli); sekme rozeti = bekleyen talep + okunmamış bildirim.
  - Wellness'a işlendi (sürüm 77): prototipte filtreler, grup aç/kapa, Görülenler ve kaydırmalı talep satırları çalışır.
