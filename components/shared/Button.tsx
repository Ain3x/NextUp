import { TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from './Typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const { theme } = useTheme();

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  };

  const labelColors: Record<ButtonVariant, string> = {
    primary: theme.colors.background,
    secondary: theme.colors.primary,
    ghost: theme.colors.textSecondary,
  };

  const baseStyle: ViewStyle = {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.5 : 1,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[baseStyle, variantStyles[variant], style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={labelColors[variant]}
          size="small"
        />
      ) : (
        <Typography
          variant="label"
          color={labelColors[variant]}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
}