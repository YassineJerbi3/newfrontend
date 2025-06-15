// src/components/ui/input.tsx
import React, { InputHTMLAttributes } from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    className={`block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
