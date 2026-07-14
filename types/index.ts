export type MediaType = 'anime' | 'movie' | 'show';

export type QueueStatus =
  | 'not_started'
  | 'watching'
  | 'paused'
  | 'completed'
  | 'dropped';

export type QueueItem = {
  id: string;
  userId: string;
  mediaId: string;
  type: MediaType;
  title: string;
  posterUrl: string | null;
  totalEpisodes: number | null;
  currentEpisode: number;
  runtimeMins: number | null;
  status: QueueStatus;
  queuePosition: number;
  addedAt: string;
  lastWatchedAt: string | null;
  rating: number | null;
  notes: string | null;
  numberOfSeasons: number | null;  // shows only
  inProduction: boolean;           // shows only — true = ongoing
};

export type SearchResult = {
  mediaId: string;
  type: MediaType;
  title: string;
  posterUrl: string | null;
  year: number | null;
  score: number | null;
  totalEpisodes: number | null;
  runtimeMins: number | null;
  numberOfSeasons: number | null;
  inProduction: boolean;
};

export type MoodType =
  | 'chill'
  | 'hype'
  | 'emotional'
  | 'funny'
  | 'epic'
  | 'dark'
  | 'wholesome'
  | 'mindless'
  | 'intense';

export type TimeAvailable = number | 'all_night';

export type AIPick = {
  item: QueueItem;
  reason: string;
  rank: number;
};

export type WatchStats = {
  totalHours: number;
  titlesCompleted: number;
  avgRating: number;
  pace: number;                                        // avg titles/month, last 6 months
  completionRate: number;                              // 0–100
  favouriteGenre: string;                              // kept for Gemini context, not displayed
  mostWatchedType: MediaType;
  ratingBuckets: Record<string, number>;              // { "1": 0, ..., "10": 3 }
  monthlyPace: { month: string; count: number }[];    // last 6 months
};