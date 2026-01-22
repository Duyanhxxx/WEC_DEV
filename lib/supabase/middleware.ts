import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  console.log(`Middleware check: Path=${path}, User=${user?.email || 'null'}`)

  // Debug log
  if (path.startsWith('/auth/callback')) {
      return supabaseResponse
  }

  // TẠM THỜI TẮT REDIRECT ĐỂ DEBUG
  // Nếu user chưa đăng nhập và cố vào trang bảo vệ (không phải login/register/auth)
  
  if (
    !user &&
    !path.startsWith('/login') &&
    !path.startsWith('/register') &&
    !path.startsWith('/auth')
  ) {
    console.log('Middleware: No user, redirecting to login from', path)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  

  // Nếu user ĐÃ đăng nhập mà cố vào trang login hoặc register -> đẩy về dashboard
  if (user && (path.startsWith('/login') || path.startsWith('/register'))) {
    console.log('Middleware: User found, redirecting to dashboard from', path)
    const url = request.nextUrl.clone()
    url.pathname = '/'
    
    // Create a redirect response
    const newResponse = NextResponse.redirect(url)
    
    // Copy cookies from supabaseResponse (which might contain refreshed tokens) to the new redirect response
    // This is crucial because if the token was refreshed in getUser(), supabaseResponse has the new cookies
    // but NextResponse.redirect creates a fresh response without them.
    const cookiesToSet = supabaseResponse.cookies.getAll()
    cookiesToSet.forEach(cookie => {
        newResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return newResponse
  }

  return supabaseResponse
}
