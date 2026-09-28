import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { colors, radius, size } from '../theme';
import { PressableScale } from './PressableScale';

export type IconButtonProps = {
  icon: ReactNode;
  accessibilityLabel: string;
  onPress?: () => void;
};

/** 42px kare ikon butonu, 16px köşe, gri dolgu (ör. bildirim zili). */
export function IconButton({ icon, accessibilityLabel, onPress }: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      onPress={onPress}
      style={styles.base}
    >
      {icon}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: size.iconButton,
    height: size.iconButton,
    borderRadius: radius.icon,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
