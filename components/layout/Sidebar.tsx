import { SidebarContent } from "./SidebarContent"

interface SidebarProps {
  role?: string
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <div className="hidden border-r bg-muted/40 md:block h-full">
      <SidebarContent role={role} />
    </div>
  )
}
