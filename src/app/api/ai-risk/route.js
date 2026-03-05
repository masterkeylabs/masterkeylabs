import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { prompt, systemPrompt } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser Input: ${prompt}`
                    }]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return NextResponse.json({ error: data.error?.message || 'Failed to call AI API' }, { status: response.status });
        }

        // Gemini response structure: data.candidates[0].content.parts[0].text
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
