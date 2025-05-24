// src/components/Header/DropdownUser.tsx
"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import ClickOutside from "@/components/ClickOutside";
import { FiSettings, FiPower, FiUser, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/AuthProvider";

export default function DropdownUser() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const name = user ? `${user.nom} ${user.prenom}` : "Utilisateur";
  const role = user?.roles ?? "Invité";

  const handleLogout = () => logout();

  return (
    <ClickOutside onClick={() => setOpen(false)} className="relative z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-full p-2 transition hover:bg-gray-100"
      >
        <div className="hidden flex-col items-start lg:flex">
          <div className="text-sm font-semibold text-black">{name}</div>
          <div className="text-xs uppercase text-gray-600">{role}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
          <FiUser size={24} className="text-gray-700" />
        </div>
        <FiChevronDown
          className={`hidden transition-transform duration-200 lg:inline-flex ${open ? "rotate-180" : "rotate-0"}`}
          size={16}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {},
              }}
              className="py-1"
            >
              <motion.li
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <button
                  onClick={() => router.push("/settings")}
                  className="flex w-full items-center gap-2 px-4 py-2 transition hover:bg-gray-100"
                >
                  <FiSettings className="text-blue-500" />
                  <span className="text-sm text-gray-700">Paramètres</span>
                </button>
              </motion.li>

              <div className="mx-4 my-2 border-t border-dashed border-gray-300" />

              <motion.li
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 transition hover:bg-gray-100"
                >
                  <FiPower className="text-red-500" />
                  <span className="text-sm text-gray-700">Déconnexion</span>
                </button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </ClickOutside>
  );
}
