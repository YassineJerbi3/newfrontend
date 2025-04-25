// src/app/layout.tsx
"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { AuthProvider } from "@/hooks/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{loading ? <Loader /> : children}</AuthProvider>
      </body>
    </html>
  );
}
