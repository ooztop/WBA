import { addD, lessonStarted, NOW_H, TODAY } from '../../data';

describe('lessonStarted', () => {
  it('dünkü ders başlamış sayılır', () => expect(lessonStarted(addD(TODAY, -1), 20)).toBe(true));
  it('yarınki ders başlamamış sayılır', () => expect(lessonStarted(addD(TODAY, 1), 8)).toBe(false));
  it('bugün saati geçmiş ders başlamış sayılır', () => expect(lessonStarted(TODAY, NOW_H - 2)).toBe(true));
  it('bugün devam eden ders (başlamış, bitmemiş) başlamış sayılır', () => expect(lessonStarted(TODAY, Math.floor(NOW_H))).toBe(true));
  it('bugün daha sonraki ders başlamamış sayılır', () => expect(lessonStarted(TODAY, NOW_H + 1)).toBe(false));
});
