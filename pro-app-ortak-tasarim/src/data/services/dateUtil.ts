// Servislerin içinde kullanılan küçük tarih yardımcısı.
export const addDays = (d: Date, n: number): Date => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
