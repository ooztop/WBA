import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, size } from '../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Birincil buton: tam genişlik, mürekkep dolgu, 56px, 20px köşe. */
export function Button({ label, onPress, disabled, style }: ButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, disabled && styles.disabled, style]}
    >
      <Text variant="button" color={disabled ? colors.textSecondary : colors.textOnInk}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: size.buttonHeight,
    borderRadius: radius.control,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.surface,
  },
});
