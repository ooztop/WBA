# Pro App · Devam notu (yeni konuşmada önce bunu oku)

Son güncelleme: 29 Eylül 2026

## Proje
Serbest çalışan uzmanlar (psikolog, PT, diyetisyen, eğitmen) için iOS uygulaması. Arayüz Türkçe.
Kullanıcıyla sade Türkçe konuşulur. Kurum ve Mekân ekranları kapsam dışı.

## Dosyalar
| Dosya | Ne |
|---|---|
| `prototip/app.html` | **Güncel, tıklanabilir uygulama prototipi** (tek dosya). Tarayıcıda aç. |
| `prototip/PLAN-ekran-revizyonu.md` | Kurallar, kilitli ekranlar, kalan adımlar |
| `prototip/takvim.html` | Sadece takvim prototipi (eski ara sürüm) |
| `prototip/design-upload/` | Claude Design'a yüklenen kopyalar |
| `prototip/eski/` | Eski Claude Design ekranlarının dökümü (referans) |

Yerelde açmak için:
```
cd prototip && python3 -m http.server 8095
```
sonra http://localhost:8095/app.html

## Nerede yedekli
- GitHub: `ooztop/WBA`, branch `claude/pro-prototip`, klasör `prototip/`
- Claude Design: "Wellness" projesi → `Pro App - Final Product (Başlangıç) 2.html`, `Pro App - Tasarım Sistemi v2.dc.html`, bu not

## Tasarım sistemi (özet)
- Font Instrument Sans (değişken ağırlık 400–700). Zemin beyaz (koyu tema siyah).
- Ana renk marka mavisi #2F4BD1 (koyu #7B8FF0). Kırmızı sadece silme/borç.
- Ders türü renkleri: Bireysel #2F4BD1, Grup #8A3FD1, Online #12A06B, Deneme #F07A1A.
- İkonlar Material Symbols Rounded dolgulu; bildirim için özel çan.
- Alt bar: üst köşeleri yuvarlak, yarı saydam, çok hafif mavimsi; 4 sekme Takvim · Kişiler · Bildirimler · Hesabım.
- Takvim: tek sayfa Gün → Hafta → Ay (aşağı çekince biçim değiştirir), sağ üstte Gün/Hafta/Ay seçici, artı butonu → Ders ekle / Ara ekle menüsü.

## Durum
**Kilitli (kullanıcı onayladı, dokunma):** Takvim, Kişiler listesi, Yeni kişi, Kişi detayı, Kişiyi düzenle.

**Sıradaki:** PLAN dosyasındaki Adım 1 · Ders akışı (ders detayı, ertele, iptal, yeni ders paneli, ara ekle paneli). Kişiler'den çıkan kurallar uygulanacak.

## Kullanıcının tercihleri (önemli)
- Her şeyi küçük ve sade ister; "büyük" ve "fazla kalın" en sık şikâyet.
- Listelerde rozet/etiket ve gereksiz alt satır istemez.
- Eski tasarımdan görsel gösterirse sadece fikir alınır, görünüm kopyalanmaz.
- Değişiklikleri kendisi localhost'tan kontrol eder; her değişiklik önce tarayıcıda test edilip kısa özetle bildirilir.
