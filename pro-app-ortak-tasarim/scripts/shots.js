// Ekran görüntüsü karşılaştırma betiği: node scripts/shots.js before|after
// Her ekran için temiz bir sayfa açar (aynı tarayıcı bağlamı, demo verisiyle başlar); after, before ile bayt bayt karşılaştırılır.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const mode = process.argv[2] || 'after';
const dir = path.join(__dirname, 'shots', mode);
const URL = process.env.APP_URL || 'http://localhost:8081';
fs.mkdirSync(dir, { recursive: true });

const wait = (p, ms = 1200) => p.waitForTimeout(ms);
const tab = (p, t) => p.getByText(t, { exact: true }).filter({ visible: true }).last().click();
const row = (p, t) => p.getByText(t, { exact: true }).filter({ visible: true }).first().click();

const SHOTS = [
  ['01-takvim-gun', async () => {}],
  ['02-hafta', async p => { await p.getByText('Hafta', { exact: true }).filter({ visible: true }).last().click(); }],
  ['03-ay', async p => { await p.getByText('Ay', { exact: true }).filter({ visible: true }).last().click(); }],
  ['04-kisiler', async p => { await tab(p, 'Kişiler'); }],
  ['05-kisi-elif', async p => { await tab(p, 'Kişiler'); await wait(p); await row(p, 'Elif Yıldırım'); }],
  ['06-bildirimler', async p => { await tab(p, 'Bildirimler'); }],
  ['07-hesabim', async p => { await tab(p, 'Hesabım'); }],
  ['08-paket-tercihleri', async p => { await tab(p, 'Hesabım'); await wait(p); await row(p, 'Paket tercihleri'); }],
  ['09-takvim-ayarlarim', async p => { await tab(p, 'Hesabım'); await wait(p); await row(p, 'Takvim ayarlarım'); }],
  ['10-odemeler', async p => { await tab(p, 'Hesabım'); await wait(p); await row(p, 'Ödemeler'); }],
  ['11-yeni-ders', async p => { await p.getByLabel('Ekle: ders ya da mola').click(); await wait(p, 600); await row(p, 'Ders ekle'); }],
];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
  const errors = [];
  for (const [name, act] of SHOTS) {
    const p = await ctx.newPage();
    p.on('console', m => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
    p.on('pageerror', e => errors.push(`${name}: ${e.message}`));
    await p.goto(URL, { waitUntil: 'networkidle' });
    await wait(p, 3000);
    await act(p);
    await wait(p, 2500);
    await p.screenshot({ path: path.join(dir, name + '.png') });
    await p.close();
  }
  await b.close();
  if (errors.length) { console.log('Konsol hataları:'); errors.forEach(e => console.log('  ' + e)); } else console.log('Konsol hatası yok');
  if (mode !== 'before') {
    const bd = path.join(__dirname, 'shots', 'before');
    let diff = 0;
    for (const [name] of SHOTS) {
      const f = name + '.png';
      const a = fs.readFileSync(path.join(dir, f)), o = fs.existsSync(path.join(bd, f)) ? fs.readFileSync(path.join(bd, f)) : null;
      if (!o || !a.equals(o)) {
        diff++;
        // Bayt farkı varsa (alt piksel gölge gürültüsü olabilir) kaç piksel ve en çok kaç seviye farklı olduğunu yaz
        const r = o ? spawnSync('python3', ['-W', 'ignore', '-c', 'import sys\nfrom PIL import Image, ImageChops\na=Image.open(sys.argv[1]).convert("RGB");b=Image.open(sys.argv[2]).convert("RGB")\nd=ImageChops.difference(a,b)\nv=[max(p) for p in d.getdata() if p!=(0,0,0)]\nprint(len(v),"piksel, en çok",max(v) if v else 0,"seviye")', path.join(dir, f), path.join(bd, f)], { encoding: 'utf8' }) : null;
        console.log('FARKLI: ' + f + (r && r.stdout ? ' (' + r.stdout.trim() + ')' : ''));
      }
    }
    console.log(diff ? `${diff} ekran farklı` : `${SHOTS.length} ekran aynı`);
    process.exitCode = diff ? 1 : 0;
  }
})();
