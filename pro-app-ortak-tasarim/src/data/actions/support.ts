// Destek eylemi: mesajı gönderir; hata olursa uyarı gösterir ve false döner.
import { supportService } from '../services';
import { toast } from '../../store';

export async function sendSupport(topic: string, text: string): Promise<boolean> {
  try {
    await supportService.send({ topic, text });
    return true;
  } catch {
    toast('Gönderilemedi. Tekrar dene.');
    return false;
  }
}
