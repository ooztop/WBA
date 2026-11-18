// Şifre yenileme kuralı: en az 8 karakter ve iki kutu aynı.
import { passwordIssue } from '../password';

test('boşken uyarı yok ama kaydedilemez', () => {
  expect(passwordIssue('', '')).toEqual({ ok: false, msg: null });
});
test('8 karakterden kısa şifre', () => {
  expect(passwordIssue('abc123', '')).toEqual({ ok: false, msg: 'En az 8 karakter olmalı' });
});
test('tekrar yazılırken eşleşmiyor', () => {
  expect(passwordIssue('sifre1234', 'sifre12')).toEqual({ ok: false, msg: 'Şifreler aynı değil' });
});
test('tekrar kutusu boşken uyarı yok', () => {
  expect(passwordIssue('sifre1234', '')).toEqual({ ok: false, msg: null });
});
test('uygun şifre', () => {
  expect(passwordIssue('sifre1234', 'sifre1234')).toEqual({ ok: true, msg: null });
});
