"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Store,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Home", url: "/d", icon: Home },
  { title: "Products", url: "/d/products", icon: Package },
  { title: "Orders", url: "/d/orders", icon: ShoppingCart },
  { title: "Users", url: "/d/users", icon: Users },
  { title: "Settings", url: "/d/settings", icon: Settings },
];

const statCards = [
  { label: "Products", value: "24", color: "bg-green-500" },
  { label: "Orders", value: "12", color: "bg-orange-500" },
  { label: "Users", value: "156", color: "bg-blue-500" },
  { label: "Revenue", value: "3.2M", color: "bg-purple-500" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { me } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Logout failed");

      toast.success("Berhasil logout");
      router.push("/auth");
      router.refresh();
    } catch {
      toast.error("Gagal logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (url: string) => {
    if (url === "/d") return pathname === "/d";
    return pathname.startsWith(url);
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/d">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs text-muted-foreground">
                    E-Commerce
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Stat Cards */}
        <SidebarGroup>
          <div className="grid grid-cols-2 gap-2 px-2">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-none bg-sidebar-accent p-3 text-card-foreground"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                  <div className={cn("size-2 rounded-full", stat.color)} />
                </div>
                <p className="mt-1 text-xl font-medium text-background">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </SidebarGroup>

        {/* Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={me?.data?.avatar || ""}
                      alt={me?.data?.name || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {me?.data?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {me?.data?.name || "User"}
                    </span>
                    <span className="truncate text-xs">
                      {me?.data?.email || ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={me?.data?.avatar || ""}
                      alt={me?.data?.name || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {me?.data?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {me?.data?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {me?.data?.email || ""}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 size-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
