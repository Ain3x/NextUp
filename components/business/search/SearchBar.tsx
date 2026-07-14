import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
};

export function SearchBar({ onChangeText, onClear, placeholder = 'Search anime, movies, shows…' }: Props) {
  const { theme } = useTheme();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    setValue(text);
    onChangeText(text);
  };

  const handleClear = () => {
    setValue('');
    onClear();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: focused ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: 0,
  },
});