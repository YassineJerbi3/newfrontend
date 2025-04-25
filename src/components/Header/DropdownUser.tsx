// src/components/Header/DropdownUser.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClickOutside from "@/components/ClickOutside";
import { FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "@/hooks/AuthProvider";

export default function DropdownUser() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const name = user ? `${user.nom} ${user.prenom}` : "";
  const role = user?.roles ?? "";

  const handleLogout = () => {
    logout(); // calls your AuthProvider.logout()
    // AuthProvider.redirects to “/” for you
  };

  return (
    <ClickOutside onClick={() => setOpen(false)} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 p-1"
      >
        <div className="hidden text-right lg:block">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs uppercase">{role}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
          <FiUser size={24} />
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 border bg-white shadow-lg">
          <ul className="py-2">
            <li>
              <button
                onClick={() => router.push("/settings")}
                className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <FiSettings /> Paramètres
              </button>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-100"
          >
            <FiLogOut /> Déconnexion
          </button>
        </div>
      )}
    </ClickOutside>
  );
}
