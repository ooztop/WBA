// Şifre yenileme kuralı: en az 8 karakter, iki kutu aynı. Uyarı yalnız yazmaya başlanınca çıkar.
export const MIN_PW = 8;

export function passwordIssue(pw: string, again: string): { ok: boolean; msg: string | null } {
  if (pw.length > 0 && pw.length < MIN_PW) return { ok: false, msg: `En az ${MIN_PW} karakter olmalı` };
  if (!pw) return { ok: false, msg: null };
  if (!again) return { ok: false, msg: null };
  if (pw !== again) return { ok: false, msg: 'Şifreler aynı değil' };
  return { ok: true, msg: null };
}
