import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { QueueItem } from '@/types';

type Props = {
    item: QueueItem;
};

export function HistoryRowCard({ item }: Props) {
    const { theme } = useTheme();
    const accent =
        item.type === 'anime' ? theme.colors.anime
        : item.type === 'movie' ? theme.colors.movie
        : theme.colors.show;

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={styles.poster} resizeMode="cover" />
            ) : (
                <View style={[styles.poster, styles.posterFallback, { backgroundColor: theme.colors.background }]}>
                    <Ionicons name="film-outline" size={22} color={theme.colors.textSecondary} />
                </View>
            )}
            <View style={styles.info}>
                <View style={styles.topRow}>
                    <View style={[styles.typeBadge, { backgroundColor: accent }]}>
                        <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>
                    {item.rating != null && (
                        <Text style={[styles.rating, { color: '#FFD60A', fontSize: theme.font.sizes.xs }]}>
                            ★ {item.rating}/10
                        </Text>
                    )}
                </View>
                <Text
                    style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}
                    numberOfLines={2}
                >
                    {item.title}
                </Text>
                {item.lastWatchedAt && (
                    <Text style={[styles.meta, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                        {new Date(item.lastWatchedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 10,
    },
    poster: { width: 72, height: 100 },
    posterFallback: { justifyContent: 'center', alignItems: 'center' },
    info: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeBadge: {
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    typeBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    rating: { fontWeight: '700' },
    title: { fontWeight: '600', lineHeight: 20, marginBottom: 4 },
    meta: { marginTop: 0 },
});