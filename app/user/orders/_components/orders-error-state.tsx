"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type OrdersErrorStateProps = {
  message: string;
  onRetry: () => void;
};

// Error state component with retry button (Requirement 2.6)
export function OrdersErrorState({ message, onRetry }: OrdersErrorStateProps) {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive mb-4">{message}</p>
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
