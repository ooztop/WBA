// Uygulama modelleri: servislerin, mock veritabanının ve önbelleğin ortak tipleri.
export type ID = string;
export type TagKind = 'a' | 'i' | 's' | 'd' | 'n';
export type Person = { id: ID; ini: string; name: string; sub: string; tag: [TagKind, string]; cat: string; arch?: boolean; gone?: boolean };
export type LessonStatus = 'ok' | 'no' | 'nx' | 'w';
export type Lesson = { id: ID; date: string; h: number; dur: number; pid: ID; type: string; st: LessonStatus; pk?: string; rep?: number; loc?: string };
export type Pkg = { id: ID; kind: 'single' | 'multi'; c1: string; c2: string; name: string; sub: string; price: string; base?: boolean };
export type Brk = { id: ID; name: string; start: string; end: string; days: number[] };
export type Off = { id: ID; date: string; name: string; start: number; end: number; all?: boolean };
export type DebtLesson = { lessonId?: ID; when: string; what: string };
export type Debt = { pid: ID; lessons: DebtLesson[]; note: string; late?: boolean; tag: string };
export type PaidRow = { id: ID; ini: string; name: string; sub: string; amt: number };
export type DayHours = { on: boolean; s: string; e: string };          // 'HH:mm'
export type WeekHours = DayHours[];                                     // uzunluk 7, 0 = Pazartesi
export type Choice = { s: number; c: string | null };                   // hazır değer sırası ya da özel değer (bugünkü rule.N şekli)
export type LessonRules = { window: Choice; freeCancel: Choice; startMin: Choice; gap: Choice };
// Anahtarlar bugünkü nt.* son ekleri: can, pay, req, qs, qe, quiet, v (v: hatırlatma/e-posta/SMS seçimleri nesnesi)
export type NotifPrefs = Record<string, boolean | string | Record<string, string>>;
export type Profile = { ad: string; soyad: string; title: string };
// Rezervasyon talebi: kişinin istediği ders; left = yanıt için kalan saat (demo)
export type Req = { id: ID; pid: ID; date: string; h: number; dur: number; type: string; price: string; left: number; note?: string };
// Bildirim: at = 'YYYY-MM-DDTHH:mm'; sub = kişi adından sonra gelen kısa açıklama
export type NotifKind = 'payDue' | 'pkgLow' | 'paid' | 'cancel' | 'rsOk' | 'added';
export type Notif = { id: ID; kind: NotifKind; pid: ID; at: string; sub: string; read: boolean };
export type Topic = 'people' | 'lessons' | 'packages' | 'schedule' | 'rules' | 'notifPrefs' | 'payments' | 'requests' | 'profile' | 'notifs';
