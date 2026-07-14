const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

type GeminiSchema = {
    type: string;
    items: {
        type: string;
        properties: Record<string, { type: string }>;
        required: string[];
    };
};

export async function callGemini<T>(
    prompt: string,
    schema: GeminiSchema,
): Promise<T> {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured.');

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 4096,
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message ?? `API error ${response.status}`);
    }

    const data = await response.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!text) throw new Error('Gemini returned an empty response.');

    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        throw new Error(`Response cut off (${finishReason}) — retry.`);
    }

    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as T;
}