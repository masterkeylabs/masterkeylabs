import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { analyzeSEO } from '@/lib/analyzer/seo';
import { analyzePerformance } from '@/lib/analyzer/performance';
import { analyzeConversion } from '@/lib/analyzer/conversion';
import { analyzeTrust } from '@/lib/analyzer/trust';
import { analyzeUX } from '@/lib/analyzer/ux';
import { finalizeAnalysis } from '@/lib/analyzer/recommendations';

export async function POST(req) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        const startTime = Date.now();
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 0 } // Bypass cache
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const endTime = Date.now();
        const responseTimeMs = endTime - startTime;

        const $ = cheerio.load(html);
        const hasSSL = response.url.startsWith('https://');

        const seo = analyzeSEO($, targetUrl);
        const perf = analyzePerformance(
            responseTimeMs,
            html.length,
            response.headers
        );
        const conversion = analyzeConversion($);
        const trust = analyzeTrust($, hasSSL);
        const ux = analyzeUX($);

        const result = finalizeAnalysis(
            targetUrl,
            seo,
            perf,
            conversion,
            trust,
            ux
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze website' },
            { status: 500 }
        );
    }
}
