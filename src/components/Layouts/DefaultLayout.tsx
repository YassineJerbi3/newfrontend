// app/layouts/DefaultLayout.tsx
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/AuthProvider";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { getSocket } from "@/utils/socket";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const { initialized, isLoggedIn } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!initialized || !isLoggedIn) return;

    const socket = getSocket();
    if (!socket) return;

    // 1️⃣ Register handlers _before_ connecting
    socket.on("connect", () => console.log("✅ WS connected:", socket.id));
    socket.on("disconnect", (reason) =>
      console.log("❌ WS disconnected:", reason),
    );
    socket.on("connect_error", (err) =>
      console.error("⚠️ WS auth error:", err.message),
    );
    socket.on("newIncident", (data) =>
      console.log("🔔 Nouvelle notif reçue:", data),
    );

    // 2️⃣ Now open the connection (with cookie)
    socket.connect();

    // 3️⃣ Cleanup on unmount / logout
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("newIncident");
    };
  }, [initialized, isLoggedIn]);

  if (!initialized) return null;
  if (!isLoggedIn) {
    router.replace("/");
    return null;
  }

  return (
    <div className="flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-1 flex-col lg:ml-72.5">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
