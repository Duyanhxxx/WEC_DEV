'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UserNav } from './UserNav'
import { User } from '@supabase/supabase-js'

import { MobileNav } from './MobileNav'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  user: User | null
  role?: string
}

export function Header({ user, role }: HeaderProps) {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  const breadcrumbs = paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`
    const label = path.charAt(0).toUpperCase() + path.slice(1)
    const isLast = index === paths.length - 1

    // Map common paths to friendly names
    const friendlyName = {
        'dashboard': 'Tổng quan',
        'attendance': 'Điểm danh',
        'classes': 'Lớp học',
        'finance': 'Tài chính',
        'payroll': 'Lương & Chấm công',
        'profile': 'Hồ sơ',
        'reports': 'Báo cáo',
        'users': 'Người dùng'
    }[path.toLowerCase()] || label

    return { href, label: friendlyName, isLast }
  })

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="md:hidden">
        <MobileNav role={role} />
      </div>
      <div className="hidden md:flex items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb) => (
              <div key={crumb.href} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {role === 'admin' && (
           <Badge variant="default" className="bg-red-600 hover:bg-red-700">Admin Mode</Badge>
        )}
      </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search input could go here */}
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-background" />
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Thông báo</h4>
                <p className="text-sm text-muted-foreground">
                  Bạn có 3 thông báo mới chưa đọc.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">Báo cáo doanh thu tháng 5</p>
                    <p className="text-xs text-muted-foreground">Đã sẵn sàng để xem lại.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="h-2 w-2 mt-2 rounded-full bg-yellow-500" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">Nhắc nhở chấm công</p>
                    <p className="text-xs text-muted-foreground">Vui lòng kiểm tra chấm công ngày hôm qua.</p>
                  </div>
                </div>
                 <div className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">Học phí sắp đến hạn</p>
                    <p className="text-xs text-muted-foreground">Có 5 học sinh sắp đến hạn đóng học phí.</p>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <UserNav user={user} />
      </div>
    </header>
  )
}
