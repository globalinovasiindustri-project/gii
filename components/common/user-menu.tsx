"use client";

import { User, LogOut, Package, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { me, isLoggedIn, isMeLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      toast.success("Berhasil keluar");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Gagal keluar");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading state
  if (isMeLoading) {
    return (
      <Button variant="ghost" size="icon" aria-label="User Account" disabled>
        <User className="size-5" strokeWidth={1.5} />
      </Button>
    );
  }

  // If not logged in, show login button
  if (!isLoggedIn) {
    return (
      <Button variant="ghost" size="icon" aria-label="User Account" asChild>
        <Link href="/auth">
          <User className="size-5" strokeWidth={1.5} />
        </Link>
      </Button>
    );
  }

  // If logged in, show user dropdown
  const user = me?.data;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="font-semibold">{user?.name}</p>
            <p className="font-normal text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user/orders" className="cursor-pointer">
            <Package className="h-4 w-4" />
            Pesanan Saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/profile" className="cursor-pointer">
            <Settings className="h-4 w-4" />
            Pengaturan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Log out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
