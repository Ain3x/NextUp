import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
    rate: number;
};

export function CompletionRateSection({ rate }: Props) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}>
                Completion rate
            </Text>
            <View style={styles.rateRow}>
                <Text style={[styles.rateValue, { color: theme.colors.primary, fontSize: theme.font.sizes.xl }]}>
                    {rate}%
                </Text>
                <Text style={[styles.rateLabel, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.sm }]}>
                    of started titles finished
                </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
                <View
                    style={[styles.barFill, { backgroundColor: theme.colors.primary, width: `${Math.min(rate, 100)}%` }]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
    },
    title: { fontWeight: '700' },
    rateRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginTop: 8,
    },
    rateValue: { fontWeight: '700' },
    rateLabel: {},
    barTrack: {
        height: 8,
        borderRadius: 4,
        marginTop: 10,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
});