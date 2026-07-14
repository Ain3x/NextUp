import { API } from '@/constants';
import { SearchResult } from '@/types';

const getHeaders = () => ({
  Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_TOKEN}`,
  'Content-Type': 'application/json',
});

const buildImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  return `${API.TMDB_IMAGE_BASE_URL}${path}`;
};

export const tmdb = {
  search: async (query: string): Promise<SearchResult[]> => {
    const url = `${API.TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false`;

    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      throw new Error(`TMDB search failed: ${response.status}`);
    }

    const data = await response.json();

    return data.results
      .filter((item: any) =>
        item.media_type === 'movie' || item.media_type === 'tv'
      )
      .map((item: any): SearchResult => ({
        mediaId: `tmdb_${item.id}`,
        type: item.media_type === 'movie' ? 'movie' : 'show',
        title: item.title ?? item.name,
        posterUrl: buildImageUrl(item.poster_path),
        year: item.release_date
          ? new Date(item.release_date).getFullYear()
          : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : null,
        score: item.vote_average ?? null,
        totalEpisodes: item.number_of_episodes ?? null,
        runtimeMins: item.runtime ?? null,
        numberOfSeasons: null,
        inProduction: false,
      }));
  },

  getTrending: async (): Promise<SearchResult[]> => {
    const url = `${API.TMDB_BASE_URL}/trending/all/week`;

    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      throw new Error(`TMDB trending failed: ${response.status}`);
    }

    const data = await response.json();

    return data.results
      .filter((item: any) =>
        item.media_type === 'movie' || item.media_type === 'tv'
      )
      .map((item: any): SearchResult => ({
        mediaId: `tmdb_${item.id}`,
        type: item.media_type === 'movie' ? 'movie' : 'show',
        title: item.title ?? item.name,
        posterUrl: buildImageUrl(item.poster_path),
        year: item.release_date
          ? new Date(item.release_date).getFullYear()
          : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : null,
        score: item.vote_average ?? null,
        totalEpisodes: null,
        runtimeMins: item.runtime ?? null,
        numberOfSeasons: null,
        inProduction: false,
      }));
  },

  getDetails: async (tmdbId: string, type: 'movie' | 'show'): Promise<Partial<SearchResult>> => {
    const numericId = tmdbId.replace('tmdb_', '');
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const url = `${API.TMDB_BASE_URL}/${endpoint}/${numericId}`;

    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error(`TMDB details failed: ${response.status}`);

    const item = await response.json();

    // For shows: episode_run_time is often [] on ongoing series.
    // Fall back to last_episode_to_air.runtime before giving up.
    const showRuntime =
      item.episode_run_time?.[0] ??
      item.last_episode_to_air?.runtime ??
      null;

    return {
      runtimeMins: type === 'movie' ? (item.runtime ?? null) : showRuntime,
      // For ongoing shows, total episodes is misleading — store null so the
      // card doesn't show a denominator that will keep changing.
      totalEpisodes: type === 'show' && item.in_production
        ? null
        : (item.number_of_episodes ?? null),
      score: item.vote_average ?? null,
      numberOfSeasons: type === 'show' ? (item.number_of_seasons ?? null) : null,
      inProduction: type === 'show' ? (item.in_production ?? false) : false,
    };
  },
};