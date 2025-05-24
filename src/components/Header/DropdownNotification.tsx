// src/components/Header/DropdownNotification.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import {
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiChevronRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Mock notifications
const notifications = Array.from({ length: 12 }, (_, i) => {
  const types = ["success", "info", "warning", "error"];
  const TypeIcons = {
    success: FiCheckCircle,
    info: FiInfo,
    warning: FiAlertCircle,
    error: FiX,
  };
  const type = types[i % types.length];
  const Icon = TypeIcons[type];
  const date = new Date(Date.now() - i * 3600 * 1000 * 3);
  const dateStr = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    id: i + 1,
    type,
    title: `Notification ${i + 1}: événement ${type}`,
    date: dateStr,
    Icon,
  };
});

const typeStyle = {
  success: "bg-green-100 text-green-600",
  info: "bg-blue-100 text-blue-600",
  warning: "bg-yellow-100 text-yellow-600",
  error: "bg-red-100 text-red-600",
};

export default function DropdownNotification() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [items, setItems] = useState(notifications);

  const toggle = () => {
    setOpen(!open);
    if (unread) setUnread(false);
  };

  const dismiss = (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <ClickOutside onClick={() => setOpen(false)} className="relative">
      <li>
        <button
          onClick={toggle}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-100 transition hover:bg-gray-200"
          aria-label="Notifications"
        >
          {unread && (
            <span className="absolute -right-0.5 -top-0.5 block h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          )}
          <FiBell size={18} className="text-gray-700" />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-50 mt-2 flex max-h-[360px] w-[320px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              {/* Header with mark all */}
              <div className="flex items-center justify-between border-b bg-white px-4 py-2">
                <h5 className="text-sm font-semibold text-gray-800">
                  Notifications
                </h5>
                <button
                  onClick={() => setItems([])}
                  className="text-xs text-gray-500 transition hover:text-gray-700"
                >
                  Tout lire
                </button>
              </div>

              {/* Modern vertical list with minimal scrollbar */}
              <ul className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent scrollbar-thumb-rounded-lg flex-1 overflow-y-auto">
                {items.map(({ id, type, title, date, Icon }) => (
                  <motion.li
                    key={id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    layout
                    className="flex items-center justify-between border-b px-4 py-3 transition-colors last:border-none hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${typeStyle[type]}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="truncate text-sm font-medium text-gray-800">
                          {title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{date}</p>
                      </div>
                    </div>
                    {/* Dismiss button */}
                    <motion.button
                      onClick={() => dismiss(id)}
                      whileTap={{ scale: 0.8 }}
                      className="p-1 text-red-500 transition hover:text-red-700"
                      aria-label="Dismiss"
                    >
                      <FiX size={16} />
                    </motion.button>
                  </motion.li>
                ))}
              </ul>

              {/* Footer view all */}
              <Link href="/notification/not-responsablesi">
                <div className="flex cursor-pointer items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                  <FiChevronRight className="rotate-180" />
                  <span>Voir toutes</span>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    </ClickOutside>
  );
}
