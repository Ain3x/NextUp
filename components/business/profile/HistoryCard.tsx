import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { QueueItem } from '@/types';

type Props = {
    item: QueueItem;
};

export function HistoryCard({ item }: Props) {
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
                    <Ionicons name="film-outline" size={20} color={theme.colors.textSecondary} />
                </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: accent }]}>
                <Text style={styles.typeBadgeText}>{item.type}</Text>
            </View>
            <Text
                style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.xs }]}
                numberOfLines={2}
            >
                {item.title}
            </Text>
            {item.rating != null && (
                <Text style={[styles.rating, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                    ★ {item.rating}/10
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { flex: 1, borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
    poster: { width: '100%', height: 160 },
    posterFallback: { justifyContent: 'center', alignItems: 'center' },
    typeBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    typeBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
    title: { padding: 6, paddingBottom: 2, fontWeight: '600', lineHeight: 15 },
    rating: { paddingHorizontal: 6, paddingBottom: 6 },
});