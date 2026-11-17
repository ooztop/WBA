// Kişi eylemleri: kişi ekleme, güncelleme ve arşivleme (arşivden geri alma da güncellemedir).
import type { ID, Person } from '../models';
import { peopleService } from '../services';
import { afterCall, optimistic } from './optimistic';

// Aynı adlı kişi varsa onu döner, yoksa ekler. Hata olursa uyarı gösterilir ve fırlatılır.
export async function addPerson(name: string, sub = ''): Promise<Person> {
  const p = await afterCall(() => peopleService.create({ name, sub }), (made, s) => (s.people.some(x => x.id === made.id) ? {} : { people: [...s.people, made] }), 'Kişi eklenemedi. Tekrar dene.');
  if (!p) throw new Error('Kişi eklenemedi');
  return p;
}

export function updatePerson(id: ID, patch: Partial<Omit<Person, 'id'>>): Promise<boolean> {
  return optimistic(s => ({ people: s.people.map(p => (p.id === id ? { ...p, ...patch } : p)) }), () => peopleService.update(id, patch));
}
