import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useHistoryList } from '@/hooks/useHistoryList';
import { HistoryRowCard } from '@/components/business/profile';
import type { MediaType } from '@/types';

const TYPE_FILTERS: { label: string; value: MediaType | 'all' }[] = [
    { label: 'All',    value: 'all' },
    { label: 'Anime',  value: 'anime' },
    { label: 'Movies', value: 'movie' },
    { label: 'Shows',  value: 'show' },
];

export default function HistoryListScreen() {
    const { mode } = useLocalSearchParams<{ mode: 'completed' | 'toprated' }>();
    const router = useRouter();
    const { theme } = useTheme();

    const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const handleSearchSubmit = useCallback(() => {
        setSearch(searchInput.trim());
    }, [searchInput]);

    const handleClear = useCallback(() => {
        setSearchInput('');
        setSearch('');
    }, []);

    const { items, loading, loadingMore, error, hasMore, loadMore, refetch } =
        useHistoryList(mode ?? 'completed', typeFilter, search);

    const title = mode === 'toprated' ? 'Top Rated' : 'Completed';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.heading, { color: theme.colors.text, fontSize: theme.font.sizes.lg }]}>
                    {title}
                </Text>
                <View style={styles.backBtn} />
            </View>

            {/* Search bar */}
            <View style={[styles.searchRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="search-outline" size={16} color={theme.colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text, fontSize: theme.font.sizes.sm }]}
                    placeholder="Search..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchInput}
                    onChangeText={setSearchInput}
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchInput.length > 0 && (
                    <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Type filter chips */}
            <View style={styles.filterRow}>
                {TYPE_FILTERS.map((f) => {
                    const active = typeFilter === f.value;
                    return (
                        <TouchableOpacity
                            key={f.value}
                            onPress={() => setTypeFilter(f.value)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                                    borderColor: active ? theme.colors.primary : theme.colors.border,
                                },
                            ]}
                        >
                            <Text style={[styles.chipText, {
                                color: active ? '#fff' : theme.colors.textSecondary,
                                fontSize: theme.font.sizes.sm,
                            }]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centerLoader} />
            ) : error ? (
                <TouchableOpacity onPress={refetch} style={styles.errorRow}>
                    <Text style={{ color: theme.colors.error, fontSize: theme.font.sizes.sm }}>
                        {error} — tap to retry
                    </Text>
                </TouchableOpacity>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <HistoryRowCard item={item} />}
                    contentContainerStyle={styles.list}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={() => {
                        if (loadingMore) {
                            return <ActivityIndicator size="small" color={theme.colors.primary} style={styles.footerLoader} />;
                        }
                        if (!hasMore && items.length > 0) {
                            return (
                                <Text style={[styles.endText, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                                    That's everything
                                </Text>
                            );
                        }
                        return null;
                    }}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="film-outline" size={40} color={theme.colors.textSecondary} />
                            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.font.sizes.sm, marginTop: 12 }}>
                                Nothing here yet
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 12,
    },
    backBtn: { width: 36 },
    heading: { fontWeight: '700' },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },
    searchInput: { flex: 1, padding: 0, margin: 0 },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    chip: {
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    chipText: { fontWeight: '600' },
    list: { paddingHorizontal: 16, paddingBottom: 32 },
    centerLoader: { flex: 1 },
    errorRow: { padding: 16 },
    empty: { alignItems: 'center', paddingTop: 80 },
    footerLoader: { marginVertical: 16 },
    endText: { textAlign: 'center', paddingVertical: 20 },
});