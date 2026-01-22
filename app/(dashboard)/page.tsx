import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, School, DollarSign, CalendarCheck, UserCog } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch counts in parallel
  const [
    { count: studentsCount },
    { count: classesCount },
    { count: attendanceCount }, // Logic might need adjustment for "today's attendance"
    { data: transactions },
    { count: staffCount },
    { count: teacherCount }
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', new Date().toISOString().split('T')[0]),
    supabase.from('transactions').select('amount, type').gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from('staff').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true })
  ])

  const totalStaff = (staffCount || 0) + (teacherCount || 0)

  // Calculate revenue
  const totalRevenue = transactions?.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + Number(curr.amount) : acc
  }, 0) || 0

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số Học sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Toàn hệ thống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số Nhân sự</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">Giáo viên & Nhân viên</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lớp học đang hoạt động</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Lớp học</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm danh hôm nay</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceCount || 0}</div>
            <p className="text-xs text-muted-foreground">Lượt điểm danh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng này</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('vi-VN')}₫</div>
            <p className="text-xs text-muted-foreground">Tổng thu</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional dashboard content (charts, recent activity) can go here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[200px] flex items-center justify-center text-muted-foreground">
               Biểu đồ doanh thu (Chưa có dữ liệu)
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {/* Could fetch recent logs here */}
               <div className="text-sm text-muted-foreground">Chưa có hoạt động nào.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
