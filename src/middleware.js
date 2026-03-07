import { NextResponse } from 'next/server';

export async function middleware(req) {
    // Security Overhaul Disabled for stability (Bug-Free Priority)
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
