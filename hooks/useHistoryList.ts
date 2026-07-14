import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { rowToItem } from '@/lib/mappers';
import type { QueueItem, MediaType } from '@/types';

type HistoryMode = 'completed' | 'toprated';

type UseHistoryListReturn = {
    items: QueueItem[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refetch: () => Promise<void>;
};

const PAGE_SIZE = 20;

export function useHistoryList(
    mode: HistoryMode,
    typeFilter: MediaType | 'all',
    search: string,
): UseHistoryListReturn {
    const { session } = useAuth();
    const [items, setItems] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const offsetRef = useRef(0);

    const buildQuery = useCallback((from: number) => {
        let q = supabase
            .from('queue')
            .select('*')
            .eq('user_id', session!.user!.id)
            .range(from, from + PAGE_SIZE - 1);

        if (mode === 'completed') {
            q = q.eq('status', 'completed').order('last_watched_at', { ascending: false });
        } else {
            q = q.not('rating', 'is', null).order('rating', { ascending: false });
        }

        if (typeFilter !== 'all') q = q.eq('type', typeFilter);
        if (search.trim()) q = q.ilike('title', `%${search.trim()}%`);

        return q;
    }, [session?.user?.id, mode, typeFilter, search]);

    const fetchFirst = useCallback(async () => {
        if (!session?.user) return;
        setLoading(true);
        setError(null);
        offsetRef.current = 0;

        try {
            const { data, error: err } = await buildQuery(0);
            if (err) throw err;
            const rows = (data ?? []).map(rowToItem);
            setItems(rows);
            setHasMore(rows.length === PAGE_SIZE);
            offsetRef.current = rows.length;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [buildQuery, session?.user]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !session?.user) return;
        setLoadingMore(true);

        try {
            const { data, error: err } = await buildQuery(offsetRef.current);
            if (err) throw err;
            const rows = (data ?? []).map(rowToItem);
            setItems(prev => [...prev, ...rows]);
            setHasMore(rows.length === PAGE_SIZE);
            offsetRef.current += rows.length;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more');
        } finally {
            setLoadingMore(false);
        }
    }, [buildQuery, hasMore, loadingMore, session?.user]);

    useEffect(() => {
        fetchFirst();
    }, [fetchFirst]);

    return { items, loading, loadingMore, error, hasMore, loadMore, refetch: fetchFirst };
}