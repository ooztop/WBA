// Talep eylemleri: rezervasyon taleplerini onayla, reddet.
import type { ReqState } from '../models';
import { requestsService } from '../services';
import { optimistic } from './optimistic';
import { refreshDay } from './lessons';

const close = (id: keyof ReqState) => (s: { reqs: ReqState }) => ({ reqs: { ...s.reqs, [id]: false } });

// Burak'ın talebi onaylanınca 12 Eylül 18:00 dersi servis tarafında eklenir; günün önbelleği tazelenir
export function acceptRequest(id: 'b'): Promise<boolean> {
  return optimistic(close(id), async () => {
    await requestsService.accept(id);
    await refreshDay('2026-09-12').catch(() => {}); // tazeleme hatası onayı geri aldırmaz
  });
}
export function rejectRequest(id: 'b'): Promise<boolean> {
  return optimistic(close(id), () => requestsService.reject(id));
}
