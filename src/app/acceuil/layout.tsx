// src/app/acceuil/layout.tsx
"use client";

import { useAuth } from "@/hooks/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function AccueilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;
  return <DefaultLayout>{children}</DefaultLayout>;
}
