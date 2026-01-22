import { createClient } from "@/lib/supabase/server"
import AttendanceClient from "./attendance-client"

export default async function AttendancePage() {
  const supabase = await createClient()
  
  const { data: classes } = await supabase.from('classes').select('*').order('name', { ascending: true })

  return <AttendanceClient classes={classes || []} />
}
