import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[#E5E0D8] bg-white px-3 py-2 text-sm",
          "placeholder:text-[#9CA3AF]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3A2A] focus-visible:ring-offset-0 focus-visible:border-[#1A3A2A]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
