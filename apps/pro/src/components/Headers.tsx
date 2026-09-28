import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Sağ üst: genelde bir <IconButton />. */
  trailing?: ReactNode;
};

/** Ekran başlığı: 800/26 başlık + 12px yardımcı satır, sağda isteğe bağlı eylem. */
export function ScreenHeader({ title, subtitle, trailing }: ScreenHeaderProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.screenText}>
        <Text variant="screenTitle" accessibilityRole="header">
          {title}
        </Text>
        {subtitle != null && (
          <Text variant="caption" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </View>
  );
}

export type SectionHeaderProps = {
  title: string;
  /** Sağdaki bağlantı metni; "›" otomatik eklenir. */
  actionLabel?: string;
  onActionPress?: () => void;
};

/** Bölüm başlığı: 800/17 başlık, sağda 700/12 gri bağlantı ("Günü düzenle ›"). */
export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.section}>
      <Text variant="sectionTitle" accessibilityRole="header">
        {title}
      </Text>
      {actionLabel != null && (
        <PressableScale accessibilityRole="link" hitSlop={8} onPress={onActionPress}>
          <Text variant="link">{actionLabel} ›</Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  screenText: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
});
