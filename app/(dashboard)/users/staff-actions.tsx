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

interface StaffActionsProps {
  staff: any
}

export function StaffActions({ staff }: StaffActionsProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [empType, setEmpType] = useState(staff.employment_type || "full-time")

  async function onUpdate(formData: FormData) {
    setLoading(true)
    const staff_code = formData.get("staff_code")
    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const dob = formData.get("dob")
    const role = formData.get("role")
    const employment_type = formData.get("employment_type")
    const salary_rate = formData.get("salary_rate")

    const { error } = await supabase
      .from("staff")
      .update({
        staff_code,
        name,
        email,
        phone,
        dob: dob || null,
        role,
        employment_type,
        salary_rate: salary_rate ? Number(salary_rate) : 0
      })
      .eq("id", staff.id)

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
    const { error } = await supabase.from("staff").delete().eq("id", staff.id)
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
            <DialogTitle>Sửa thông tin nhân viên</DialogTitle>
          </DialogHeader>
          <form action={onUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff_code">Mã nhân viên</Label>
              <Input id="staff_code" name="staff_code" defaultValue={staff.staff_code} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" name="name" defaultValue={staff.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={staff.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" defaultValue={staff.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input id="dob" name="dob" type="date" defaultValue={staff.dob} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Chức vụ</Label>
              <Input id="role" name="role" defaultValue={staff.role} />
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
                <Input name="salary_rate" type="number" defaultValue={staff.salary_rate} placeholder="0" />
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
            <p>Hành động này không thể hoàn tác. Nhân viên <b>{staff.name}</b> sẽ bị xóa vĩnh viễn.</p>
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
