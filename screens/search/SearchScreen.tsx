import { View, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSearch } from '@/hooks/useSearch';
import { useQueueContext } from '@/context/QueueContext';
import { SearchBar } from '@/components/business/search/SearchBar';
import { SearchResultCard } from '@/components/business/search/SearchResultCard';
import { Typography, Loader, EmptyState } from '@/components/shared';
import type { SearchResult } from '@/types';
import { tmdb } from '@/lib/tmdb';

export default function SearchScreen() {
  const { theme } = useTheme();
  const { results, loading, error, search, clearResults } = useSearch();
  const { addToQueue, items } = useQueueContext();

  // Set of mediaIds already in queue — updates instantly when addToQueue fires
  const queuedMediaIds = new Set(items.map((i) => i.mediaId));

  const handleAdd = async (item: SearchResult) => {
    let runtimeMins = item.runtimeMins;
    let totalEpisodes = item.totalEpisodes;
    let numberOfSeasons = item.numberOfSeasons;
    let inProduction = item.inProduction;

    if ((item.type === 'movie' || item.type === 'show') && item.mediaId.startsWith('tmdb_')) {
      try {
        const details = await tmdb.getDetails(item.mediaId, item.type);
        runtimeMins = details.runtimeMins ?? runtimeMins;
        totalEpisodes = details.totalEpisodes ?? totalEpisodes;
        numberOfSeasons = details.numberOfSeasons ?? null;
        inProduction = details.inProduction ?? false;
      } catch {
        // non-fatal
      }
    }

    await addToQueue({
      mediaId: item.mediaId,
      type: item.type,
      title: item.title,
      posterUrl: item.posterUrl,
      totalEpisodes,
      runtimeMins,
      status: 'not_started',
      numberOfSeasons,
      inProduction,
    });
  };

  const handlePress = (item: SearchResult) => {
    // Detail modal — wired up in a later step
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Typography variant="heading" style={styles.heading}>Search</Typography>

      <View style={styles.searchBarWrapper}>
        <SearchBar onChangeText={search} onClear={clearResults} />
      </View>

      {loading && <Loader />}

      {error && (
        <Typography variant="body" style={{ ...styles.message, color: theme.colors.error }}>
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.mediaId}`}
          renderItem={({ item }) => (
            <SearchResultCard
              item={item}
              onPress={handlePress}
              onAdd={handleAdd}
              inQueue={queuedMediaIds.has(item.mediaId)}
            />
          )}
          ListEmptyComponent={
            <EmptyState message="Search for anime, movies, or shows" />
          }
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  searchBarWrapper: { paddingHorizontal: 16, paddingBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  message: { paddingHorizontal: 16 },
});