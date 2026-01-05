"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FloatingLabelTextareaProps = Omit<
  React.ComponentProps<typeof Textarea>,
  "placeholder"
> & {
  label: string;
};

export const FloatingLabelTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(({ label, id, className, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <Textarea
        ref={ref}
        id={id}
        placeholder=" "
        className={cn("peer pt-4", className)}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-3 text-sm text-muted-foreground transition-all duration-200 pointer-events-none bg-background px-1 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-foreground peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:text-foreground"
      >
        {label}
      </label>
    </div>
  );
});

FloatingLabelTextarea.displayName = "FloatingLabelTextarea";
