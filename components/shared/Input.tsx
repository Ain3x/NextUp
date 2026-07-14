import { TextInput, View, ViewStyle, TextStyle } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from './Typography';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
};

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  style,
}: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const containerStyle: ViewStyle = {
    gap: theme.spacing.xs,
  };

  const inputStyle: ViewStyle = {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderColor: error
      ? theme.colors.error
      : focused
      ? theme.colors.primary
      : theme.colors.border,
    backgroundColor: theme.colors.surface,
  };

  const textStyle: TextStyle = {
    fontSize: theme.font.sizes.md,
    color: theme.colors.text,
  };

  return (
    <View style={[containerStyle, style]}>
      {label && (
        <Typography variant="label">{label}</Typography>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[inputStyle, textStyle]}
      />
      {error && (
        <Typography variant="caption" color={theme.colors.error}>
          {error}
        </Typography>
      )}
    </View>
  );
}