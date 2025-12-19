import { MainNavigation } from "@/components/common/main-navigation";
import { UserLayoutClient } from "./_components/user-layout-client";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Main Navigation visible at all times (Requirement 1.4) */}
      <MainNavigation />
      <UserLayoutClient>{children}</UserLayoutClient>
    </>
  );
}
