"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, AlertCircle, CheckCircle2, Save } from "lucide-react"
import { addAdjustment, deleteAdjustment, getAttendanceLogs, updateAttendanceLog } from "./payroll-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

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

interface AttendanceLog {
  id: string
  date: string
  hours_worked: number
  status: string
}

interface PayrollAdjustmentDialogProps {
  employeeId: string
  employeeName: string
  type: 'teacher' | 'staff'
  month: string
  adjustments: Adjustment[]
  onUpdate: () => void
}

export function PayrollAdjustmentDialog({
  employeeId,
  employeeName,
  type,
  month,
  adjustments,
  onUpdate
}: PayrollAdjustmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [adjType, setAdjType] = useState<'bonus' | 'deduction'>('bonus')
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Attendance State
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editingHours, setEditingHours] = useState("")

  useEffect(() => {
    if (open) {
      loadAttendance()
    }
  }, [open])

  const loadAttendance = async () => {
    try {
      const logs = await getAttendanceLogs(type, employeeId, month)
      setAttendanceLogs(logs || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveAttendance = async (logId: string) => {
    try {
      await updateAttendanceLog(type, logId, Number(editingHours))
      setMessage({ type: 'success', text: "Đã cập nhật giờ làm" })
      setEditingLogId(null)
      loadAttendance()
      onUpdate()
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: "Lỗi khi cập nhật giờ làm" })
    }
  }

  const startEdit = (log: AttendanceLog) => {
    setEditingLogId(log.id)
    setEditingHours(log.hours_worked.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return

    setLoading(true)
    setMessage(null)
    try {
      await addAdjustment({
        teacher_id: type === 'teacher' ? employeeId : undefined,
        staff_id: type === 'staff' ? employeeId : undefined,
        month,
        amount: Number(amount),
        type: adjType,
        description
      })
      setMessage({ type: 'success', text: "Đã thêm khoản điều chỉnh" })
      setAmount("")
      setDescription("")
      onUpdate()
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: "Có lỗi xảy ra" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return
    try {
      await deleteAdjustment(id)
      setMessage({ type: 'success', text: "Đã xóa khoản điều chỉnh" })
      onUpdate()
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: "Có lỗi xảy ra khi xóa" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Điều chỉnh lương">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Điều chỉnh lương - {employeeName}</DialogTitle>
          <DialogDescription>
            Tháng {month}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {message && (
            <Alert variant={message.type === 'error' ? "destructive" : "default"} className={message.type === 'success' ? "border-green-500 text-green-700 bg-green-50" : ""}>
                {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{message.type === 'success' ? "Thành công" : "Lỗi"}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Tabs defaultValue="adjustments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="adjustments">Thưởng / Phạt</TabsTrigger>
                <TabsTrigger value="attendance">Chi tiết Chấm công</TabsTrigger>
              </TabsList>
              
              <TabsContent value="adjustments" className="space-y-4 pt-4">
                <div className="space-y-4">
                    <h4 className="font-medium">Danh sách điều chỉnh</h4>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Số tiền</TableHead>
                                    <TableHead>Lý do</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adjustments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">Chưa có điều chỉnh nào</TableCell>
                                    </TableRow>
                                ) : (
                                    adjustments.map((adj) => (
                                        <TableRow key={adj.id}>
                                            <TableCell>
                                                <span className={adj.type === 'bonus' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                    {adj.type === 'bonus' ? 'Thưởng' : 'Phạt/Khấu trừ'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{adj.amount.toLocaleString('vi-VN')}₫</TableCell>
                                            <TableCell>{adj.description}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(adj.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-medium">Thêm điều chỉnh mới</h4>
                    <form onSubmit={handleSubmit} className="grid gap-4 p-4 border rounded-md bg-muted/20">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Loại điều chỉnh</Label>
                                <Select value={adjType} onValueChange={(v: any) => setAdjType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bonus">Thưởng (+)</SelectItem>
                                        <SelectItem value="deduction">Phạt/Khấu trừ (-)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Số tiền (VNĐ)</Label>
                                <Input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Nhập số tiền..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Lý do / Ghi chú</Label>
                            <Input 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ví dụ: Thưởng chuyên cần, Phạt đi muộn..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Đang lưu..." : "Thêm điều chỉnh"}
                            </Button>
                        </div>
                    </form>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="pt-4">
                 <div className="border rounded-md max-h-[400px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ngày</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="w-[150px]">Giờ làm</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">Không có dữ liệu chấm công</TableCell>
                                </TableRow>
                            ) : (
                                attendanceLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{format(new Date(log.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                log.status === 'present' ? 'bg-green-100 text-green-800' : 
                                                log.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {log.status === 'present' ? 'Có mặt' : log.status === 'absent' ? 'Vắng' : log.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {editingLogId === log.id ? (
                                                <Input 
                                                    type="number" 
                                                    value={editingHours} 
                                                    onChange={(e) => setEditingHours(e.target.value)}
                                                    className="h-8 w-24"
                                                />
                                            ) : (
                                                <span>{log.hours_worked} giờ</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingLogId === log.id ? (
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleSaveAttendance(log.id)}>
                                                        <Save className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setEditingLogId(null)}>
                                                        <Trash2 className="h-4 w-4 text-gray-500 rotate-45" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="ghost" size="icon" onClick={() => startEdit(log)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
