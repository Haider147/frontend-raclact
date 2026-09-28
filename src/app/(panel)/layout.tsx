import { RequireAuth } from "@/components/auth/require-auth"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <div className="flex-1 space-y-6 p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  )
}
