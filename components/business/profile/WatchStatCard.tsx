import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
    label: string;
    value: string | number;
    accent?: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export function WatchStatCard({ label, value, accent, icon }: Props) {
    const { theme } = useTheme();
    const color = accent ?? theme.colors.primary;

    return (
        <View style={[styles.card, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
        }]}>
            <Ionicons name={icon} size={24} color={accent} />
            <Text style={[styles.value, { color, fontSize: theme.font.sizes.xl }]}>
                {value != null ? String(value) : '—'}
            </Text>
            <Text style={[styles.label, {
                color: theme.colors.textSecondary,
                fontSize: theme.font.sizes.xs,
            }]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 4,
        alignItems: 'flex-start',
        minHeight: 90,
        minWidth: 90,
    },
    value: {
        fontWeight: '700',
        lineHeight: 28,
    },
    label: {
        fontWeight: '500',
        lineHeight: 14,
    },
});