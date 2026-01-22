'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Auto confirm email if possible or handle flow gracefully
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        // Redirect to this URL after email confirmation
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    }
  })

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message))
  }
  
  // If signup successful, we might need to verify email
  // But if auto-confirm is enabled in Supabase dashboard, we can just redirect to login
  redirect('/login?message=Check your email to confirm account')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  
  const getURL = () => {
    let url =
      process.env.NEXT_PUBLIC_BASE_URL ?? // Ưu tiên biến môi trường do bạn set
      'http://localhost:3000'
      
    // Đảm bảo có https:// (trừ localhost)
    if (url.includes('localhost')) {
        url = url.startsWith('http') ? url : `http://${url}`
    } else {
        url = url.startsWith('http') ? url : `https://${url}`
    }
    // Loại bỏ dấu / ở cuối nếu có
    url = url.replace(/\/+$/, '')
    return url
  }

  const redirectUrl = `${getURL()}/auth/callback`
  console.log('Login with Google redirecting to:', redirectUrl)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    console.error('Login error:', error)
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    console.log('Supabase returned OAuth URL:', data.url)
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
