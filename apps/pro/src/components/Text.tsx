import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { typography, type TypographyVariant } from '../theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: string;
};

export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  return <RNText {...rest} style={[typography[variant], color != null && { color }, style]} />;
}
