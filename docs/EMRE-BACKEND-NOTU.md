# Emre'ye: backend hakkında notlar ve istekler

Selam Emre,

Backend'i (`EmreTuygan/WBA`, `main`, son commit `2943e49 contacts`) okuduk. Koduna dokunmadık. Mobil tarafta yeni tasarımın (`pro-app-ortak-tasarim`) içine bir veri katmanı kurduk. Ekranlar artık veriyi servisler üzerinden alıyor. Senin bir ucun hazır olduğunda biz sadece bir çevirici yazıp o konuyu "gerçek API"ye çeviriyoruz. Şu an her şey sahte veriyle çalışıyor; API'ye bağlamaya henüz başlamadık.

Aşağıda önce iyi bulduklarımız var, sonra önem sırasına göre isteklerimiz.

## İyi olanlar

- Katmanlar temiz ayrılmış: route, controller, validation, service.
- Doğrulama sıkı, hata biçimi her yerde tutarlı.
- OpenAPI dokümanı var, çok çalışma yerinde transaction kullanılmış.
- Müsaitlik, izin günleri, ders kuralları (`appointment-defaults`), kişiler (`clients`) ve tekil ders fiyatları (`offerings`, `prices`) bizim ekranlarla büyük ölçüde örtüşüyor. Bağlamaya ilk bunlarla başlayacağız.

## 1. Hemen (küçük işler)

1. **CORS izni.** Backend'de CORS ayarı yok. Uygulamanın web sürümü ve tarayıcıdaki önizlemeler sunucuya istek atamıyor. Telefondaki uygulama etkilenmiyor. Geliştirme için `localhost:8081` (Expo web) izinli olsun, ileride gerçek alan adı eklenir.
2. **`.env` repoda.** Kök dizindeki `.env` commit edilmiş. `what_to_run.txt` dosyasında da veritabanı şifresi açık yazıyor. Yerel şifre de olsa değiştirip `.env`'i `.gitignore`'a almak lazım. `AGENTS.md` de bunu yasaklıyor.
3. **Kişi e-postası tüm sistemde benzersiz (`Client.email @unique`).**
   - İki farklı uzman aynı e-postalı kişiyi ekleyemiyor, ikincisi 409 alıyor.
   - Bu hata, o kişinin başka bir uzmanın müşterisi olduğunu da ele veriyor.
   - Öneri: benzersizlik uzman başına olsun. Ya iletişim bilgisi `ProfessionalClient` üzerinde tutulur, ya da `Client` uzmana bağlanır. Platform hesabı olan kişiyle eşleştirme ayrıca yapılır.

## 2. Bağlanabilmemiz için gerekenler

4. **Kişi arşivleme.**
   - Bizde kişi arşivlenince listelerden kalkıyor, "Geri al" ile geri geliyor.
   - Şu an `DELETE /clients/:id` kaydı listeden siliyor.
   - Öneri: `ProfessionalClient`'a `archivedAt` alanı, listede `?archived=true|false` filtresi ve `PATCH` ile geri alma.
5. **Haftanın günü.** Biz `0 = Pazartesi … 6 = Pazar` kabul ediyoruz. `backend.md` de böyle diyor. Değişmeyecekse tamam; değişecekse haber ver.
6. **İsimli molalar.**
   - Uygulamada "Öğle molası 12:30–13:30 · Pzt–Cmt" gibi adı olan, haftalık tekrar eden molalar var.
   - Şu an bunlar sadece müsaitlikteki boşluk olarak kalıyor, adı kayboluyor.
   - Öneri: `Availability` aralıklarına isteğe bağlı bir `name` ya da ayrı bir `Break` tablosu (ad, başlangıç, bitiş, günler).
7. **Çoklu paket ve üyelik.**
   - `OfferingType.PACKAGE` şemada var ama doğrulama sadece `APPOINTMENT` kabul ediyor.
   - Bizde "8 derslik paket · 2 ay" ve "Aylık üyelik" var.
   - Ayrıca kişinin aldığı paketin ne kadar kaldığını gösteren bir tablo gerekiyor: kalan seans, geçerlilik tarihi, peşin ödendi mi.
8. **Profil.** `GET/PATCH /professionals/:id/profile`: ad, soyad, ünvan, meslek, iletişim bilgileri.

## 3. Sıradaki büyük işler (uygulamanın ana parçaları)

9. **Dersler API'si (en önemlisi).** Takvim uygulamanın ana ekranı. Tablolar (`Appointment`, `AppointmentBooking`) hazır, uçlar yok. İhtiyacımız şunlar:
   - `GET /appointments?from=YYYY-MM-DD&to=YYYY-MM-DD`: aralıktaki dersler, kişi ve ödeme durumu ile.
   - `POST /appointments`: tekrar desteğiyle (her hafta, bitiş tarihi ya da adet).
   - Erteleme (yalnız bu ders), iptal (sebep ile) ve ders notu.
   - Ders durumu: ödendi, ödenmedi, sıradaki, bekliyor.
10. **Ödemeler.**
    - Bizde tek seferde birden fazla dersin ödemesi alınabiliyor, kısmi ödeme de var.
    - Şu an ödeme bilgisi ders kaydının içinde (`amountPaid`, `paidAt`), bu yüzden ödeme geçmişi tutulamıyor.
    - Öneri: ayrı bir `Payment` tablosu (tutar, yöntem, tarih) ve hangi derse ne kadar düştüğünü tutan bir bağlantı tablosu.
    - İhtiyacımız şunlar:
      - kişi başına ödenmemiş dersler
      - bu ay tahsil edilenler
      - "ödeme al" (ders kimlikleri, tutar, yöntem)
11. **Rezervasyon talepleri.**
    - `BookingStatus.PENDING` var.
    - Onayla (ders oluşur) ve reddet uçları gerekiyor.
    - Karşı teklif (yeni saat önerme) için önerilen saat alanı da gerekiyor.
12. **Giriş ve yetki.**
    - Şu an `devAuth` her isteği geçiriyor ve uzman kimliği adreste duruyor.
    - Gerçek kullanıcıya açılmadan önce şunlar gerekiyor:
      - giriş: e-posta + şifre, e-posta kodu, telefon SMS kodu, Apple ile giriş
      - oturum
      - "ben kimim" ucu
      - her istekte uzmanın kendi verisine eriştiğinin kontrolü
    - Uzman kaydı da yok, şu an sadece örnek veriyle oluşuyor.
13. **Bildirimler ve bildirim ayarları.**
    - Bildirim listesi: tür, kişi, zaman, okundu bilgisi, okunmamış sayısı.
    - Ayarlar: hangi türler, sessiz saatler, e-posta özeti, SMS hatırlatma.

## 4. Sorular

- Tutarları metin olarak dönüyorsun (`"750.00"`). Böyle kalacak mı? Biz buna göre çeviririz.
- Kişinin bekleyen borç tutarını backend mi hesaplayacak, yoksa biz ödenmemiş derslerden mi toplayalım?
- Ödeme vadesi kaç gün? Biz şimdilik "ders + 7 gün" sayıyoruz.
- Güne ve pakete özel ders kuralları olacak mı? Tasarımda var. Şimdilik sadece genel kuralları kullanıyoruz.
- Backend'i ne zaman ve nerede yayına almayı düşünüyorsun? Telefondan deneyebilmemiz için gerekiyor.

Bizim taraftaki ayrıntılar: `ooztop/WBA` reposu, `claude/pro-prototip` dalı, `pro-app-ortak-tasarim/src/data/README.md` (hangi konu hangi uca bağlanacak tablosu).
