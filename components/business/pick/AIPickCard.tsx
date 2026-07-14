import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { AIPick } from '@/types';

type Props = {
  pick: AIPick;
  totalPicks: number;
  onConfirm: () => void;
  onNext: () => void;
  onDismiss: () => void;
};

const TYPE_COLOR_KEY = {
  anime: 'anime',
  movie: 'movie',
  show: 'show',
} as const;

export function AIPickCard({ pick, totalPicks, onConfirm, onNext, onDismiss }: Props) {
  const { theme } = useTheme();
  const { item, reason, rank } = pick;
  const typeColor = theme.colors[TYPE_COLOR_KEY[item.type]];
  const isLastPick = rank >= totalPicks;

  const progressLabel = item.totalEpisodes
    ? `Ep ${item.currentEpisode}/${item.totalEpisodes}`
    : item.runtimeMins
    ? `${item.runtimeMins} min`
    : null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {/* Rank pill */}
      <View style={[styles.rankPill, { backgroundColor: theme.colors.primary + '22' }]}>
        <Text style={[styles.rankText, { color: theme.colors.primary, fontSize: theme.font.sizes.xs }]}>
          Pick {rank} of {totalPicks}
        </Text>
      </View>

      {/* Poster + info row */}
      <View style={styles.row}>
        <View style={styles.posterWrapper}>
          {item.posterUrl ? (
            <Image source={{ uri: item.posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterFallback, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="film-outline" size={28} color={theme.colors.textSecondary} />
            </View>
          )}
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeBadgeText}>{item.type}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text
            style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.lg }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {progressLabel && (
            <Text style={[styles.meta, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
              {progressLabel}
            </Text>
          )}

          {item.rating && (
            <Text style={[styles.meta, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
              ★ {item.rating}/10
            </Text>
          )}
        </View>
      </View>

      {/* Claude's reason */}
      <View style={[styles.reasonBox, { backgroundColor: theme.colors.primary + '11', borderColor: theme.colors.primary + '33' }]}>
        <Ionicons name="sparkles" size={14} color={theme.colors.primary} style={styles.sparkle} />
        <Text style={[styles.reason, { color: theme.colors.text, fontSize: theme.font.sizes.sm }]}>
          {reason}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.dismissBtn, { borderColor: theme.colors.border }]}
          onPress={onDismiss}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.dismissText, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.sm }]}>
            Skip
          </Text>
        </TouchableOpacity>

        {!isLastPick && (
          <TouchableOpacity
            style={[styles.nextBtn, { borderColor: theme.colors.primary }]}
            onPress={onNext}
            activeOpacity={0.7}
          >
            <Text style={[styles.nextText, { color: theme.colors.primary, fontSize: theme.font.sizes.sm }]}>
              Next pick
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: theme.colors.primary }]}
          onPress={onConfirm}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={16} color="#fff" />
          <Text style={[styles.confirmText, { fontSize: theme.font.sizes.sm }]}>
            Watch this
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  rankPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  rankText: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  posterWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  poster: {
    width: 80,
    height: 114,
    borderRadius: 10,
  },
  posterFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  info: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  title: {
    fontWeight: '700',
    lineHeight: 24,
  },
  meta: {
    fontWeight: '500',
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  sparkle: {
    marginTop: 1,
    flexShrink: 0,
  },
  reason: {
    flex: 1,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dismissText: {
    fontWeight: '500',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nextText: {
    fontWeight: '600',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 'auto',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});