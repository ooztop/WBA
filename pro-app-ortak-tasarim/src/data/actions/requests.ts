// Talep eylemleri: rezervasyon taleplerini onayla, reddet, karşı teklif gönder.
import type { ReqState } from '../models';
import { requestsService } from '../services';
import { optimistic } from './optimistic';
import { refreshDay } from './lessons';

const close = (id: keyof ReqState) => (s: { reqs: ReqState }) => ({ reqs: { ...s.reqs, [id]: false } });

// Burak'ın talebi onaylanınca 12 Eylül 18:00 dersi servis tarafında eklenir; günün önbelleği tazelenir
export function acceptRequest(id: 'b' | 'a'): Promise<boolean> {
  return optimistic(close(id), async () => {
    await requestsService.accept(id);
    if (id === 'b') await refreshDay('2026-09-12').catch(() => {}); // tazeleme hatası onayı geri aldırmaz
  });
}
export function rejectRequest(id: 'b' | 'a'): Promise<boolean> {
  return optimistic(close(id), () => requestsService.reject(id));
}
export function counterRequest(id: 'a'): Promise<boolean> {
  return optimistic(close(id), () => requestsService.counter(id));
}
