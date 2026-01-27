import { createClient } from "@/lib/supabase/server"

export type UserRole = 'admin' | 'staff' | 'teacher'

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Assuming you will create the 'profiles' table as planned
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return (profile?.role as UserRole) || 'staff'
}
