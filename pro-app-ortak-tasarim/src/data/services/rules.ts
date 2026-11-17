// Ders kuralları servisi (mock dalı).
import type { LessonRules } from '../models';
import { copy, db } from './util';

export const rulesService = {
  async get(): Promise<LessonRules> { return copy(db('rules').data().rules); },
  async save(r: LessonRules): Promise<void> { db('rules').update(d => ({ ...d, rules: copy(r) })); },
};
