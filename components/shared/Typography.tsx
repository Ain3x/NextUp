import { Text, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type TypographyVariant = 'heading' | 'subheading' | 'body' | 'caption' | 'label';

type Props = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  numberOfLines?: number;
};

export function Typography({ variant, children, style, color, numberOfLines }: Props) {
  const { theme } = useTheme();

  const variantStyles: Record<TypographyVariant, TextStyle> = {
    heading: {
      fontSize: theme.font.sizes.xl,
      fontWeight: theme.font.weights.bold,
      color: color ?? theme.colors.text,
    },
    subheading: {
      fontSize: theme.font.sizes.lg,
      fontWeight: theme.font.weights.medium,
      color: color ?? theme.colors.text,
    },
    body: {
      fontSize: theme.font.sizes.md,
      fontWeight: theme.font.weights.regular,
      color: color ?? theme.colors.text,
    },
    caption: {
      fontSize: theme.font.sizes.xs,
      fontWeight: theme.font.weights.regular,
      color: color ?? theme.colors.textSecondary,
    },
    label: {
      fontSize: theme.font.sizes.sm,
      fontWeight: theme.font.weights.medium,
      color: color ?? theme.colors.textSecondary,
    },
  };

  return (
    <Text
      style={[variantStyles[variant], style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}