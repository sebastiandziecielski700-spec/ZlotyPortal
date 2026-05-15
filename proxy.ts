import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Odświeżenie sesji użytkownika
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isDebugUser = request.cookies.has("zloty_debug_user")

    // Zabezpieczenie ścieżek
    const isPublicUserRoute = 
        request.nextUrl.pathname.startsWith('/logowanie') || 
        request.nextUrl.pathname.startsWith('/api') || 
        request.nextUrl.pathname.startsWith('/_next');

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isAdminLoginRoute = request.nextUrl.pathname.startsWith('/admin/logowanie');
    const isAdminLoggedIn = request.cookies.has("zloty_admin");

    // Jeśli to strona admina (ale nie strona logowania admina) i admin nie jest zalogowany
    if (isAdminRoute && !isAdminLoginRoute && !isAdminLoggedIn) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/logowanie'
        return NextResponse.redirect(url)
    }

    // Jeśli to zwykła strona (nie admin, nie publiczna) i użytkownik nie jest zalogowany
    if (!isAdminRoute && !user && !isDebugUser && !isPublicUserRoute) {
        // Przekieruj na zwykłe logowanie uczniów
        const url = request.nextUrl.clone()
        url.pathname = '/logowanie'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Dopasuj wszystkie ścieżki oprócz:
         * - plików statycznych (_next/static, _next/image, favicon.ico)
         * - zasobów omijanych np. obrazków
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
