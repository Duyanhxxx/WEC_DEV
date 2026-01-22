"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Download, Plus } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ReportsClientProps {
  overviewData: any[]
  sourceData: any[]
}

export default function ReportsClient({ overviewData, sourceData }: ReportsClientProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onAddLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name")
    const source = formData.get("source")
    
    const { error } = await supabase.from("leads").insert({ name, source, status: 'new' })
    if (!error) {
        setOpen(false)
        router.refresh()
    } else {
        alert("Lỗi: " + error.message)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Báo cáo Marketing</h1>
        <div className="flex items-center gap-2">
           <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Thêm Lead
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thêm Lead mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={onAddLead} className="space-y-4">
                    <div>
                        <Label>Tên</Label>
                        <Input name="name" required placeholder="Nhập tên khách hàng tiềm năng" />
                    </div>
                    <div>
                        <Label>Nguồn</Label>
                        <Select name="source" required>
                            <SelectTrigger><SelectValue placeholder="Chọn nguồn" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Facebook">Facebook</SelectItem>
                                <SelectItem value="Google">Google</SelectItem>
                                <SelectItem value="Referral">Giới thiệu</SelectItem>
                                <SelectItem value="Offline">Offline</SelectItem>
                                <SelectItem value="Other">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full">Lưu</Button>
                </form>
            </DialogContent>
        </Dialog>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Hiệu quả tuyển sinh</CardTitle>
            <CardDescription>
              Số lượng Leads và Học sinh mới theo tháng (6 tháng gần nhất).
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={overviewData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" name="Leads" fill="#8884d8" />
                  <Bar dataKey="students" name="Học sinh mới" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Nguồn Leads</CardTitle>
            <CardDescription>
              Tỷ lệ Leads đến từ các kênh khác nhau.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={sourceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" name="Số lượng" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
