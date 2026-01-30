import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, School, DollarSign, CalendarCheck, UserCog } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Overview } from "@/app/(dashboard)/components/overview"
import { BirthdayAlert } from "@/app/(dashboard)/components/birthday-alert"

export default async function DashboardPage() {
  const supabase = await createClient()
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Fetch counts in parallel
  const [
    { count: studentsCount },
    { count: classesCount },
    { count: attendanceCount },
    { data: transactions },
    { count: staffCount },
    { count: teacherCount },
    { data: teachersData },
    { data: staffData }
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', now.toISOString().split('T')[0]),
    supabase.from('transactions').select('amount, type, date').gte('date', startOfYear),
    supabase.from('staff').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('id, name, dob, subject'),
    supabase.from('staff').select('id, name, dob, role')
  ])

  const totalStaff = (staffCount || 0) + (teacherCount || 0)

  const birthdayPeople = [
    ...(teachersData || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      dob: t.dob,
      role: t.subject ? `GV ${t.subject}` : 'Giáo viên',
      type: 'teacher' as const
    })),
    ...(staffData || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      dob: s.dob,
      role: s.role || 'Nhân viên',
      type: 'staff' as const
    }))
  ]

  // Calculate revenue for current month
  const totalRevenue = transactions?.reduce((acc, curr) => {
    const isThisMonth = curr.date >= startOfMonth
    return (isThisMonth && curr.type === 'income') ? acc + Number(curr.amount) : acc
  }, 0) || 0

  // Prepare graph data
  const monthlyRevenue = new Array(12).fill(0)
  transactions?.forEach(t => {
    if (t.type === 'income') {
      const month = new Date(t.date).getMonth()
      monthlyRevenue[month] += Number(t.amount)
    }
  })

  const graphData = monthlyRevenue.map((total, index) => ({
    name: `T${index + 1}`,
    total
  }))

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500">
      <BirthdayAlert people={birthdayPeople} />
      {/* <h1 className="text-2xl font-bold">Dashboard</h1> - Removed as it's now in Breadcrumbs/Header */}
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
            <CardTitle>Tổng quan doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <Overview data={graphData} />
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
