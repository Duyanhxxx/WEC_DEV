"use client"

import { login, loginWithGoogle } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { School, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Suspense, useState } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      await loginWithGoogle()
    } catch (err) {
      console.error("Google login error:", err)
    } finally {
        // Redirect happens on server, so this might not run if redirect is successful
        // But good to have for cleanup if error
       setLoading(false)
    }
  }

  return (
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <School className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Đăng nhập vào WEC</h1>
          <p className="text-sm text-muted-foreground">
            Nhập email và mật khẩu của bạn để tiếp tục
          </p>
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    {error === 'Invalid login credentials' ? 'Sai email hoặc mật khẩu' : error}
                </AlertDescription>
            </Alert>
        )}

        {message && (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Thông báo</AlertTitle>
                <AlertDescription>
                    {message}
                </AlertDescription>
            </Alert>
        )}

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button formAction={login} className="w-full">
            Đăng nhập
          </Button>
          <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
              {loading ? (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              )}
              Google
            </Button>
        </form>
        <div className="text-center text-sm">
           Chưa có tài khoản?{' '}
           <Link href="/register" className="underline">
             Đăng ký ngay
           </Link>
        </div>
      </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
