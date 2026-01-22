import { createClient } from "@/lib/supabase/server"
import PayrollClient from "./payroll-client"

export default async function PayrollPage() {
  const supabase = await createClient()
  
  const { data: teachers } = await supabase
    .from('teachers')
    .select('*')
    .order('name', { ascending: true })

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .order('name', { ascending: true })

  return <PayrollClient teachers={teachers || []} staff={staff || []} />
}
