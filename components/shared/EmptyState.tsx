import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from './Typography';

type Props = {
  message: string;
  subMessage?: string;
};

export function EmptyState({ message, subMessage }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Typography variant="subheading" style={{ textAlign: 'center' }}>
        {message}
      </Typography>
      {subMessage && (
        <Typography
          variant="caption"
          style={{ textAlign: 'center', color: theme.colors.textSecondary }}
        >
          {subMessage}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 40,
    paddingTop: 60,
  },
});