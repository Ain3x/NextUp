import { useState, useCallback, useRef } from 'react';
import { useQueueContext } from '@/context/QueueContext';
import { callGemini } from '@/lib/gemini';
import { buildQueuePrompt } from '@/lib/geminiPrompts';
import type { MoodType, TimeAvailable, AIPick } from '@/types';

type PickState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'results'; picks: AIPick[]; currentIndex: number }
    | { status: 'error'; message: string };

export type UseAIPickReturn = {
    mood: MoodType | null;
    timeAvailable: TimeAvailable | null;
    pickState: PickState;
    currentPick: AIPick | null;
    selectMood: (mood: MoodType) => void;
    selectTimeAvailable: (time: TimeAvailable) => void;
    generatePick: () => Promise<void>;
    nextPick: () => void;
    confirmPick: () => Promise<void>;
    dismissPick: () => void;
    reset: () => void;
};

const QUEUE_PICK_SCHEMA = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            rank: { type: 'integer' },
            reason: { type: 'string' },
        },
        required: ['id', 'rank', 'reason'],
    },
};

export function useAIPick(): UseAIPickReturn {
    const { items, updateStatus } = useQueueContext();

    const [mood, setMood] = useState<MoodType | null>(null);
    const [timeAvailable, setTimeAvailable] = useState<TimeAvailable | null>(null);
    const [pickState, setPickState] = useState<PickState>({ status: 'idle' });
    const dismissedIds = useRef<Set<string>>(new Set());

    const selectMood = useCallback((m: MoodType) => {
        setMood(m);
        setPickState((prev) => (prev.status === 'results' ? { status: 'idle' } : prev));
    }, []);

    const selectTimeAvailable = useCallback((t: TimeAvailable) => {
        setTimeAvailable(t);
        setPickState((prev) => (prev.status === 'results' ? { status: 'idle' } : prev));
    }, []);

    const generatePick = useCallback(async () => {
        if (!mood || timeAvailable === null) return;

        const prompt = buildQueuePrompt(items, mood, timeAvailable, dismissedIds.current);
        if (!prompt) {
            setPickState({ status: 'error', message: 'Your queue is empty — add something to watch first!' });
            return;
        }

        setPickState({ status: 'loading' });
        try {
            const raw = await callGemini<{ id: string; rank: number; reason: string }[]>(prompt, QUEUE_PICK_SCHEMA);
            const itemMap = new Map(items.map((i) => [i.id, i]));
            const picks: AIPick[] = raw
                .filter((r) => itemMap.has(r.id))
                .sort((a, b) => a.rank - b.rank)
                .map((r) => ({ item: itemMap.get(r.id)!, reason: r.reason, rank: r.rank }));

            if (picks.length === 0) {
                setPickState({ status: 'error', message: "Couldn't find a good match. Try a different mood or time." });
                return;
            }
            setPickState({ status: 'results', picks, currentIndex: 0 });
        } catch (err) {
            setPickState({ status: 'error', message: err instanceof Error ? err.message : 'Something went wrong. Try again.' });
        }
    }, [mood, timeAvailable, items]);

    const nextPick = useCallback(() => {
        setPickState((prev) => {
            if (prev.status !== 'results') return prev;
            const next = prev.currentIndex + 1;
            return next >= prev.picks.length ? prev : { ...prev, currentIndex: next };
        });
    }, []);

    const dismissPick = useCallback(() => {
        setPickState((prev) => {
            if (prev.status !== 'results') return prev;
            dismissedIds.current.add(prev.picks[prev.currentIndex].item.id);
            const next = prev.currentIndex + 1;
            return next >= prev.picks.length ? { status: 'idle' } : { ...prev, currentIndex: next };
        });
    }, []);

    const confirmPick = useCallback(async () => {
        if (pickState.status !== 'results') return;
        const pick = pickState.picks[pickState.currentIndex];
        await updateStatus(pick.item.id, 'watching');
        setPickState({ status: 'idle' });
        dismissedIds.current.clear();
    }, [pickState, updateStatus]);

    const reset = useCallback(() => {
        setMood(null);
        setTimeAvailable(null);
        setPickState({ status: 'idle' });
        dismissedIds.current.clear();
    }, []);

    const currentPick = pickState.status === 'results' ? pickState.picks[pickState.currentIndex] : null;

    return { mood, timeAvailable, pickState, currentPick, selectMood, selectTimeAvailable, generatePick, nextPick, confirmPick, dismissPick, reset };
}