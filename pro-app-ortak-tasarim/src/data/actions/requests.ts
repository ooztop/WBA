// Talep eylemleri: rezervasyon taleplerini onayla, reddet.
import type { ID } from '../models';
import { requestsService } from '../services';
import { optimistic } from './optimistic';
import { refreshDay } from './lessons';
import { get } from '../../store';

const drop = (id: ID) => (s: { reqs: { id: ID }[] }) => ({ reqs: s.reqs.filter(r => r.id !== id) }) as never;

// Onaylanan talebin dersi servis tarafında eklenir; o günün önbelleği tazelenir
export function acceptRequest(id: ID): Promise<boolean> {
  const r = get().reqs.find(x => x.id === id);
  return optimistic(drop(id), async () => {
    await requestsService.accept(id);
    if (r) await refreshDay(r.date).catch(() => {}); // tazeleme hatası onayı geri aldırmaz
  });
}
export function rejectRequest(id: ID): Promise<boolean> {
  return optimistic(drop(id), () => requestsService.reject(id));
}
