"use client";

import { useState, useEffect, useCallback, MouseEvent } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import { FiBell, FiX, FiClock, FiUser, FiMapPin, FiTag } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "@/utils/socket";
import { useAuth } from "@/hooks/AuthProvider";

// Bordure couleur selon priorité
const priorityColor = {
  URGENT: "border-red-600",
  NORMALE: "border-blue-600",
  BASSE: "border-green-600",
  DEFAULT: "border-gray-600",
} as const;

interface NotificationItem {
  id: string;
  familleMI: string;
  priorite: string;
  creator: string;
  equipmentType: string;
  location: string;
  dateCreation: string;
}

export default function DropdownNotification() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const toggle = () => setOpen((o) => !o);

  // Charger notifications non-lues
  const loadNotifications = useCallback(() => {
    fetch("http://localhost:2000/notifications", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data: any[]) => {
        const unread = data
          .filter((rec) => !rec.read)
          .map((rec) => ({
            id: rec.id,
            familleMI: rec.payload.familleMI,
            priorite: rec.payload.priorite,
            creator: rec.payload.creator || "-",
            equipmentType: rec.payload.equipmentType || "-",
            location: rec.payload.location || "-",
            dateCreation: rec.payload.dateCreation,
          }));
        setItems(unread);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Tout lire
  const markAllRead = (e: MouseEvent) => {
    e.stopPropagation();
    items.forEach((n) => {
      fetch(`http://localhost:2000/notifications/${n.id}/read`, {
        method: "PATCH",
        credentials: "include",
      }).catch(console.error);
    });
    setItems([]);
  };

  // Lire une seule
  const dismissOne = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    fetch(`http://localhost:2000/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    }).catch(console.error);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  // WebSocket temps réel
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (payload: any) => {
      const newItem: NotificationItem = {
        id: payload.id,
        familleMI: payload.familleMI,
        priorite: payload.priorite,
        creator: payload.creator || "-",
        equipmentType: payload.equipmentType || "-",
        location: payload.location || "-",
        dateCreation: payload.dateCreation,
      };
      setItems((curr) => [newItem, ...curr]);
    };

    const onConnect = () => {
      socket.emit("joinNotifications", { recipientId: user.recipientId });
      // on écoutait déjà 'newIncident' :
      socket.on("newIncident", handler);
      // maintenant on écoute aussi 'incident_assign' :
      socket.on("incident_assign", handler);
    };

    socket.on("connect", onConnect);
    if (socket.disconnected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("newIncident", handler);
      socket.off("incident_assign", handler);
    };
  }, [user.recipientId]);

  return (
    <ClickOutside onClick={() => setOpen(false)} className="relative">
      <li>
        <button
          onClick={toggle}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200"
          aria-label="Notifications"
        >
          {items.length > 0 && (
            <span className="absolute right-0 top-0 h-2 w-2 animate-ping rounded-full bg-red-500" />
          )}
          <FiBell size={18} className="text-gray-700" />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 max-h-[400px] w-[360px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-2">
                <h5 className="font-semibold text-gray-800">Notifications</h5>
              </div>

              {/* Liste */}
              <ul>
                <AnimatePresence>
                  {items.length > 0 ? (
                    items.map((n) => (
                      <motion.li
                        key={n.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          relative flex flex-col border-b border-l-4 px-4 py-3 last:border-none
                          ${priorityColor[n.priorite] || priorityColor.DEFAULT}
                          overflow-hidden transition-shadow hover:bg-gray-50 hover:shadow-sm
                        `}
                      >
                        {/* Bouton × */}
                        <button
                          onClick={(e) => dismissOne(e, n.id)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          <FiX size={14} />
                        </button>

                        {/* Badge priorité */}
                        <span
                          className={`
                            self-start rounded-full border px-2 py-0.5 text-xs font-medium
                            ${priorityColor[n.priorite] || priorityColor.DEFAULT}
                          `}
                        >
                          {n.priorite}
                        </span>

                        {/* Type & Emplacement */}
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-700">
                          <span className="flex items-center gap-1">
                            <FiTag size={14} />
                            {n.equipmentType}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMapPin size={14} />
                            {n.location}
                          </span>
                        </div>

                        {/* Créateur */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <FiUser size={14} />
                          <span>{n.creator}</span>
                        </div>

                        {/* Horodatage */}
                        <div className="mt-3 flex items-center justify-center text-xs text-gray-400">
                          <FiClock size={12} />
                          <span className="ml-1">
                            {new Date(n.dateCreation).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </motion.li>
                    ))
                  ) : (
                    <motion.li
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Aucune notification
                    </motion.li>
                  )}
                </AnimatePresence>
              </ul>

              {/* Footer */}
              <Link href="/notification/not-responsablesi">
                <div className="cursor-pointer border-t px-4 py-2 text-center text-sm text-blue-600 hover:underline">
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
