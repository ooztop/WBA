# Pro App · Ekran revizyonu planı

Kişiler ekranında birlikte yaptığımız düzeltmelerden çıkan kurallar ve kalan ekranların sırası.
Prototip: `prototip/app.html` (http://localhost:8095/app.html)

## 1. Kilitli ekranlar — dokunulmayacak

Bunları sen tek tek düzelttin; bu turda hiçbir değişiklik yapılmaz.

- **Takvim** (gün / hafta / ay, artı menüsü, alt bar)
- **Kişiler listesi** (alfabetik, sağda harf çubuğu, filtreler, arama)
- **Yeni kişi** paneli
- **Kişi detayı**
- **Kişiyi düzenle** paneli

## 2. Kişiler'den çıkan kurallar

Kalan her ekrana aynı şekilde uygulanacak:

1. **Ölçüler küçük ve sade.** Sayfa başlığı 28, kişi/başlık 19, satır başlığı 14–15, alt yazı 12–12.5, buton yüksekliği 44–48, avatar 36–54. Hiçbir şeyi büyütme.
2. **Yazı kalınlığı ölçülü.** İsimler ve satır başlıkları yarı kalın. Kutu başlıkları, butonlar ve sekmeler hafif kalın (≈570). Alan içi yazılar normal (≈470). Ekstra kalın yazı yok.
3. **Başlık hizası.** Sekme sayfalarında büyük başlık takvimdeki "Bugün" ile aynı yükseklikte. Sağ üstteki işlem butonu yuvarlak ve başlığın tam karşısında.
4. **Üst gezinme yuvarlak butonlarla.**
   - İç sayfalar: solda gri daire içinde geri oku, sağda gerekirse gri daire içinde ikon (kalem vb.).
   - Paneller: solda ✕ (gri), sağda ✓ (mavi).
   - "Geri / Vazgeç / Kaydet / Düzenle" yazıları kullanılmaz.
5. **Listelerde rozet/etiket yok.** Sağ tarafta sadece gerekli tek bilgi (tutar gibi) yazı olarak durur. Gereksiz alt satırlar kaldırılır.
6. **Dersler kutucukta.** İnce çerçeveli kutu, solda ders türü renginde dikey çizgi. Grup başlıkları kullanılır (Bu hafta / Eylül…).
7. **Formlar.** Beyaz zemin, ince çerçeveli 44 px alanlar, küçük etiketler. Seçenekler ve anahtarlar ince çerçeveli kutularda. Alanlar arası ferah; ekranı dolduracak kadar boşluk bırakılır.
8. **Ana işlemler en altta.** Yan yana iki buton: solda ince çerçeveli ikincil, sağda mavi ana buton. Silme gibi tehlikeli işlemler açık kırmızı zeminli buton olur. Başlıkta ✓ varsa altta ayrıca "Kaydet" butonu olmaz.
9. **Gri kutu kalabalığı yok.** Rakam kutucukları (ücret, ders sayısı gibi) küçük ve sade kalır. Hızlı işlem ikon sıraları yerine işlem ilgili öğeye dokununca açılan menüye taşınır (örnek: isme dokun → Ara / WhatsApp).
10. **Tasarım sistemine sadakat.** Eski tasarımdan görsel gösterildiğinde sadece fikir alınır. Mavi kare butonlar, çerçeveli kişi kartları gibi eski stiller kopyalanmaz.

## 3. Kalan ekranlar — uygulama sırası

Her adım bitince localhost'ta kontrol edip sana haber veriyorum; sen onaylayınca bir sonrakine geçiyoruz.

**Adım 1 · Ders akışı** (takvimden ve kişiden en çok girilen yer)
- Ders detayı
- Dersi ertele
- Dersi iptal et → Ders iptal edildi
- Yeni ders paneli (+ menüsünden)
- Ara ekle paneli (+ menüsünden)

**Adım 2 · Ödeme akışı**
- Ödeme al → Ödeme alındı

**Adım 3 · Bildirimler**
- Bildirimler sekmesi
- Rezervasyon talebi (normal ve çakışmalı) → Rezervasyon onaylandı

**Adım 4 · Hesabım**
- Hesabım sekmesi
- Hesabı düzenle paneli
- Ödemeler
- Profilini paylaş (QR)

**Adım 5 · Ayarlar**
- Takvim ayarlarım, gün kuralı, düzenli mola paneli, izin / kapalı gün
- Ders kuralları
- Paket tercihleri, tekil ve çoklu paket panelleri
- Bildirim ayarları, yardım

**Adım 6 · Hesap çıkışı**
- Çıkış onayı, giriş ekranı, hesabı sil → silinmek üzere

**Adım 7 · Kapanış**
- Tasarım Sistemi v2 sayfasını bu kurallarla güncelle.
- Prototipi Claude Design'a yeniden yükle.

## 4. Kapsam dışı

- Kurum ve Mekân ekranları.
- Boş hâller ve "bağlantı yok" ekranları (sonraki tur).
