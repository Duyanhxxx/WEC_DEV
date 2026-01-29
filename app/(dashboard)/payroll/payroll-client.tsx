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
import { CalendarIcon, Loader2, Download } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import * as XLSX from "xlsx"
import { getAdjustments } from "./payroll-actions"
import { PayrollAdjustmentDialog } from "./payroll-adjustment-dialog"

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

interface Adjustment {
  id: string
  teacher_id?: string
  staff_id?: string
  month: string
  amount: number
  type: 'bonus' | 'deduction'
  description: string
  created_at: string
}

interface PayrollClientProps {
  teachers: Employee[]
  staff: Employee[]
}

export default function PayrollClient({ teachers, staff }: PayrollClientProps) {
  // Salary Report State
  const [reportMonth, setReportMonth] = useState<string>(format(new Date(), 'yyyy-MM'))
  const [teacherSalaryData, setTeacherSalaryData] = useState<any[]>([])
  const [staffSalaryData, setStaffSalaryData] = useState<any[]>([])
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [calculating, setCalculating] = useState(false)
  
  const supabase = createClient()

  // --- Salary Logic ---

  const calculateSalary = useCallback(async () => {
    setCalculating(true)
    const [year, month] = reportMonth.split('-').map(Number)
    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(new Date(year, month - 1))

    // Fetch Adjustments
    const adjData = await getAdjustments(reportMonth)
    setAdjustments(adjData || [])

    // Calculate Teacher Salary
    const { data: tLogs } = await supabase
      .from('teacher_attendance')
      .select('*')
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))

    const tReport = teachers.map(t => {
      const logs = (tLogs as AttendanceRecord[])?.filter(l => l.teacher_id === t.id) || []
      const myAdjs = (adjData || []).filter((a: Adjustment) => a.teacher_id === t.id)
      
      const totalBonus = myAdjs.filter((a: Adjustment) => a.type === 'bonus').reduce((sum: number, a: Adjustment) => sum + a.amount, 0)
      const totalDeduction = myAdjs.filter((a: Adjustment) => a.type === 'deduction').reduce((sum: number, a: Adjustment) => sum + a.amount, 0)

      let totalHours = 0
      let workDays = 0
      logs.forEach(l => {
         if (l.status === 'present') {
             workDays++
             totalHours += (l.hours_worked || 0)
         }
      })
      let baseSalary = 0
      if (t.employment_type === 'full-time') {
          baseSalary = t.salary_rate || 0
      } else {
          baseSalary = (t.salary_rate || 0) * totalHours
      }
      
      const totalSalary = baseSalary + totalBonus - totalDeduction

      return { ...t, workDays, totalHours, baseSalary, totalBonus, totalDeduction, totalSalary, adjustments: myAdjs }
    })
    setTeacherSalaryData(tReport)

    // Calculate Staff Salary
    const { data: sLogs } = await supabase
      .from('staff_attendance')
      .select('*')
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))

    const sReport = staff.map(s => {
      const logs = (sLogs as AttendanceRecord[])?.filter(l => l.staff_id === s.id) || []
      const myAdjs = (adjData || []).filter((a: Adjustment) => a.staff_id === s.id)

      const totalBonus = myAdjs.filter((a: Adjustment) => a.type === 'bonus').reduce((sum: number, a: Adjustment) => sum + a.amount, 0)
      const totalDeduction = myAdjs.filter((a: Adjustment) => a.type === 'deduction').reduce((sum: number, a: Adjustment) => sum + a.amount, 0)

      let totalHours = 0
      let workDays = 0
      logs.forEach(l => {
         if (l.status === 'present') {
             workDays++
             totalHours += (l.hours_worked || 0)
         }
      })
      let baseSalary = 0
      if (s.employment_type === 'full-time') {
          baseSalary = s.salary_rate || 0
      } else {
          baseSalary = (s.salary_rate || 0) * totalHours
      }

      const totalSalary = baseSalary + totalBonus - totalDeduction

      return { ...s, workDays, totalHours, baseSalary, totalBonus, totalDeduction, totalSalary, adjustments: myAdjs }
    })
    setStaffSalaryData(sReport)

    setCalculating(false)
  }, [reportMonth, teachers, staff, supabase])
  
  useEffect(() => {
    if (teachers.length > 0 || staff.length > 0) {
        calculateSalary()
    }
  }, [calculateSalary, teachers.length, staff.length])

  const handleExportPayroll = () => {
    const wb = XLSX.utils.book_new()

    // Helper to create sheet data
    const createSheetData = (data: any[]) => {
        const header = ["Họ tên", "Loại HĐ", "Số ngày làm", "Tổng giờ làm", "Lương cơ bản", "Đơn vị", "Thưởng", "Khấu trừ", "Tổng lương"]
        const rows = data.map(d => [
            d.name,
            d.employment_type === 'full-time' ? 'Full-time' : 'Part-time',
            d.workDays,
            d.totalHours,
            d.baseSalary,
            d.employment_type === 'full-time' ? 'tháng' : 'giờ',
            d.totalBonus,
            d.totalDeduction,
            d.totalSalary
        ])
        return [header, ...rows]
    }

    // Teacher Sheet
    const teacherSheetData = createSheetData(teacherSalaryData)
    const wsTeachers = XLSX.utils.aoa_to_sheet(teacherSheetData)
    XLSX.utils.book_append_sheet(wb, wsTeachers, "Giáo viên")

    // Staff Sheet
    const staffSheetData = createSheetData(staffSalaryData)
    const wsStaff = XLSX.utils.aoa_to_sheet(staffSheetData)
    XLSX.utils.book_append_sheet(wb, wsStaff, "Nhân viên")

    // Save file
    const fileName = `Bang_luong_${reportMonth}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const renderSalaryTable = (data: (Employee & { workDays: number; totalHours: number; totalSalary: number, baseSalary: number, totalBonus: number, totalDeduction: number, adjustments: Adjustment[] })[]) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Loại HĐ</TableHead>
                <TableHead className="text-right">Công</TableHead>
                <TableHead className="text-right">Lương cơ bản</TableHead>
                <TableHead className="text-right text-green-600">Thưởng</TableHead>
                <TableHead className="text-right text-red-600">Khấu trừ</TableHead>
                <TableHead className="text-right">Tổng lương</TableHead>
                <TableHead className="w-[50px]"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.map(d => (
                <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", 
                            d.employment_type === 'full-time' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800")}>
                            {d.employment_type === 'full-time' ? 'Full-time' : 'Part-time'}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <div>{d.workDays} ngày</div>
                        <div className="text-xs text-muted-foreground">{d.totalHours} giờ</div>
                    </TableCell>
                    <TableCell className="text-right">
                        {Number(d.baseSalary).toLocaleString('vi-VN')}₫
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                        {d.totalBonus > 0 ? `+${d.totalBonus.toLocaleString('vi-VN')}₫` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                        {d.totalDeduction > 0 ? `-${d.totalDeduction.toLocaleString('vi-VN')}₫` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                        {d.totalSalary.toLocaleString('vi-VN')}₫
                    </TableCell>
                    <TableCell>
                        <PayrollAdjustmentDialog 
                            employeeId={d.id}
                            employeeName={d.name}
                            type={d.teacher_code ? 'teacher' : 'staff'}
                            month={reportMonth}
                            adjustments={d.adjustments}
                            onUpdate={calculateSalary}
                        />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Quản lý Lương</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Bảng lương</CardTitle>
                <CardDescription>Tính toán lương dựa trên chấm công.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Input 
                    type="month" 
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="w-[200px]"
                />
                <Button variant="outline" size="icon" onClick={handleExportPayroll} title="Xuất Excel">
                    <Download className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
             {calculating ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
             ) : (
                <Tabs defaultValue="teachers">
                    <TabsList>
                        <TabsTrigger value="teachers">Giáo viên</TabsTrigger>
                        <TabsTrigger value="staff">Nhân viên</TabsTrigger>
                    </TabsList>
                    <TabsContent value="teachers">
                        {renderSalaryTable(teacherSalaryData)}
                    </TabsContent>
                    <TabsContent value="staff">
                        {renderSalaryTable(staffSalaryData)}
                    </TabsContent>
                </Tabs>
             )}
        </CardContent>
      </Card>
    </div>
  )
}
