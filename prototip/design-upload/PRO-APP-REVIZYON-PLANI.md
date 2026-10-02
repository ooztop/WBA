# Pro App · Ekran revizyonu planı (v2 · 30 Eylül 2026)

Kişiler ekranında birlikte yaptığımız düzeltmelerden çıkan kurallar, henüz birlikte elden geçirmediğimiz ekranlar ve her biri için yapılacak değişiklikler.
Prototip: `prototip/app.html` (http://localhost:8095/app.html).
Claude Design'daki "Başlangıç 2" ve diğer dosyalar **kontrol noktası**: dokunulmaz.

## 1. Kilitli ekranlar (dokunulmayacak)

- Takvim (gün / hafta / ay, + menüsü, alt bar)
- Kişiler listesi
- Yeni kişi paneli
- Kişi detayı
- Kişiyi düzenle paneli

## 2. Kişiler'den çıkan kurallar

1. **Ölçüler küçük.** Sekme başlığı 28. Kişi/ekran başlığı 19. Satır başlığı 14–15, alt yazı 12–12.5. Buton 44 (tek ana buton 48). Avatar 36–54. Büyük rakam en fazla 28–32.
2. **Kalınlık ölçülü.** İsim 600. Kutu başlığı, buton ve sekme ≈570. Alan içi ≈470. 700 sadece sekme başlığında.
3. **Başlık hizası.** Sekme başlığı top 33'te (Bugün / Kişiler hizası), üstünde küçük etiket yok. Sağ üst işlem 36 px yuvarlak ve başlığın karşısında.
4. **Üst gezinme yuvarlak.** İç sayfada ‹ geri (+ gerekirse kalem vb.), panelde ✕ ve mavi ✓. "Geri / Vazgeç / Kaydet / Tümünü oku" gibi yazılı buton yok.
5. **Rozet / etiket yok.** ÖDENDİ, ALINMADI, PRO, DOĞRULANDI, YANIT İÇİN 22 SAAT gibi hapların hepsi gider. Gerekirse tek bilgi sağda düz yazı olur (kırmızı tutar gibi).
6. **Dersler kutucukta.** İnce çerçeve, solda tür rengi çizgi (`lbox`). Gruplar "Bu hafta / Eylül" gibi başlıklarla.
7. **Formlar.** İnce çerçeveli 44 px alanlar, küçük etiket. Anahtar ve seçenekler ince çerçeveli kutuda (`obox`). Aralıklar ferah (`data-roomy`).
8. **Ana işlem altta.** Yan yana: çerçeveli ikincil + mavi ana. Tehlikeli işlem açık kırmızı. Başlıkta ✓ varsa altta ayrıca buton yok.
9. **Gri kutu kalabalığı yok.** Rakamlar küçük `stats` kutusunda. Hızlı işlemler öğeye dokununca açılan menüde. Renkli uyarı kutuları sadeleşir.
10. **Eski tasarımdan sadece fikir alınır.** Görünüm kopyalanmaz.

## 3. Önce ortak parçalar (Adım 0)

Bunlar birçok ekranda kullanılıyor. Bir kere düzeltince hepsi düzelir.

| Parça | Şimdi | Olacak |
|---|---|---|
| Sekme başlığı (`rhead`) | Üstte küçük etiket, sağda yazılı kare buton | Kişiler başlığıyla birebir aynı: top 33, alt satır gri, sağda 36 px yuvarlak ikon |
| Sonuç ekranı (`result`) | 76 px renkli daire, 24/700 başlık, renkli ikonlu liste, "X" yazısı | Sağ üstte yuvarlak ✕. 52 px sade ikon, 20/600 başlık, kısa gri açıklama. Alt maddeler ikonsuz ince liste. Alt butonlar `bpair` |
| Uyarı kutusu (`box`) | Renkli dolu zemin + ikon + kalın başlık | İnce çerçeveli kutu, solda ince renk çizgisi (lbox dili), tek cümle |
| Gri kart (`card`) | Gri dolu kutu | İnce çerçeveli kutu, zemin beyaz |
| Form içi anahtar satırı | İkonlu `row` + toggle | `obox` (Yeni kişi'deki gibi) |
| Renkli ikon kareleri (`.ic`) | Mavi/kırmızı/sarı dolu kareler | Ayar listelerinde sade gri ikon, renk yok. Kırmızı sadece "Çıkış yap / Hesabı sil" yazısında |
| Onay ve menü açılır pencereleri | — | **Şimdilik dokunulmuyor** (kullanıcı kararı, 30 Eylül) |

## 4. Elden geçirilecek ekranlar (29 ekran)

### Adım 1 · Ders akışı
1. **Ders detayı**
   - Renkli dolu büyük başlık kartı kalkar. Yerine tür çizgili çerçeveli kutu gelir: isim 19/600, altında tarih · saat · süre.
   - "HER HAFTA TEKRARLANIR" rozeti silinir, tekrar bilgisi alt satıra yazılır.
   - Ödeme satırındaki ÖDENDİ / ALINMADI rozetleri silinir.
   - Ücret, konum ve ödeme küçük `stats` kutularına alınır. Ödenmediyse tutar kırmızı yazılır.
   - Kişi satırı kalır; dokununca kişi detayı açılır.
   - Ders notu çerçeveli yazı alanı olur.
   - Alt: `bpair` Ertele (çerçeveli) + İptal et (açık kırmızı). Ödeme alınmadıysa ücret kutusuna dokununca Ödeme al açılır.
2. **Dersi ertele**
   - "ŞU ANKİ SAAT → YENİ SAAT" gri kartı kalkar. Yerine iki küçük çerçeveli kutu gelir.
   - Müsait saat listesi sade kalır. "Takvimden başka saat seç" mavi satır olarak durur.
   - "Kişiye bildir" `obox` olur. Uzun açıklama tek satıra iner.
   - Alt: tek mavi "Ertelemeyi onayla".
3. **Dersi iptal et**
   - Büyük kırmızı uyarı kutusu tek satırlık sade uyarıya iner.
   - Sebep çipleri küçük (`chips sm`). Mesaj alanı ince çerçeveli.
   - Ödeme ve paket hakkı küçük `stats` olur.
   - "İptali onaylıyorum" anahtarı silinir; butona basınca onay penceresi açılır.
   - Alt: açık kırmızı "Dersi iptal et".
4. **Ders iptal edildi:** Yeni sonuç ekranı şablonu. Alt: Yeni saat öner (çerçeveli) + Takvime dön (mavi).
5. **Yeni ders paneli**
   - Alttaki "Dersi oluştur" butonu silinir (başlıkta ✓ var).
   - Kişi seçimi avatarlı çip sırası yerine tek 44 px alan olur ("Kişi seç ›"); seçilince isim yazar.
   - Süre, tür, konum ve tekrar küçük çiplerle gösterilir. "Süre" etiketi form etiket stiline (12.5/500) iner.
   - Ücret bölümü sadeleşir: Paket / Manuel seçimi + tek satır bilgi.
   - "Kişiye bildirim gönder" `obox` olur. Aralıklar ferah.
6. **Ara ekle paneli** (Müsaitliği kapat)
   - Alttaki "Molayı ekle" butonu silinir.
   - Sarı uyarı kutusu yeni sade uyarıya iner. İki anahtar `obox` olur.
   - "Hızlı süre" etiketi form etiketine iner.

### Adım 2 · Ödeme
7. **Ödeme al**
   - 42/700 tutar yaklaşık 30/600'e iner. "6 GÜN GECİKMİŞ" rozeti yerine gri yazı gelir.
   - Borçlu dersler seçilebilir tür çizgili kutular olur.
   - Yöntem listesi sade kalır. Tutar alanı + "Kısmi" küçük çip.
   - "Makbuz gönder" `obox` olur. Alt: mavi "Ödemeyi kaydet".
8. **Ödeme alındı:** Sonuç şablonu, tek mavi "Tamam".

### Adım 3 · Bildirimler
9. **Bildirimler sekmesi**
   - Üstteki "Bugün 3 yeni" etiketi silinir. Başlık Kişiler hizasına gelir.
   - "Tümünü oku" yazılı butonu yuvarlak ikon butonu olur (✓✓).
   - Renkli ikon kareleri silinir. Satırda kişi avatarı (kişi yoksa gri ikon) + tek satır başlık + kısa alt satır, sağda zaman.
   - Okunmamış satırı ayırmak için küçük mavi nokta önerisi (soru aşağıda).
10. **Rezervasyon talebi**
    - Başlık kişi detayıyla aynı düzende: 54 avatar, isim 19/600, altında gri "22 saat içinde yanıtla". Rozet kalkar.
    - İstenen ders tür çizgili kutuda gösterilir. Ücret ve ön ödeme küçük `stats` olur.
    - Kişinin notu çerçeveli kutuda.
    - Alt: 3 buton yerine `bpair` Reddet (çerçeveli) + Onayla (mavi). "Başka saat öner" sağ üstteki yuvarlak ⋯ menüye taşınır.
11. **Rezervasyon talebi · çakışmalı**
    - Sarı dolu kutu kalkar. Yerine "Bu saatte başka dersin var" başlığı altında çakışan ders turuncu çizgili kutuda gösterilir.
    - "En yakın müsait saat" mavi satır olarak durur. Mavi buton "Yine de onayla" olur.
12. **Rezervasyon onaylandı:** Sonuç şablonu.

### Adım 4 · Hesabım
13. **Hesabım sekmesi**
    - "Pro üyelik" üst etiketi silinir. Sağ üst yuvarlak buton kalem olur (Hesabı düzenle); Yardım listede zaten var.
    - Profil satırı: 62 avatar → 54, isim 19/600, PRO rozeti silinir.
    - "Ödeme takibi" gri kartı (26/700 rakamlar) küçük `stats` kutularına döner (tahsil edilen / bekleyen); dokununca Ödemeler açılır.
    - QR kartı ve üç çipi tek satıra iner: "Profilini paylaş" (QR ikonu), dokununca paylaş ekranı açılır.
    - Ayar satırlarında ikonlar sade gri olur, sağda tek değer kalır.
    - Çıkış yap: ikon karesiz, kırmızı yazı.
14. **Hesabı düzenle paneli**
    - Kişiyi düzenle paneliyle aynı düzen: solda 54 avatar, yanında mavi "Fotoğrafı değiştir".
    - Telefondaki DOĞRULANDI rozeti alanın içinde küçük yeşil tik olur.
    - "Profil herkese açık" `obox` olur.
    - En alta açık kırmızı "Hesabı sil" butonu gelir (Kişiyi düzenle'deki gibi).
15. **Ödemeler**
    - Ay seçici küçülür: iki yuvarlak ‹ › buton, ortada 15/570 ay adı.
    - Listedeki "-₺1.500" rozeti sağda kırmızı düz yazıya döner. Alt satırlar kısalır. Açıklama notu silinir.
    - "Elle ödeme kaydet" alt butonu sağ üste yuvarlak + olarak taşınır.
16. **Profilini paylaş**
    - Avatar 54, isim 19/600. QR gölgesiz, ince çerçeveli kutuda, biraz küçülür.
    - Alt: `bpair` NFC ile paylaş (çerçeveli) + Bağlantıyı kopyala (mavi).

### Adım 5 · Ayarlar
17. **Takvim ayarlarım:** Uzun bölüm başlıkları kısalır ("Çalışma saatleri"). Mola satırları ikonsuz olur. Apple Takvim senkronu `obox` olur.
18. **Gün kuralı:** "Bu gün çalışıyorum" `obox` olur. Çipler küçülür. Mavi dolu saat çipleri ince çerçeveli sade çiplere döner.
19. **Düzenli mola paneli:** Anahtar `obox` olur. Notlar tek satıra iner.
20. **İzin / kapalı gün**
    - Alttaki "İzni kaydet" butonu sağ üste ✓ olarak taşınır (Gün kuralı gibi).
    - Sarı kutu sade uyarı olur. Etkilenen dersler tür çizgili kutularda listelenir.
21. **Ders kuralları:** 20/700 değer 15/570'e iner. Açıklamalar kısalır. Kaydırıcı sade kalır.
22. **Paket tercihleri**
    - Satırlar iki satıra iner (ad + tek bilgi). Fiyat 570 olur.
    - Yıldız yerine "Temel paket" seçimi paket panelinin içine taşınır.
    - "Yeni paket ekle" sağ üste yuvarlak + olur.
23. **Tekil ders paneli:** Gri "takvimde 90 dk" görseli sade ince çubuğa iner (700 → 500). Kural satırları sadeleşir.
24. **Çoklu paket paneli:** ± butonları yuvarlak `cbtn` olur. "8 seans" 22 → 17/600. "Peşin ödeme" `obox` olur.
25. **Bildirim ayarları:** Dört anahtar ikonsuz `obox` / sade satır olur. Sessiz saatler iki alanda kalır.
26. **Yardım:** İkonlar sade gri olur. Sık sorulanlar listesi aynı kalır.

### Adım 6 · Hesap çıkışı
27. **Çıkış onayı:** Ortak onay penceresi düzeltmesiyle birlikte gelir.
28. **Giriş**
    - 72 px mavi "Pro" logosu yaklaşık 56 px'e iner. Başlık 26/700 → 22/600.
    - Butonlar 44 px, aralıklı. Apple butonu çerçeveli.
29. **Hesabı sil → Silinmek üzere**
    - Kırmızı kutu sade uyarı olur. Silinecekler küçük `stats` olur.
    - "Önce çözülmesi gerekenler" kalır, rozetsiz.
    - "SİL yaz" alanı kalır, ikinci onay anahtarı silinir. Alt: açık kırmızı "Hesabımı sil".
    - Silinmek üzere ekranı yeni sonuç şablonunu kullanır.

### Adım 7 · Kapanış
- Tasarım Sistemi v2 sayfası bu kurallarla güncellenir. Design'a **yeni isimle** yüklenir (Başlangıç 2 kontrol noktası olarak kalır).

## 5. Çalışma şekli
- Her adım: uygula → localhost'ta 420×880 test et → kısa özet → sen bakıp onaylarsın → sonraki adım.
- Kilitli ekranların koduna dokunulmaz. Ortak parça değişikliği kilitli ekranı etkiliyorsa önce sorulur.
- Kişiler'deki `.row`, `.lbox`, `.obox`, `stats` stilleri değiştirilmez; yeni ekranlar bunları kullanır.

## 6. Kapsam dışı
- Kurum ve Mekân ekranları. Boş hâller ve "bağlantı yok" ekranları.

## 7. Durum (30 Eylül 2026)
- Adım 0–6 tek seferde uygulandı: kilitsiz 29 ekranın hepsi yeni kurallarla yeniden yazıldı. Onay ve menü pencerelerine dokunulmadı.
- Sıradaki: kullanıcı ekranları tek tek inceleyip geri bildirim verecek. Onaylanan ekran "Kilitli" listesine eklenecek.
- Yedek (bu turdan önceki hâl): scratchpad `app.before-adim0.html`. GitHub'a henüz kaydedilmedi.

### Sonra dönülecek (kullanıcı beğenmedi, 30 Eylül)
- Takvim ayarlarım (son hâli: eski Design düzeni — varsayılan saatler, molalar, günler listesi, kademe/ara).
- Tekil ders paneli (son hâli: eski Design düzeni + bizim ödeme kutuları; ödeme yöntemi kutuları BEĞENİLDİ, korunacak).

### Onaylananlar (bu turda)
- Hesabım: C tipi profil kartı (açık mavi zemin, avatar + isim + kalem ikonu, QR + Bağlantıyı kopyala + NFC), ⋯ menüsü (Yardım, Çıkış), ikonlar mavi.
- Bildirimler: sağ üstte ⚙️ → Bildirim ayarları.
- Paket tercihleri: B listesi (daire rozet, temel = mavi daire), sola kaydır = Sil, sağa kaydır = Temel, mavi başlık.
- Ders kuralları ONAYLANDI (1 Ekim): ikonlu bölümler, 3 hazır + ✎ özel değer çipi (4'lü ızgara, başlık hizasında), seçili çip mavi, not en altta sabit. Ders başlama kademesi + ders arası mola buraya taşındı.

### Durum (1 Ekim, akşam)
Bu turda kullanıcıyla tek tek elden geçenler: Hesabım, Bildirimler sekmesi, Bildirim ayarları, Yardım (sadece mavi başlık), Takvim ayarları, Gün sayfası, Düzenli mola, İzin/kapalı gün, Ders kuralları, Paket tercihleri, Tekil/Çoklu paket, Yeni ders (+Paketler, Kişi seç, Yeni paket), Ara ekle, Ders detayı, Dersi ertele, Dersi iptal et, Ödeme al, Ödeme alındı, Ödemeler, Hesabı düzenle.
Henüz tek tek bakılmayanlar: Ders iptal edildi, Rezervasyon talebi (normal + çakışmalı), Rezervasyon onaylandı, Profilini paylaş (QR), Hesabı sil → Silinmek üzere, Giriş. Onay/menü açılır pencereleri bilerek dokunulmadı.
