
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Pencil, Trash2, Users, Save } from "lucide-react"
import { createSubjectClass } from "./subject-actions"

interface Subject {
  id: string
  name: string
  code: string
}

interface Class {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  student_code: string
  class_id: string
}

export default function SubjectsClient({ initialSubjects, classes }: { initialSubjects: Subject[], classes: Class[] }) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [loading, setLoading] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEnroll, setOpenEnroll] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  
  // Enrollment state
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [students, setStudents] = useState<Student[]>([])
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<string[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [creatingClass, setCreatingClass] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const code = formData.get("code") as string

    const { data, error } = await supabase.from("subjects").insert({ name, code }).select().single()
    if (error) {
      alert(error.message)
    } else {
      if (data) {
        setSubjects([...subjects, data])
        setOpenAdd(false)
        router.refresh()
      }
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa môn học này?")) return
    const { error } = await supabase.from("subjects").delete().eq("id", id)
    if (error) {
      alert(error.message)
    } else {
      setSubjects(subjects.filter(s => s.id !== id))
      router.refresh()
    }
  }

  // Enrollment Logic
  const openEnrollment = (subject: Subject) => {
    setSelectedSubject(subject)
    setSelectedClass("")
    setStudents([])
    setEnrolledStudentIds([])
    setOpenEnroll(true)
  }

  const fetchStudentsAndEnrollment = async (classId: string) => {
    setLoadingStudents(true)
    setSelectedClass(classId)
    
    // Fetch students in class
    const { data: classStudents } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('name')
    
    if (classStudents) {
      setStudents(classStudents)
      
      // Fetch existing enrollments for this subject and these students
      if (selectedSubject) {
        const { data: enrollments } = await supabase
          .from('student_subjects')
          .select('student_id')
          .eq('subject_id', selectedSubject.id)
          .in('student_id', classStudents.map(s => s.id))
        
        if (enrollments) {
          setEnrolledStudentIds(enrollments.map(e => e.student_id))
        }
      }
    }
    setLoadingStudents(false)
  }

  const toggleEnrollment = async (studentId: string, checked: boolean) => {
    if (!selectedSubject) return

    // Optimistic update
    if (checked) {
      setEnrolledStudentIds(prev => [...prev, studentId])
      await supabase.from('student_subjects').insert({
        student_id: studentId,
        subject_id: selectedSubject.id
      })
    } else {
      setEnrolledStudentIds(prev => prev.filter(id => id !== studentId))
      await supabase.from('student_subjects').delete()
        .eq('student_id', studentId)
        .eq('subject_id', selectedSubject.id)
    }
  }

  const handleCreateClass = async () => {
    if (!selectedSubject || !newClassName) return
    if (enrolledStudentIds.length === 0) {
      alert("Vui lòng chọn ít nhất một học sinh")
      return
    }

    setCreatingClass(true)
    try {
      await createSubjectClass({
        subject_id: selectedSubject.id,
        name: newClassName,
        student_ids: enrolledStudentIds
      })
      alert("Đã tạo lớp thành công!")
      setOpenEnroll(false)
      setNewClassName("")
      router.refresh()
    } catch (error: any) {
      console.error(error)
      alert("Lỗi: " + error.message)
    } finally {
      setCreatingClass(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Môn học</h2>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Thêm Môn học
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Môn học mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên môn học</Label>
                <Input id="name" name="name" required placeholder="Ví dụ: Toán, Lý..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Mã môn (tùy chọn)</Label>
                <Input id="code" name="code" placeholder="MATH01" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên môn học</TableHead>
              <TableHead>Mã môn</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  Chưa có môn học nào.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEnrollment(subject)} title="Danh sách học sinh">
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(subject.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={openEnroll} onOpenChange={setOpenEnroll}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Danh sách học sinh - {selectedSubject?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 py-4">
            <Label>Chọn Lớp:</Label>
            <Select value={selectedClass} onValueChange={fetchStudentsAndEnrollment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn lớp..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-auto border rounded-md p-2">
            {!selectedClass ? (
              <div className="text-center py-8 text-muted-foreground">Vui lòng chọn lớp để xem danh sách học sinh</div>
            ) : loadingStudents ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">Lớp này chưa có học sinh.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ĐK</TableHead>
                    <TableHead className="w-[50px]">STT</TableHead>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ tên</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const isEnrolled = enrolledStudentIds.includes(student.id)
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox 
                            checked={isEnrolled} 
                            onCheckedChange={(checked) => toggleEnrollment(student.id, checked as boolean)} 
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.student_code}</TableCell>
                        <TableCell>{student.name}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-2">Tạo Lớp Học Phần (từ danh sách đã chọn)</h4>
            <div className="flex gap-2">
              <Input 
                placeholder="Nhập tên lớp (VD: Lý 10A - Nhóm 1)" 
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
              />
              <Button onClick={handleCreateClass} disabled={creatingClass || !newClassName || enrolledStudentIds.length === 0}>
                {creatingClass ? "Đang tạo..." : "Tạo Lớp"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              * Chọn học sinh ở trên, sau đó nhập tên lớp và bấm Tạo Lớp.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
