// components/DayEventsModal.tsx
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";

// ← on exporte le type pour pouvoir l’importer ailleurs
export type EventItem = {
  id: string;
  type: "preventive" | "rapport";
  title: string;
  description?: string;
  incident?: { priorite: string; dateIncident: string; id: string };
  dateIncident?: string;
  datePlanification: Date;
  statut?: string | null;
};

interface DayEventsModalProps {
  date: Date;
  events: EventItem[];
  onClose: () => void;
  onSelect: (ev: EventItem) => void;
}

const iconFor = (ev: EventItem) => {
  if (ev.type === "preventive") {
    return ev.statut === "VALIDE" ? <FiCheckCircle /> : <FiAlertTriangle />;
  } else {
    if (ev.statut === "VALIDE") return <FiCheckCircle />;
    if (ev.incident?.priorite === "URGENT") return <FiAlertCircle />;
    return <FiClock />;
  }
};

export const DayEventsModal: React.FC<DayEventsModalProps> = ({
  date,
  events,
  onClose,
  onSelect,
}) => (
  <AnimatePresence>
    {events.length > 0 && (
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-xl">
            ✕
          </button>
          <h3 className="mb-4 text-lg font-semibold">
            Événements du {moment(date).format("DD/MM/YYYY")}
          </h3>
          <ul className="max-h-80 space-y-3 overflow-auto">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center justify-between rounded-lg bg-gray-100 p-3"
              >
                <div>
                  <strong>{ev.title}</strong>
                  <p className="text-sm text-gray-600">
                    {ev.type === "preventive"
                      ? ev.description
                      : `${ev.incident?.priorite} — ${moment(
                          ev.incident?.dateIncident,
                        ).format("HH:mm")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {iconFor(ev)}
                  {ev.statut === "VALIDE" && (
                    <span className="font-semibold text-green-600">Validé</span>
                  )}
                  <button
                    onClick={() => onSelect(ev)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {ev.type === "preventive"
                      ? "Voir rapport"
                      : "Voir incident"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
