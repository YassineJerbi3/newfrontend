// app/acceuil/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function AccueilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Petit guard : si pas de user en localStorage, on renvoie au login
  useEffect(() => {
    if (!localStorage.getItem("user")) {
      router.replace("/");
    }
  }, [router]);

  return <DefaultLayout>{children}</DefaultLayout>;
}
