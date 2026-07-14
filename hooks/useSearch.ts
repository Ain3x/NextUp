import { useState, useCallback, useRef } from 'react';
import { tmdb } from '@/lib/tmdb';
import { anilist } from '@/lib/anilist';
import type { SearchResult } from '@/types';

const DEBOUNCE_MS = 300;

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const [tmdbResults, anilistResults] = await Promise.allSettled([
          tmdb.search(query),
          anilist.search(query),
        ]);

        const tmdbData = tmdbResults.status === 'fulfilled' ? tmdbResults.value : [];
        const anilistData = anilistResults.status === 'fulfilled' ? anilistResults.value : [];

        console.log("tmbd:", tmdbData);
        console.log("anilist", anilistData);

        const normalise = (title: string) =>
          title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // strip all punctuation
            .replace(/\s+/g, ' ')         // collapse whitespace
            .trim();

        const anilistTitles = new Set(anilistData.map((r) => normalise(r.title)));

        const filteredTmdb = tmdbData.filter(
          (r) => !anilistTitles.has(normalise(r.title))
        );

        setResults([...anilistData, ...filteredTmdb]);
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearResults = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
}