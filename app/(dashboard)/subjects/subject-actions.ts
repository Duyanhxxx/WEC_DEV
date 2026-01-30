'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createSubjectClass(data: {
  subject_id: string
  name: string
  grade?: string
  student_ids: string[]
}) {
  const supabase = await createClient()

  // 1. Create Class
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .insert({
      name: data.name,
      grade: data.grade,
      subject_id: data.subject_id
    })
    .select()
    .single()

  if (classError) throw classError

  // 2. Add Students to Class
  if (data.student_ids.length > 0) {
    const enrollments = data.student_ids.map(studentId => ({
      class_id: classData.id,
      student_id: studentId
    }))

    const { error: enrollError } = await supabase
      .from('class_students')
      .insert(enrollments)

    if (enrollError) {
        // Cleanup if possible, or just throw
        throw enrollError
    }
    
    // Also add to student_subjects if not already there (optional, but good for consistency)
    // We use upsert or ignore duplicates
    const subjectEnrollments = data.student_ids.map(studentId => ({
        student_id: studentId,
        subject_id: data.subject_id
    }))
    
    const { error: subjectError } = await supabase
        .from('student_subjects')
        .upsert(subjectEnrollments, { onConflict: 'student_id, subject_id' })
        
    if (subjectError) throw subjectError
  }

  revalidatePath('/subjects')
  revalidatePath('/classes')
  return classData
}
