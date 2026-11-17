# src/data — veri katmanı

Ekranlar ile verinin geldiği yer (sahte veritabanı ya da backend) arasındaki katman.

| Klasör / dosya | Ne |
|---|---|
| `models.ts` | Uygulama modelleri (Person, Lesson, Pkg, Brk, Off, Debt, PaidRow, WeekHours, LessonRules, NotifPrefs, Profile, ReqState) |
| `source.ts` | Konu başına `'mock'` / `'api'` anahtarı (`sourceFor`) |
| `errors.ts` | `ApiError`, `notConnected()` (bağlanmamış konunun `api` dalı, 501) |
| `dates.ts` | `iso()`, `fromIso()`, eski kayıt anahtarı dönüşümü |
| `mock/` | Demo verisi (`seed.ts`), ders üreteci (`lessonGen.ts`), sahte veritabanı + cihazda saklama + eski (v1) kaydı taşıma (`db.ts`) |
| `services/` | Konu başına servis; her fonksiyon `Promise` döner |
| `actions/` | Ekranların çağırdığı yazma işlemleri (iyimser güncelleme + hata olunca geri alma), açılış yüklemesi (`boot.ts`), ders aralığı yükleme (`lessons.ts`) |
| `__tests__/` | Servis, sahte veritabanı, eylem testleri ve ekran koruma testi |

## Konu → backend eşlemesi

Backend: `EmreTuygan/WBA` reposundaki `backend/` (Express + Prisma), taban yol `/api/v1/professionals/:professionalId`.

| Konu | Servis | Backend ucu | Durum |
|---|---|---|---|
| Haftalık çalışma saatleri | `scheduleService.getWeek / saveWeek` | `GET/PUT /availability` | Backend hazır, bağlanmadı |
| İzin günleri | `scheduleService.listOffs / addOffs` | `/availability/exceptions` | Backend hazır, bağlanmadı |
| Ders kuralları | `rulesService` | `/appointment-defaults` | Backend hazır, bağlanmadı |
| Kişiler | `peopleService` | `/clients` | Backend hazır (arşiv alanı yok), bağlanmadı |
| Paketler | `packagesService` | `/offerings`, `/offerings/:id/prices` | Kısmen: tekil ders var, çoklu paket/üyelik yok |
| Molalar (isimli) | `scheduleService.listBreaks / saveBreak` | — | Backend'de yok |
| Dersler | `lessonsService` | — (tablolar var, API yok) | Backend'de yok |
| Ödemeler | `paymentsService` | — | Backend'de yok |
| Rezervasyon talepleri | `requestsService` | — | Backend'de yok |
| Profil | `profileService` | — | Backend'de yok |
| Bildirim ayarları | `notifPrefsService` | — | Backend'de yok |

Şu an her konu `mock`.

## Bilinen sınırlar

- **Aynı alana arka arkaya iki iyimser yazma:** ilki hata verirse geri alma, ikinci değişikliği de siler (önbellek ilk yazmadan önceki hâline döner). Gerçek API'ye geçince gerekirse istek sırası eklenir.
- **Boş sayfa kipi** yalnız sahte veritabanında vardır (demo amaçlı).
- **Kimlikler:** demo kimlikleri sayı metinleridir (`'0'`, `'1'`…); backend UUID döndürür, ikisi de `string`.
