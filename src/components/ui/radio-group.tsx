// src/components/ui/radio-group.tsx
"use client";

import React, { forwardRef, ReactNode } from "react";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}

export function RadioGroup({
  value,
  onValueChange,
  children,
  className = "",
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      data-value={value}
      className={className}
      onChange={(e: any) => onValueChange?.(e.target.value)}
    >
      {children}
    </div>
  );
}

interface RadioGroupItemProps {
  id: string;
  value: string;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ id, value, ...props }, ref) => (
    <input
      ref={ref}
      id={id}
      type="radio"
      name="radio-group"
      value={value}
      {...props}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
    />
  ),
);
RadioGroupItem.displayName = "RadioGroupItem";
