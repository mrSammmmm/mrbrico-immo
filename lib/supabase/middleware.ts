import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from './database.types'

/**
 * Middleware Supabase pour gérer les sessions et la protection des routes
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
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

  // Rafraîchir la session si elle existe
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protection des routes
  const pathname = request.nextUrl.pathname

  // Routes publiques (pas de protection)
  const publicRoutes = ['/login', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Si pas connecté et pas sur une route publique, rediriger vers login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si connecté et sur la page login, rediriger vers le dashboard approprié
  if (user && pathname === '/login') {
    // Récupérer le rôle de l'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = userData?.role === 'admin' ? '/admin/dashboard' : '/manager/dashboard'
    return NextResponse.redirect(url)
  }

  // Vérifier l'accès aux routes admin
  if (user && pathname.startsWith('/admin')) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/manager/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
