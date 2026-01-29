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

interface UserActionsProps {
  student: any
  classes: any[]
}

export function UserActions({ student, classes }: UserActionsProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onUpdate(formData: FormData) {
    setLoading(true)
    const student_code = formData.get("student_code")
    const name = formData.get("name")
    const parent_name = formData.get("parent_name")
    const phone = formData.get("phone")
    const class_id = formData.get("class_id")

    const { error } = await supabase
      .from("students")
      .update({
        student_code,
        name,
        parent_name,
        phone,
        class_id: class_id || null
      })
      .eq("id", student.id)

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
    const { error } = await supabase.from("students").delete().eq("id", student.id)
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
            <DialogTitle>Sửa thông tin học sinh</DialogTitle>
          </DialogHeader>
          <form action={onUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student_code">Mã học sinh</Label>
              <Input id="student_code" name="student_code" defaultValue={student.student_code} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" name="name" defaultValue={student.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_name">Tên phụ huynh</Label>
              <Input id="parent_name" name="parent_name" defaultValue={student.parent_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" defaultValue={student.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_id">Lớp học</Label>
              <Select name="class_id" defaultValue={student.class_id || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">-- Không chọn --</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <p>Hành động này không thể hoàn tác. Học sinh <b>{student.name}</b> sẽ bị xóa vĩnh viễn.</p>
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
