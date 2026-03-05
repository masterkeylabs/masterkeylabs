import { NextResponse } from 'next/server';

const MODELS = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
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
        for (const modelUrl of MODELS) {
            const response = await fetch(`${modelUrl}?key=${process.env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            const data = await response.json();

            if (response.ok) {
                return NextResponse.json(data);
            }

            // If quota exceeded or model not found, try next model
            const errCode = data?.error?.code;
            const errStatus = data?.error?.status;
            if (errCode === 429 || errStatus === 'RESOURCE_EXHAUSTED' || errCode === 404 || errStatus === 'NOT_FOUND') {
                console.warn(`Model ${modelUrl} failed (${errCode}), trying next...`);
                continue;
            }

            // Other error — return it immediately
            console.error('Gemini API Error:', data);
            return NextResponse.json({ error: data.error?.message || 'AI API error' }, { status: response.status });
        }

        // All models exhausted
        return NextResponse.json({
            error: 'AI service is temporarily at capacity. Please try again in 30 seconds.'
        }, { status: 503 });

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
