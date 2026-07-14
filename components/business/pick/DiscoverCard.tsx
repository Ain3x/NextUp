import { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useQueueContext } from '@/context/QueueContext';
import { tmdb } from '@/lib/tmdb';
import type { SearchResult } from '@/types';
import type { DiscoverItem } from '@/hooks/useDiscover';
import type { AddToQueuePayload } from '@/hooks/useQueue';

type Props = {
    item: DiscoverItem;
    index: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    theme: ReturnType<typeof useTheme>['theme'];
};

export function DiscoverCard({ item, index, total, onPrev, onNext, theme }: Props) {
    const { addToQueue, items: queueItems } = useQueueContext();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const sr = item.searchResult;
    const accent = theme.colors[item.type as 'anime' | 'movie' | 'show'] ?? theme.colors.primary;
    const alreadyInQueue = sr ? queueItems.some(q => q.mediaId === sr.mediaId) : false;

    const handleAdd = useCallback(async () => {
        if (!sr || adding || added || alreadyInQueue) return;
        setAdding(true);
        try {
            let enriched: SearchResult = { ...sr };
            if (sr.type !== 'anime') {
                try {
                    const details = await tmdb.getDetails(sr.mediaId, sr.type as 'movie' | 'show');
                    enriched = { ...sr, ...details } as SearchResult;
                } catch {
                    // non-fatal
                }
            }
            await addToQueue(enriched as unknown as AddToQueuePayload);
            setAdded(false);
        } finally {
            setAdding(false);
        }
    }, [sr, adding, added, alreadyInQueue, addToQueue]);

    const posterUrl = sr?.posterUrl ?? null;
    const displayTitle = sr?.title ?? item.title;
    const displayYear = sr?.year?.toString() ?? item.year ?? null;
    const score = sr?.score ?? null;

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {/* Pagination header */}
            <View style={styles.paginationRow}>
                <TouchableOpacity
                    onPress={onPrev}
                    disabled={index === 0}
                    style={[styles.pageBtn, { opacity: index === 0 ? 0.3 : 1, borderColor: theme.colors.border }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="chevron-back" size={16} color={theme.colors.text} />
                </TouchableOpacity>

                <View style={[styles.rankPill, { backgroundColor: theme.colors.primary + '22' }]}>
                    <Text style={[styles.rankText, { color: theme.colors.primary, fontSize: theme.font.sizes.xs }]}>
                        {index + 1} of {total}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={onNext}
                    disabled={index === total - 1}
                    style={[styles.pageBtn, { opacity: index === total - 1 ? 0.3 : 1, borderColor: theme.colors.border }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Poster + info */}
            <View style={styles.row}>
                <View style={styles.posterWrapper}>
                    {posterUrl ? (
                        <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
                    ) : (
                        <View style={[styles.poster, styles.posterFallback, { backgroundColor: theme.colors.background }]}>
                            <Ionicons name="film-outline" size={28} color={theme.colors.textSecondary} />
                        </View>
                    )}
                    <View style={[styles.typeBadge, { backgroundColor: accent }]}>
                        <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.lg }]} numberOfLines={3}>
                        {displayTitle}
                    </Text>
                    <View style={styles.metaRow}>
                        {displayYear && (
                            <Text style={[styles.meta, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                                {displayYear}
                            </Text>
                        )}
                        {score != null && (
                            <Text style={[styles.meta, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                                ★ {score.toFixed(1)}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Reason */}
            <View style={[styles.reasonBox, { backgroundColor: theme.colors.primary + '11', borderColor: theme.colors.primary + '33' }]}>
                <Ionicons name="sparkles" size={14} color={theme.colors.primary} style={{ marginTop: 2, flexShrink: 0 }} />
                <Text style={[styles.reasonText, { color: theme.colors.text, fontSize: theme.font.sizes.sm }]}>
                    {item.reason}
                </Text>
            </View>

            {/* Why for you */}
            <View style={[styles.whyBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Ionicons name="person-circle-outline" size={14} color={theme.colors.textSecondary} style={{ marginTop: 2, flexShrink: 0 }} />
                <Text style={[styles.whyText, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.sm }]}>
                    {item.whyForYou}
                </Text>
            </View>

            {/* Add to queue */}
            {sr ? (
                <TouchableOpacity
                    style={[
                        styles.addBtn,
                        {
                            backgroundColor: alreadyInQueue || added ? theme.colors.success + '22' : theme.colors.primary,
                            borderWidth: alreadyInQueue || added ? 1 : 0,
                            borderColor: theme.colors.success,
                        },
                    ]}
                    onPress={handleAdd}
                    disabled={adding || added || alreadyInQueue}
                    activeOpacity={0.8}
                >
                    {adding ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons
                                name={alreadyInQueue || added ? 'checkmark-circle' : 'add-circle-outline'}
                                size={18}
                                color={alreadyInQueue || added ? theme.colors.success : '#fff'}
                            />
                            <Text style={[styles.addBtnText, { color: alreadyInQueue || added ? theme.colors.success : '#fff' }]}>
                                {alreadyInQueue ? 'In queue' : added ? 'Added!' : 'Add to queue'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            ) : (
                <Text style={[styles.noMatchHint, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                    Search for it in the Search tab to add to your queue.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
    paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pageBtn: { borderWidth: 1, borderRadius: 8, padding: 4 },
    rankPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 },
    rankText: { fontWeight: '600' },
    row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
    posterWrapper: { position: 'relative', flexShrink: 0 },
    poster: { width: 80, height: 114, borderRadius: 10 },
    posterFallback: { justifyContent: 'center', alignItems: 'center' },
    typeBadge: { position: 'absolute', bottom: 6, left: 6, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
    typeBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
    info: { flex: 1, gap: 6, paddingTop: 2 },
    title: { fontWeight: '700', lineHeight: 24 },
    metaRow: { flexDirection: 'row', gap: 10 },
    meta: { fontWeight: '500' },
    reasonBox: { flexDirection: 'row', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'flex-start' },
    reasonText: { flex: 1, lineHeight: 20, fontStyle: 'italic' },
    whyBox: { flexDirection: 'row', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'flex-start' },
    whyText: { flex: 1, lineHeight: 20 },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, paddingVertical: 12 },
    addBtnText: { fontSize: 14, fontWeight: '700' },
    noMatchHint: { textAlign: 'center', paddingTop: 4 },
});