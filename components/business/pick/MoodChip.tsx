import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { MoodType } from '@/types';

const MOOD_EMOJI: Record<MoodType, string> = {
  chill:      '😌',
  hype:       '🔥',
  emotional:  '😢',
  funny:      '😂',
  epic:       '⚔️',
  dark:       '🌑',
  wholesome:  '🥰',
  mindless:   '🧠',
  intense:    '😤',
};

type Props = {
  mood: MoodType;
  selected: boolean;
  onPress: (mood: MoodType) => void;
};

export function MoodChip({ mood, selected, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
      onPress={() => onPress(mood)}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{MOOD_EMOJI[mood]}</Text>
      <Text
        style={[
          styles.label,
          {
            color: selected ? '#fff' : theme.colors.text,
            fontSize: theme.font.sizes.sm,
            fontWeight: selected ? theme.font.weights.bold : theme.font.weights.regular,
          },
        ]}
      >
        {mood.charAt(0).toUpperCase() + mood.slice(1)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  emoji: {
    fontSize: 15,
  },
  label: {
    letterSpacing: 0.2,
  },
});