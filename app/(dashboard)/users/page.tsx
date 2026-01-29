import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchInput } from "./search-input"
import { createClient } from "@/lib/supabase/server"
import { AddUserDialog } from "./add-user-dialog"
import { UserActions } from "./user-actions"
import { TeacherActions } from "./teacher-actions"
import { StaffActions } from "./staff-actions"
import { getUserRole } from "@/lib/auth"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string
  }>
}) {
  const supabase = await createClient()
  const role = await getUserRole()
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams?.query || ''

  let studentQuery = supabase.from('students').select('*').order('created_at', { ascending: false })
  if (query) {
    studentQuery = studentQuery.ilike('name', `%${query}%`)
  }
  const { data: students } = await studentQuery

  let teacherQuery = supabase.from('teachers').select('*').order('created_at', { ascending: false })
  if (query) {
    teacherQuery = teacherQuery.ilike('name', `%${query}%`)
  }
  const { data: teachers } = await teacherQuery

  let staffQuery = supabase.from('staff').select('*').order('created_at', { ascending: false })
  if (query) {
    staffQuery = staffQuery.ilike('name', `%${query}%`)
  }
  const { data: staff } = await staffQuery

  const { data: classes } = await supabase.from('classes').select('id, name').order('name', { ascending: true })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Học sinh / Giáo viên / Nhân viên</h1>
        <AddUserDialog classes={classes || []} role={role || 'staff'} />
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className={`grid w-[600px] ${role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="students">Học sinh</TabsTrigger>
          <TabsTrigger value="teachers">Giáo viên</TabsTrigger>
          {role === 'admin' && <TabsTrigger value="staff">Nhân viên</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Học sinh</CardTitle>
              <CardDescription>
                Quản lý thông tin học sinh toàn trường.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                 <SearchInput placeholder="Tìm kiếm học sinh..." />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Tên phụ huynh</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Chưa có dữ liệu học sinh
                      </TableCell>
                    </TableRow>
                  ) : (
                    students?.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.student_code}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.parent_name}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell className="text-right">
                          <UserActions student={student} classes={classes || []} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Giáo viên</CardTitle>
              <CardDescription>
                Quản lý thông tin giáo viên và bộ môn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                 <SearchInput placeholder="Tìm kiếm giáo viên..." />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã GV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Bộ môn</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Chưa có dữ liệu giáo viên
                      </TableCell>
                    </TableRow>
                  ) : (
                    teachers?.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.teacher_code}</TableCell>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.subject}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.phone}</TableCell>
                        <TableCell className="text-right">
                          <TeacherActions teacher={teacher} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Nhân viên</CardTitle>
              <CardDescription>
                Quản lý thông tin nhân viên (Bảo vệ, Kế toán, Tư vấn...).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                 <SearchInput placeholder="Tìm kiếm nhân viên..." />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã NV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Chưa có dữ liệu nhân viên
                      </TableCell>
                    </TableRow>
                  ) : (
                    staff?.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.staff_code}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.role}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.phone}</TableCell>
                        <TableCell className="text-right">
                          <StaffActions staff={s} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
