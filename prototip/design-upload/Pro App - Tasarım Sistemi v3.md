# Pro App · Tasarım Sistemi v3

Son güncelleme: 2 Ekim 2026. Kaynak: `prototip/app.html` (Design'da "Başlangıç 3").
v2'nin üstüne, kullanıcıyla ekran ekran yapılan revizyonlardan çıkan kurallar.

---

## 1. Temel karakter

- **Sade, ferah, küçük.** En sık şikâyet "büyük" ve "kalabalık". Şüphede küçült ve azalt.
- **Bizim mavi her yerde tek vurgu.** #2F4BD1 (koyu tema #7B8FF0). Yeşil başarı rengi bile istenmedi; başarı ekranı da mavi.
- **Kırmızı sadece** borç/ödenmemiş, iptal ve silme için.
- **Zemin beyaz.** Krem ya da gri sayfa zemini yok. Gri dolu kutu kalabalığı yok.
- **Eski tasarımdan sadece düzen/mantık alınır**, görünüm (krem zemin, kare mavi buton, rozet, büyük ölçü) kopyalanmaz.

## 2. Renkler ve yüzeyler

| Token | Açık | Koyu | Kullanım |
|---|---|---|---|
| `--a` | #2F4BD1 | #7B8FF0 | Vurgu, seçili, başlık, + |
| `--pbg` | #F2F4FF | #141A33 | Açık mavi kart zemini (profil kartı, özet kartları, ikon kareleri) |
| `--red` | — | — | Borç, iptal, silme |
| `--sep` | — | — | İnce çerçeve ve ayırıcı |

- **Açık mavi kart (`--pbg`)**: Bir ekranın "ana bilgisi" için. Örnekler: Hesabım profil/QR kartı, Ertele'deki Eski → Yeni kartı, Ödeme al tutar kartı, Gün sayfası durum kartı.
- **Açık kırmızı kart**: Sadece iptal edilecek şeyi göstermek için (Dersi iptal et).
- **Tam mavi blok**: Sadece Ders detayının üst kısmı (status bar arkasına kadar uzanır, status bar yazısı beyaza döner).

## 3. Tipografi

- Instrument Sans. Sekme başlığı 28/700. Sayfa başlığı (nav) 17/600 **mavi**.
- Bölüm başlığı 15/570, açıklaması 12.5/400 gri.
- Satır başlığı 14–15/500–570, alt yazı 12–12.5.
- Büyük rakam (tutar, saat) 26–34/600.
- Değer yazısı (sağdaki seçili değer) 13.5 silik gri (`--t3`).

## 4. Gezinme ve üst bar

- İç sayfa: solda gri yuvarlak ‹, ortada **mavi başlık**, sağda gerekirse mavi + ya da kalem.
- Panel (alttan açılan): solda ✕, sağda mavi ✓. Altta ayrıca "Kaydet" yok.
- Ayar sayfalarında ✓ yok (anında kaydedilmiş sayılır). Yeni kayıt oluşturan sayfada ✓ var (İzin, Yeni ders, Ara ekle).
- Sağ üst + butonu **her zaman mavi** (Paket tercihleri, Ödemeler, Paketler).
- Sekme sayfasında sağ üst yuvarlak buton: Bildirimler'de ⚙️ (Bildirim ayarları), Hesabım'da ⋯ (Yardım, Çıkış).

## 5. Bölüm (section) dili — ana yapı taşı

```
[açık mavi kare + mavi ikon]  Başlık 15/570
                              Açıklama 12.5 gri (isteğe bağlı)      [sağ öğe]
[içerik: çipler / alanlar / liste — tam genişlik]
────────── ince ayırıcı ──────────
```

- İkon karesi 32px, köşe 10, zemin `--pbg`, ikon mavi dolgulu.
- Açıklaması olmayan başlık ikonla **dikey ortalanır**.
- İçerik tam genişlik (18px kenar). **İstisna:** Ders kuralları sayfasında çipler başlık hizasından (62px) başlar — kullanıcı orada onayladı, başka yerde istemedi.
- Sağ öğe şunlardan biri olur: küçük anahtar, değer + ok, mavi +, sadece ok.

## 6. Kontroller

### Seçim çipleri
- Eşit genişlikli ızgara (3'lü ya da 4'lü). **Seçili = mavi zemin, beyaz yazı.**
- **3 hazır seçenek + 4. kutu ✎ kalem**: Kaleme dokununca kutu çerçeveli bir sayı alanına döner, yazılan değer ("3 sa", "20 dk") seçili olur. Hazır seçeneğe dönülünce kalem geri gelir.
- Gün seçimi: eşit kutular, üstte gün adı küçük, altta tarih büyük.

### Değer satırı (alttan seçim)
- Satırın sağında **silik gri değer + mavi tek ok** ("Haftalık ›"). Çerçeve, hap, çift ok yok.
- Dokununca alttan iOS tarzı seçim penceresi açılır; seçili seçenek ✓ ile işaretli.
- Kullanıldığı yerler: Ders hatırlatması, E-posta özeti, SMS, Konum, Tekrar, Sebep, İptal'de ödeme.

### Anahtar
- **Tek boy: 42×25** (her yerde). Açık = mavi.
- Bir anahtar alttaki alanları kontrol ediyorsa kapatınca alanlar **soluklaşır** (Sessiz saatler) ya da **gizlenir** (Gün kapalı, Tüm gün izin).

### Seçim kutuları (tile)
- Kullanıcının en çok beğendiği öğe: **Nakit / Havale / Kart** kutuları. İkon + etiket, seçili = mavi çerçeve + açık mavi zemin.
- Aynı dil tür seçiminde de kullanılıyor: Tekil ders / Çoklu paket, Gün içinde ara / Tüm gün kapalı.

### Butonlar
- Alt buton çifti yan yana: solda çerçeveli ya da kırmızı çerçeveli, sağda mavi.
- Tehlikeli tek buton: açık kırmızı zemin (`dsoft`).

## 7. Listeler

- Gruplu liste kutusu (`gbox`): ince çerçeve, köşe 14, satırlar arasında ince çizgi, ikon yok.
- Paket satırı: solda daire rozet ("60 dk", "8×"), ad + kısa açıklama, sağda fiyat. Temel paket = **mavi daire** (yazıyla "Temel" demeye gerek yok).
- **Kaydırma hareketi**: Sola çek → kırmızı Sil, sağa çek → mavi Temel (Paket tercihleri).
- Bildirimler: başlık **konu** ("Ödeme bekleniyor"), alt satır "Mert Kaya tarafından · ₺1.500", solda sadece kişinin avatarı (konu ikonu istenmedi).
- Kişi seçimi: satırda avatar(lar) + isim + ok; birden fazlaysa üst üste avatar ve "Can, Elif" / "3 kişi".

## 8. Geçişler ve animasyon

- Panel içinde ikinci seviye ekran (Paketler, Kişi seç, Yeni paket): sağdan kayarak gelir, ana içerik sola hafif kayıp solar.
- Panel içi tür değişimi (Tekil ↔ Çoklu): üst kısım sabit kalır, seçim yumuşakça geçer, alttaki bölümler sırayla aşağıdan süzülür. Yeni panel açılmaz.
- Açılır bölüm (paket "Ders kuralları"): başlık + ok; açılınca açık mavi zeminli alan içinde alt bölümler.

## 9. Mantık kuralları (iş akışı)

- **Ücret otomatik gelir**: Kişinin paketi varsa o ("Elif'in paketi · 5 ders kaldı"), yoksa temel paket. Karta dokununca tüm paketler ekranı; oradan + ile kişiye özel paket oluşturulur.
- **Genel ↔ özel kural**: Ders kuralları genel; paket ve gün sayfası bunu ezebilir ("Genel kurallar geçerli" / "Bu pakete özel").
- **Ders başlama kademesi ve ders arası mola** Ders kuralları'nda yaşar (Takvim ayarlarından taşındı).
- Mola ikonu: `snooze` (erteleme saati) — her mola geçen yerde.

## 10. Çalışma şekli (kullanıcıyla)

- Kullanıcı localhost'tan bakar; her değişiklik önce tarayıcıda test edilir, sonra kısa özet.
- "Beğenmedim" + belirsizlik → **birden fazla varyasyon** göster (widget), o seçsin.
- "Neredeyse tam, fazla ekleme" → yapıya dokunma, en küçük düzeltme.
- "Eskiye dön" → bir önceki hâle tam dön, ek değişiklik yapma.
- Boşluk/yerleşim gibi ince ayarlarda sadece söylenen yerde değiştir; global değişiklik yapma.
- Kilitli/onaylı ekranlara ve onay pencerelerine (Vazgeç) izinsiz dokunma.
