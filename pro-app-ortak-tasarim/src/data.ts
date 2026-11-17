
export const DN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const D1 = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
export const DL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const MN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const MS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
// Demo saati ve günü (tanım data/mock/lessonGen.ts'te); ekranlar buradan okur
import { TODAY, NOW_H } from './data/mock/lessonGen';
export { TODAY, NOW_H };

export const p2 = (n: number) => String(n).padStart(2, '0');
export const hm = (x: number) => `${p2(Math.floor(x))}:${p2(Math.round((x % 1) * 60))}`;
export const addD = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
// Ders başladı mı (devam eden ders de sayılır): başladıysa iptal ve erteleme yapılamaz
export const lessonStarted = (d: Date, h: number) => (same(d, TODAY) ? h <= NOW_H : d < TODAY);
export const wd = (d: Date) => (d.getDay() + 6) % 7;
export const mon = (d: Date) => addD(d, -wd(d));
export const first = (n: string) => n.split(' ')[0];
export const initials = (n: string) => n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr');

// Ders, kişi ve paket tipleri uygulama modellerinden gelir (data/models.ts)
export type { Lesson, Person, Pkg, TagKind } from './data/models';

export const TRA = 'A B C Ç D E F G H I İ J K L M N O Ö P R S Ş T U Ü V Y Z #'.split(' ');
