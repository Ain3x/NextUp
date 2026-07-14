import type { QueueItem, MediaType } from '@/types';

export function rowToItem(row: Record<string, unknown>): QueueItem {
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
        status: row.status as QueueItem['status'],
        queuePosition: row.queue_position as number,
        addedAt: row.added_at as string,
        lastWatchedAt: (row.last_watched_at as string) ?? null,
        rating: (row.rating as number) ?? null,
        notes: (row.notes as string) ?? null,
        numberOfSeasons: (row.number_of_seasons as number) ?? null,
        inProduction: (row.in_production as boolean) ?? false,
    };
}