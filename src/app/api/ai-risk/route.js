import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { prompt, systemPrompt } = await req.json();

        // Use DEEPSEEK_API_KEY as requested
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            console.error('DEEPSEEK_API_KEY is missing');
            return NextResponse.json({ error: 'DEEPSEEK_API_KEY is not configured in environment variables.' }, { status: 500 });
        }

        const body = JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            response_format: {
                type: 'json_object'
            },
            temperature: 0.7,
            max_tokens: 2000
        });

        console.log('--- DISPATCHING TO DEEPSEEK ---');

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('DeepSeek API Error:', data);

            // Handle specific DeepSeek/OpenAI error codes
            if (response.status === 402) {
                return NextResponse.json({ error: 'Insufficient Balance: Please check your DeepSeek account top-up.' }, { status: 402 });
            }
            if (response.status === 429) {
                return NextResponse.json({ error: 'DeepSeek Rate Limit: Too many requests. Please wait a moment.' }, { status: 429 });
            }

            return NextResponse.json({
                error: data.error?.message || 'DeepSeek service unavailable or failed.'
            }, { status: response.status });
        }

        // Return standardized OpenAI-style response
        // The frontend will be updated to handle this data structure
        return NextResponse.json(data);

    } catch (error) {
        console.error('DeepSeek API Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
