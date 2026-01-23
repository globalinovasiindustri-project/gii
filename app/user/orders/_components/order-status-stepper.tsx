"use client";

import { Check, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type StepperProps = {
  currentStatus: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};

type Step = {
  status: OrderStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const steps: Step[] = [
  { status: "pending", label: "Menunggu", icon: Package },
  { status: "processing", label: "Diproses", icon: Package },
  { status: "shipped", label: "Dikirim", icon: Truck },
  { status: "delivered", label: "Selesai", icon: CheckCircle2 },
];

const statusOrder: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

export function OrderStatusStepper({
  currentStatus,
  createdAt,
  updatedAt,
}: StepperProps) {
  // Handle cancelled status
  if (currentStatus === "cancelled") {
    return (
      <div className="py-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-900 dark:text-red-100">
              Pesanan Dibatalkan
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
              Pesanan ini telah dibatalkan
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="py-6">
      <div className="relative px-5">
        {/* Progress line container */}
        <div className="absolute top-5 left-5 right-5 flex items-center">
          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Active progress */}
        <div
          className="absolute top-5 left-5 h-1 bg-gradient-to-r from-primary to-primary transition-all duration-700 ease-out"
          style={{
            width:
              currentIndex === 0
                ? "0%"
                : `calc(${(currentIndex / (steps.length - 1)) * 100}% - ${(1 - currentIndex / (steps.length - 1)) * 2.5}rem)`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.status}
                className="flex flex-col items-center gap-3 relative"
                style={{
                  marginLeft: index === 0 ? "-1.25rem" : undefined,
                  marginRight:
                    index === steps.length - 1 ? "-1.25rem" : undefined,
                }}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 shrink-0 shadow-sm",
                    isCompleted &&
                      "bg-primary border-2 border-primary scale-100",
                    isCurrent &&
                      "bg-primary border-2 border-primary scale-110 shadow-lg shadow-primary/30",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white animate-in zoom-in duration-300" />
                  ) : (
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isCurrent
                          ? "text-white"
                          : "text-gray-400 dark:text-gray-600",
                      )}
                    />
                  )}

                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                  )}
                </div>

                {/* Label */}
                <div className="text-center px-1 absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p
                    className={cn(
                      "text-xs md:text-sm font-medium leading-tight transition-colors",
                      isCompleted || isCurrent
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-500",
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional: Show timestamp */}
      {updatedAt && (
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Terakhir diperbarui:{" "}
            {new Date(updatedAt).toLocaleString("id-ID", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
