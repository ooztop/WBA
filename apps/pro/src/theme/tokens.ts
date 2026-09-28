/**
 * Pro · tasarım token'ları (form dili 1b · Yumuşak).
 * Kaynak: Claude Design — "Pro App - Tasarım Sistemi.dc.html".
 * Değer değiştirirken DESIGN.md'yi de güncelle.
 */

export const palette = {
  /** Metin, birincil buton, seçili gün, dolu takvim bloğu */
  ink: '#16181c',
  /** Müsait saat, onaylı rezervasyon, bilgi dolgusu */
  blue: '#cfe0fb',
  /** Ödenmemiş, iptal, dikkat */
  red: '#f8d8d4',
  /** Ekran zemini (1b'de ekran beyazdır) */
  white: '#ffffff',
  /** Satır ve gün dolgusu, pasif dolgu */
  gray100: '#f3f3f1',
  /** İkincil metin, pasif ikon */
  gray600: '#6b6c70',
} as const;

export const colors = {
  background: palette.white,
  surface: palette.gray100,
  text: palette.ink,
  textSecondary: palette.gray600,
  /** Açık mavi dolgu üstündeki ikincil metin */
  textOnFillMuted: 'rgba(22,24,28,0.6)',
  textOnInk: palette.white,
  textOnInkMuted: 'rgba(255,255,255,0.65)',
  primary: palette.ink,
  info: palette.blue,
  alert: palette.red,
  divider: 'rgba(0,0,0,0.07)',
} as const;

/** Plus Jakarta Sans; RN'de ağırlık, fontFamily ile seçilir. */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

const em = (size: number, value: number) => size * value;

export const typography = {
  /** ekran-başlık · 800/26 */
  screenTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 26,
    lineHeight: 26 * 1.1,
    letterSpacing: em(26, -0.025),
    color: colors.text,
  },
  /** bölüm-başlık · 800/17 */
  sectionTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 17,
    color: colors.text,
  },
  /** saat (ders satırı) · 800/15 */
  time: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    color: colors.text,
  },
  /** buton · 700/15 */
  button: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textOnInk,
  },
  /** satır-başlık · 700/14.5 */
  rowTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14.5,
    color: colors.text,
  },
  /** gövde · 500/13.5 */
  body: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    lineHeight: 13.5 * 1.5,
    color: colors.text,
  },
  /** bağlantı · 700/12 */
  link: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  /** yardımcı · 500/12 */
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  /** rozet · 700/10.5 · +6% · BÜYÜK HARF */
  badge: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    letterSpacing: em(10.5, 0.06),
    color: colors.text,
  },
  /** küçük meta (süre, sekme etiketi) · 500/10.5 */
  meta: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  /** gün etiketi (PZT) · 500/10 */
  dayLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: colors.textSecondary,
  },
} as const;

export const radius = {
  /** Rozet, kapsül */
  pill: 999,
  /** Ders satırı */
  row: 22,
  /** Gün hücresi, birincil buton */
  control: 20,
  /** İkon butonu */
  icon: 16,
  /** Renk çizgisi */
  bar: 2,
} as const;

export const spacing = {
  xxs: 2,
  xs: 5,
  sm: 6,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 18,
  /** Ekran yatay kenar boşluğu */
  screen: 24,
  /** Ekran başlığı yatay boşluğu */
  header: 26,
} as const;

export const size = {
  buttonHeight: 56,
  iconButton: 42,
  icon: 21,
  tabIcon: 22,
  accentBar: 3,
  homeIndicator: { width: 134, height: 5 },
} as const;

/** 1b düz yüzeylidir: derinlik gri dolgu ile verilir, gölge kullanılmaz. */
export const elevation = {
  none: {},
} as const;

export const motion = {
  pressScale: 0.97,
  pressOpacity: 0.85,
  durationFast: 120,
} as const;

export const theme = {
  palette,
  colors,
  fontFamily,
  typography,
  radius,
  spacing,
  size,
  elevation,
  motion,
} as const;

export type Theme = typeof theme;
export type TypographyVariant = keyof typeof typography;
