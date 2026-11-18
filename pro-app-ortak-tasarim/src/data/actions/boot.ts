// Açılış ve yeniden yükleme: önbelleği servislerden doldurur (boot), Boş sayfa ve sıfırlama sonrası baştan yükler.
import { TODAY, addD } from '../../data';
import type { Accent } from '../../theme';
import { get, set } from '../../store';
import { iso } from '../dates';
import { mockDb } from '../mock/db';
import { notifPrefsService, notifsService, packagesService, paymentsService, peopleService, profileService, requestsService, rulesService, scheduleService } from '../services';
import { ensureLessons, resetInflight } from './lessons';
import { modelsToPrefs } from './settings';

const ACCENTS: Accent[] = ['blue', 'orange', 'purple'];

// Bugünün ±6 haftası (takvim, odaklı günün çevresini kendisi ister)
async function loadWindow() {
  await ensureLessons(iso(addD(TODAY, -42)), iso(addD(TODAY, 42)));
}

// epoch: yükleme başladığındaki sayaç; araya yeniden yükleme girdiyse eski sonuç atılır
async function loadLists(epoch: number) {
  const [people, packages, breaks, offs, debts, paid, collected, me, reqs, notifs] = await Promise.all([
    peopleService.list(), packagesService.list(), scheduleService.listBreaks(), scheduleService.listOffs(),
    paymentsService.debts(), paymentsService.paid(), paymentsService.collected(), profileService.get(), requestsService.list(), notifsService.list(),
  ]);
  if (get().epoch !== epoch) return;
  set({ people, packages, breaks, offs, debts, paid, collected, me, reqs, notifs });
}

// Boş sayfa ve Verileri sıfırla sonrası: ders önbelleğini boşaltıp her şeyi yeniden yükler
export async function reloadAll(): Promise<void> {
  resetInflight();
  set(s => ({ lessons: {}, loaded: new Set<string>(), epoch: s.epoch + 1 }));
  // Önce listeler (kişiler), sonra dersler: takvim bir dersi gösterirken kişisi önbellekte olsun
  await loadLists(get().epoch);
  await loadWindow();
}

// Uygulama açılışı: cihazdaki kaydı yükle, listeleri ve bugünün çevresindeki dersleri önbelleğe al
export async function boot(): Promise<void> {
  await mockDb.load();
  const { dark, accent, ...ui } = mockDb.data().uiPrefs;
  // Çalışma saatleri, ders kuralları ve bildirim tercihleri servislerden gelir; ekranlar bunları prefs anahtarlarıyla okur
  const [week, rules, notif] = await Promise.all([scheduleService.getWeek(), rulesService.get(), notifPrefsService.get()]);
  const prefs = { ...ui, ...modelsToPrefs(week, rules, notif) };
  set({ prefs, ...(typeof dark === 'boolean' ? { dark } : {}), ...(ACCENTS.includes(accent as Accent) ? { accent: accent as Accent } : {}) });
  await reloadAll();
}

// Hesabım ⋯ › Boş sayfa / Dolu sayfa
export async function setEmptyMode(on: boolean): Promise<void> {
  mockDb.setEmpty(on);
  set({ emp: on });
  await reloadAll();
}

// Hesabım ⋯ › Verileri sıfırla: demo verisi geri gelir, ekran ilk açılış durumuna döner
export async function resetDemo(): Promise<void> {
  mockDb.reset();
  set({ stack: [], sheets: [], tab: 0, emp: false, F: new Date(TODAY), dark: false, accent: 'blue', prefs: {} });
  await reloadAll();
}
