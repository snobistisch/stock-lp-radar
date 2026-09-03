import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("h-9 w-full border border-border bg-black px-3 text-xs uppercase text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary/20", className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";
