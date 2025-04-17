import {
  Home,
  Search,
  Settings,
  CalendarHeart,
  UserPen,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

function MoreOptions() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const { Icon, toggleTheme } = useTheme();

  const moreItems = [
    {
      title: "Toggle Theme",
      icon: Icon,
      onClick: toggleTheme,
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => navigate("/settings"),
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

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Events",
    url: "#",
    icon: CalendarHeart,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserPen,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="text-2xl font-bold tracking-tight px-4 py-3">
        <span className="bg-gradient-to-r from-slate-600 to-slate-300 dark:from-slate-200 dark:to-slate-500 bg-clip-text text-transparent">
          UniVerse
        </span>
      </SidebarHeader>

      <aside className="overflow-hidden">
        <SidebarSeparator />
      </aside>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item, itemIdx) => (
            <SidebarMenuItem key={itemIdx}>
              <SidebarMenuButton
                asChild
                className="flex items-center gap-3 w-full px-4 py-2"
              >
                <a href={item.url} className="flex items-center gap-3 w-full">
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <MoreOptions />
      </SidebarFooter>
    </Sidebar>
  );
}
