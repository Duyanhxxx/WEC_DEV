import { createClient } from "@/lib/supabase/server"
import TimesheetClient from "./timesheet-client"
import { getUserRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function TimesheetPage() {
  const role = await getUserRole()
  // Allowed for everyone
  
  const supabase = await createClient()
  
  const { data: teachers } = await supabase
    .from('teachers')
    .select('*')
    .order('name', { ascending: true })

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .order('name', { ascending: true })

  return <TimesheetClient teachers={teachers || []} staff={staff || []} />
}
