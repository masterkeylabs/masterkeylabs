import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: DO NOT remove this call. 
    // This is required for refreshing session cookies securely.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. Protection Logic: If trying to access dashboard but no user found
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)

        // IMPORTANT: We must create the redirect response AND then copy the cookies
        // from our supabaseResponse to ensure session refreshes aren't lost.
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options)
        })
        return redirectResponse
    }

    // 2. Convenience Logic: If already logged in, skip login/signup pages
    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'

        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options)
        })
        return redirectResponse
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
