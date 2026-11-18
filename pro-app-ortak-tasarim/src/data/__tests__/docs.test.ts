// Dokümanlar: kişiye göre ayırma, satır yazısı, not başlığı ve servis.
import { mockDb } from '../mock/db';
import { docLine, noteTitle, splitDocs } from '../docs';
import type { Doc } from '../models';
import { docsService } from '../services';

beforeEach(() => { jest.useFakeTimers(); mockDb.reset(); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

const D = (id: string, pid: string, kind: Doc['kind'], date: string, x: Partial<Doc> = {}): Doc => ({ id, pid, kind, name: id, date, ...x });

test('splitDocs kişinin dosyalarını ve notlarını yeniden eskiye ayırır', () => {
  const all = [D('a', '1', 'pdf', '2026-08-13'), D('b', '1', 'image', '2026-08-28'), D('c', '1', 'note', '2026-08-27'), D('d', '1', 'note', '2026-09-03'), D('e', '2', 'pdf', '2026-09-01')];
  const r = splitDocs(all, '1');
  expect(r.files.map(x => x.id)).toEqual(['b', 'a']);
  expect(r.notes.map(x => x.id)).toEqual(['d', 'c']);
});
test('docLine: dosyada boyut ve tarih, notta metnin ilk satırı', () => {
  expect(docLine(D('a', '1', 'pdf', '2026-08-28', { size: '1,2 MB' }))).toBe('1,2 MB · 28 Ağu');
  expect(docLine(D('a', '1', 'pdf', '2026-08-13'))).toBe('13 Ağu');
  expect(docLine(D('n', '1', 'note', '2026-09-03', { text: 'Konu tekrarı yapıldı\nödev verildi' }))).toBe('Konu tekrarı yapıldı');
  expect(docLine(D('n', '1', 'note', '2026-09-03', { text: '' }))).toBe('Boş not');
});
test('noteTitle tarihten "9 Eylül notu" yazar', () => {
  expect(noteTitle('2026-09-09')).toBe('9 Eylül notu');
});
test('demo verisinde her etkin kişinin 3 dosyası ve 2 notu var', async () => {
  const all = await docsService.list();
  const r = splitDocs(all, '0');
  expect(r.files).toHaveLength(3);
  expect(r.notes).toHaveLength(2);
});
test('create, update ve remove kalıcıdır', async () => {
  const n = await docsService.create({ pid: '0', kind: 'note', name: '9 Eylül notu', date: '2026-09-09', text: '' });
  expect(n.id).toBeTruthy();
  await docsService.update(n.id, { text: 'Yeni not' });
  expect((await docsService.list()).find(x => x.id === n.id)?.text).toBe('Yeni not');
  await docsService.remove(n.id);
  expect((await docsService.list()).some(x => x.id === n.id)).toBe(false);
});
test('boş sayfa kipinde doküman yok', async () => {
  mockDb.setEmpty(true);
  expect(await docsService.list()).toEqual([]);
  mockDb.setEmpty(false);
});
