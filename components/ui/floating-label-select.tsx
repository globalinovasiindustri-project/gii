"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FloatingLabelSelectProps = {
  label: string;
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  id?: string;
};

export function FloatingLabelSelect({
  label,
  value,
  onValueChange,
  disabled,
  isLoading,

  children,
  id,
}: FloatingLabelSelectProps) {
  const hasValue = Boolean(value);

  return (
    <div className="group relative w-full">
      <label
        htmlFor={id}
        className={cn(
          "origin-start absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all",
          hasValue
            ? "pointer-events-none top-0 cursor-default text-xs font-medium text-foreground"
            : "text-muted-foreground group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground"
        )}
      >
        <span className="bg-background inline-flex px-1">{label}</span>
      </label>
      <Select
        value={value ?? ""}
        onValueChange={onValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="h-11" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}
