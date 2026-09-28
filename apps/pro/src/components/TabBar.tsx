import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarDaysIcon as CalendarOutline, UserCircleIcon as UserCircleOutline, UserGroupIcon as UserGroupOutline } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, UserCircleIcon, UserGroupIcon } from 'react-native-heroicons/solid';

import { colors, fontFamily, size, spacing } from '../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type IconComponent = ComponentType<{ size?: number; color?: string }>;

export type TabKey = 'calendar' | 'contacts' | 'account';

const tabs: { key: TabKey; label: string; active: IconComponent; inactive: IconComponent }[] = [
  { key: 'calendar', label: 'Takvim', active: CalendarDaysIcon, inactive: CalendarOutline },
  { key: 'contacts', label: 'Kişiler', active: UserGroupIcon, inactive: UserGroupOutline },
  { key: 'account', label: 'Hesabım', active: UserCircleIcon, inactive: UserCircleOutline },
];

export type TabBarProps = {
  active: TabKey;
  onChange?: (key: TabKey) => void;
};

/**
 * Alt sekme çubuğu: üstte ince ayırıcı, üç sekme.
 * Aktif: dolu ikon + 700 mürekkep etiket. Pasif: çizgi ikon %60 + 500 gri etiket.
 */
export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.key === active;
        const Icon = selected ? tab.active : tab.inactive;
        return (
          <PressableScale
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={onChange ? () => onChange(tab.key) : undefined}
            style={styles.tab}
          >
            <View style={!selected && styles.inactiveIcon}>
              <Icon size={size.tabIcon} color={colors.text} />
            </View>
            <Text
              variant="meta"
              color={selected ? colors.text : colors.textSecondary}
              style={selected && { fontFamily: fontFamily.bold }}
            >
              {tab.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 30,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 4,
  },
  inactiveIcon: {
    opacity: 0.6,
  },
});
