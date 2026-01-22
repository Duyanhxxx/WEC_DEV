import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>User not found</div>
  }

  const { email, user_metadata } = user
  const fullName = user_metadata?.full_name || email?.split('@')[0] || "User"
  const avatarUrl = user_metadata?.avatar_url
  const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('vi-VN') : 'N/A'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Hồ sơ cá nhân</h3>
        <p className="text-sm text-muted-foreground">
          Thông tin tài khoản và tùy chọn cá nhân.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Thông tin hiển thị công khai của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
               <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="text-2xl">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h4 className="text-lg font-semibold">{fullName}</h4>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
            <CardTitle>Chi tiết tài khoản</CardTitle>
            <CardDescription>
              Thông tin đăng nhập và định danh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uid">User ID</Label>
              <Input id="uid" value={user.id} disabled readOnly className="font-mono text-xs" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="last-sign-in">Đăng nhập lần cuối</Label>
              <Input id="last-sign-in" value={lastSignIn} disabled readOnly />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
