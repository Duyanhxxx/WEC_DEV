"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"

interface Student {
  id: string
  name: string
  student_code: string
  parent_name: string
  class_id: string
}

interface Class {
  id: string
  name: string
}

interface Transaction {
  id: string
  amount: number
  student_id: string
  date: string
}

export function TuitionStats() {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'))
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  // Fetch initial data (classes)
  useEffect(() => {
    async function fetchClasses() {
      const { data } = await supabase.from('classes').select('id, name').order('name')
      if (data) setClasses(data)
    }
    fetchClasses()
  }, [])

  // Fetch students and transactions when filters change
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // 1. Fetch Students
      let studentQuery = supabase.from('students').select('*').order('name')
      if (selectedClassId !== 'all') {
        studentQuery = studentQuery.eq('class_id', selectedClassId)
      }
      const { data: studentsData } = await studentQuery
      
      // 2. Fetch Transactions (Income only) for the month
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = startOfMonth(new Date(year, month - 1))
      const endDate = endOfMonth(new Date(year, month - 1))
      
      const { data: transData } = await supabase
        .from('transactions')
        .select('id, amount, student_id, date')
        .eq('type', 'income')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .not('student_id', 'is', null)

      if (studentsData) setStudents(studentsData)
      if (transData) setTransactions(transData)
      
      setLoading(false)
    }

    fetchData()
  }, [selectedClassId, selectedMonth])

  // Process data
  const stats = students.map(student => {
    // Find all transactions for this student in this month
    const studentTrans = transactions.filter(t => t.student_id === student.id)
    const totalPaid = studentTrans.reduce((sum, t) => sum + Number(t.amount), 0)
    const isPaid = totalPaid > 0 // Simple logic: if paid anything, mark as paid. Can be improved with expected amount.
    
    return {
      ...student,
      paid: isPaid,
      amount: totalPaid,
      transactions: studentTrans
    }
  })

  const totalStudents = stats.length
  const paidCount = stats.filter(s => s.paid).length
  const unpaidCount = totalStudents - paidCount
  const totalCollected = stats.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã đóng</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
            <p className="text-xs text-muted-foreground">{totalStudents > 0 ? Math.round((paidCount/totalStudents)*100) : 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa đóng</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCollected.toLocaleString('vi-VN')}₫</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <label className="text-sm font-medium">Tháng</label>
            <Input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
            />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <label className="text-sm font-medium">Lớp học</label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả lớp</SelectItem>
                    {classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chi tiết</CardTitle>
          <CardDescription>
            Tình trạng đóng học phí tháng {selectedMonth.split('-').reverse().join('/')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          ) : (
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">STT</TableHead>
                    <TableHead>Mã HS</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Phụ huynh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Đã đóng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">Không có học sinh nào</TableCell>
                    </TableRow>
                  ) : (
                    stats.map((s, index) => (
                      <TableRow key={s.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{s.student_code}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.parent_name}</TableCell>
                        <TableCell>
                            {s.paid ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Đã đóng</Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">Chưa đóng</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                            {s.amount > 0 ? `${s.amount.toLocaleString('vi-VN')}₫` : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
