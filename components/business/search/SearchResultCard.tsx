import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { SearchResult } from '@/types';

const TYPE_COLOR_KEY = {
  anime: 'anime',
  movie: 'movie',
  show: 'show',
} as const;

type Props = {
  item: SearchResult;
  onPress: (item: SearchResult) => void;
  onAdd: (item: SearchResult) => void;
  inQueue?: boolean;
};

export function SearchResultCard({ item, onPress, onAdd, inQueue = false }: Props) {
  const { theme } = useTheme();
  const typeColor = theme.colors[TYPE_COLOR_KEY[item.type]];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Poster */}
      {item.posterUrl ? (
        <Image source={{ uri: item.posterUrl }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.posterFallback, { backgroundColor: theme.colors.border }]}>
          <Ionicons name="image-outline" size={24} color={theme.colors.textSecondary} />
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text
          style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[styles.typeLabel, { color: typeColor, fontSize: theme.font.sizes.xs }]}>
              {item.type}
            </Text>
          </View>
          {item.year != null && (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
              {item.year}
            </Text>
          )}
          {item.score != null && item.score > 0 && (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
              ★ {item.score.toFixed(1)}
            </Text>
          )}
        </View>
      </View>

      {/* Add button — changes to checkmark when already in queue */}
      <TouchableOpacity
        style={[
          styles.addBtn,
          { backgroundColor: inQueue ? theme.colors.surface : theme.colors.primary },
          inQueue && { borderWidth: 1.5, borderColor: theme.colors.border },
        ]}
        onPress={() => !inQueue && onAdd(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={inQueue ? 1 : 0.7}
      >
        <Ionicons
          name={inQueue ? 'checkmark' : 'add'}
          size={20}
          color={inQueue ? theme.colors.textSecondary : '#fff'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    gap: 12,
    paddingRight: 12,
  },
  poster: {
    width: 56,
    height: 80,
  },
  posterFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 6,
    paddingVertical: 10,
  },
  title: {
    fontWeight: '600',
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeLabel: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metaText: {},
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});