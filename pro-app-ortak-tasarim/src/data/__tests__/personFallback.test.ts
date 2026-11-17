// person(): bulunamayan kimlik (ör. boş kipte liste boşken) uygulamayı çökertmez
import { person, set } from '../../store';

test('liste boşken person() yer tutucu kişi döner', () => {
  set({ people: [] });
  const p = person('1');
  expect(p.id).toBe('1');
  expect(typeof p.ini).toBe('string');
  expect(typeof p.name).toBe('string');
});
