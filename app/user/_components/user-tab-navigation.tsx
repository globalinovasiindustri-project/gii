"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

type TabItem = {
  href: string;
  label: string;
};

const tabs: TabItem[] = [
  { href: "/user/orders", label: "Pesanan" },
  { href: "/user/addresses", label: "Alamat" },
  { href: "/user/profile", label: "Profil" },
];

export function UserTabNavigation() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4 w-fit">
        {/* Horizontal scrollable tabs for mobile (Requirement 5.4) */}
        <nav
          className="flex overflow-x-auto scrollbar-hide -mb-px space-x-4"
          aria-label="User navigation tabs"
        >
          {tabs.map((tab) => {
            // Check if current path matches tab href (Requirement 5.2)
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center p-4 border-b-2 whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
