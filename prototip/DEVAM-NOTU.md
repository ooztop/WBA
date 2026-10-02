# Pro App · Devam notu (yeni konuşmada önce bunu oku)

Son güncelleme: 2 Ekim 2026

## Proje
Serbest çalışan uzmanlar (psikolog, PT, diyetisyen, eğitmen) için iOS uygulaması. Arayüz Türkçe.
Kullanıcıyla sade Türkçe konuşulur. Kurum ve Mekân ekranları kapsam dışı.

## Dosyalar
| Dosya | Ne |
|---|---|
| `prototip/app.html` | **Güncel, tıklanabilir prototip** (tek dosya, vanilla JS) |
| `prototip/TASARIM-SISTEMI-v3.md` | **Güncel tasarım kuralları** — önce bunu oku |
| `prototip/PLAN-ekran-revizyonu.md` | Ekran ekran ilerleme, onaylananlar, kalanlar |
| `prototip/design-upload/` | Claude Design'a yüklenen kopyalar |
| `prototip/eski/` | Eski Claude Design ekranlarının dökümü (fikir için) |

Yerelde açmak için:
```
cd prototip && python3 -m http.server 8095
```
sonra http://localhost:8095/app.html (kullanıcı kendisi bakar).

## Nerede yedekli
- Claude Design "Wellness" projesi: `Pro App - Final Product (Başlangıç) 3.html` = 1 Ekim sonu hâli. Başlangıç / Başlangıç 2 eski kontrol noktaları, dokunma.
- GitHub `ooztop/WBA` branch `claude/pro-prototip` = ESKİ (29 Eylül) hâl. Bu turdaki değişiklikler henüz push edilmedi.

## Durum
**Kullanıcıyla tek tek elden geçen ve onaylanan:** Takvim, Kişiler listesi, Yeni kişi, Kişi detayı, Kişiyi düzenle, Hesabım, Bildirimler sekmesi, Bildirim ayarları, Yardım, Takvim ayarları, Gün sayfası, Düzenli mola, İzin/kapalı gün, Ders kuralları, Paket tercihleri, Tekil/Çoklu paket, Yeni ders (+Paketler, Kişi seç, Yeni paket), Ara ekle, Ders detayı, Dersi ertele, Dersi iptal et, Ödeme al, Ödeme alındı, Ödemeler, Hesabı düzenle.

**Sıradaki (henüz tek tek bakılmadı):**
1. Ders iptal edildi (sonuç ekranı — Ödeme alındı'nın yeni tasarımına uyarlanabilir)
2. Rezervasyon talebi (normal + çakışmalı)
3. Rezervasyon onaylandı
4. Profilini paylaş (QR)
5. Hesabı sil → Silinmek üzere
6. Giriş

Bilerek dokunulmayan: onay/menü açılır pencereleri ("Vazgeç" olanlar).

## Kod notları (app.html)
- Ekranlar: `SCR` (itilen sayfalar), `SH` (alttan paneller), `rootHTML(i)` (sekmeler), `ACTS` (data-act işleyicileri).
- Ortak yardımcılar: `sec()` ikonlu bölüm (çoğu ekranda yerel tanımlı), `obx`, `chs`, `lbx`, `bp`, `cb`, `navB`, `navS`, `pick` (alttan değer seçici), `cstEdit` (✎ özel değer), `pkgOpen/ppOpen` (panel içi ikinci ekran), `pkSwitch` (Tekil↔Çoklu geçişi).
- Kapsayıcı sınıflar: `.bkf` (mavi seçili çip + ızgara), `.rblue` (Ders kuralları girintili), `.nlx` (Yeni ders sıkı boşluk).
- Düzenleme python string-replace ile yapılıyor; büyük değişiklikten sonra `node --check` ile söz dizimi kontrolü ve tüm SCR/SH fonksiyonlarını tarayıcıda çağırarak hata taraması yap. Aynı satırda birden fazla fonksiyon olabilir — satır bazlı kesmeden önce kontrol et.

## Kullanıcının tercihleri (önemli)
- Küçük, sade, ferah; "büyük" ve "kalabalık" en sık şikâyet.
- Beğenmeyince birden fazla varyasyon görmek istiyor; seçtiğini uygula.
- "Eskiye dön" dediğinde tam geri al. "Fazla ekleme" dediğinde minimum değişiklik.
- Eski tasarımdan sadece düzen/mantık; görünüm bizim sistemden.
