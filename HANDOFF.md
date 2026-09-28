# Devir notu: "Tasarımla çalışma ve uygulama planı" oturumundan

Bu dosya, önceki oturumda konuşulanları yeni oturuma aktarmak için yazıldı.

## Kullanıcı ve hedef
- Kullanıcı Türkçe konuşuyor; açıklamaları sade Türkçe ile yap.
- Birden fazla uygulama yapmak istiyor. İlki "Pro App"; tasarımı Claude Design'da hazırlandı
  (`Pro App - Tasarım Sistemi.dc.html` + `support.js`, ayrıca `README.md` ve `chats/` konuşmaları).
- Platform (web / mobil) ve teknoloji henüz netleşmedi — kodlamadan önce sor ya da export'taki notlardan çıkar.

## Repoda hazır olanlar (ooztop/WBA, branch `claude/happy-ramanujan-alnfwy`)
- `.claude/skills/` altında, orijinal GitHub kaynaklarından kopyalanmış skill'ler:
  - Superpowers (obra/superpowers): brainstorming, writing-plans, executing-plans, TDD, systematic-debugging vb.
  - Impeccable (pbakaus/impeccable): `/impeccable init` → PRODUCT.md + DESIGN.md; craft/critique/audit/polish.
  - Emil Kowalski (emilkowalski/skills): emil-design-eng, animate, review-animations, apple-design, mobile-native, animate-expo…
  - Vercel web-design-guidelines: yayın öncesi arayüz denetimi.
  - Kaynak commit'leri ve lisanslar: `.claude/skills/SOURCES.md`, `_licenses/`.
- `CLAUDE.md`: çalışma kuralları (önce plan → tasarım dili → kod → denetim).

## Verilen kararlar
- TikTok'taki "DM us" skill paketleri kullanılmadı; yalnızca orijinal depolardan alındı.
- Claude-Mem ve Observer kurulmadı (bulut oturumunda gereksiz / kaynağı belirsiz); hafıza için CLAUDE.md kullanılıyor.
- UI/UX Pro Max, Brandkit, Image-to-Code, Extract Design System kurulmadı (Impeccable ve Claude Design aynı işi görüyor).
- Kullanıcıya claude.ai eklenti dizininden şunları kurması önerildi: Design (Anthropic), frontend-design (Anthropic),
  Figma (Figma kullanıyorsa), Backend Design (backend olacaksa). Engineering isteğe bağlı.

## Sıradaki adımlar
1. Export'taki `README.md` ve `chats/` konuşmalarını oku; belirsizlik varsa kodlamadan önce kullanıcıya sor.
2. Tasarım sistemini (renk, font, boşluk, bileşenler) çıkarıp `DESIGN.md`'ye işle (`/impeccable init` akışı).
3. Plan çıkar (Superpowers), onaydan sonra `Pro App - Tasarım Sistemi.dc.html`'i uygula.
4. Bitince `web-design-guidelines` ve `/impeccable audit` ile denetle.
