import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { QueueItem, QueueStatus } from '@/types';

type Props = {
  item: QueueItem;
  isDragging?: boolean;
  onDragHandle?: () => void;
  onPress: (item: QueueItem) => void;
  onMenuOpen: (item: QueueItem, pageX: number, pageY: number) => void;
  onMarkEpisodeWatched: (id: string) => void;
  onMarkComplete: (id: string) => void;
};

const STATUS_LABELS: Record<QueueStatus, string> = {
  not_started: 'Not started',
  watching: 'Watching',
  paused: 'Paused',
  completed: 'Completed',
  dropped: 'Dropped',
};

const STATUS_COLORS: Record<QueueStatus, string> = {
  not_started: '#8E8E93',
  watching: '#43A047',
  paused: '#FFD60A',
  completed: '#1E88E5',
  dropped: '#E53935',
};

function typeColor(item: QueueItem, theme: any): string {
  if (item.type === 'anime') return theme.colors.anime;
  if (item.type === 'movie') return theme.colors.movie;
  return theme.colors.show;
}

function progressPercent(item: QueueItem): number {
  if (!item.totalEpisodes || item.totalEpisodes === 0) return 0;
  return Math.min(item.currentEpisode / item.totalEpisodes, 1);
}

export function QueueCard({
  item,
  isDragging = false,
  onDragHandle,
  onPress,
  onMenuOpen,
  onMarkEpisodeWatched,
  onMarkComplete,
}: Props) {
  const { theme } = useTheme();
  const progress = progressPercent(item);
  const isEpisodic = item.totalEpisodes !== null;
  const isCompleted = item.status === 'completed';
  const accent = typeColor(item, theme);

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isDragging ? accent : theme.colors.border,
          transform: [{ scale: isDragging ? 1.03 : 1 }],
        },
      ]}
    >
      {/* Drag handle */}
      <TouchableOpacity
        onPressIn={onDragHandle}
        hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        style={styles.dragHandle}
      >
        <Ionicons name="reorder-two" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Poster */}
      <View style={styles.posterWrapper}>
        {item.posterUrl ? (
          <Image source={{ uri: item.posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="film-outline" size={24} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={[styles.typeBadge, { backgroundColor: accent }]}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.sm }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
          <Text style={[styles.statusLabel, { color: STATUS_COLORS[item.status], fontSize: theme.font.sizes.xs }]}>
            {STATUS_LABELS[item.status]}
          </Text>
        </View>

        {item.type === 'show' && item.numberOfSeasons != null && (
          <View style={styles.showMeta}>
            <Text style={[styles.metaChip, {
              color: theme.colors.textSecondary,
              fontSize: theme.font.sizes.xs,
            }]}>
              {item.numberOfSeasons} {item.numberOfSeasons === 1 ? 'season' : 'seasons'}
            </Text>
            <View style={[styles.productionBadge, {
              backgroundColor: item.inProduction
                ? theme.colors.success + '22'
                : theme.colors.border,
            }]}>
              <Text style={[styles.productionLabel, {
                color: item.inProduction ? theme.colors.success : theme.colors.textSecondary,
                fontSize: theme.font.sizes.xs,
              }]}>
                {item.inProduction ? 'Ongoing' : 'Completed'}
              </Text>
            </View>
          </View>
        )}

        {/* Episode progress — only when we have a real total */}
        {item.totalEpisodes != null ? (
          <View style={styles.progressRow}>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
              <View style={[styles.progressFill, {
                backgroundColor: isCompleted ? theme.colors.success : accent,
                width: `${progress * 100}%`,
              }]} />
            </View>
            <Text style={[styles.progressLabel, {
              color: theme.colors.textSecondary,
              fontSize: theme.font.sizes.xs,
            }]}>
              {item.currentEpisode}/{item.totalEpisodes} ep
            </Text>
          </View>
        ) : item.type !== 'movie' && item.currentEpisode > 0 ? (
          // Ongoing show — no total known, just show count so far
          <Text style={[{ color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
            Ep {item.currentEpisode} watched
          </Text>
        ) : null}

        {item.type === 'movie' && item.runtimeMins && (
          <Text style={[{ color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
            {item.runtimeMins} min
          </Text>
        )}

        {!isCompleted && (
          <View style={styles.actions}>
            {isEpisodic ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: accent + '22' }]}
                onPress={() => onMarkEpisodeWatched(item.id)}
              >
                <Ionicons name="checkmark" size={13} color={accent} />
                <Text style={[styles.actionText, { color: accent, fontSize: theme.font.sizes.xs }]}>
                  Ep {item.currentEpisode + 1} done
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.colors.success + '22' }]}
                onPress={() => onMarkComplete(item.id)}
              >
                <Ionicons name="checkmark-done" size={13} color={theme.colors.success} />
                <Text style={[styles.actionText, { color: theme.colors.success, fontSize: theme.font.sizes.xs }]}>
                  Mark watched
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Menu trigger — measures its own page position */}
      <TouchableOpacity
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={(e) => {
          const { pageX, pageY } = e.nativeEvent;
          onMenuOpen(item, pageX, pageY);
        }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 10,
  },
  dragHandle: {
    paddingHorizontal: 4,
    marginRight: 6,
    justifyContent: 'center',
  },
  posterWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  poster: {
    width: 56,
    height: 80,
    borderRadius: 8,
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontWeight: '600',
    lineHeight: 18,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    minWidth: 40,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontWeight: '600',
  },
  showMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaChip: {
    fontWeight: '500',
  },
  productionBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  productionLabel: {
    fontWeight: '600',
  },
});