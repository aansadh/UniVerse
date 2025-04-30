import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/Components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SearchUsersSheet } from "@/Components/SearchUsersSheet.jsx";
import { useState } from "react";

export default function Layout() {
  let [openSearch, setOpenSearch] = useState(false);

  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen">
        <div className="flex-none">
          <AppSidebar openSearch={openSearch} setOpenSearch={setOpenSearch} />
          <SearchUsersSheet
            openSearch={openSearch}
            setOpenSearch={setOpenSearch}
          />
        </div>
        <div className="flex-1 px-4 py-6">
          <SidebarTrigger className="mb-4 z-1000 fixed" />
          <Outlet />
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
}
