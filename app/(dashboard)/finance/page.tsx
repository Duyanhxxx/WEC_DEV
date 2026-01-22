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
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { TransactionActions } from "./transaction-actions"
import { format } from "date-fns"

export default async function FinancePage() {
  const supabase = await createClient()
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(100)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  let totalIncome = 0
  let totalExpense = 0

  transactions?.forEach(t => {
    const tDate = new Date(t.date)
    // Check if it's valid date
    if (!isNaN(tDate.getTime())) {
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            if (t.type === 'income') totalIncome += Number(t.amount)
            else totalExpense += Number(t.amount)
        }
    }
  })

  const profit = totalIncome - totalExpense

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Thu chi</h1>
        <AddTransactionDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Thu (Tháng này)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString('vi-VN')}₫</div>
            <p className="text-xs text-muted-foreground">Tháng {currentMonth + 1}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Chi (Tháng này)</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString('vi-VN')}₫</div>
            <p className="text-xs text-muted-foreground">Tháng {currentMonth + 1}</p>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>
            Các giao dịch gần đây nhất.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Chưa có giao dịch nào</TableCell>
                 </TableRow>
              ) : (
                transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
