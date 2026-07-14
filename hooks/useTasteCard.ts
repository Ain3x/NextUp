import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import type { QueueItem } from '@/types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type UseTasteCardReturn = {
    tasteCard: string | null;
    loading: boolean;
};

export function useTasteCard(
    completed: QueueItem[],
    topRated: QueueItem[],
    completedCount: number,
): UseTasteCardReturn {
    const [tasteCard, setTasteCard] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const generate = useCallback(async () => {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) return;

        try {
            const now = Date.now();
            const [cachedCard, cachedAt, cachedCount] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.TASTE_CARD),
                AsyncStorage.getItem(STORAGE_KEYS.TASTE_CARD_UPDATED_AT),
                AsyncStorage.getItem(STORAGE_KEYS.TASTE_CARD_COMPLETED_COUNT),
            ]);

            const isStale = cachedAt ? now - parseInt(cachedAt) > SEVEN_DAYS_MS : true;
            const countChanged = cachedCount !== String(completedCount);

            if (cachedCard && !isStale && !countChanged) {
                setTasteCard(cachedCard);
                return;
            }

            // Show previous card immediately while regenerating
            if (cachedCard) setTasteCard(cachedCard);
            setLoading(true);

            const completedTitles = completed
                .slice(0, 20)
                .map(i => `${i.title} (${i.type})`)
                .join(', ');

            const topRatedTitles = topRated
                .filter(i => (i.rating ?? 0) >= 7)
                .slice(0, 20)
                .map(i => `${i.title} ${i.rating}/10`)
                .join(', ');

            const prompt = `You are analyzing a viewer's watch history to write a short, personal viewer identity.

Completed titles: ${completedTitles || 'none yet'}
Top rated (≥7/10): ${topRatedTitles || 'none yet'}
Total completed: ${completedCount}

Write 1-2 sentences describing this person as a viewer — their tendencies, taste, and what makes them distinctive. Be specific and direct. No filler phrases like "Based on your history". Plain text only, no markdown.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        },
                    }),
                },
            );

            const data = await response.json();
            const card: string | null = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;

            if (card) {
                setTasteCard(card);
                await Promise.all([
                    AsyncStorage.setItem(STORAGE_KEYS.TASTE_CARD, card),
                    AsyncStorage.setItem(STORAGE_KEYS.TASTE_CARD_UPDATED_AT, String(now)),
                    AsyncStorage.setItem(STORAGE_KEYS.TASTE_CARD_COMPLETED_COUNT, String(completedCount)),
                ]);
            }
        } catch {
            // Non-fatal — previous card stays visible
        } finally {
            setLoading(false);
        }
    }, [completed, topRated, completedCount]);

    useEffect(() => {
        if (completedCount > 0) generate();
    }, [generate]);

    return { tasteCard, loading };
}