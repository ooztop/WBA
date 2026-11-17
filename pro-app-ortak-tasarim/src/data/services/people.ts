// Kişiler servisi (mock dalı).
import type { ID, Person } from '../models';
import { newId } from '../mock/db';
import { copy, db } from './util';

const initials = (n: string) => n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr');

export const peopleService = {
  async list(): Promise<Person[]> {
    return copy(db('people').data().people);
  },
  // Aynı adlı kişi varsa onu döner, yoksa ekler
  async create(i: { name: string; sub?: string }): Promise<Person> {
    const m = db('people');
    const ex = m.data().people.find(p => p.name === i.name);
    if (ex) return copy(ex);
    const p: Person = { id: newId('u'), ini: initials(i.name), name: i.name, sub: i.sub ?? '', tag: ['n', 'Tek ders'], cat: '' };
    m.update(d => ({ ...d, people: [...d.people, p] }));
    return copy(p);
  },
  async update(id: ID, patch: Partial<Omit<Person, 'id'>>): Promise<Person> {
    const m = db('people');
    if (!m.data().people.some(p => p.id === id)) throw new Error(`Kişi bulunamadı: ${id}`);
    m.update(d => ({ ...d, people: d.people.map(p => (p.id === id ? { ...p, ...patch } : p)) }));
    return copy(m.data().people.find(p => p.id === id) as Person);
  },
};
