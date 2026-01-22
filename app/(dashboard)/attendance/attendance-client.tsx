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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Save } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
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

  // History State
  const [historyMonth, setHistoryMonth] = useState<Date>(new Date())
  const [monthlyAttendance, setMonthlyAttendance] = useState<any[]>([])

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

  // Fetch Monthly History
  useEffect(() => {
    async function fetchHistory() {
      if (!selectedClass || !historyMonth) return

      const start = startOfMonth(historyMonth)
      const end = endOfMonth(historyMonth)

      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
      
      if (data) {
        setMonthlyAttendance(data)
      } else {
        setMonthlyAttendance([])
      }
    }
    fetchHistory()
  }, [selectedClass, historyMonth, supabase])

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

      // Also refresh history if in same month
      if (historyMonth && date.getMonth() === historyMonth.getMonth() && date.getFullYear() === historyMonth.getFullYear()) {
         const start = startOfMonth(historyMonth)
         const end = endOfMonth(historyMonth)
         const { data: histData } = await supabase
          .from('attendance')
          .select('*')
          .eq('class_id', selectedClass)
          .gte('date', format(start, 'yyyy-MM-dd'))
          .lte('date', format(end, 'yyyy-MM-dd'))
         if (histData) setMonthlyAttendance(histData)
      }

    } catch (error: any) {
      console.error("Error saving attendance:", error)
      alert("Lỗi khi lưu điểm danh: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(historyMonth),
    end: endOfMonth(historyMonth)
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Điểm danh học sinh</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-[300px]">
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
      </div>

      {!selectedClass ? (
        <div className="text-center py-10 text-muted-foreground border rounded-lg bg-slate-50">
          Vui lòng chọn lớp học để tiếp tục
        </div>
      ) : (
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="daily">Điểm danh ngày</TabsTrigger>
            <TabsTrigger value="history">Lịch sử tháng</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
             <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                   <span className="text-sm font-medium">Ngày điểm danh:</span>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Lưu điểm danh
                </Button>
             </div>

             <Card>
               <CardContent className="pt-6">
                 {loading ? (
                   <div className="text-center py-4">Đang tải danh sách...</div>
                 ) : students.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Lớp chưa có học sinh nào.</div>
                 ) : (
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead>Mã HS</TableHead>
                        <TableHead>Họ tên</TableHead>
                        <TableHead className="text-center">Có mặt</TableHead>
                        <TableHead className="text-center">Vắng CP</TableHead>
                        <TableHead className="text-center">Vắng KP</TableHead>
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
                            <TableCell className="font-medium">{student.name}</TableCell>
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
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <CardTitle>Lịch sử điểm danh tháng {format(historyMonth, 'MM/yyyy')}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const newDate = new Date(historyMonth)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setHistoryMonth(newDate)
                    }}>{"<"}</Button>
                    <div className="font-medium w-[100px] text-center">{format(historyMonth, 'MM/yyyy')}</div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const newDate = new Date(historyMonth)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setHistoryMonth(newDate)
                    }}>{">"}</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="border-collapse border">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px] sticky left-0 bg-background z-10 border-r">Học sinh</TableHead>
                        {daysInMonth.map(day => (
                          <TableHead key={day.toString()} className="text-center p-1 min-w-[30px] text-xs border-r h-8">
                            {format(day, 'd')}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium sticky left-0 bg-background z-10 border-r">{student.name}</TableCell>
                          {daysInMonth.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd')
                            const record = monthlyAttendance.find(
                              r => r.student_id === student.id && r.date === dateStr
                            )
                            let statusSymbol = ""
                            let statusColor = ""
                            let bgColor = ""
                            
                            if (record) {
                              if (record.status === 'present') {
                                statusSymbol = "✓"
                                statusColor = "text-green-600"
                                bgColor = "bg-green-50"
                              } else if (record.status === 'absent_excused') {
                                statusSymbol = "P"
                                statusColor = "text-yellow-600"
                                bgColor = "bg-yellow-50"
                              } else if (record.status === 'absent_unexcused') {
                                statusSymbol = "x"
                                statusColor = "text-red-600"
                                bgColor = "bg-red-50"
                              }
                            }

                            return (
                              <TableCell key={day.toString()} className={cn("text-center p-1 border-r border-b h-8", bgColor)}>
                                <span className={cn("font-bold", statusColor)} title={record?.note}>{statusSymbol}</span>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
