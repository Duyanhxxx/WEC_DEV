import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBirthdayEmail } from '@/app/(dashboard)/components/birthday-actions'

export async function GET(req: NextRequest) {
  // 1. Verify Authorization (Optional but recommended)
  // Check for a secret token in the query params or headers
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // For local dev, we might skip this or use a simple check
    // return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()

  try {
    // 2. Fetch Teachers and Staff
    const { data: teachers } = await supabase.from('teachers').select('id, name, dob, email, subject')
    const { data: staff } = await supabase.from('staff').select('id, name, dob, email, role')

    const birthdayPeople = [
        ...(teachers || []).map((t: any) => ({ ...t, type: 'teacher' })),
        ...(staff || []).map((s: any) => ({ ...s, type: 'staff' }))
    ]

    // 3. Filter for Today's Birthday
    const birthdaysToday = birthdayPeople.filter(person => {
        if (!person.dob || !person.email) return false
        const dob = new Date(person.dob)
        return (dob.getMonth() + 1) === currentMonth && dob.getDate() === currentDay
    })

    if (birthdaysToday.length === 0) {
        return NextResponse.json({ message: "No birthdays today" })
    }

    // 4. Send Emails
    const results = await Promise.all(birthdaysToday.map(async (person) => {
        try {
            await sendBirthdayEmail({
                email: person.email,
                name: person.name,
                message: "Chúc mừng sinh nhật! Chúc bạn luôn vui vẻ, hạnh phúc và thành công trong công việc cũng như cuộc sống. Thay mặt trung tâm, xin gửi đến bạn những lời chúc tốt đẹp nhất!"
            })
            return { email: person.email, status: 'sent' }
        } catch (error: any) {
            return { email: person.email, status: 'failed', error: error.message }
        }
    }))

    return NextResponse.json({ 
        message: `Processed ${birthdaysToday.length} birthdays`,
        results 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
