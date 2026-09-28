# Pro

Serbest çalışan eğitmen/danışman için mobil uygulama. Expo (SDK 57) + React Native + TypeScript.

Bu aşamada yalnız **tasarım sistemi** var: token'lar, temel bileşenler ve hepsini tek ekranda gösteren katalog.

## Çalıştırma

```bash
cd apps/pro
npm install
npm start          # Expo Go ile telefonda aç (QR)
npm run web        # tarayıcıda önizleme
npm run typecheck
```

## Yapı

- `DESIGN.md` — tasarım dili (1b · Yumuşak): renk, tipografi, köşe, bileşen kuralları.
- `src/theme/tokens.ts` — DESIGN.md'nin kod karşılığı.
- `src/theme/fonts.ts` — Plus Jakarta Sans yüklemesi.
- `src/components/` — `Button`, `Badge`, `IconButton`, `WeekStrip`/`DayChip`, `LessonRow`, `ScreenHeader`, `SectionHeader`, `TabBar`, `Text`, `PressableScale`.
- `src/DesignSystemScreen.tsx` — katalog ekranı (şimdilik uygulamanın açılış ekranı).
