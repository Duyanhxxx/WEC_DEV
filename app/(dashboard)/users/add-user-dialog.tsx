"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
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

export function AddUserDialog({ classes }: { classes: any[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [empType, setEmpType] = useState("full-time")

  async function onAddStudent(formData: FormData) {
    const student_code = formData.get("student_code")
    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const class_id = formData.get("class_id")

    const { error } = await supabase.from("students").insert({
        student_code,
        name,
        email,
        phone,
        class_id: class_id || null
    })

    if (!error) {
        setOpen(false)
        router.refresh()
    } else {
        alert("Lỗi: " + error.message)
    }
  }

  async function onAddTeacher(formData: FormData) {
    const teacher_code = formData.get("teacher_code")
    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const subject = formData.get("subject")
    const employment_type = formData.get("employment_type")
    const salary_rate = formData.get("salary_rate")

    const { error } = await supabase.from("teachers").insert({
        teacher_code,
        name,
        email,
        phone,
        subject,
        employment_type,
        salary_rate: salary_rate ? Number(salary_rate) : 0
    })

    if (!error) {
        setOpen(false)
        router.refresh()
    } else {
        alert("Lỗi: " + error.message)
    }
  }

  async function onAddStaff(formData: FormData) {
    const staff_code = formData.get("staff_code")
    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const role = formData.get("role")
    const employment_type = formData.get("employment_type")
    const salary_rate = formData.get("salary_rate")

    const { error } = await supabase.from("staff").insert({
        staff_code,
        name,
        email,
        phone,
        role,
        employment_type,
        salary_rate: salary_rate ? Number(salary_rate) : 0
    })

    if (!error) {
        setOpen(false)
        router.refresh()
    } else {
        alert("Lỗi: " + error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm mới</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="student">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">Học sinh</TabsTrigger>
                <TabsTrigger value="teacher">Giáo viên</TabsTrigger>
                <TabsTrigger value="staff">Nhân viên</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
                <form action={onAddStudent} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Mã học sinh</Label>
                        <Input name="student_code" required placeholder="HS001" />
                    </div>
                    <div className="space-y-2">
                        <Label>Họ và tên</Label>
                        <Input name="name" required placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input name="email" type="email" placeholder="email@example.com" />
                    </div>
                     <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input name="phone" placeholder="098..." />
                    </div>
                    <div className="space-y-2">
                         <Label>Lớp</Label>
                         <select name="class_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">Chọn lớp</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                         </select>
                    </div>
                    <Button type="submit" className="w-full">Lưu học sinh</Button>
                </form>
            </TabsContent>
            <TabsContent value="teacher">
                <form action={onAddTeacher} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Mã giáo viên</Label>
                        <Input name="teacher_code" required placeholder="GV001" />
                    </div>
                    <div className="space-y-2">
                        <Label>Họ và tên</Label>
                        <Input name="name" required placeholder="Trần Thị B" />
                    </div>
                     <div className="space-y-2">
                        <Label>Email</Label>
                        <Input name="email" type="email" placeholder="email@example.com" />
                    </div>
                     <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input name="phone" placeholder="098..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Bộ môn</Label>
                        <Input name="subject" placeholder="Toán, Lý, Hóa..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Loại hợp đồng</Label>
                        <Select name="employment_type" defaultValue="full-time" onValueChange={setEmpType}>
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
                        <Input name="salary_rate" type="number" placeholder="0" />
                    </div>
                    <Button type="submit" className="w-full">Lưu giáo viên</Button>
                </form>
            </TabsContent>
            <TabsContent value="staff">
                <form action={onAddStaff} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="staff_code">Mã nhân viên</Label>
                        <Input id="staff_code" name="staff_code" placeholder="NV001" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input id="name" name="name" placeholder="Nguyễn Văn A" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="example@gmail.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input id="phone" name="phone" placeholder="0912345678" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Vị trí / Chức vụ</Label>
                        <Input id="role" name="role" placeholder="Kế toán, Bảo vệ..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Loại hợp đồng</Label>
                        <Select name="employment_type" defaultValue="full-time" onValueChange={setEmpType}>
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
                        <Input name="salary_rate" type="number" placeholder="0" />
                    </div>
                    <Button type="submit" className="w-full">Lưu nhân viên</Button>
                </form>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
