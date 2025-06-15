// src/components/ui/select.tsx
import React, { PropsWithChildren } from "react";

interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Select({ children }: PropsWithChildren<{}>) {
  return <div className="relative">{children}</div>;
}

export function SelectTrigger({
  children,
  className = "",
  ...props
}: SelectTriggerProps) {
  return (
    <div
      className={`w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-gray-500">{placeholder}</span>;
}

export function SelectContent({ children }: PropsWithChildren<{}>) {
  return (
    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={() => {
        /** tu géreras la selection via React Hook Form Controller si besoin */
      }}
      className="cursor-pointer px-3 py-2 hover:bg-gray-100"
      data-value={value}
    >
      {children}
    </div>
  );
}
