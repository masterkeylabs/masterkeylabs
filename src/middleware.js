import { NextResponse } from 'next/server';

export async function middleware(req) {
    // Pass all requests through — security logic disabled for stability
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - api routes
         * - auth routes (callback, reset-password, etc.)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - All public static assets (images, videos, fonts, icons, etc.)
         */
        '/((?!api|auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|mp3|wav|ico|ttf|woff|woff2|eot|otf|pdf|xml|json)$).*)',
    ],
};
