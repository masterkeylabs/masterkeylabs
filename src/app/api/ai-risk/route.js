import { NextResponse } from 'next/server';

const MODELS = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
];

export async function POST(req) {
    try {
        const { prompt, systemPrompt } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const body = JSON.stringify({
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nUser Input: ${prompt}`
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        // Try each model in order until one succeeds
        let lastError = null;
        for (const modelUrl of MODELS) {
            try {
                const response = await fetch(`${modelUrl}?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body,
                });

                const data = await response.json();

                if (response.ok && data.candidates) {
                    return NextResponse.json(data);
                }

                lastError = data;

                // If quota exceeded or model not found, try next model
                const errCode = data?.error?.code;
                const errStatus = data?.error?.status;
                const errMsg = (data?.error?.message || '').toLowerCase();

                const isQuotaOrUnusable =
                    errCode === 429 ||
                    errStatus === 'RESOURCE_EXHAUSTED' ||
                    errCode === 404 ||
                    errStatus === 'NOT_FOUND' ||
                    errStatus === 'UNAVAILABLE' ||
                    errMsg.includes('quota') ||
                    errMsg.includes('exhausted') ||
                    errMsg.includes('capacity') ||
                    errMsg.includes('overloaded');

                if (isQuotaOrUnusable) {
                    console.warn(`Model ${modelUrl} failed/quota reached, trying next...`);
                    continue;
                }

                // Other error — return it immediately and let the frontend retry
                console.error('Gemini API Error:', data);
                return NextResponse.json({ error: data.error?.message || 'AI API error' }, { status: response.status || 500 });

            } catch (fetchErr) {
                console.warn(`Fetch to ${modelUrl} failed:`, fetchErr.message);
                lastError = fetchErr;
                continue; // Try next model on network error
            }
        }

        // All models exhausted
        console.error('All Gemini models exhausted. Last error:', lastError);
        return NextResponse.json({
            error: 'AI service is temporarily at capacity (Model Quota Reached). Please wait a moment and try again.'
        }, { status: 429 });

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
