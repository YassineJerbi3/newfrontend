// src/app/acceuil/layout.tsx
"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function AccueilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // no client-side redirect here: middleware already did it
  return <DefaultLayout>{children}</DefaultLayout>;
}
