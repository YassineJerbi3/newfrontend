"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import { FiBell, FiX, FiClock, FiUser, FiMapPin } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "@/utils/socket";
import { useAuth } from "@/hooks/AuthProvider";

// Map priorities to style classes
const priorityStyle = {
  URGENT: "text-red-600 border-red-600",
  NORMALE: "text-blue-600 border-blue-600",
  BASSE: "text-green-600 border-green-600",
  DEFAULT: "text-gray-600 border-gray-600",
} as const;

interface NotificationItem {
  id: string;
  equipementId: string;
  familleMI: string;
  priorite: string;
  creator: string;
  location: string;
  dateCreation: string;
  read: boolean;
}

export default function DropdownNotification() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const toggle = () => {
    setOpen((o) => !o);
    if (unread) setUnread(false);
  };

  // Fetch notifications and determine unread
  useEffect(() => {
    fetch("http://localhost:2000/notifications", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data: any[]) => {
        const mapped = data.map((rec) => ({
          id: rec.id,
          equipementId: rec.payload.incidentId,
          familleMI: rec.payload.familleMI,
          priorite: rec.payload.priorite,
          creator: rec.payload.creator || "-",
          location: rec.payload.location || "-",
          dateCreation: rec.payload.dateCreation,
          read: rec.read,
        }));
        setItems(mapped);
        if (mapped.some((n) => !n.read)) setUnread(true);
      })
      .catch(console.error);
  }, []);

  // Mark all as read when dropdown is opened
  useEffect(() => {
    if (open && items.length > 0) {
      items.forEach((n) => {
        if (!n.read) {
          fetch(`http://localhost:2000/notifications/${n.id}/read`, {
            method: "PATCH",
            credentials: "include",
          }).catch(console.error);
        }
      });
    }
  }, [open, items]);

  // WebSocket listener for real-time notifications
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (payload: any) => {
      const newItem: NotificationItem = {
        id: `${payload.incidentId}-${Date.now()}`,
        equipementId: payload.incidentId,
        familleMI: payload.familleMI,
        priorite: payload.priorite,
        creator: payload.creator || "-",
        location: payload.location || "-",
        dateCreation: payload.dateCreation,
        read: false,
      };
      setItems((curr) => [newItem, ...curr].slice(0, 5));
      setUnread(true);
    };

    const onConnect = () => {
      socket.emit("joinNotifications", { recipientId: user.recipientId });
      socket.on("newIncident", handler);
    };

    socket.on("connect", onConnect);
    if (socket.disconnected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("newIncident", handler);
    };
  }, [user.recipientId]);

  // Dismiss a single notification (mark read and remove)
  const dismiss = (id: string) => {
    fetch(`http://localhost:2000/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    }).catch(console.error);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <ClickOutside onClick={() => setOpen(false)} className="relative">
      <li>
        <button
          onClick={toggle}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200"
          aria-label="Notifications"
        >
          {unread && (
            <span className="absolute right-0 top-0 h-2 w-2 animate-ping rounded-full bg-red-500" />
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
              className="absolute right-0 z-50 mt-2 w-[350px] rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-2">
                <h5 className="font-semibold text-gray-800">Notifications</h5>
                <button
                  onClick={() => setItems([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Tout lire
                </button>
              </div>

              {/* List items (max 5) */}
              <ul>
                {items.length > 0 ? (
                  items.slice(0, 5).map((n) => (
                    <li
                      key={n.id}
                      className="relative flex flex-col border-b px-4 py-3 last:border-none hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          Équipement: {n.equipementId}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <FiClock size={12} />{" "}
                          {new Date(n.dateCreation).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                        <span
                          className={`rounded border px-1 ${priorityStyle[n.priorite] || priorityStyle.DEFAULT}`}
                        >
                          {n.priorite}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiUser size={12} /> {n.creator}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMapPin size={12} /> {n.location}
                        </span>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={14} />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-6 text-center text-gray-500">
                    Aucune notification
                  </li>
                )}
              </ul>

              {/* Footer */}
              <Link href="/notification/not-responsablesi">
                <div className="cursor-pointer px-4 py-2 text-center text-sm text-blue-600 hover:underline">
                  Voir toutes
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    </ClickOutside>
  );
}
