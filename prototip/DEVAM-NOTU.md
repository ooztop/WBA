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
- Claude Design "Wellness" projesi: **`Pro App - Final 1.html` = en güncel (2 Ekim akşamı, boş hâller + alt bar dahil)**. `Pro App - Final Product (Başlangıç) 4.html` = 2 Ekim öğlen. `Başlangıç 3` = 1 Ekim sonu. Başlangıç / Başlangıç 2 eski kontrol noktaları, dokunma.
- GitHub `ooztop/WBA` branch `claude/pro-prototip`, commit 9ebba79 (2 Ekim) = Başlangıç 3 ile aynı hâl.
- Design'da ayrıca `Pro App - Tasarım Sistemi v3.md`.

## Durum
**Kullanıcıyla tek tek elden geçen ve onaylanan:** Takvim, Kişiler listesi, Yeni kişi, Kişi detayı, Kişiyi düzenle, Hesabım, Bildirimler sekmesi, Bildirim ayarları, Yardım, Takvim ayarları, Gün sayfası, Düzenli mola, İzin/kapalı gün, Ders kuralları, Paket tercihleri, Tekil/Çoklu paket, Yeni ders (+Paketler, Kişi seç, Yeni paket), Ara ekle, Ders detayı, Dersi ertele, Dersi iptal et, Ödeme al, Ödeme alındı, Ödemeler, Hesabı düzenle.

**2 Ekim'de eklenen/yenilenen (Başlangıç 4):** Profilini paylaş (beyaz sayfa), Hesabı sil (Silinmek üzere ekranı tamamen silindi → doğrudan Giriş), Rezervasyon talebi normal/çakışmalı, sonuç ekranları ortak `doneS()` ile (Rezervasyon onaylandı, Talep reddedildi, Yeni saat onaylandı `rsAccepted`, Ders iptal edildi — kişi iptali `k`), Bildirimlerde her satır tıklanır, Ödeme al üst kısmı ortalı sade (kart yok), Kişi detayında paket kutusu (`cpk4`, sadece PAKET kişilerde), Giriş + adımlı Kaydol (`signup` → `suMail` → `suMailCode` → `suPhone` → `suPhoneCode` → `suJob`, ortak `suS()`).

**Final 1 sonrası eklenenler:** Üstte "Boş sayfa" düğmesi (`EMP` bayrağı) — boş olabilen ekranların boş hâli: Takvim (saatler/şimdi çizgisi/+ gizli, ortada "Takvimin boş" + Ders ekle), Kişiler, Bildirimler, Ödemeler, Paket tercihleri, Yeni ders (Kişi seç, Paketler, ücret kartı), Takvim ayarları molalar, İzin dersleri, Hesabı sil. Ortak `EMPT()` / `EMPS()`. Sonuç ekranlarının boş hâli yok (veri olmadan açılmazlar). Alt bar: açık mavi zemin + radial lila/mavi lekeler (takvimdeki buğulu görünüm her sekmede).

**Sıradaki:** Kullanıcıyla birlikte karar verilecek.

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
