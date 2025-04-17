import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/Components/ui/sidebar";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";

function MoreOptions() {
  const { handleLogout } = useAuth();
  const { toggleTheme, Icon } = useTheme();

  const moreItems = [
    {
      title: "Toggle Theme",
      icon: Icon,
      onClick: toggleTheme,
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: handleLogout,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          •••
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {moreItems.map((item, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={item.onClick}
            className="flex items-center gap-2"
          >
            <item.icon className="w-4 h-4" />
            {item.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SettingsSidebar() {
  const sidebarOptions = [
    {
      title: "Profile",
      url: "/settings",
    },
    {
      title: "Delete Account",
      url: "/settings/deleteAccount",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="scroll-m-20 border-b p-4 text-3xl font-semibold tracking-tight first:mt-0">
          Settings
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {sidebarOptions.map((item, itemIdx) => {
            return (
              <SidebarMenuItem key={itemIdx}>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-1 w-full px-6 py-6"
                >
                  <a
                    href={item.url}
                    className="flex text-lg items-center gap-1 w-full"
                  >
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <MoreOptions />
      </SidebarFooter>
    </Sidebar>
  );
}
