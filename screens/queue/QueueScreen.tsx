import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Portal } from 'react-native-portalize';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useQueueContext } from '@/context/QueueContext';
import { QueueList } from '@/components/business/queue/QueueList';
import type { QueueItem, QueueStatus } from '@/types';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU_WIDTH = 180;
const MENU_ITEM_HEIGHT = 44;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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

type MenuState = {
  item: QueueItem;
  x: number;
  y: number;
} | null;

export default function QueueScreen() {
  const { theme } = useTheme();
  const {
    items,
    loading,
    error,
    reorder,
    removeItem,
    updateStatus,
    markEpisodeWatched,
    markComplete,
    refetch,
  } = useQueueContext();

  const router = useRouter();

  const [menu, setMenu] = useState<MenuState>(null);

  // ── Menu ───────────────────────────────────────────────────────────────────

  const handleMenuOpen = useCallback(
    (item: QueueItem, pageX: number, pageY: number) => {
      // Clamp so menu never overflows screen edges
      const x = Math.min(pageX, SCREEN_WIDTH - MENU_WIDTH - 8);
      const menuHeight = MENU_ITEM_HEIGHT * 5 + 16; // approx
      const y = pageY + menuHeight > SCREEN_HEIGHT
        ? pageY - menuHeight
        : pageY;
      setMenu({ item, x, y });
    },
    []
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  const handleMenuAction = useCallback(
    async (action: () => Promise<void>) => {
      closeMenu();
      await action();
    },
    [closeMenu]
  );

  // ── Reorder adapter ────────────────────────────────────────────────────────

  const handleReorder = useCallback(
    async (newOrder: QueueItem[]) => {
      await reorder(newOrder);
    },
    [reorder]
  );

  // ── Stats ──────────────────────────────────────────────────────────────────

  const watching = items.filter((i) => i.status === 'watching').length;
  const total = items.length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.xl }]}>
          My Queue
        </Text>
        {!loading && total > 0 && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }]}>
            {watching} watching · {total} total
          </Text>
        )}
      </View>

      {/* List */}
      <QueueList
        queue={items}
        loading={loading}
        error={error}
        onReorder={handleReorder}
        onPress={(item) => router.push(`/(modals)/item-detail?id=${item.id}`)}
        onRemove={removeItem}
        onMenuOpen={handleMenuOpen}
        onMarkEpisodeWatched={markEpisodeWatched}
        onMarkComplete={markComplete}
        onRetry={refetch}
      />

      {/* Portal menu — renders above everything */}
      {menu && (
        <Portal>
          {/* Backdrop to dismiss */}
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Menu */}
          <View
            style={[
              styles.menu,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                left: menu.x,
                top: menu.y,
              },
            ]}
          >
            {(['watching', 'paused', 'dropped'] as QueueStatus[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.menuItem}
                onPress={() =>
                  handleMenuAction(() => updateStatus(menu.item.id, s))
                }
              >
                <View style={[styles.dot, { backgroundColor: STATUS_COLORS[s] }]} />
                <Text style={[styles.menuItemText, { color: theme.colors.text, fontSize: theme.font.sizes.sm }]}>
                  {STATUS_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                handleMenuAction(() => markComplete(menu.item.id))
              }
            >
              <Ionicons name="checkmark-done" size={14} color={theme.colors.success} />
              <Text style={[styles.menuItemText, { color: theme.colors.success, fontSize: theme.font.sizes.sm }]}>
                Mark complete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                handleMenuAction(() => removeItem(menu.item.id))
              }
            >
              <Ionicons name="trash-outline" size={14} color={theme.colors.error} />
              <Text style={[styles.menuItemText, { color: theme.colors.error, fontSize: theme.font.sizes.sm }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </Portal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    elevation: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  menuItemText: {
    fontWeight: '500',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 10,
    marginVertical: 4,
  },
});