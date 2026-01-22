import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AddClassDialog } from "./add-class-dialog"

export default async function ClassesPage() {
  const supabase = await createClient()
  const { data: classes } = await supabase.from('classes').select('*').order('name', { ascending: true })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Lớp học</h1>
        <AddClassDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Lớp học</CardTitle>
          <CardDescription>
            Quản lý các lớp học trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên lớp</TableHead>
                <TableHead>Khối</TableHead>
                <TableHead>Giáo viên chủ nhiệm</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes?.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Chưa có lớp học nào</TableCell>
                 </TableRow>
              ) : (
                classes?.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>Khối {cls.grade}</TableCell>
                    <TableCell>{cls.teacher || 'Chưa phân công'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
