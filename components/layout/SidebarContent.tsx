"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  School,
  DollarSign,
  BarChart3,
} from "lucide-react"

import { cn } from "@/lib/utils"

export const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Học sinh / Giáo viên",
    href: "/users",
    icon: Users,
  },
  {
    title: "Điểm danh",
    href: "/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Lớp học",
    href: "/classes",
    icon: School,
  },
  {
    title: "Thu chi",
    href: "/finance",
    icon: DollarSign,
  },
  {
    title: "Báo cáo MKT",
    href: "/reports",
    icon: BarChart3,
  },
]

interface SidebarContentProps {
  setOpen?: (open: boolean) => void
}

export function SidebarContent({ setOpen }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <School className="h-6 w-6" />
          <span className="">WEC Manager</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen?.(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === item.href
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
