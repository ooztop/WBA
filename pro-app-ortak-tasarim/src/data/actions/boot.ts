// Açılış ve yeniden yükleme: önbelleği servislerden doldurur (boot), Boş sayfa ve sıfırlama sonrası baştan yükler.
import { TODAY, addD } from '../../data';
import type { Accent } from '../../theme';
import { set } from '../../store';
import { iso } from '../dates';
import { mockDb } from '../mock/db';
import { packagesService, paymentsService, peopleService, profileService, requestsService, scheduleService } from '../services';
import { ensureLessons, resetInflight } from './lessons';

const ACCENTS: Accent[] = ['blue', 'orange', 'purple'];

// Bugünün ±6 haftası (takvim, odaklı günün çevresini kendisi ister)
async function loadWindow() {
  await ensureLessons(iso(addD(TODAY, -42)), iso(addD(TODAY, 42)));
}

async function loadLists() {
  const [people, packages, breaks, offs, debts, paid, collected, me, reqs] = await Promise.all([
    peopleService.list(), packagesService.list(), scheduleService.listBreaks(), scheduleService.listOffs(),
    paymentsService.debts(), paymentsService.paid(), paymentsService.collected(), profileService.get(), requestsService.get(),
  ]);
  set({ people, packages, breaks, offs, debts, paid, collected, me, reqs });
}

// Boş sayfa ve Verileri sıfırla sonrası: ders önbelleğini boşaltıp her şeyi yeniden yükler
export async function reloadAll(): Promise<void> {
  resetInflight();
  set(s => ({ lessons: {}, loaded: new Set<string>(), epoch: s.epoch + 1 }));
  await loadLists();
  await loadWindow();
}

// Uygulama açılışı: cihazdaki kaydı yükle, listeleri ve bugünün çevresindeki dersleri önbelleğe al
export async function boot(): Promise<void> {
  await mockDb.load();
  const { dark, accent, ...prefs } = mockDb.data().uiPrefs;
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
  set({ stack: [], sheets: [], tab: 0, emp: false, F: new Date(TODAY), dark: false, accent: 'blue', prefs: {}, extra: [], cancelled: [] });
  await reloadAll();
}
