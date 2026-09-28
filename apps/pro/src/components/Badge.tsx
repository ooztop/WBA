import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';
import { Text } from './Text';

export type BadgeTone = 'info' | 'alert';

const background: Record<BadgeTone, string> = {
  info: colors.info,
  alert: colors.alert,
};

/**
 * Durum rozeti. Renk tek başına bilgi taşımaz: metin her zaman mürekkep
 * rengindedir ve durumu kelimeyle söyler (ÖDENDİ, BEKLİYOR).
 */
export function Badge({ label, tone = 'info' }: { label: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.base, { backgroundColor: background[tone] }]}>
      <Text variant="badge">{label.toLocaleUpperCase('tr-TR')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 0,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
  },
});
