import { useState, useCallback } from 'react';
import { useQueueContext } from '@/context/QueueContext';
import { useProfile } from '@/hooks/useProfile';
import { tmdb } from '@/lib/tmdb';
import { anilist } from '@/lib/anilist';
import { callGemini } from '@/lib/gemini';
import { buildDiscoverPrompt } from '@/lib/geminiPrompts';
import type { MediaType, TimeAvailable, SearchResult } from '@/types';

export type DiscoverItem = {
    title: string;
    type: MediaType;
    year: string | null;
    reason: string;
    whyForYou: string;
    rank: number;
    searchResult: SearchResult | null;
};

type DiscoverState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'results'; items: DiscoverItem[]; currentIndex: number }
    | { status: 'error'; message: string };

export type UseDiscoverReturn = {
    mediaType: MediaType | null;
    timeAvailable: TimeAvailable | null;
    genre: string;
    freeText: string;
    discoverState: DiscoverState;
    currentDiscover: DiscoverItem | null;
    setMediaType: (type: MediaType) => void;
    setDiscoverTime: (time: TimeAvailable) => void;
    setGenre: (genre: string) => void;
    setFreeText: (text: string) => void;
    generateDiscover: () => Promise<void>;
    nextDiscover: () => void;
    prevDiscover: () => void;
    resetDiscover: () => void;
};

const DISCOVER_SCHEMA = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            type: { type: 'string' },
            year: { type: 'string' },
            rank: { type: 'integer' },
            reason: { type: 'string' },
            whyForYou: { type: 'string' },
        },
        required: ['title', 'type', 'rank', 'reason', 'whyForYou'],
    },
};

async function resolveToSearchResult(title: string, type: MediaType): Promise<SearchResult | null> {
    try {
        if (type === 'anime') {
            const results = await anilist.search(title);
            return results[0] ?? null;
        } else {
            const results = await tmdb.search(title);
            return results.find((r) => r.type === type) ?? results[0] ?? null;
        }
    } catch {
        return null;
    }
}

export function useDiscover(): UseDiscoverReturn {
    const { items } = useQueueContext();
    const { completedHistory, topRated } = useProfile();

    const [mediaType, setMediaTypeState] = useState<MediaType | null>(null);
    const [timeAvailable, setTimeAvailableState] = useState<TimeAvailable | null>(null);
    const [genre, setGenre] = useState('');
    const [freeText, setFreeText] = useState('');
    const [discoverState, setDiscoverState] = useState<DiscoverState>({ status: 'idle' });

    const setMediaType = useCallback((t: MediaType) => {
        setMediaTypeState(t);
        setDiscoverState((prev) => prev.status === 'results' ? { status: 'idle' } : prev);
    }, []);

    const setDiscoverTime = useCallback((t: TimeAvailable) => {
        setTimeAvailableState(t);
        setDiscoverState((prev) => prev.status === 'results' ? { status: 'idle' } : prev);
    }, []);

    const generateDiscover = useCallback(async () => {
        if (!mediaType || timeAvailable === null) return;

        const seenTitles = new Set(items.map(i => i.title.toLowerCase()));
        const completedTitles = completedHistory.filter(i => !seenTitles.has(i.title.toLowerCase())).map(i => i.title);
        const topRatedTitles = topRated.filter(i => (i.rating ?? 0) >= 7).map(i => `${i.title} (${i.rating}/10)`);

        const prompt = buildDiscoverPrompt(mediaType, timeAvailable, genre, freeText, { completedTitles, topRatedTitles });

        setDiscoverState({ status: 'loading' });
        try {
            type RawDiscover = { title: string; type: string; year: string | null; rank: number; reason: string; whyForYou: string };
            const raw = await callGemini<RawDiscover[]>(prompt, DISCOVER_SCHEMA);

            if (!Array.isArray(raw) || raw.length === 0) throw new Error('Unexpected response format.');

            const resolved = await Promise.all(
                raw.map(async (r): Promise<DiscoverItem> => ({
                    title: r.title,
                    type: r.type as MediaType,
                    year: r.year ?? null,
                    rank: r.rank,
                    reason: r.reason,
                    whyForYou: r.whyForYou,
                    searchResult: await resolveToSearchResult(r.title, r.type as MediaType),
                }))
            );

            setDiscoverState({ status: 'results', items: resolved.sort((a, b) => a.rank - b.rank), currentIndex: 0 });
        } catch (err) {
            setDiscoverState({ status: 'error', message: err instanceof Error ? err.message : 'Something went wrong. Try again.' });
        }
    }, [mediaType, timeAvailable, genre, freeText, items, completedHistory, topRated]);

    const nextDiscover = useCallback(() => {
        setDiscoverState((prev) => {
            if (prev.status !== 'results') return prev;
            const next = prev.currentIndex + 1;
            return next >= prev.items.length ? prev : { ...prev, currentIndex: next };
        });
    }, []);

    const prevDiscover = useCallback(() => {
        setDiscoverState((prev) => {
            if (prev.status !== 'results') return prev;
            const next = prev.currentIndex - 1;
            return next < 0 ? prev : { ...prev, currentIndex: next };
        });
    }, []);

    const resetDiscover = useCallback(() => {
        setMediaTypeState(null);
        setTimeAvailableState(null);
        setGenre('');
        setFreeText('');
        setDiscoverState({ status: 'idle' });
    }, []);

    const currentDiscover = discoverState.status === 'results' ? discoverState.items[discoverState.currentIndex] : null;

    return { mediaType, timeAvailable, genre, freeText, discoverState, currentDiscover, setMediaType, setDiscoverTime, setGenre, setFreeText, generateDiscover, nextDiscover, prevDiscover, resetDiscover };
}