import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
    monthly: { month: string; count: number }[];
    pace: number;
};

function shortMonth(m: string): string {
    const [year, month] = m.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
}

export function PaceSparkline({ monthly, pace }: Props) {
    const { theme } = useTheme();
    const max = Math.max(...monthly.map(m => m.count), 1);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}>
                    Pace
                </Text>
                <Text style={[styles.badge, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                    {pace} titles/month avg
                </Text>
            </View>
            <View style={styles.chart}>
                {monthly.map((m) => {
                    const height = Math.max((m.count / max) * 56, m.count > 0 ? 4 : 0);
                    return (
                        <View key={m.month} style={styles.col}>
                            <Text style={[styles.count, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                                {m.count > 0 ? m.count : ''}
                            </Text>
                            <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
                                <View style={[styles.fill, { height, backgroundColor: theme.colors.primary }]} />
                            </View>
                            <Text style={[styles.monthLabel, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                                {shortMonth(m.month)}
                            </Text>
                        </View>
                    );
                })}
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: { fontWeight: '500' },
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        marginTop: 8,
        height: 80,
    },
    col: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
    },
    count: { fontWeight: '600' },
    track: {
        width: '100%',
        height: 56,
        borderRadius: 4,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    fill: {
        width: '100%',
        borderRadius: 4,
    },
    monthLabel: { fontWeight: '500' },
});