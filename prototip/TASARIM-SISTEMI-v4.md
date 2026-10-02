# Pro App · Tasarım Sistemi v4

Son güncelleme: 2 Ekim 2026. Kaynak: `prototip/app.html` (Design'da **"Pro App - Final 1.html"**).
v3'ün üstüne: kalan ekranlar (paylaş, hesabı sil, rezervasyon, sonuç ekranları, giriş/kaydol), boş hâller ve alt bar.
v3'te olup burada değişen kurallar **(v4)** ile işaretli.

---

## 1. Temel karakter

- **Sade, ferah, küçük.** En sık şikâyet "büyük", "kalabalık", "boş görünüyor". Şüphede küçült ve azalt; ama sayfa boş kalıyorsa içeriği yukarı topla.
- **Bizim mavi tek vurgu.** #2F4BD1 (koyu tema #7B8FF0). Yeşil başarı rengi bile yok; başarı ekranı da mavi.
- **Kırmızı sadece** borç/ödenmemiş, iptal, ret ve silme için.
- **Zemin beyaz.** Gri dolu kutu kalabalığı yok.
- **Açıklama yazısı az olsun (v4).** Kullanıcı bilgi notlarını, uyarı kutularını, "bu ne işe yarar" cümlelerini çoğunlukla sildirdi. Bir şey kendini anlatıyorsa yazı ekleme. Tekrar eden etiketleri (ör. "8 derslik paket") kaldır.
- **Eski tasarımdan sadece düzen/mantık alınır**, görünüm kopyalanmaz.

## 2. Renkler ve yüzeyler

| Token | Açık | Koyu | Kullanım |
|---|---|---|---|
| `--a` | #2F4BD1 | #7B8FF0 | Vurgu, seçili, başlık, + |
| `--pbg` | #F2F4FF | #141A33 | Açık mavi kart, ikon kareleri |
| `--red` / `--redSoft` | #D6453D / #FBE7E5 | #FF6B61 / şeffaf | Borç, iptal, ret, silme |
| `--sep` | #E4E4E8 | #2A2A2D | İnce çerçeve ve ayırıcı |

- **Açık mavi kart (`--pbg`)**: Bir ekranın tek "ana bilgisi" için, **idareli (v4)**. Kalanlar: Hesabım profil/QR kartı, Ertele'de Eski → Yeni, Gün sayfası durum kartı, Rezervasyon talebi kişi+saat kartı, Kişi detayında paket kutusu. Profilini paylaş ve Ödeme al'da kullanıcı **kaldırttı** → beyaz sayfa.
- **Açık kırmızı kart**: Sadece Dersi iptal et'te. Hesabı sil'de istenmedi (v4).
- **Tam mavi blok**: Sadece Ders detayının üstü.

## 3. Tipografi

- Instrument Sans. Sekme başlığı 28/700. Sayfa başlığı (nav) 17/600 **mavi**.
- Giriş/kaydol karşılama başlığı 26/600, sola hizalı (v4).
- Bölüm başlığı 15/570, açıklaması 12.5 gri.
- Büyük rakam (tutar, saat, kalan ders) 26–34/600. Yanına küçük birim yazısı 14/570 ("**2** ders kaldı").
- Değer yazısı (sağdaki seçili değer) 13.5 silik gri.

## 4. Gezinme ve üst bar

- İç sayfa: solda gri yuvarlak ‹, ortada **mavi başlık**, sağda gerekirse mavi + / kalem.
- Panel: solda ✕, sağda mavi ✓. Altta ayrıca "Kaydet" yok.
- Ayar sayfalarında ✓ yok. Yeni kayıt oluşturan sayfada ✓ var.
- Sağ üst + her zaman mavi.
- **Sonuç ekranında (v4):** bir akışın sonuysa sağ üstte ✕; bildirimden açılan bilgi ekranıysa (Yeni saat onaylandı, Kişi dersi iptal etti) solda **geri** tuşu.
- **Alt bar (v4):** üst köşeleri 22px yuvarlak, buzlu cam (blur 20). Zemin açık mavi + üstüne yumuşak lila/mavi radial lekeler → takvimdeki buğulu renk **her sekmede aynı** görünür. Koyu temada eski koyu bar.

## 5. Bölüm (section) dili — ana yapı taşı

```
[açık mavi kare + mavi ikon]  Başlık 15/570
                              Açıklama 12.5 gri (isteğe bağlı)      [sağ öğe]
[içerik: çipler / alanlar / liste — tam genişlik]
────────── ince ayırıcı ──────────
```

- İkon karesi 32px, köşe 10, zemin `--pbg`, ikon mavi. Açıklamasız başlık ikonla dikey ortalanır.
- İçerik tam genişlik (18px kenar). İstisna: Ders kuralları (çipler 62px girintili).
- Sağ öğe: küçük anahtar, değer + ok, mavi +, sadece mavi ok, ya da tutar (koyu 15/600).
- Bölümün tamamı tıklanabiliyorsa sağda **mavi tek ok** (ör. "Başka saat öner" → Ertele).
- Boşluk ince ayarı sadece söylenen bölümde yapılır (ör. Rezervasyon'da Ücret bölümü: üstten 22px, alttan 0).

## 6. Kontroller

### Seçim çipleri
- Eşit ızgara. Seçili = mavi zemin, beyaz yazı. 3 hazır + 4. kutu ✎ özel değer.

### Değer satırı
- Sağda silik gri değer + mavi tek ok. Dokununca alttan iOS seçim penceresi.

### Anahtar
- Tek boy 42×25. Kontrol ettiği alanlar kapanınca soluklaşır / gizlenir.

### Seçim kutuları (tile)
- Nakit/Havale/Kart dili: ikon + etiket, seçili = mavi çerçeve + açık mavi zemin.
- Kullanıldığı yerler: ödeme yöntemi, Tekil/Çoklu, Gün içinde/Tüm gün, **meslek seçimi (v4)**.

### Butonlar
- Alt çift: solda çerçeveli ya da kırmızı çerçeveli (`dline`), sağda mavi.
- Tehlikeli tek buton: açık kırmızı (`dsoft`). **Onay yazılana kadar soluk ve basılamaz (v4)** — Hesabı sil'de "SİL".
- Yanında açıklama gerekiyorsa butonun hemen üstünde küçük soluk gri tek satır; alt bar çizgisi o ekranda kaldırılır.

### İlerleme (v4)
- **Parçalı çubuk**: her ders/adım ayrı yuvarlak kutucuk, aralarında 4px boşluk. Bitenler açık lila (`--a` %12), kalanlar mavi. Kişi paketi ve kayıt adımları bu dilde.

### Kod girişi (v4)
- 6 ayrı kutu (54px yükseklik, köşe 13, 22/600 rakam), yazdıkça sonrakine geçer. Altında mavi "Kodu tekrar gönder".

## 7. Listeler

- Gruplu liste kutusu (`gbox`): ince çerçeve, köşe 14, satır arası ince çizgi.
- **Anahtar–değer listesi (v4)**: solda gri etiket, sağda koyu değer; önemli değer mavi ("Yeniden müsait"), eski değer gri üstü çizili.
- Paket satırı: solda daire rozet, ad + açıklama, sağda fiyat; temel paket = mavi daire. Sola çek → Sil, sağa çek → Temel.
- **Bildirimler (v4)**: başlık konu, alt satır kişi · detay, solda avatar. **Her satır bir ekrana gider** (talep, çakışma, yeni saat, ödeme, iptal, paket → kişi).

## 8. Ekran kalıpları (v4)

### Sonuç ekranı (`doneS`)
```
              [daire ikon 68px + 8px açık halka]
              Kişi · ne oldu         (13.5 gri)
              12 Eyl · 18:00         (34/600)
              Kısa açıklama          (13.5 gri)
[ anahtar–değer listesi (gbox) ]
[ ikincil buton ]  [ mavi Tamam ]
```
- Olumlu: mavi daire (✓, takvim). Olumsuz (iptal, ret): kırmızı daire, büyük değer gri ve üstü çizili.
- Kullanıldığı yerler: Ödeme alındı, Rezervasyon onaylandı, Talep reddedildi, Yeni saat onaylandı, Ders iptal edildi (kendi iptalin / kişinin iptali).

### Talep ekranı
- Üstte açık mavi kart: avatar + isim + alt bilgi, sağ üstte mavi "22 sa kaldı", büyük mavi tarih·saat, ders bilgisi.
- Altında ikonlu bölümler. Çakışmada: "Bu saatte başka dersin var" + "Başka saat öner" (en yakın 3 saat; birini seçince ana buton "Bu saati öner" olur).
- Alt: Reddet (kırmızı çerçeve) + Onayla. Reddet → onay penceresi → Talep reddedildi sonuç ekranı.

### Ödeme al üstü
- Kart yok, ortalı: küçük avatar, "İsim · 2 ders", büyük tutar, açık kırmızı "6 gün gecikmiş" hapı.

### Kişi detayında paket
- İstatistiklerin altında açık mavi kutu: büyük mavi "**2** ders kaldı", sağda dikey ortalı mavi "Yenile" yazısı, altta parçalı çubuk. Sadece paketli kişide.

### Profilini paylaş
- Beyaz sayfa: avatar, isim, alt bilgi, çerçeveli QR, altında çerçeveli bağlantı hapı (dokununca kopyalar). Alt: NFC + mavi Paylaş.

### Hesabı sil
- Uyarı kartı yok. Bölümler: Silinecekler (3 sütun sayı kutusu), Önce çözülmesi gerekenler (liste), Onaylamak için SİL yaz. Altta soluk "30 gün içinde giriş yaparsan silme iptal edilir." + soluk/aktif kırmızı buton. Ara "Silinmek üzere" ekranı **yok** → doğrudan Giriş.

### Giriş
- Sola hizalı: mavi "Pro" logo karesi, "Tekrar hoş geldin", kısa alt yazı. E-posta, Şifre (göz simgesi), sağda mavi "Şifremi unuttum". Mavi Giriş yap → "veya" ayıracı → Apple ile devam et. En altta "Hesabın yok mu? **Kaydol**".

### Kaydol (adım adım)
1. Hesap oluştur — girişle aynı düzen: Ad soyad, Şifre, Şifre tekrar → Devam et / Apple ile kaydol.
2. E-posta → 3. Mail kodu → 4. Telefon (+90 kutusu) → 5. SMS kodu → 6. Meslek (2×3 tile).
- 2–6: üstte geri + 5 parçalı ilerleme; 56px açık mavi ikon karesi, 26/600 başlık, gri alt yazı; **buton içeriğin hemen altında** (en dipte değil). Bilgi notu yok.
- Apple ile kaydolunca mail/telefon adımları atlanır.

## 9. Boş hâller (v4)

Prototipte üstte **"Boş sayfa"** düğmesi (yanında "Koyu tema"); basınca veri yokmuş gibi görünür.

- **Tam sayfa boş (`EMPT`)**: ortalı 64px açık mavi kare + ikon, 17/600 başlık, 13.5 gri tek-iki satır, altında üst üste en fazla 2 buton (max 240px).
- **Bölüm içi boş (`EMPS`)**: kesik çizgili ince kutu, ortalı soluk tek cümle ("Düzenli mola yok. + ile ekleyebilirsin.").
- Takvim boşken: saat yazıları, saat çizgileri, şimdi çizgisi ve sağ alttaki + **gizlenir**; ortada çerçevesiz "Takvimin boş" + Ders ekle.
- Boş hâli olanlar: Takvim, Kişiler (Kişi ekle + Profilini paylaş), Bildirimler, Ödemeler (iki sekme ayrı), Paket tercihleri, Yeni ders (Kişiler "Seç", ücret "Paket yok", Kişi seç, Paketler), Takvim ayarları molalar, İzin dersleri, Hesabı sil.
- **Sonuç ekranlarının ve formların boş hâli yok** — veri olmadan açılmazlar.

## 10. Geçişler ve animasyon

- Panel içi ikinci ekran sağdan kayar; ana içerik sola hafif kayıp solar.
- Tekil ↔ Çoklu: üst sabit, bölümler sırayla süzülür.
- Açılır bölüm: açık mavi zeminli alan.

## 11. Mantık kuralları

- Ücret otomatik: kişinin paketi varsa o, yoksa temel paket; dokununca Paketler, + ile kişiye özel paket.
- Ders kuralları genel; paket ve gün sayfası ezebilir.
- Paket bitmek üzere bildirimi → kişi sayfası; uyarı kişi sayfasında paket kutusunda da görünür.
- Bildirimdeki her olayın kendi ekranı vardır.

## 12. Çalışma şekli (kullanıcıyla)

- Kullanıcı localhost:8095'ten bakar; her değişiklik önce tarayıcıda 420×880 test edilir, sonra kısa Türkçe özet + "sayfayı yenile".
- Belirsiz "kötü / beğenmedim / başka ne olabilir" → **4–6 varyasyon widget'ı**, o seçer; seçtiğine küçük ekler yapar ("2 gibi ama…").
- "Eskisi gibi / eskiye dön" → bir önceki hâle tam dön.
- "Buna gerek yok" → sadece o öğeyi sil, başka bir şeye dokunma.
- Görsel + kısa not gönderir; notu görseldeki öğeye uygula.
- Boşluk/hizalama ince ayarı sadece söylenen yerde.
- Kayıt: "kaydet X diye" → Design'a o adla; "her yere" → Design + GitHub + devam notu.
