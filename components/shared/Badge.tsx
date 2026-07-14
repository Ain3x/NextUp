import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  label: string;
  color?: string;
};

export function Badge({ label, color }: Props) {
  const { theme } = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: resolvedColor + '22' }]}>
      <Text style={[styles.label, { color: resolvedColor, fontSize: theme.font.sizes.xs }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});