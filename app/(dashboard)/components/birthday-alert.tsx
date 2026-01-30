"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Cake, Copy, Check } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface BirthdayPerson {
  id: string
  name: string
  dob: string // YYYY-MM-DD
  role: string // 'Giáo viên' or Staff role
  type: 'teacher' | 'staff'
}

interface BirthdayAlertProps {
  people: BirthdayPerson[]
}

const WISHES = [
  "Chúc mừng sinh nhật! Chúc bạn luôn vui vẻ, hạnh phúc và thành công trong công việc cũng như cuộc sống.",
  "Mừng tuổi mới! Chúc bạn sức khỏe dồi dào, tràn đầy năng lượng và gặt hái được nhiều thành công rực rỡ.",
  "Happy Birthday! Chúc bạn một ngày sinh nhật thật ý nghĩa, ngập tràn niềm vui và tiếng cười.",
  "Chúc mừng sinh nhật! Tuổi mới thêm nhiều thành công mới, vạn sự như ý, tỷ sự như mơ.",
  "Chúc bạn sinh nhật vui vẻ! Mong rằng mọi điều tốt đẹp nhất sẽ đến với bạn trong tuổi mới này.",
  "Sinh nhật vui vẻ! Chúc bạn luôn giữ vững nụ cười trên môi và nhiệt huyết trong tim.",
  "Chúc mừng sinh nhật! Cảm ơn những đóng góp của bạn cho trung tâm. Chúc bạn tuổi mới rực rỡ!",
  "Happy Birthday! Chúc bạn có một ngày đặc biệt bên người thân và bạn bè. Tuổi mới thành công mới!",
]

export function BirthdayAlert({ people }: BirthdayAlertProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()

  // Filter for birthdays today and in the next 7 days
  const upcomingBirthdays = people.filter(person => {
    if (!person.dob) return false
    const dob = new Date(person.dob)
    const birthMonth = dob.getMonth() + 1
    const birthDay = dob.getDate()

    // Check if birthday is today
    if (birthMonth === currentMonth && birthDay === currentDay) return true

    // Check if birthday is in the next 7 days
    // Simple check: create a date object for this year's birthday
    const thisYearBirthday = new Date(today.getFullYear(), birthMonth - 1, birthDay)
    
    // If birthday has passed this year, look at next year (for late Dec birthdays)
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1)
    }

    const diffTime = thisYearBirthday.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays >= 0 && diffDays <= 7
  }).sort((a, b) => {
    const dateA = new Date(a.dob)
    const dateB = new Date(b.dob)
    // Sort by day and month only
    const monthA = dateA.getMonth()
    const monthB = dateB.getMonth()
    if (monthA !== monthB) return monthA - monthB
    return dateA.getDate() - dateB.getDate()
  })

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (upcomingBirthdays.length === 0) {
    return null
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-pink-500" />
            <CardTitle className="text-base font-medium">Sinh nhật sắp tới</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingBirthdays.map((person) => {
            const dob = new Date(person.dob)
            const isToday = dob.getDate() === currentDay && (dob.getMonth() + 1) === currentMonth
            
            return (
              <div key={person.id} className={`flex items-center justify-between p-3 rounded-lg border ${isToday ? 'bg-pink-50 border-pink-200' : 'bg-background'}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isToday ? 'bg-pink-100 text-pink-600' : 'bg-muted'}`}>
                    <Gift className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{person.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isToday ? <span className="font-bold text-pink-600">Hôm nay!</span> : `${dob.getDate()}/${dob.getMonth() + 1}`} • {person.role}
                    </p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-auto">
                        Gửi lời chúc
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gửi lời chúc đến {person.name}</DialogTitle>
                    </DialogHeader>
                    <div className="h-[300px] w-full overflow-y-auto rounded-md border p-4">
                      <div className="flex flex-col gap-3">
                        {WISHES.map((wish, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                            <p className="text-sm flex-1">{wish}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => copyToClipboard(wish, idx)}
                            >
                              {copiedIndex === idx ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
