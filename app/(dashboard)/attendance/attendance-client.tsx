"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface AttendanceClientProps {
  classes: any[]
}

export default function AttendanceClient({ classes }: AttendanceClientProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  // Fetch students when class changes
  useEffect(() => {
    async function fetchStudents() {
      if (!selectedClass) {
        setStudents([])
        return
      }
      setLoading(true)
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .order('name', { ascending: true })
      
      if (data) {
        setStudents(data)
      }
      setLoading(false)
    }
    fetchStudents()
  }, [selectedClass, supabase])

  // Fetch attendance when class or date changes
  useEffect(() => {
    async function fetchAttendance() {
      if (!selectedClass || !date) return
      
      const formattedDate = format(date, 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', formattedDate)
      
      const newAttendanceData : Record<string, any> = {}
      if (data) {
        data.forEach((record) => {
          newAttendanceData[record.student_id] = record
        })
      }
      setAttendanceData(newAttendanceData)
    }
    fetchAttendance()
  }, [selectedClass, date, supabase])

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: status,
        student_id: studentId
      }
    }))
  }

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note: note,
        student_id: studentId
      }
    }))
  }

  const handleSave = async () => {
    if (!selectedClass || !date) return
    setSaving(true)
    
    const formattedDate = format(date, 'yyyy-MM-dd')
    
    // Prepare data
    // If a student has no record in attendanceData, default to 'present'
    const upsertData = students.map(student => {
      const record = attendanceData[student.id] || {}
      return {
        student_id: student.id,
        class_id: selectedClass,
        date: formattedDate,
        status: record.status || 'present', 
        note: record.note || '',
      }
    })

    try {
      // 1. Delete existing records for this class & date
      const { error: deleteError } = await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', formattedDate)
      
      if (deleteError) throw deleteError

      // 2. Insert new records
      const { error: insertError } = await supabase
        .from('attendance')
        .insert(upsertData)
      
      if (insertError) throw insertError

      alert("Lưu điểm danh thành công!")
      
      // Refresh attendance data
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', formattedDate)
        
      const newAttendanceData : Record<string, any> = {}
      if (data) {
        data.forEach((record) => {
          newAttendanceData[record.student_id] = record
        })
      }
      setAttendanceData(newAttendanceData)

    } catch (error: any) {
      console.error("Error saving attendance:", error)
      alert("Lỗi khi lưu điểm danh: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Điểm danh hàng ngày</h1>
        <Button onClick={handleSave} disabled={saving || !selectedClass}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Lưu điểm danh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-4">
           <Card>
             <CardHeader>
               <CardTitle>Chọn ngày & Lớp</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Ngày điểm danh</label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
               </div>
               
               <div className="space-y-2">
                 <label className="text-sm font-medium">Lớp học</label>
                 <Select onValueChange={setSelectedClass} value={selectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp học" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
               </div>
             </CardContent>
           </Card>
        </div>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              Danh sách điểm danh: {selectedClass ? classes.find(c => c.id === selectedClass)?.name : "..."}
            </CardTitle>
            <CardDescription>
              {date ? format(date, "PPP") : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedClass ? (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Vui lòng chọn lớp để hiển thị danh sách
              </div>
            ) : loading ? (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Lớp này chưa có học sinh nào.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">TT</TableHead>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead className="text-center">Có mặt</TableHead>
                    <TableHead className="text-center">Vắng có phép</TableHead>
                    <TableHead className="text-center">Vắng không phép</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const record = attendanceData[student.id] || {}
                    const status = record.status || 'present'
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.student_code}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={status === 'present'} 
                            onCheckedChange={() => handleStatusChange(student.id, 'present')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={status === 'absent_excused'}
                            onCheckedChange={() => handleStatusChange(student.id, 'absent_excused')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={status === 'absent_unexcused'}
                            onCheckedChange={() => handleStatusChange(student.id, 'absent_unexcused')}
                          />
                        </TableCell>
                        <TableCell>
                           <input 
                              className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-sm transition-colors" 
                              placeholder="Ghi chú..." 
                              value={record.note || ''}
                              onChange={(e) => handleNoteChange(student.id, e.target.value)}
                           />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
