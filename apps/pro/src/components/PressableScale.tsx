import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { motion } from '../theme';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

/** Dokunmada hafif küçülme + opaklık; tüm dokunulabilir yüzeylerin ortak geri bildirimi. */
export function PressableScale({ style, disabled, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        style,
        pressed && !disabled && { opacity: motion.pressOpacity, transform: [{ scale: motion.pressScale }] },
      ]}
    />
  );
}
