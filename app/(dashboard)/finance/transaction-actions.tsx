"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface TransactionActionsProps {
  transaction: any
}

export function TransactionActions({ transaction }: TransactionActionsProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const date = formData.get("date")
    const description = formData.get("description")
    const amount = formData.get("amount")
    const type = formData.get("type")

    const { error } = await supabase
      .from("transactions")
      .update({
        date,
        description,
        amount,
        type,
      })
      .eq("id", transaction.id)

    setLoading(false)

    if (!error) {
      setOpenEdit(false)
      router.refresh()
    } else {
      alert("Lỗi: " + error.message)
    }
  }

  async function onDelete() {
    setLoading(true)
    const { error } = await supabase.from("transactions").delete().eq("id", transaction.id)
    setLoading(false)

    if (!error) {
      setOpenDelete(false)
      router.refresh()
    } else {
      alert("Lỗi: " + error.message)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="ghost" size="icon" onClick={() => setOpenEdit(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      
      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setOpenDelete(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sửa giao dịch</DialogTitle>
          </DialogHeader>
          <form onSubmit={onUpdate} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Ngày
              </Label>
              <Input id="date" name="date" type="date" required className="col-span-3" defaultValue={transaction.date} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Nội dung
              </Label>
              <Input id="description" name="description" required className="col-span-3" defaultValue={transaction.description} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Số tiền
              </Label>
              <Input id="amount" name="amount" type="number" required className="col-span-3" defaultValue={transaction.amount} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Loại
              </Label>
              <Select name="type" required defaultValue={transaction.type}>
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
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Hành động này không thể hoàn tác. Giao dịch <b>{transaction.description}</b> sẽ bị xóa vĩnh viễn.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={loading}>Hủy</Button>
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              {loading ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
