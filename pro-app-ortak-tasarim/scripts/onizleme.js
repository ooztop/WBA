// Uygulamanın web sürümünü tek bir HTML dosyasına paketler (JS ve Manrope yazı tipleri içine gömülü).
// Bu dosya claude.ai'daki "Pro App Önizleme" artifact'ine yüklenir.
//
// Kullanım (pro-app-ortak-tasarim klasöründe):
//   npx expo export --platform web --output-dir /tmp/onizleme-dist
//   node scripts/onizleme.js /tmp/onizleme-dist /tmp/pro-app-onizleme.html
const fs = require('fs');
const path = require('path');

const [dist, out] = process.argv.slice(2);
if (!dist || !out) {
  console.error('Kullanım: node scripts/onizleme.js <expo export klasörü> <çıktı.html>');
  process.exit(1);
}

const dir = path.join(dist, '_expo/static/js/web');
let code = fs.readFileSync(path.join(dir, fs.readdirSync(dir).find(f => f.endsWith('.js'))), 'utf8');

// Yazı tipi modülleri dosya yolu döndürür: yolu dosyanın kendisiyle (data URI) değiştir
let n = 0;
code = code.replace(/m\.exports="\/(assets\/[^"]+\.ttf)"/g, (m, p) => {
  n++;
  return 'm.exports="data:font/ttf;base64,' + fs.readFileSync(path.join(dist, p)).toString('base64') + '"';
});
if (n === 0) throw new Error('Pakette yazı tipi bulunamadı; expo export çıktısı değişmiş olabilir');
code = code.replace(/<\/script/gi, '<\\/script');

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Pro App Önizleme</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root{--page:#eef0f4;color-scheme:light}
html,body{height:100%;margin:0}
body{overflow:hidden;background:var(--page)}
#root{display:flex;height:100%;flex:1}
</style></head><body>
<div id="root"></div>
<script>
${code}
</script>
</body></html>`;
fs.writeFileSync(out, html);
console.log(`${out} yazıldı (${(html.length / 1e6).toFixed(2)} MB, ${n} yazı tipi gömülü)`);
