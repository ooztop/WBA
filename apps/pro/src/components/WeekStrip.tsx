import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type Day = {
  key: string;
  /** Kısa gün adı: PZT, SAL … */
  label: string;
  /** Ayın günü */
  date: number;
  /** Açık mavi: o gün dersi / müsaitliği var */
  marked?: boolean;
};

export type DayChipProps = Day & {
  selected?: boolean;
  onPress?: () => void;
};

export function DayChip({ label, date, marked, selected, onPress }: DayChipProps) {
  const background = selected ? colors.primary : marked ? colors.info : colors.surface;
  const labelColor = selected ? colors.textOnInkMuted : marked ? colors.textOnFillMuted : colors.textSecondary;
  const dateColor = selected ? colors.textOnInk : colors.text;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`${label} ${date}`}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: background }]}
    >
      <Text variant="dayLabel" color={labelColor}>
        {label}
      </Text>
      <Text variant="rowTitle" color={dateColor} style={styles.date}>
        {date}
      </Text>
    </PressableScale>
  );
}

export type WeekStripProps = {
  days: Day[];
  selectedKey?: string;
  onSelect?: (key: string) => void;
};

/** Haftalık gün şeridi: eşit genişlikte hücreler, 6px aralık. */
export function WeekStrip({ days, selectedKey, onSelect }: WeekStripProps) {
  return (
    <View style={styles.strip}>
      {days.map((day) => (
        <DayChip
          {...day}
          key={day.key}
          selected={day.key === selectedKey}
          onPress={onSelect ? () => onSelect(day.key) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 11,
    borderRadius: radius.control,
  },
  date: {
    fontSize: 15,
  },
});
