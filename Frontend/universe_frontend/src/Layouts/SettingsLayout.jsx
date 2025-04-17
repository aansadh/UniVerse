import SettingsSidebar from '@/components/SettingsSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/Components/ui/sonner'

export default function SettingsLayout() {
  return (
    <div className="space-y-4">
      <SidebarProvider>
        <div className="w-full min-h-screen flex">
          <div className='flex-none'>
            <SettingsSidebar />
          </div>
          <div className="flex-1 px-4 py-6">
            <Outlet />
            <Toaster />
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}
