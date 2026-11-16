import React from 'react';
import { BAND1, S1 } from './screens1';
import { S2 } from './screens2';
import { BAND3, S3 } from './screens3';
import { SHEET_MAP } from './sheets';
type M = Record<string, React.ComponentType<{ p: any }>>;
export const SCREENS: M = { ...S1, ...S2, ...S3 };
export const SHEETS: M = SHEET_MAP;
// Koyu bantlı (durum çubuğu beyaz) sayfalar
export const BAND: string[] = [...BAND1, ...BAND3];
