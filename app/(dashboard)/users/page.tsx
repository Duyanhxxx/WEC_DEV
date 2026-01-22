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
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AddUserDialog } from "./add-user-dialog"

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: students } = await supabase.from('students').select('*').order('created_at', { ascending: false })
  const { data: teachers } = await supabase.from('teachers').select('*').order('created_at', { ascending: false })
  const { data: classes } = await supabase.from('classes').select('id, name').order('name', { ascending: true })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Học sinh / Giáo viên</h1>
        <AddUserDialog classes={classes || []} />
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="students">Học sinh</TabsTrigger>
          <TabsTrigger value="teachers">Giáo viên</TabsTrigger>
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
                 <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm kiếm học sinh..."
                      className="pl-8 sm:w-[300px]"
                    />
                 </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Chưa có dữ liệu học sinh
                      </TableCell>
                    </TableRow>
                  ) : (
                    students?.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.student_code}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone}</TableCell>
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
                 <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm kiếm giáo viên..."
                      className="pl-8 sm:w-[300px]"
                    />
                 </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã GV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Bộ môn</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
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
