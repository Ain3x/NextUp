import type { MoodType, TimeAvailable, QueueItem, MediaType } from '@/types';

export function buildQueuePrompt(
    queue: QueueItem[],
    mood: MoodType,
    timeAvailable: TimeAvailable,
    dismissedIds: Set<string>,
): string {
    const hour = new Date().getHours();
    const timeOfDay =
        hour < 6 ? 'late night' :
        hour < 12 ? 'morning' :
        hour < 17 ? 'afternoon' :
        hour < 21 ? 'evening' : 'night';

    const timeLabel =
        timeAvailable === 'all_night'
            ? 'no time limit (all night)'
            : `about ${timeAvailable} minutes`;

    const candidates = queue
        .filter((item) => item.status !== 'completed' && item.status !== 'dropped')
        .filter((item) => !dismissedIds.has(item.id))
        .map((item) => {
            const progress =
                item.totalEpisodes
                    ? ` (episode ${item.currentEpisode}/${item.totalEpisodes})`
                    : item.runtimeMins
                        ? ` (${item.runtimeMins} min)`
                        : '';
            const rating = item.rating ? ` — rated ${item.rating}/10` : '';
            const status = item.status !== 'not_started' ? ` [${item.status}]` : '';
            return `- ${item.title} (${item.type})${progress}${status}${rating} [id:${item.id}]`;
        });

    if (candidates.length === 0) return '';

    return [
        `You are a smart entertainment assistant helping someone decide what to watch tonight.`,
        ``,
        `CONTEXT:`,
        `- Time of day: ${timeOfDay}`,
        `- Mood: ${mood}`,
        `- Time available: ${timeLabel}`,
        ``,
        `QUEUE (not completed or dropped):`,
        ...candidates,
        ``,
        `TASK:`,
        `Pick the top 3 items from the queue that best match the mood and time available.`,
        `For movies/standalone content, check runtime against time available.`,
        `For episodic content (anime/shows), assume watching 1-3 episodes is fine unless time is very short (<30 min).`,
        `Prioritise items already in progress (status: watching) over not_started.`,
        `Weigh higher-rated items (if rated) as personal preference signals.`,
        `Do NOT pick items outside the queue list above.`,
        `Return VALID JSON only. No markdown. No backticks.`,
        ``,
        `Respond with ONLY a JSON array:`,
        `[`,
        `  { "id": "<queue item id>", "rank": 1, "reason": "<10 words max, specific and warm>" },`,
        `  { "id": "<queue item id>", "rank": 2, "reason": "<one sentence>" },`,
        `  { "id": "<queue item id>", "rank": 3, "reason": "<one sentence>" }`,
        `]`,
        ``,
        `If fewer than 3 candidates exist, return as many as you can. Never invent ids.`,
    ].join('\n');
}

export function buildDiscoverPrompt(
    mediaType: MediaType,
    timeAvailable: TimeAvailable,
    genre: string,
    freeText: string,
    tasteProfile: { completedTitles: string[]; topRatedTitles: string[] },
): string {
    const timeLabel =
        timeAvailable === 'all_night'
            ? 'no time limit (all night)'
            : `about ${timeAvailable} minutes`;

    const tasteLines: string[] = [];
    if (tasteProfile.completedTitles.length > 0) {
        tasteLines.push(`Recently completed: ${tasteProfile.completedTitles.slice(0, 8).join(', ')}`);
    }
    if (tasteProfile.topRatedTitles.length > 0) {
        tasteLines.push(`Highly rated by user: ${tasteProfile.topRatedTitles.slice(0, 8).join(', ')}`);
    }

    const tasteSection = tasteLines.length > 0
        ? [`TASTE PROFILE (use as preference signals, not strict filter):`, ...tasteLines.map(l => `- ${l}`), ``]
        : [`TASTE PROFILE: No history yet — make broadly appealing picks.`, ``];

    return [
        `You are a personalised entertainment recommendation engine.`,
        ``,
        `USER REQUEST:`,
        `- Looking for: ${mediaType === 'anime' ? 'anime' : mediaType === 'movie' ? 'movies' : 'TV shows'}`,
        `- Time available: ${timeLabel}`,
        genre.trim() ? `- Genre / vibe: ${genre.trim()}` : null,
        freeText.trim() ? `- Additional notes from user: ${freeText.trim()}` : null,
        ``,
        ...tasteSection,
        `TASK:`,
        `Recommend exactly 5 different ${mediaType} titles that fit the request.`,
        `- All titles must be REAL, well-known works that genuinely exist.`,
        `- Match the time constraint: for movies pick runtimes close to time available; for anime/shows, one episode or a short season should fit.`,
        `- Use the taste profile to infer preferences — do NOT repeat titles already in the list above.`,
        `- Vary the picks — don't give 3 very similar titles. Offer range within the genre/vibe.`,
        `- Be specific and confident. No hedging.`,
        ``,
        `Return ONLY valid JSON — a JSON array of exactly 5 objects, no markdown:`,
        `[`,
        `  { "title": "<exact title>", "type": "${mediaType}", "year": "<release year or null>", "rank": 1, "reason": "<one punchy sentence: what it is and why it fits the vibe>", "whyForYou": "<one sentence: why it matches their taste specifically>" },`,
        `  { "title": "<exact title>", "type": "${mediaType}", "year": "<release year or null>", "rank": 2, "reason": "...", "whyForYou": "..." },`,
        `  { "title": "<exact title>", "type": "${mediaType}", "year": "<release year or null>", "rank": 3, "reason": "...", "whyForYou": "..." },`,
        `  { "title": "<exact title>", "type": "${mediaType}", "year": "<release year or null>", "rank": 2, "reason": "...", "whyForYou": "..." },`,
        `  { "title": "<exact title>", "type": "${mediaType}", "year": "<release year or null>", "rank": 3, "reason": "...", "whyForYou": "..." }`,
        `]`,
    ].filter((l): l is string => l !== null).join('\n');
}