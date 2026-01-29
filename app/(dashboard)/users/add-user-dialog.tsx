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

export function AddUserDialog({ classes, role = 'staff' }: { classes: any[], role?: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [empType, setEmpType] = useState("full-time")

  async function onAddStudent(formData: FormData) {
    const student_code = formData.get("student_code")
    const name = formData.get("name")
    const parent_name = formData.get("parent_name")
    const phone = formData.get("phone")
    const class_id = formData.get("class_id")

    const { error } = await supabase.from("students").insert({
        student_code,
        name,
        parent_name,
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
    const dob = formData.get("dob")
    const subject = formData.get("subject")
    const employment_type = formData.get("employment_type")
    const salary_rate = formData.get("salary_rate")

    const { error } = await supabase.from("teachers").insert({
        teacher_code,
        name,
        email,
        phone,
        dob: dob || null,
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
    const dob = formData.get("dob")
    const role = formData.get("role")
    const employment_type = formData.get("employment_type")
    const salary_rate = formData.get("salary_rate")

    const { error } = await supabase.from("staff").insert({
        staff_code,
        name,
        email,
        phone,
        dob: dob || null,
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
          <DialogTitle>Thêm mới thành viên</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="student" className="w-full">
          <TabsList className={`grid w-full ${role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="student">Học sinh</TabsTrigger>
            <TabsTrigger value="teacher">Giáo viên</TabsTrigger>
            {role === 'admin' && <TabsTrigger value="staff">Nhân viên</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="student">
            <form action={onAddStudent} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student_code">Mã học sinh</Label>
                <Input id="student_code" name="student_code" placeholder="HS001" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent_name">Tên phụ huynh</Label>
                <Input id="parent_name" name="parent_name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class_id">Lớp học</Label>
                <Select name="class_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Lưu thông tin</Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher">
            <form action={onAddTeacher} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="teacher_code">Mã giáo viên</Label>
                <Input id="teacher_code" name="teacher_code" placeholder="GV001" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input id="dob" name="dob" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Bộ môn</Label>
                <Input id="subject" name="subject" required />
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="employment_type">Loại hợp đồng</Label>
                 <Select name="employment_type" defaultValue="full-time">
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn loại hợp đồng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="salary_rate">Mức lương cơ bản</Label>
                 <Input id="salary_rate" name="salary_rate" type="number" />
              </div>
              <Button type="submit">Lưu thông tin</Button>
            </form>
          </TabsContent>

          {role === 'admin' && (
          <TabsContent value="staff">
            <form action={onAddStaff} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="staff_code">Mã nhân viên</Label>
                <Input id="staff_code" name="staff_code" placeholder="NV001" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input id="dob" name="dob" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Chức vụ</Label>
                <Input id="role" name="role" required />
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="employment_type">Loại hợp đồng</Label>
                 <Select name="employment_type" defaultValue="full-time">
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn loại hợp đồng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="salary_rate">Mức lương cơ bản</Label>
                 <Input id="salary_rate" name="salary_rate" type="number" />
              </div>
              <Button type="submit">Lưu thông tin</Button>
            </form>
          </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
