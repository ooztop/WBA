# Pro App · Web devam notu (web konuşmasında önce bunu oku)

Son güncelleme: 5 Ekim 2026

## Proje
Pro App: serbest çalışan uzmanlar (psikolog, PT, diyetisyen, eğitmen) için uygulama. Arayüz Türkçe. Kullanıcıyla sade Türkçe konuşulur.
Mobil uygulama ayrı bir konuşmada yürüyor ve **onay almış durumda (Final 2)**. Bu not **web** tarafı içindir.

## Web'de ne yapılacak
1. **Uzman web paneli** — mobil uygulamanın masaüstü hâli (şu an üzerinde çalışılan).
2. **Tanıtım sitesi** — sonra yapılacak.
Kişilerin rezervasyon yaptığı sayfa henüz konuşulmadı.

## Dosyalar
| Dosya | Ne |
|---|---|
| `prototip/web.html` | **Web paneli prototipi** (tek dosya, vanilla JS) — bu konuşmada düzenlenen dosya |
| `prototip/app.html` | Mobil prototip (Final 2) — **web konuşmasında dokunma**, sadece referans |
| `prototip/TASARIM-SISTEMI-v4.md` | Tasarım dili (mobil için yazıldı, web de aynı dili kullanır) — önce oku |
| `prototip/DEVAM-NOTU.md` | Mobil devam notu (referans) |

Sunucu: Terminal panelinde `cd prototip && python3 -m http.server 8095` (arka plan görevleri 10 dk'da kapanıyor, bu yüzden terminal sekmesinde çalıştır). Adres: http://localhost:8095/web.html. Kullanıcı kendisi bakar.

## Tasarım dili (özet — ayrıntı TASARIM-SISTEMI-v4.md)
- Instrument Sans; tek vurgu mavi #2F4BD1 (koyu #7B8FF0); zemin beyaz; açık mavi #F2F4FF kartlar/ikon kareleri.
- Kırmızı sadece borç/iptal/ret/silme. Yeşil başarı rengi yok.
- Sayfa/panel başlıkları mavi; + butonları mavi.
- İkonlu bölüm: açık mavi kare + mavi ikon, başlık 15/570 + gri açıklama, bölümler arası ince çizgi.
- Seçili çip mavi; 3 hazır + ✎ özel değer. Değer satırı: silik gri değer + mavi ok. Anahtar 42×25.
- Nakit/Havale/Kart kutu dili; açılır bölüm (Ders kuralları/Tekrar) açık mavi alanla.
- Ders türü renkleri: Bireysel mavi, Grup mor #8A3FD1, Online yeşil #12A06B, Deneme turuncu #F07A1A (sadece takvim blokları için).
- Açıklama yazısı/bilgi notu az; kullanıcı "kalabalık/büyük" sevmez.

## Web paneli: alınan kararlar
- **İskelet B**: sol menü (Takvim, Kişiler, Ödemeler, Bildirimler 2 rozet, Ayarlar; altta profil kartı + Koyu tema) + ana alan + **sağ detay paneli** (mobildeki alttan açılan panellerin karşılığı; tıklanan şey sayfa değişmeden sağda açılır).
- Sağ panel Takvim'de varsayılan olarak "Bugün" özeti (bugünkü dersler, bekleyen talepler, bekleyen ödemeler); diğer sayfalarda sadece bir şey açılınca görünür. 1280px altında sağdan açılan çekmece.
- **Takvim**: sadece **Hafta** ve **Ay** görünümü (Gün yok). ‹ › ve "Bugün" gezinme butonları **kaldırıldı** (kullanıcı istemedi). Sağ üstte Hafta/Ay seçici + "Mola ekle" (snooze) + mavi "Ders ekle".
  - Hafta: 7 sütun, dersler türe göre renkli, öğle molaları çizgili, kapalı Pazar taralı, şimdi çizgisi (12:36), alt renk açıklaması. Seçili gün siyah, bugün seçili değilse mavi.
  - Ay: Eylül 2026 ızgarası, hücrede en çok 3 ders (saat + isim) + "+N ders", bugün mavi yuvarlak.
- **Kişiler**: sol liste (arama, filtre çipleri, harf grupları) + sağ detay (büyük avatar, isim, mavi telefon; Dokümanlar + Ders ekle; kutular: toplam ders mavi, bekleyen `***` + göz, paket "2 ders kaldı" + parçalı çubuk; Geçmiş/Gelecek).
- **Ödemeler**: üstte tahsil edilen/bekleyen toplam, tablo (Kişi, Açıklama, Tarih, Durum, Tutar); ödenmemiş satır → sağda Ödeme al.
- **Bildirimler**: her satır sağ panelde ilgili ekranı açar (talep, çakışma, ödeme, iptal, paket).
- **Ayarlar**: sol alt menü (Takvim ayarlarım, Ders kuralları, Paket tercihleri, Bildirim ayarları, Hesap) + içerik.
- Sağ panel ekranları: Ders detayı (mavi üst blok), Yeni ders, Mola ekle, Rezervasyon talebi, Ödeme al, Dokümanlar, Yeni kişi.

## Sıradaki
Takvim sayfasını kullanıcıyla birlikte inceleyip revize etmek, sonra diğer sayfalar; en sonda tanıtım sitesi.

## Çalışma şekli
- Her değişikliği önce tarayıcıda (1440 genişlik) test et, sonra kısa Türkçe özet + "sayfayı yenile".
- Belirsiz "beğenmedim/kötü" → 4–6 varyasyon widget'ı göster, o seçsin. "Eskisi gibi" → tam geri al. "Buna gerek yok" → sadece o öğeyi sil. İnce ayar sadece söylenen yerde.
- Kullanıcı kısa ve yazım hatalı yazar; anlamı bağlamdan çıkar, gerçekten belirsizse kısa sor.
- Kaydetme sadece istenince: "kaydet X diye" → Claude Design "Wellness" projesi (id 6e4ddb52-d7dc-4eb6-b3cb-82b84028a72f, DesignSync, dosyalar `prototip/design-upload/` üzerinden); "her yere" → Design + GitHub (`ooztop/WBA`, dal `claude/pro-prototip`, `prototip/` klasörünü rsync edip commit/push) + bu not.
