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
import { Plus, Loader2, Check, ChevronsUpDown } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AddTransactionDialogProps {
    onSuccess?: () => void
}

export function AddTransactionDialog({ onSuccess }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [students, setStudents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [creatorName, setCreatorName] = useState("")
  
  // Combobox state
  const [openCombobox, setOpenCombobox] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) {
        // Reset fields when dialog closes
        setSelectedStudentId("")
        setSearchQuery("")
    }
  }, [open])

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
    const student_id_raw = formData.get("student_id")
    const student_id = (student_id_raw && student_id_raw !== 'none') ? student_id_raw : null
    const created_by = formData.get("created_by")

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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.student_code && student.student_code.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
            <div className="col-span-3">
                <input type="hidden" name="student_id" value={selectedStudentId} />
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between font-normal"
                    >
                      {selectedStudentId
                        ? (() => {
                            const s = students.find((s) => s.id === selectedStudentId)
                            return s ? `${s.student_code} - ${s.name}` : "Chọn học sinh..."
                          })()
                        : "Tìm kiếm học sinh..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="p-2 border-b">
                        <Input
                            placeholder="Nhập tên hoặc mã học sinh..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-none focus-visible:ring-0"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {filteredStudents.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                {searchQuery ? "Không tìm thấy học sinh nào." : "Nhập để tìm kiếm..."}
                            </div>
                        ) : (
                            filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className={cn(
                                        "flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors",
                                        selectedStudentId === student.id ? "bg-accent text-accent-foreground" : ""
                                    )}
                                    onClick={() => {
                                        setSelectedStudentId(student.id === selectedStudentId ? "" : student.id)
                                        setOpenCombobox(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{student.name}</span>
                                        <span className="text-xs text-muted-foreground">{student.student_code}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                  </PopoverContent>
                </Popover>
            </div>
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
