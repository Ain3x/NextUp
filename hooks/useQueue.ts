import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { QueueItem, QueueStatus, MediaType } from '@/types';

// ---------------------------------------------------------------------------
// Helpers — map snake_case DB rows ↔ camelCase QueueItem
// ---------------------------------------------------------------------------

function rowToItem(row: Record<string, unknown>): QueueItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    mediaId: row.media_id as string,
    type: row.type as MediaType,
    title: row.title as string,
    posterUrl: (row.poster_url as string) ?? null,
    totalEpisodes: (row.total_episodes as number) ?? null,
    currentEpisode: (row.current_episode as number) ?? 0,
    runtimeMins: (row.runtime_mins as number) ?? null,
    status: row.status as QueueStatus,
    queuePosition: row.queue_position as number,
    addedAt: row.added_at as string,
    lastWatchedAt: (row.last_watched_at as string) ?? null,
    rating: (row.rating as number) ?? null,
    notes: (row.notes as string) ?? null,
    numberOfSeasons: (row.number_of_seasons as number) ?? null,
    inProduction: (row.in_production as boolean) ?? false,
  };
}

function itemToRow(item: Partial<QueueItem>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.userId !== undefined) row.user_id = item.userId;
  if (item.mediaId !== undefined) row.media_id = item.mediaId;
  if (item.type !== undefined) row.type = item.type;
  if (item.title !== undefined) row.title = item.title;
  if (item.posterUrl !== undefined) row.poster_url = item.posterUrl;
  if (item.totalEpisodes !== undefined) row.total_episodes = item.totalEpisodes;
  if (item.currentEpisode !== undefined) row.current_episode = item.currentEpisode;
  if (item.runtimeMins !== undefined) row.runtime_mins = item.runtimeMins;
  if (item.status !== undefined) row.status = item.status;
  if (item.queuePosition !== undefined) row.queue_position = item.queuePosition;
  if (item.lastWatchedAt !== undefined) row.last_watched_at = item.lastWatchedAt;
  if (item.rating !== undefined) row.rating = item.rating;
  if (item.notes !== undefined) row.notes = item.notes;
  if (item.numberOfSeasons !== undefined) row.number_of_seasons = item.numberOfSeasons;
  if (item.inProduction !== undefined) row.in_production = item.inProduction;
  return row;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AddToQueuePayload = Omit<
  QueueItem,
  'id' | 'userId' | 'queuePosition' | 'addedAt' | 'lastWatchedAt' | 'rating' | 'currentEpisode' | 'notes' 
>;

export type UseQueueReturn = {
  items: QueueItem[];
  loading: boolean;
  error: string | null;
  addToQueue: (payload: AddToQueuePayload) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  reorder: (newOrder: QueueItem[]) => Promise<void>;
  updateStatus: (id: string, status: QueueStatus) => Promise<void>;
  markEpisodeWatched: (id: string) => Promise<void>;
  markComplete: (id: string) => Promise<void>;
  rateItem: (id: string, rating: number) => Promise<void>;
  filterByType: (type: MediaType | 'all') => QueueItem[];
  refetch: () => Promise<void>;
  addNote: (id: string, notes: string) => Promise<void>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useQueue(): UseQueueReturn {
  const { session } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchQueue = useCallback(async () => {
    if (!session?.user) {
      setQueue([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('queue')
        .select('*')
        .neq('status', 'completed')
        .eq('user_id', session.user.id)
        .order('queue_position', { ascending: true });

      if (fetchError) throw fetchError;
      setQueue((data ?? []).map(rowToItem));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // ── Add ───────────────────────────────────────────────────────────────────

  const addToQueue = useCallback(
    async (payload: AddToQueuePayload) => {
      console.log(session?.user)
      if (!session?.user) return;

      // Optimistic: append with a temp position at the end
      const tempPosition = queue.length > 0
        ? Math.max(...queue.map((q) => q.queuePosition)) + 1
        : 0;

      const optimisticItem: QueueItem = {
        id: `temp-${Date.now()}`,
        userId: session.user.id,
        currentEpisode: 0,
        addedAt: new Date().toISOString(),
        lastWatchedAt: null,
        rating: null,
        notes: null,
        queuePosition: tempPosition,
        ...payload,
      };

      setQueue((prev) => [...prev, optimisticItem]);

      try {
        const { data, error: insertError } = await supabase
          .from('queue')
          .insert({
            ...itemToRow(optimisticItem),
            id: undefined, // let Supabase generate uuid
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Replace temp item with real DB row
        setQueue((prev) =>
          prev.map((item) => (item.id === optimisticItem.id ? rowToItem(data) : item))
        );
      } catch (err) {
        // Rollback
        setQueue((prev) => prev.filter((item) => item.id !== optimisticItem.id));
        setError(err instanceof Error ? err.message : 'Failed to add item');
      }
    },
    [session?.user?.id, queue]
  );

  // ── Remove ────────────────────────────────────────────────────────────────

  const removeFromQueue = useCallback(
    async (id: string) => {
      const previous = queue;
      setQueue((prev) => prev.filter((item) => item.id !== id));

      try {
        const { error: deleteError } = await supabase
          .from('queue')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
      } catch (err) {
        setQueue(previous); // rollback
        setError(err instanceof Error ? err.message : 'Failed to remove item');
      }
    },
    [queue]
  );

  // ── Reorder (drag-and-drop) ───────────────────────────────────────────────

  const reorderQueue = useCallback(
    async (newOrder: QueueItem[]) => {
      const previous = queue;

      const reordered = newOrder.map((item, index) => ({
        ...item,
        queuePosition: index,
      }));

      setQueue(reordered);

      try {
        const updates = reordered.map((item) =>
          supabase
            .from('queue')
            .update({ queue_position: item.queuePosition })
            .eq('id', item.id)
            .eq('user_id', item.userId)
        );

        const results = await Promise.all(updates);
        const failed = results.find((r) => r.error);
        if (failed?.error) throw failed.error;
      } catch (err) {
        setQueue(previous);
        const msg = err instanceof Error ? err.message : JSON.stringify(err);
        setError(msg);
      }
    },
    [queue]
  );

  // ── Update status ─────────────────────────────────────────────────────────

  const updateStatus = useCallback(
    async (id: string, status: QueueStatus) => {
      const previous = queue;
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );

      try {
        const { error: updateError } = await supabase
          .from('queue')
          .update({ status })
          .eq('id', id);

        if (updateError) throw updateError;
      } catch (err) {
        setQueue(previous);
        setError(err instanceof Error ? err.message : 'Failed to update status');
      }
    },
    [queue]
  );

  // ── Mark episode watched ──────────────────────────────────────────────────

  const markEpisodeWatched = useCallback(
    async (id: string) => {
      const item = queue.find((q) => q.id === id);
      if (!item) return;

      const nextEpisode = item.currentEpisode + 1;
      const isComplete =
        item.totalEpisodes !== null && nextEpisode >= item.totalEpisodes;

      const patch: Partial<QueueItem> = {
        currentEpisode: nextEpisode,
        lastWatchedAt: new Date().toISOString(),
        status: isComplete
          ? 'completed'
          : item.status === 'not_started'
            ? 'watching'
            : item.status,
      };

      const previous = queue;
      setQueue((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
      );

      try {
        const { error: updateError } = await supabase
          .from('queue')
          .update(itemToRow(patch))
          .eq('id', id);

        if (updateError) throw updateError;

        if(isComplete){
          fetchQueue();
        }
      } catch (err) {
        setQueue(previous);
        setError(err instanceof Error ? err.message : 'Failed to mark episode watched');
      }
    },
    [queue]
  );

  // ── Mark complete ─────────────────────────────────────────────────────────

  const markComplete = useCallback(
    async (id: string) => {
      const item = queue.find((q) => q.id === id);
      if (!item) return;

      const patch: Partial<QueueItem> = {
        status: 'completed',
        lastWatchedAt: new Date().toISOString(),
        currentEpisode: item.totalEpisodes ?? item.currentEpisode,
      };

      const previous = queue;
      setQueue((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
      );

      try {
        const { error: updateError } = await supabase
          .from('queue')
          .update(itemToRow(patch))
          .eq('id', id);

        if (updateError) throw updateError;
        fetchQueue();
      } catch (err) {
        setQueue(previous);
        setError(err instanceof Error ? err.message : 'Failed to mark complete');
      }
    },
    [queue]
  );

  // ── Rate item ─────────────────────────────────────────────────────────────

  const rateItem = useCallback(
    async (id: string, rating: number) => {
      const previous = queue;
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, rating } : item))
      );

      try {
        const { error: updateError } = await supabase
          .from('queue')
          .update({ rating })
          .eq('id', id);

        if (updateError) throw updateError;
      } catch (err) {
        setQueue(previous);
        setError(err instanceof Error ? err.message : 'Failed to rate item');
      }
    },
    [queue]
  );

  // ── Filter (pure, no async) ───────────────────────────────────────────────

  const filterByType = useCallback(
    (type: MediaType | 'all'): QueueItem[] => {
      if (type === 'all') return queue;
      return queue.filter((item) => item.type === type);
    },
    [queue]
  );

  const addNote = useCallback(
    async (id: string, notes: string) => {
      const previous = queue;
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, notes } : item))
      );
      try {
        const { error: updateError } = await supabase
          .from('queue')
          .update({ notes })
          .eq('id', id);
        if (updateError) throw updateError;
      } catch (err) {
        setQueue(previous);
        setError(err instanceof Error ? err.message : 'Failed to save note');
      }
    },
    [queue]
  );

  // ── Expose ────────────────────────────────────────────────────────────────

  return {
    // screen-facing aliases
    items: queue,
    reorder: reorderQueue,
    removeItem: removeFromQueue,
    refetch: fetchQueue,

    // rest
    loading,
    error,
    addToQueue,
    updateStatus,
    markEpisodeWatched,
    markComplete,
    rateItem,
    filterByType,
    addNote,
  };
}