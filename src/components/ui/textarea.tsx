// src/components/ui/textarea.tsx
import React, { TextareaHTMLAttributes } from "react";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea
    className={`block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
