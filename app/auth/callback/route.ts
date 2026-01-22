import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sau khi exchange code thành công, cookie session đã được set.
      // Chúng ta redirect về trang đích (mặc định là /).
      // Sử dụng origin từ request URL để đảm bảo đúng domain (localhost hoặc vercel).
      return NextResponse.redirect(`${origin}${next}`)
    } else {
        console.error('Auth callback error:', error)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
}
