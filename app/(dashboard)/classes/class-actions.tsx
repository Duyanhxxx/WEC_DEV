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

interface ClassActionsProps {
  cls: any
}

export function ClassActions({ cls }: ClassActionsProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onUpdate(formData: FormData) {
    setLoading(true)
    const name = formData.get("name")
    const grade = formData.get("grade")
    const teacher = formData.get("teacher")

    const { error } = await supabase
      .from("classes")
      .update({
        name,
        grade,
        teacher,
      })
      .eq("id", cls.id)

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
    const { error } = await supabase.from("classes").delete().eq("id", cls.id)
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
            <DialogTitle>Sửa lớp học</DialogTitle>
          </DialogHeader>
          <form action={onUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên lớp</Label>
              <Input id="name" name="name" defaultValue={cls.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Khối</Label>
              <Input id="grade" name="grade" defaultValue={cls.grade} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Giáo viên chủ nhiệm</Label>
              <Input id="teacher" name="teacher" defaultValue={cls.teacher} placeholder="Tên giáo viên" />
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
            <p>Hành động này không thể hoàn tác. Lớp học <b>{cls.name}</b> sẽ bị xóa vĩnh viễn.</p>
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
