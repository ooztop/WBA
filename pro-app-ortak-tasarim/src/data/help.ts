// Yardım ve destek içeriği: destek formu konuları ve kuralı, sık sorulanlar, kullanım koşulları.

export const SUPPORT_TOPICS = ['Ödeme', 'Takvim', 'Hesap', 'Diğer'] as const;
export type SupportTopic = (typeof SUPPORT_TOPICS)[number];

// Mesaj boş ya da yalnız boşluksa Gönder pasif kalır.
export const canSend = (text: string) => text.trim().length > 0;

// a: paragraflar · link: cevabın sonunda ilgili ekrana giden bağlantı (to = ekran kimliği)
export type Faq = { id: string; q: string; a: string[]; link?: { t: string; to: string } };

export const FAQ: Faq[] = [
  {
    id: 'kisiye-fiyat',
    q: 'Her kişiye farklı fiyat nasıl veririm?',
    a: ['Kişiyi eklerken "Özel paket tanımla"yı aç. Bu kişiye özel fiyat ya da paket burada tanımlanır.', 'Özel fiyat tanımlanmayan kişiler Paket tercihlerindeki fiyatları görür.'],
    link: { t: 'Paket tercihlerine git', to: 'pricing' },
  },
  {
    id: 'fiyat-bildirim',
    q: 'Fiyatı güncellersem kişilere bildirim gider mi?',
    a: ['Hayır. Yeni fiyat yalnızca bundan sonra alınan derslere ve paketlere uygulanır.', 'Daha önce alınmış paketler ve planlanmış dersler eski fiyatla kalır.'],
    link: { t: 'Paket tercihlerine git', to: 'pricing' },
  },
  {
    id: 'iptal-kurallari',
    q: 'İptal kurallarını nasıl değiştiririm?',
    a: ['Ders kurallarındaki "Ücretsiz iptal süresi"ni değiştir. Bu süreden sonra iptal eden kişiden ders ücreti alınır.', 'İptal ederken yine istediğin seçeneği seçebilirsin.'],
    link: { t: 'Ders kurallarına git', to: 'rules' },
  },
  {
    id: 'elle-odeme',
    q: 'Ödemeyi elle kaydetmek nasıl çalışır?',
    a: ['Ödenmemiş bir dersi aç ve "Ödeme al"a dokun. Kişinin diğer borç dersleri de listede çıkar; istediklerini seç.', 'Eksik ödeme alırsan kalan tutar borç olarak durur.'],
    link: { t: 'Ödemelere git', to: 'payments' },
  },
];
export const faqById = (id: string) => FAQ.find(f => f.id === id);

// Örnek metin: gerçek kullanım koşulları hukuki onaydan sonra buraya gelir.
export const TERMS: { h: string; p: string[] }[] = [
  { h: 'Hizmet', p: ['Pro App, serbest çalışan uzmanların derslerini, kişilerini ve ödemelerini yönetmesi için sunulur.'] },
  { h: 'Hesabın', p: ['Hesap bilgilerinin doğru ve güncel olmasından sen sorumlusun.', 'Hesabını dilediğin zaman Hesabım > Hesabı sil ile kapatabilirsin.'] },
  { h: 'Kişilerin verileri', p: ['Eklediğin kişilerin bilgilerini yalnızca ders ve ödeme takibi için kullanırsın.', 'Bu bilgiler üçüncü kişilerle paylaşılmaz.'] },
  { h: 'Ödemeler', p: ['Uygulamaya kaydedilen ödemeler senin kayıtlarındır; tahsilat sana ve kişiye aittir.'] },
  { h: 'Değişiklikler', p: ['Koşullar değişirse uygulama içinden haber verilir.'] },
];
