import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
    buckets: Record<string, number>;
    avg: number;
};

function ratingLabel(avg: number): string {
    if (avg >= 7.5) return 'You rate generously';
    if (avg <= 6) return "You're selective";
    return "You're balanced";
}

export function RatingDistribution({ buckets, avg }: Props) {
    const { theme } = useTheme();
    const max = Math.max(...Object.values(buckets), 1);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}>
                    Rating distribution
                </Text>
                <Text style={[styles.badge, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                    {ratingLabel(avg)}
                </Text>
            </View>
            <View style={styles.chart}>
                {Array.from({ length: 10 }, (_, i) => {
                    const score = i + 1;
                    const count = buckets[String(score)] ?? 0;
                    const height = Math.max((count / max) * 60, count > 0 ? 4 : 0);
                    const barColor =
                        score >= 7 ? theme.colors.success
                        : score >= 4 ? theme.colors.primary
                        : theme.colors.error;

                    return (
                        <View key={score} style={styles.barCol}>
                            <Text style={[styles.count, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                                {count > 0 ? count : ''}
                            </Text>
                            <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
                                <View style={[styles.barFill, { height, backgroundColor: barColor }]} />
                            </View>
                            <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                                {score}
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
        gap: 4,
        marginTop: 8,
        height: 90,
    },
    barCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
    },
    count: { fontWeight: '600' },
    barTrack: {
        width: '100%',
        height: 60,
        borderRadius: 3,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        borderRadius: 3,
    },
    scoreLabel: { fontWeight: '500' },
});