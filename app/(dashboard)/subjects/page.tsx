
import { createClient } from "@/lib/supabase/server"
import SubjectsClient from "./subjects-client"

export default async function SubjectsPage() {
  const supabase = await createClient()
  
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('name')

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .order('name')

  return <SubjectsClient initialSubjects={subjects || []} classes={classes || []} />
}
