import { SidebarContent } from "./SidebarContent"

export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block h-full">
      <SidebarContent />
    </div>
  )
}
