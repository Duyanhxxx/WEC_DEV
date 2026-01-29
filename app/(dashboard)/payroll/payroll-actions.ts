'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format, startOfMonth, endOfMonth } from "date-fns"

export async function getAdjustments(month: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payroll_adjustments')
    .select('*')
    .eq('month', month)

  if (error) throw error
  return data
}

export async function addAdjustment(data: {
  teacher_id?: string
  staff_id?: string
  month: string
  amount: number
  type: 'bonus' | 'deduction'
  description: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('payroll_adjustments')
    .insert(data)

  if (error) throw error
  revalidatePath('/payroll')
}

export async function deleteAdjustment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('payroll_adjustments')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/payroll')
}

export async function getAttendanceLogs(type: 'teacher' | 'staff', employeeId: string, month: string) {
  const supabase = await createClient()
  const [year, monthNum] = month.split('-').map(Number)
  const startDate = format(startOfMonth(new Date(year, monthNum - 1)), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(new Date(year, monthNum - 1)), 'yyyy-MM-dd')

  const table = type === 'teacher' ? 'teacher_attendance' : 'staff_attendance'
  const idField = type === 'teacher' ? 'teacher_id' : 'staff_id'

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(idField, employeeId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export async function updateAttendanceLog(type: 'teacher' | 'staff', id: string, hours: number) {
  const supabase = await createClient()
  const table = type === 'teacher' ? 'teacher_attendance' : 'staff_attendance'

  const { error } = await supabase
    .from(table)
    .update({ hours_worked: hours })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/payroll')
}
