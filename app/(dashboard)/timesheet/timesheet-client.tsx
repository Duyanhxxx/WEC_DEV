"use client"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Download } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar } from "@/components/ui/calendar"
import * as XLSX from "xlsx"

interface Employee {
  id: string
  name: string
  employment_type: 'full-time' | 'part-time'
  salary_rate: number
  teacher_code?: string
  staff_code?: string
}

interface AttendanceRecord {
  id?: string
  date: string
  status: string
  hours_worked: number
  note?: string
  teacher_id?: string
  staff_id?: string
}

interface TimesheetClientProps {
  teachers: Employee[]
  staff: Employee[]
}

export default function TimesheetClient({ teachers, staff }: TimesheetClientProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  // Attendance State
  const [teacherAttendance, setTeacherAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [staffAttendance, setStaffAttendance] = useState<Record<string, AttendanceRecord>>({})
  
  const [saving, setSaving] = useState(false)
  
  // History State
  const [historyMonth, setHistoryMonth] = useState<Date>(new Date())
  const [teacherHistory, setTeacherHistory] = useState<AttendanceRecord[]>([])
  const [staffHistory, setStaffHistory] = useState<AttendanceRecord[]>([])
  
  const supabase = createClient()

  // --- Attendance Logic ---

  const fetchAttendance = useCallback(async () => {
    if (!date) return
    
    const formattedDate = format(date, 'yyyy-MM-dd')

    // Fetch Teacher Attendance
    const { data: tData } = await supabase
      .from('teacher_attendance')
      .select('*')
      .eq('date', formattedDate)
    
    const newTeacherAttendance : Record<string, AttendanceRecord> = {}
    if (tData) {
      (tData as AttendanceRecord[]).forEach((record) => {
        if (record.teacher_id) newTeacherAttendance[record.teacher_id] = record
      })
    }
    setTeacherAttendance(newTeacherAttendance)

    // Fetch Staff Attendance
    const { data: sData } = await supabase
      .from('staff_attendance')
      .select('*')
      .eq('date', formattedDate)

    const newStaffAttendance : Record<string, AttendanceRecord> = {}
    if (sData) {
      (sData as AttendanceRecord[]).forEach((record) => {
        if (record.staff_id) newStaffAttendance[record.staff_id] = record
      })
    }
    setStaffAttendance(newStaffAttendance)

  }, [date, supabase])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const handleTeacherStatusChange = (id: string, checked: boolean) => {
    setTeacherAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: checked ? 'present' : 'absent',
        hours_worked: checked ? 8 : 0,
        teacher_id: id
      }
    }))
  }

  const handleTeacherHoursChange = (id: string, hours: string) => {
    setTeacherAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        hours_worked: Number(hours),
        status: Number(hours) > 0 ? 'present' : 'absent',
        teacher_id: id
      }
    }))
  }

  const handleStaffStatusChange = (id: string, checked: boolean) => {
    setStaffAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: checked ? 'present' : 'absent',
        hours_worked: checked ? 8 : 0,
        staff_id: id
      }
    }))
  }

  const handleStaffHoursChange = (id: string, hours: string) => {
    setStaffAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        hours_worked: Number(hours),
        status: Number(hours) > 0 ? 'present' : 'absent',
        staff_id: id
      }
    }))
  }

  const handleSaveAttendance = async () => {
    if (!date) return
    setSaving(true)
    
    const formattedDate = format(date, 'yyyy-MM-dd')
    
    // Prepare Teacher Data
    const teacherUpsertData = teachers.map(t => {
      const record = teacherAttendance[t.id] || {}
      return {
        teacher_id: t.id,
        date: formattedDate,
        status: record.status || 'absent',
        hours_worked: record.hours_worked || 0,
      }
    })

    // Prepare Staff Data
    const staffUpsertData = staff.map(s => {
      const record = staffAttendance[s.id] || {}
      return {
        staff_id: s.id,
        date: formattedDate,
        status: record.status || 'absent',
        hours_worked: record.hours_worked || 0,
      }
    })

    try {
      const { error: tError } = await supabase
        .from('teacher_attendance')
        .upsert(teacherUpsertData, { onConflict: 'teacher_id, date' })
      
      if (tError) throw tError

      const { error: sError } = await supabase
        .from('staff_attendance')
        .upsert(staffUpsertData, { onConflict: 'staff_id, date' })

      if (sError) throw sError

      alert("Lưu chấm công thành công!")
    } catch (error: any) {
      alert("Lỗi: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  // --- History Logic ---
  useEffect(() => {
    async function fetchHistory() {
      const start = startOfMonth(historyMonth)
      const end = endOfMonth(historyMonth)
      const startDateStr = format(start, 'yyyy-MM-dd')
      const endDateStr = format(end, 'yyyy-MM-dd')

      // Fetch Teacher History
      const { data: tData } = await supabase
        .from('teacher_attendance')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
      setTeacherHistory(tData || [])

      // Fetch Staff History
      const { data: sData } = await supabase
        .from('staff_attendance')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
      setStaffHistory(sData || [])
    }
    fetchHistory()
  }, [historyMonth, supabase])

  const handleExportHistory = () => {
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(historyMonth),
        end: endOfMonth(historyMonth)
    })

    const wb = XLSX.utils.book_new()

    // Helper to create sheet data
    const createSheetData = (people: Employee[], historyData: AttendanceRecord[], idField: keyof AttendanceRecord) => {
        const header = ["Mã", "Họ tên", "Loại HĐ", ...daysInMonth.map(d => format(d, 'dd/MM'))]
        const data = people.map(p => {
            const row: any[] = [
                idField === 'teacher_id' ? p.teacher_code : p.staff_code,
                p.name,
                p.employment_type === 'full-time' ? 'Full-time' : 'Part-time'
            ]
            
            daysInMonth.forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const record = historyData.find(r => r[idField] === p.id && r.date === dateStr)
                let cellValue = ""
                if (record) {
                    if (p.employment_type === 'full-time') {
                         cellValue = record.status === 'present' ? "X" : "VP"
                    } else {
                        cellValue = record.hours_worked > 0 ? `${record.hours_worked}` : ""
                    }
                }
                row.push(cellValue)
            })
            return row
        })
        return [header, ...data]
    }

    // Teacher Sheet
    const teacherSheetData = createSheetData(teachers, teacherHistory, 'teacher_id')
    const wsTeachers = XLSX.utils.aoa_to_sheet(teacherSheetData)
    XLSX.utils.book_append_sheet(wb, wsTeachers, "Giáo viên")

    // Staff Sheet
    const staffSheetData = createSheetData(staff, staffHistory, 'staff_id')
    const wsStaff = XLSX.utils.aoa_to_sheet(staffSheetData)
    XLSX.utils.book_append_sheet(wb, wsStaff, "Nhân viên")

    // Save file
    const fileName = `Cham_cong_${format(historyMonth, 'MM_yyyy')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // --- Render Helpers ---

  const renderHistoryTable = (people: Employee[], historyData: AttendanceRecord[], idField: keyof AttendanceRecord) => {
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(historyMonth),
        end: endOfMonth(historyMonth)
    })

    return (
        <div className="overflow-x-auto">
            <Table className="border-collapse border">
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[150px] sticky left-0 bg-background z-10 border-r">Họ tên</TableHead>
                        {daysInMonth.map(day => (
                            <TableHead key={day.toString()} className="text-center p-1 min-w-[30px] text-xs border-r h-8">
                                {format(day, 'd')}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {people.map(person => (
                        <TableRow key={person.id}>
                            <TableCell className="font-medium sticky left-0 bg-background z-10 border-r">{person.name}</TableCell>
                            {daysInMonth.map(day => {
                                const dateStr = format(day, 'yyyy-MM-dd')
                                const record = historyData.find(
                                    r => r[idField] === person.id && r.date === dateStr
                                )
                                
                                let content = ""
                                let bgColor = ""
                                let textColor = ""

                                if (record) {
                                    if (person.employment_type === 'full-time') {
                                        if (record.status === 'present') {
                                            content = "✓"
                                            bgColor = "bg-green-50"
                                            textColor = "text-green-600 font-bold"
                                        } else {
                                            content = "x"
                                            bgColor = "bg-red-50"
                                            textColor = "text-red-400"
                                        }
                                    } else {
                                        // Part-time
                                        if (record.hours_worked > 0) {
                                            content = `${record.hours_worked}h`
                                            bgColor = "bg-blue-50"
                                            textColor = "text-blue-600 font-medium"
                                        } else {
                                            content = "-"
                                        }
                                    }
                                }

                                return (
                                    <TableCell key={day.toString()} className={cn("text-center p-1 border-r border-b h-8", bgColor)}>
                                        <span className={textColor}>{content}</span>
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
  }

  const renderAttendanceTable = (people: Employee[], attendanceMap: Record<string, AttendanceRecord>, isTeacher: boolean) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Loại HĐ</TableHead>
                <TableHead>Trạng thái / Giờ làm</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {people.map(p => {
                const record = attendanceMap[p.id] || {}
                const isPresent = record.status === 'present'
                const hours = record.hours_worked || 0
                return (
                    <TableRow key={p.id}>
                        <TableCell>{isTeacher ? p.teacher_code : p.staff_code}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>
                            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", 
                                p.employment_type === 'full-time' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800")}>
                                {p.employment_type === 'full-time' ? 'Full-time' : 'Part-time'}
                            </span>
                        </TableCell>
                        <TableCell>
                            {p.employment_type === 'full-time' ? (
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        checked={isPresent}
                                        onCheckedChange={(checked) => isTeacher 
                                            ? handleTeacherStatusChange(p.id, checked as boolean) 
                                            : handleStaffStatusChange(p.id, checked as boolean)}
                                    />
                                    <Label>Có mặt</Label>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Input 
                                        type="number" className="w-20" min="0" value={hours}
                                        onChange={(e) => isTeacher
                                            ? handleTeacherHoursChange(p.id, e.target.value)
                                            : handleStaffHoursChange(p.id, e.target.value)}
                                    />
                                    <Label>Giờ</Label>
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
    </Table>
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Quản lý Chấm công</h1>
      
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="attendance">Chấm công hàng ngày</TabsTrigger>
          <TabsTrigger value="history">Lịch sử chấm công</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Chấm công</CardTitle>
                    <CardDescription>Ghi nhận thời gian làm việc.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleSaveAttendance} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu
                    </Button>
                </div>
             </CardHeader>
             <CardContent>
                <Tabs defaultValue="teachers">
                    <TabsList>
                        <TabsTrigger value="teachers">Giáo viên ({teachers.length})</TabsTrigger>
                        <TabsTrigger value="staff">Nhân viên ({staff.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="teachers">
                        {renderAttendanceTable(teachers, teacherAttendance, true)}
                    </TabsContent>
                    <TabsContent value="staff">
                        {renderAttendanceTable(staff, staffAttendance, false)}
                    </TabsContent>
                </Tabs>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="history">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lịch sử chấm công</CardTitle>
                            <CardDescription>Theo dõi ngày công trong tháng.</CardDescription>
                        </div>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(historyMonth, "MM/yyyy")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar 
                                    mode="single" 
                                    selected={historyMonth} 
                                    onSelect={(d) => d && setHistoryMonth(d)} 
                                    initialFocus 
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" size="icon" onClick={handleExportHistory} title="Xuất Excel">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <Tabs defaultValue="teachers">
                        <TabsList>
                            <TabsTrigger value="teachers">Giáo viên</TabsTrigger>
                            <TabsTrigger value="staff">Nhân viên</TabsTrigger>
                        </TabsList>
                        <TabsContent value="teachers">
                            {renderHistoryTable(teachers, teacherHistory, 'teacher_id')}
                        </TabsContent>
                        <TabsContent value="staff">
                            {renderHistoryTable(staff, staffHistory, 'staff_id')}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
