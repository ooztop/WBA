import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, size, spacing } from '../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type LessonRowProps = {
  time: string;
  /** Ör. "60 dk" */
  duration: string;
  title: string;
  subtitle?: string;
  /** Soldaki ince çizginin rengi; varsayılan mürekkep. Dikkat gerektiren satırda açık kırmızı. */
  accentColor?: string;
  /** Sağ uç: genelde bir <Badge />. */
  trailing?: ReactNode;
  onPress?: () => void;
};

/** Gri dolgulu, 22px köşeli satır: renk çizgisi · saat/süre · başlık/alt satır · rozet. */
export function LessonRow({
  time,
  duration,
  title,
  subtitle,
  accentColor = colors.primary,
  trailing,
  onPress,
}: LessonRowProps) {
  return (
    <PressableScale
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={styles.row}
    >
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.time}>
        <Text variant="time">{time}</Text>
        <Text variant="meta">{duration}</Text>
      </View>
      <View style={styles.content}>
        <Text variant="rowTitle" numberOfLines={1}>
          {title}
        </Text>
        {subtitle != null && (
          <Text variant="caption" numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.row,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  accent: {
    width: size.accentBar,
    alignSelf: 'stretch',
    borderRadius: radius.bar,
  },
  time: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    marginTop: spacing.xxs,
  },
});
