import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/Components/AppSidebar"
import { Outlet } from "react-router-dom"
import { Toaster } from '@/components/ui/sonner'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen">
        <div className="flex-none">
          <AppSidebar /> 
        </div>
        <div className="flex-1 px-4 py-6">
          <SidebarTrigger className="mb-4 z-1000 fixed" />
          <Outlet />
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  )
}