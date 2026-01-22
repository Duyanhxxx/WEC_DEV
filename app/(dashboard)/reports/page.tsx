import { createClient } from "@/lib/supabase/server"
import ReportsClient from "./reports-client"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"

export default async function ReportsPage() {
  const supabase = await createClient()
  
  // 1. Fetch Leads
  const { data: leads } = await supabase.from('leads').select('created_at, source')
  
  // 2. Fetch Students
  const { data: students } = await supabase.from('students').select('created_at')

  // Aggregate Data for last 6 months
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i)
    months.push(d)
  }

  const overviewData = months.map(month => {
    const monthKey = format(month, 'MM/yyyy')
    const start = startOfMonth(month)
    const end = endOfMonth(month)

    const leadsCount = leads?.filter(l => {
        const d = new Date(l.created_at)
        return d >= start && d <= end
    }).length || 0

    const studentsCount = students?.filter(s => {
        const d = new Date(s.created_at)
        return d >= start && d <= end
    }).length || 0

    return {
        name: monthKey,
        leads: leadsCount,
        students: studentsCount
    }
  })

  // Aggregate Source Data
  const sourceCounts: Record<string, number> = {}
  leads?.forEach(l => {
      const source = l.source || 'Unknown'
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
  })
  
  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }))

  if (sourceData.length === 0) {
      sourceData.push({ name: "Chưa có dữ liệu", value: 0 })
  }

  return <ReportsClient overviewData={overviewData} sourceData={sourceData} />
}
