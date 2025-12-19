"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton component (Requirement 2.5)
export function OrdersSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
