import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Middleware: Missing Supabase environment variables')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies for subsequent middleware/handlers
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Create new response to include updated cookies
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Update response cookies for the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    // Log error but don't fail yet, as it might be a public page
    console.log('Middleware: getUser error', userError.message)
  }

  const pathname = request.nextUrl.pathname
  
  // Define public pages
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/signup') || 
                     pathname.startsWith('/auth')
  
  // Board list pages are public (e.g., /board/free), but detail/new are private
  const pathSegments = pathname.split('/').filter(Boolean)
  const isBoardList = pathSegments.length === 2 && pathSegments[0] === 'board'
  
  const isPublicPage = pathname === '/' || isAuthPage || isBoardList

  // Debug log for authentication status (useful for Vercel logs)
  console.log(`Middleware: [${pathname}] user: ${user ? user.email : 'none'}, isPublic: ${isPublicPage}`)

  if (!user && !isPublicPage) {
    console.log(`Middleware: Redirecting to /login from ${pathname}`)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Preserve the original destination to redirect back after login
    if (pathname !== '/login') {
      url.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(url)
  }

  // Admin check
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      console.log(`Middleware: Admin access denied for ${user?.email || 'unknown'}`)
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
