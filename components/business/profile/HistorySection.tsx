import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { HistoryCard } from './HistoryCard';
import type { QueueItem } from '@/types';

type Props = {
    title: string;
    items: QueueItem[];
    mode: 'completed' | 'toprated';
};

export function HistorySection({ title, items, mode }: Props) {
    const { theme } = useTheme();
    const router = useRouter();

    if (items.length === 0) return null;

    const rows: (QueueItem | null)[][] = [];
    for (let i = 0; i < items.length; i += 2) {
        rows.push([items[i], items[i + 1] ?? null]);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}>
                    {title}
                </Text>
                <TouchableOpacity
                    onPress={() => router.push(`/(modals)/history-list?mode=${mode}`)}
                    style={styles.showMore}
                >
                    <Text style={[styles.showMoreText, { color: theme.colors.primary, fontSize: theme.font.sizes.sm }]}>
                        Show all
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
            <View style={styles.grid}>
                {rows.map((pair, i) => (
                    <View key={i} style={styles.row}>
                        <HistoryCard item={pair[0]!} />
                        {pair[1] ? <HistoryCard item={pair[1]} /> : <View style={styles.emptyCell} />}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 28 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: { fontWeight: '700' },
    showMore: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    showMoreText: { fontWeight: '600' },
    grid: { paddingHorizontal: 16, gap: 10 },
    row: { flexDirection: 'row', gap: 10 },
    emptyCell: { flex: 1 },
});