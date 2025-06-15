// src/components/ui/card.tsx
import React, { PropsWithChildren } from "react";

export function Card({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-lg bg-white ${className}`}>{children}</div>;
}

export function CardHeader({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

export function CardTitle({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function CardContent({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}
