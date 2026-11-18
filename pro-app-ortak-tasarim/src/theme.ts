// "Pro App · Ortak Tasarım" renkleri (prototip/ortak-tasarim/prototip.html içindeki .ds değişkenleri)
export type Accent = 'blue' | 'orange' | 'purple';

const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
// color-mix(in srgb, a p%, b)
export const mix = (a: string, b: string, p: number) => {
  const x = hex(a), y = hex(b);
  return '#' + x.map((v, i) => Math.round(v * p + y[i] * (1 - p)).toString(16).padStart(2, '0')).join('');
};
export const alpha = (h: string, a: number) => { const x = hex(h); return `rgba(${x[0]},${x[1]},${x[2]},${a})`; };

const base = {
  light: {
    dark: false,
    ink: '#121826', muted: '#5B6272', page: '#F3F4F7', card: '#FFFFFF', sdark: '#121826', sdark2: '#262C3D',
    onDark: '#FFFFFF', onDarkMuted: '#C9CEDA', border: '#D5D9E2', divider: '#E4E7EE',
    success: '#127A45', successTint: '#DDF2E6', danger: '#B42318', dangerTint: '#FBE3E1', info: '#1C3F99', infoTint: '#E3EAFF', warn: '#B54708', warnTint: '#FEEBD7',
    shCard: '0px 4px 16px rgba(18,24,38,0.08)', shFloat: '0px 2px 8px rgba(18,24,38,0.12)', shToast: '0px 12px 32px rgba(18,24,38,0.28)',
    canvas: '#E2E4EA', knob: '#FFFFFF', scrim: 'rgba(18,24,38,0.45)',
  },
  dark: {
    dark: true,
    ink: '#F3F4F7', muted: '#A3A9B6', page: '#0B0F19', card: '#161B29', sdark: '#1E2435', sdark2: '#2B3246',
    onDark: '#FFFFFF', onDarkMuted: '#C9CEDA', border: '#3A4157', divider: '#262C3D',
    success: '#3CCB7F', successTint: '#123826', danger: '#F97066', dangerTint: '#3D1714', info: '#8AA7FF', infoTint: '#18234A', warn: '#FDB022', warnTint: '#3A2410',
    shCard: '0px 4px 16px rgba(0,0,0,0.4)', shFloat: '0px 2px 8px rgba(0,0,0,0.5)', shToast: '0px 12px 32px rgba(0,0,0,0.6)',
    canvas: '#05070C', knob: '#F3F4F7', scrim: 'rgba(18,24,38,0.45)',
  },
};
// [accent, on-accent, tint, tint-soft, accent-ink]
const AC: Record<Accent, { light: string[]; dark: string[] }> = {
  orange: { light: ['#FF7A1A', '#121826', '#FFE1CC', '#FFF1E6', '#8A3D00'], dark: ['#FF8A33', '#121826', '#4A2A12', '#2C1D10', '#FFB27A'] },
  blue: { light: ['#2F4BD1', '#FFFFFF', '#E1E6FF', '#F2F4FF', '#1F35A8'], dark: ['#7B8FF0', '#0B1030', '#1C2656', '#141A33', '#C3CCFF'] },
  purple: { light: ['#7A3FD1', '#FFFFFF', '#EEE1FF', '#F7F0FF', '#5A24A8'], dark: ['#B98AF0', '#1A0B30', '#2E1C4A', '#1E1430', '#E0CCFF'] },
};

function build(dark: boolean, ac: Accent) {
  const b = dark ? base.dark : base.light, a = AC[ac][dark ? 'dark' : 'light'];
  return { ...b, accent: a[0], onAccent: a[1], tint: a[2], tintSoft: a[3], accentInk: a[4], dangerLine: alpha(b.danger, 0.22),
    // Mat pembe zemin (iptal kutusu) ve beyaz yazılı dolu kırmızı düğme; düğme rengi iki temada da aynı (beyaz yazıyla okunur)
    dangerSoft: mix(b.dangerTint, b.page, 0.5), dangerFill: '#B42318' };
}
export type Colors = ReturnType<typeof build>;
const memo: Record<string, Colors> = {};
export const colors = (dark: boolean, ac: Accent): Colors => (memo[`${dark}${ac}`] ??= build(dark, ac));

// Manrope: prototip 500 / 700 / 800 kullanır
export const ff = (w = 500) => (w >= 750 ? 'Manrope_800ExtraBold' : w >= 600 ? 'Manrope_700Bold' : 'Manrope_500Medium');
export const EASE = [0.32, 0.72, 0, 1] as const;
