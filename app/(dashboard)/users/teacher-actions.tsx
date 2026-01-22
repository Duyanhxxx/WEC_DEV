"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TeacherActionsProps {
  teacher: any
}

export function TeacherActions({ teacher }: TeacherActionsProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [empType, setEmpType] = useState(teacher.employment_type || "full-time")

  async function onUpdate(formData: FormData) {
    setLoading(true)
    const teacher_code = formData.get("teacher_code")
    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const subject = formData.get("subject")
    const employment_type = formData.get("employment_type")
    const salary_rate = formData.get("salary_rate")

    const { error } = await supabase
      .from("teachers")
      .update({
        teacher_code,
        name,
        email,
        phone,
        subject,
        employment_type,
        salary_rate: salary_rate ? Number(salary_rate) : 0
      })
      .eq("id", teacher.id)

    setLoading(false)

    if (!error) {
      setOpenEdit(false)
      router.refresh()
    } else {
      alert("Lỗi: " + error.message)
    }
  }

  async function onDelete() {
    setLoading(true)
    const { error } = await supabase.from("teachers").delete().eq("id", teacher.id)
    setLoading(false)

    if (!error) {
      setOpenDelete(false)
      router.refresh()
    } else {
      alert("Lỗi: " + error.message)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="ghost" size="icon" onClick={() => setOpenEdit(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      
      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setOpenDelete(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sửa thông tin giáo viên</DialogTitle>
          </DialogHeader>
          <form action={onUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher_code">Mã giáo viên</Label>
              <Input id="teacher_code" name="teacher_code" defaultValue={teacher.teacher_code} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" name="name" defaultValue={teacher.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={teacher.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" defaultValue={teacher.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Bộ môn</Label>
              <Input id="subject" name="subject" defaultValue={teacher.subject} />
            </div>
            <div className="space-y-2">
                <Label>Loại hợp đồng</Label>
                <Select name="employment_type" defaultValue={empType} onValueChange={setEmpType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn loại hợp đồng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>{empType === 'full-time' ? 'Lương cơ bản (VNĐ/tháng)' : 'Lương theo giờ (VNĐ/giờ)'}</Label>
                <Input name="salary_rate" type="number" defaultValue={teacher.salary_rate} placeholder="0" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Hành động này không thể hoàn tác. Giáo viên <b>{teacher.name}</b> sẽ bị xóa vĩnh viễn.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={loading}>Hủy</Button>
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              {loading ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
