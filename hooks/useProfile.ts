import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { rowToItem } from '@/lib/mappers';
import type { QueueItem, WatchStats } from '@/types';

type UseProfileReturn = {
    stats: WatchStats | null;
    completedHistory: QueueItem[];
    topRated: QueueItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

export function useProfile(): UseProfileReturn {
    const { session } = useAuth();
    const [stats, setStats] = useState<WatchStats | null>(null);
    const [completedHistory, setCompletedHistory] = useState<QueueItem[]>([]);
    const [topRated, setTopRated] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!session?.user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [statsRes, historyRes, ratedRes] = await Promise.all([
                supabase.rpc('get_watch_stats', { p_user_id: session.user.id }),

                supabase
                    .from('queue')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .eq('status', 'completed')
                    .order('last_watched_at', { ascending: false })
                    .limit(10),

                supabase
                    .from('queue')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .not('rating', 'is', null)
                    .order('rating', { ascending: false })
                    .limit(10),
            ]);

            if (statsRes.error) throw statsRes.error;
            if (historyRes.error) throw historyRes.error;
            if (ratedRes.error) throw ratedRes.error;

            const raw = statsRes.data as Record<string, unknown>;
            setStats({
                totalHours: Math.round((raw.totalHours as number) * 10) / 10,
                titlesCompleted: raw.titlesCompleted as number,
                avgRating: raw.avgRating as number,
                pace: raw.pace as number,
                completionRate: raw.completionRate as number,
                favouriteGenre: raw.favouriteGenre as string,
                mostWatchedType: raw.mostWatchedType as WatchStats['mostWatchedType'],
                ratingBuckets: (raw.ratingBuckets as Record<string, number>) ?? {},
                monthlyPace: (raw.monthlyPace as WatchStats['monthlyPace']) ?? [],
            });

            setCompletedHistory((historyRes.data ?? []).map(rowToItem));
            setTopRated((ratedRes.data ?? []).map(rowToItem));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { stats, completedHistory, topRated, loading, error, refetch: fetchProfile };
}