// Profil servisi (mock dalı).
import type { Profile } from '../models';
import { copy, db } from './util';

export const profileService = {
  async get(): Promise<Profile> { return copy(db('profile').data().me); },
  async save(p: Profile): Promise<void> { db('profile').update(d => ({ ...d, me: copy(p) })); },
};
