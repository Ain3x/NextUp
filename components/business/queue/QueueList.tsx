import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { QueueCard } from '@/components/business/queue/QueueCard';
import type { QueueItem, QueueStatus, MediaType } from '@/types';
import { Easing } from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterTab = MediaType | 'all';

type Props = {
  queue: QueueItem[];
  loading: boolean;
  error: string | null;
  onReorder: (newOrder: QueueItem[]) => Promise<void>;
  onPress: (item: QueueItem) => void;
  onRemove: (id: string) => void;
  onMarkEpisodeWatched: (id: string) => void;
  onMarkComplete: (id: string) => void;
  onRetry: () => void;
  onMenuOpen: (item: QueueItem, pageX: number, pageY: number) => void;
};

// ---------------------------------------------------------------------------
// Filter tabs config
// ---------------------------------------------------------------------------

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'anime', label: 'Anime' },
  { key: 'movie', label: 'Movies' },
  { key: 'show', label: 'Shows' },
];

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ filter, theme }: { filter: FilterTab; theme: any }) {
  const label = filter === 'all' ? 'your queue' : `${filter}s`;
  return (
    <View style={styles.emptyState}>
      <Ionicons name="tv-outline" size={48} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text, fontSize: theme.font.sizes.lg }]}>
        Nothing in {label}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.sm }]}>
        Search for something to watch and add it here.
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QueueList({
  queue,
  loading,
  error,
  onReorder,
  onPress,
  onRemove,
  onMarkEpisodeWatched,
  onMarkComplete,
  onRetry,
  onMenuOpen,
}: Props) {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filtered = useMemo(
    () => activeFilter === 'all' ? queue : queue.filter((item) => item.type === activeFilter),
    [queue, activeFilter]
  );

  // ── Render item ────────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<QueueItem>) => (
      <ScaleDecorator>
        <QueueCard
          item={item}
          isDragging={isActive}
          onDragHandle={drag}
          onPress={onPress}
          onMenuOpen={onMenuOpen}
          onMarkEpisodeWatched={onMarkEpisodeWatched}
          onMarkComplete={onMarkComplete}
        />
      </ScaleDecorator>
    ),
    [onPress, onMenuOpen, onMarkEpisodeWatched, onMarkComplete]
  );

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error, fontSize: theme.font.sizes.md }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { fontSize: theme.font.sizes.sm }]}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filter tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
        {TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const tabColor =
            tab.key === 'anime'
              ? theme.colors.anime
              : tab.key === 'movie'
                ? theme.colors.movie
                : tab.key === 'show'
                  ? theme.colors.show
                  : theme.colors.primary;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && { borderBottomColor: tabColor, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? tabColor : theme.colors.textSecondary,
                    fontSize: theme.font.sizes.sm,
                    fontWeight: isActive ? theme.font.weights.bold : theme.font.weights.regular,
                  },
                ]}
              >
                {tab.label}
              </Text>
              {/* Count badge */}
              {tab.key !== 'all' && (
                <View style={[styles.countBadge, { backgroundColor: isActive ? tabColor + '22' : theme.colors.surface }]}>
                  <Text style={[styles.countText, { color: isActive ? tabColor : theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
                    {queue.filter((i) => i.type === tab.key).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState filter={activeFilter} theme={theme} />
      ) : (
        <DraggableFlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => {
            // `data` is only the filtered subset. Merge it back into the
            // full queue so items from other categories aren't lost.
            // Strategy: walk the full queue and replace each slot that
            // belonged to the active filter with the next item from the
            // newly-ordered filtered array, leaving everything else in place.
            requestAnimationFrame(() => {
              const filteredIds = new Set(data.map((i) => i.id));
              let filteredIndex = 0;
              const merged = queue.map((item) =>
                filteredIds.has(item.id) ? data[filteredIndex++] : item
              );
              onReorder(merged);
            });
          }}
          activationDistance={10}
          animationConfig={{ duration: 150 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 6,
    marginBottom: -1, // sit on top of the border
  },
  tabLabel: {
    letterSpacing: 0.2,
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: {
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});