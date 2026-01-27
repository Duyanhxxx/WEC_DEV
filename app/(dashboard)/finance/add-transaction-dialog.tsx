"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const date = formData.get("date") as string
    const description = formData.get("description") as string
    const amount = parseFloat(formData.get("amount") as string)
    const type = formData.get("type") as string
    const created_by = formData.get("created_by") as string

    try {
      const { error } = await supabase.from("transactions").insert({
          date,
          description,
          amount,
          type,
          created_by
      })

      if (error) throw error

      setOpen(false)
      router.refresh()
    } catch (error: any) {
        alert("Lỗi: " + error.message)
    } finally {
        setLoading(false)
    }
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
            <Input id="date" name="date" type="date" required className="col-span-3" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Nội dung
            </Label>
            <Input id="description" name="description" required className="col-span-3" placeholder="Ví dụ: Thu học phí..." />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Số tiền
            </Label>
            <Input id="amount" name="amount" type="number" required className="col-span-3" placeholder="0" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="created_by" className="text-right">
              Người tạo
            </Label>
            <Input id="created_by" name="created_by" required className="col-span-3" placeholder="Nhập tên người tạo..." />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Loại
            </Label>
            <Select name="type" required defaultValue="income">
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="income">Thu</SelectItem>
                    <SelectItem value="expense">Chi</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
