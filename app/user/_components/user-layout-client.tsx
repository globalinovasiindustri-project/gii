"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserTabNavigation } from "./user-tab-navigation";
import { Skeleton } from "@/components/ui/skeleton";

type UserLayoutClientProps = {
  children: React.ReactNode;
};

export function UserLayoutClient({ children }: UserLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isMeLoading } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete
    if (isMeLoading) return;

    // Redirect to /auth if not authenticated (Requirement 1.2)
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }

    // Redirect to /user/orders if accessing /user directly (Requirement 1.3)
    if (pathname === "/user") {
      router.replace("/user/orders");
    }
  }, [isLoggedIn, isMeLoading, pathname, router]);

  // Show loading skeleton while checking auth
  if (isMeLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Don't render content if not logged in (will redirect)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] bg-muted">
      <UserTabNavigation />
      {children}
    </div>
  );
}
