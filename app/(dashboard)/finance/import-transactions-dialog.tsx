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
import { Upload, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { format } from "date-fns"

interface ImportTransactionsDialogProps {
  onSuccess?: () => void
}

export function ImportTransactionsDialog({ onSuccess }: ImportTransactionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      parseExcel(selectedFile)
    }
  }

  const parseExcel = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)
        setPreviewData(jsonData)
      } catch (err) {
        setError("Không thể đọc file Excel. Vui lòng kiểm tra định dạng.")
        console.error(err)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (!previewData.length) return
    setLoading(true)
    setError(null)

    try {
      // Fetch students map for linking
      const { data: students } = await supabase.from('students').select('id, student_code')
      const studentMap = new Map(students?.map(s => [s.student_code?.toLowerCase(), s.id]))

      const transactionsToInsert = previewData.map((row: any) => {
        // Map fields based on common headers
        // Assumed headers: "Ngày", "Nội dung", "Số tiền", "Loại", "Mã HS"
        
        let dateStr = row['Ngày'] || row['Date']
        // Handle Excel date serial number if needed, or string
        if (typeof dateStr === 'number') {
            const date = new Date((dateStr - (25567 + 2)) * 86400 * 1000) // Simple conversion, might need adjustment
            // Better: use XLSX utility if available or just JS date parsing
            // Actually XLSX.read with cellDates: true might be better, but let's stick to basic for now
            // Or rely on user inputting text YYYY-MM-DD
            // Let's try to parse:
             dateStr = new Date(Math.round((dateStr - 25569) * 86400 * 1000)).toISOString().split('T')[0]
        } else if (dateStr) {
            // Try to parse DD/MM/YYYY or YYYY-MM-DD
            const parts = String(dateStr).split(/[-/]/)
            if (parts.length === 3) {
                // Assume DD/MM/YYYY if first part > 1900 is unlikely
                if (Number(parts[0]) > 1000) {
                    // YYYY-MM-DD
                    dateStr = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`
                } else {
                    // DD/MM/YYYY
                    dateStr = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
                }
            }
        }

        const amount = row['Số tiền'] || row['Amount'] || 0
        const description = row['Nội dung'] || row['Description'] || ''
        const typeRaw = row['Loại'] || row['Type'] || 'income'
        const type = String(typeRaw).toLowerCase().includes('chi') ? 'expense' : 'income'
        const studentCode = row['Mã HS'] || row['Student Code']
        const studentId = studentCode ? studentMap.get(String(studentCode).toLowerCase()) : null

        return {
          date: dateStr || new Date().toISOString().split('T')[0],
          description,
          amount: Number(amount),
          type,
          student_id: studentId
        }
      })

      const { error: insertError } = await supabase
        .from('transactions')
        .insert(transactionsToInsert)

      if (insertError) throw insertError

      setOpen(false)
      router.refresh()
      if (onSuccess) onSuccess()
      alert(`Đã import thành công ${transactionsToInsert.length} giao dịch!`)

    } catch (err: any) {
      setError("Lỗi khi import: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Giao dịch từ Excel</DialogTitle>
          <DialogDescription>
            Tải lên file Excel (.xlsx, .xls) chứa danh sách thu chi.
            <br />
            Cột cần có: <b>Ngày, Nội dung, Số tiền, Loại (Thu/Chi), Mã HS (nếu có)</b>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange}
                className="cursor-pointer"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded">
                <AlertCircle className="h-4 w-4" />
                {error}
            </div>
          )}

          {previewData.length > 0 && (
            <div className="border rounded-md p-4 max-h-[300px] overflow-auto">
                <p className="text-sm font-medium mb-2">Xem trước ({previewData.length} dòng):</p>
                <div className="text-xs space-y-1">
                    {previewData.slice(0, 5).map((row, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 border-b pb-1">
                            <span>{row['Ngày'] || row['Date']}</span>
                            <span className="truncate">{row['Nội dung'] || row['Description']}</span>
                            <span>{row['Số tiền'] || row['Amount']}</span>
                            <span>{row['Loại'] || row['Type']}</span>
                        </div>
                    ))}
                    {previewData.length > 5 && (
                        <div className="text-center text-muted-foreground pt-1">...còn {previewData.length - 5} dòng nữa</div>
                    )}
                </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleImport} disabled={!file || loading || previewData.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thực hiện Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
