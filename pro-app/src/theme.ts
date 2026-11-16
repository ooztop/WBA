// Tasarım Sistemi v4 renkleri (prototip/app.html içindeki TH + VARS birleşimi)
export type TyKey = 'b' | 'g' | 'o' | 'd';
// [açık zemin, ana renk, yazı rengi, kısa ad, uzun ad]
type Ty = Record<TyKey, [string, string, string, string, string]>;

const light = {
  dark: false,
  bg: '#FFFFFF', t: '#16171A', t2: '#6C6E72', t3: '#A1A3A7', pbg: '#F2F4FF', sep: '#E4E4E8',
  a: '#2F4BD1', on: '#FFFFFF', fill: '#F3F4F6', fill2: '#E3E4E8', aSoft: '#E8ECFF',
  red: '#D6453D', redSoft: '#FBE7E5', ok: '#1E7A45', sheet: '#FFFFFF', segOn: '#FFFFFF',
  scrim: 'rgba(15,18,30,0.32)', vl: '#E6E6EA', now: '#4A4C51', tab: '#6E6E73', barS: '#F5F7FF',
  seg: '#F0F0F2', segT: '#FFFFFF', toast: '#16171A', menu: '#FFFFFF',
  a12: '#E6E9F9', a14: '#E2E6F9', a15: 'rgba(47,75,209,0.15)', a30: 'rgba(47,75,209,0.3)',
  red8: '#FCF0EF', red30: 'rgba(214,69,61,0.3)', red35: 'rgba(214,69,61,0.35)',
  fabShadow: '0px 4px 14px rgba(47,75,209,0.38)',
  ty: {
    b: ['#D2DBFF', '#2F4BD1', '#1A2A80', 'Bireysel', 'Bireysel · Stüdyo A'],
    g: ['#E8D4FB', '#8A3FD1', '#4A1A80', 'Grup', 'Grup · 3 kişi'],
    o: ['#C6EEDD', '#12A06B', '#0B5A3C', 'Online', 'Online görüşme'],
    d: ['#FFDBBF', '#F07A1A', '#7A3A08', 'Deneme dersi', 'Deneme dersi'],
  } as Ty,
};

const dark: typeof light = {
  dark: true,
  bg: '#000000', t: '#F4F4F6', t2: '#9A9DA2', t3: '#6A6D72', pbg: '#141A33', sep: '#2A2A2D',
  a: '#7B8FF0', on: '#0B1030', fill: '#1C1C1E', fill2: '#3A3A3D', aSoft: 'rgba(123,143,240,0.18)',
  red: '#FF6B61', redSoft: 'rgba(255,107,97,0.16)', ok: '#5FD08B', sheet: '#1C1C1E', segOn: '#48484B',
  scrim: 'rgba(0,0,0,0.55)', vl: '#2A2A2D', now: '#B4B7BC', tab: '#8E8E93', barS: '#1A1C26',
  seg: '#1C1C1E', segT: '#3A3A3D', toast: '#2C2C2E', menu: '#1C1C1E',
  a12: '#0F111D', a14: '#111422', a15: 'rgba(123,143,240,0.15)', a30: 'rgba(123,143,240,0.3)',
  red8: '#140908', red30: 'rgba(255,107,97,0.3)', red35: 'rgba(255,107,97,0.35)',
  fabShadow: '0px 4px 12px rgba(0,0,0,0.6)',
  ty: {
    b: ['#1C2656', '#7B8FF0', '#D5DCFF', 'Bireysel', 'Bireysel · Stüdyo A'],
    g: ['#2E1C4A', '#B98AF0', '#EBDCFF', 'Grup', 'Grup · 3 kişi'],
    o: ['#0F3A2B', '#3FD39A', '#C8F5E3', 'Online', 'Online görüşme'],
    d: ['#45260E', '#FF9A4A', '#FFE0C7', 'Deneme dersi', 'Deneme dersi'],
  } as Ty,
};

export type Colors = typeof light;
export const THEMES = { light, dark };

// Avatar renkleri (zemin, yazı)
export const AVC: [string, string][] = [
  ['rgba(47,75,209,0.14)', '#3B55D9'],
  ['rgba(138,63,209,0.15)', '#8A3FD1'],
  ['rgba(18,160,107,0.15)', '#12A06B'],
  ['rgba(240,122,26,0.17)', '#E06A10'],
];

// Instrument Sans: prototipteki ara ağırlıklar (470, 570…) en yakın sabit ağırlığa iner
export const ff = (w = 400) =>
  w >= 650 ? 'InstrumentSans_700Bold' : w >= 550 ? 'InstrumentSans_600SemiBold' : w >= 460 ? 'InstrumentSans_500Medium' : 'InstrumentSans_400Regular';

export const EASE = [0.32, 0.72, 0, 1] as const;
