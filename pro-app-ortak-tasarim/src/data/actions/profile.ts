// Profil eylemi: Hesabı düzenle sayfasındaki bilgileri kaydeder.
import type { Profile } from '../models';
import { profileService } from '../services';
import { optimistic } from './optimistic';

export function saveProfile(me: Profile): Promise<boolean> {
  return optimistic(() => ({ me }), () => profileService.save(me));
}
