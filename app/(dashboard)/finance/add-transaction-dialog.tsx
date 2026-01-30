"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"

interface AddTransactionDialogProps {
    onSuccess?: () => void
}

export function AddTransactionDialog({ onSuccess }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [students, setStudents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setCreatorName(user.user_metadata?.full_name || user.email || "")
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    if (open) {
        const fetchStudents = async () => {
            const { data } = await supabase.from('students').select('id, name, student_code').order('name')
            if (data) setStudents(data)
        }
        fetchStudents()
    }
  }, [open])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    
    const dateStr = date ? format(date, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0]
    const description = formData.get("description")
    const amount = formData.get("amount")
    const type = formData.get("type")
    const student_id_rafo aDe"sugt("cted_by")
    const student_id = (student_id_raw && student_id_raw !== 'none') ? student_id_raw : null
    const created_by = user?.user_metadata?.full_name || user?.email

    const { error } = await supabase.from("transactions").insert({
      date: dateStr,
      description,
      amount,
      type,
      student_id,
      created_by
    })

    if (!error) {
      setOpen(false)
      router.refresh()
      if (onSuccess) onSuccess()
    } else {
      alert("Lỗi: " + error.message)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Ghi nhận giao dịch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ghi nhận giao dịch mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin thu chi vào hệ thống.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Ngày
            </Label>
            <div className="col-span-3">
                <DatePicker date={date} setDate={setDate} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="created_by" className="text-right">
              Người tạo
            </Label>
            <Input 
              id="created_by" 
              name="created_by" 
              value={creatorName} 
              onChange={(e) => setCreatorName(e.target.value)}
              className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Nội dung
            </Label>
            <Input id="description" name="description" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Số tiền
            </Label>
            <Input id="amount" name="amount" type="number" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Loại
            </Label>
            <Select name="type" defaultValue="income">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Thu (Income)</SelectItem>
                <SelectItem value="expense">Chi (Expense)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student_id" className="text-right">
              Học sinh
            </Label>
            <Select name="student_id">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn học sinh (nếu có)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Không chọn --</SelectItem>
                {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.student_code} - {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu giao dịch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
