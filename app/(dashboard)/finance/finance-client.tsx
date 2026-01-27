"use client"

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
import { ArrowDownRight, ArrowUpRight, DollarSign, Filter, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { TransactionActions } from "./transaction-actions"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  created_by?: string
}

export default function FinanceClient() {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'))
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true)
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = startOfMonth(new Date(year, month - 1))
      const endDate = endOfMonth(new Date(year, month - 1))
      
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: false })

      if (data) {
        setTransactions(data as Transaction[])
      }
      setLoading(false)
    }

    fetchTransactions()
  }, [selectedMonth, supabase])

  let totalIncome = 0
  let totalExpense = 0

  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += Number(t.amount)
    else totalExpense += Number(t.amount)
  })

  const profit = totalIncome - totalExpense

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Thu chi</h1>
        <AddTransactionDialog />
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Label>Lọc theo tháng:</Label>
                </div>
                <Input 
                    type="month" 
                    className="w-[200px]" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Thu</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString('vi-VN')}₫</div>
            <p className="text-xs text-muted-foreground">Tháng {selectedMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Chi</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString('vi-VN')}₫</div>
            <p className="text-xs text-muted-foreground">Tháng {selectedMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lợi nhuận</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", profit >= 0 ? "text-blue-600" : "text-red-600")}>
                {profit.toLocaleString('vi-VN')}₫
            </div>
            <p className="text-xs text-muted-foreground">Tháng {selectedMonth}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>
            Danh sách giao dịch trong tháng {selectedMonth}.
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
                    <TableHead>Ngày</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {transactions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">Chưa có giao dịch nào trong tháng này</TableCell>
                    </TableRow>
                ) : (
                    transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{transaction.created_by || '-'}</TableCell>
                        <TableCell>
                            <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            transaction.type === "income" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            )}>
                            {transaction.type === "income" ? "Thu" : "Chi"}
                            </span>
                        </TableCell>
                        <TableCell className={cn(
                            "text-right font-medium",
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                        )}>
                            {transaction.type === "income" ? "+" : "-"}{Number(transaction.amount).toLocaleString('vi-VN')}₫
                        </TableCell>
                        <TableCell className="text-right">
                            <TransactionActions transaction={transaction} />
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
