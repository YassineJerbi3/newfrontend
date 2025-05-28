// src/app/notification/not-technicien/page.tsx
"use client";

import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  FiAlertTriangle,
  FiClock,
  FiEye,
  FiFilter,
  FiCalendar,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

interface Notification {
  id: string;
  read: boolean;
  payload: {
    incidentId: string;
    message?: string;
    dateCreation: string;
  };
}

// Accent styles for technicien notifications (single priority)
const ACCENT = {
  border: "border-blue-500",
  badgeBg: "bg-blue-100",
  badgeText: "text-blue-600",
} as const;

export default function NotificationTechnicien() {
  const [notes, setNotes] = useState<Notification[]>([]);
  const [filterRead, setFilterRead] = useState<"" | "READ" | "UNREAD">("");
  const [filterDate, setFilterDate] = useState<string>("");

  // Charger les notifications assignées à ce technicien
  useEffect(() => {
    fetch("http://localhost:2000/notifications", { credentials: "include" })
      .then((r) => r.json())
      .then((data: any[]) => {
        // On ne garde que les assignations (incident_assign)
        const assigned = data.filter((n) => n.type === "incident_assign");
        setNotes(
          assigned
            .map((n) => ({ id: n.id, read: n.read, payload: n.payload }))
            .sort(
              (a, b) =>
                new Date(b.payload.dateCreation).getTime() -
                new Date(a.payload.dateCreation).getTime(),
            ),
        );
      })
      .catch(console.error);
  }, []);

  // Marquer comme lu
  const markAsRead = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    fetch(`http://localhost:2000/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    }).catch(console.error);
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  // Filtrage & regroupement par date
  const grouped = useMemo(() => {
    const filtered = notes.filter((n) => {
      if (filterRead === "READ" && !n.read) return false;
      if (filterRead === "UNREAD" && n.read) return false;
      if (filterDate) {
        const key = new Date(n.payload.dateCreation).toISOString().slice(0, 10);
        if (key !== filterDate) return false;
      }
      return true;
    });

    return filtered.reduce<Record<string, Notification[]>>(
      (acc, n) => {
        const dateLabel = new Date(n.payload.dateCreation).toLocaleDateString(
          "fr-FR",
          { day: "2-digit", month: "2-digit", year: "numeric" },
        );
        (acc[dateLabel] ||= []).push(n);
        return acc;
      },
      {} as Record<string, Notification[]>,
    );
  }, [notes, filterRead, filterDate]);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-5xl font-extrabold text-gray-900">
            Notifications
          </h1>
          <span className="mt-2 text-gray-700 sm:mt-0">
            {new Date().toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Filtres */}
        <div className="sticky top-[90px] z-20 mx-auto mb-10 max-w-5xl rounded-2xl border border-white/30 bg-white/20 px-6 py-4 shadow-lg backdrop-blur-lg">
          <div className="flex flex-wrap gap-6">
            {/* Statut */}
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FiEye /> Statut
              </label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value as any)}
                className="w-full rounded-full bg-white/60 p-3 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-200"
              >
                <option value="">Tous</option>
                <option value="UNREAD">Non lus</option>
                <option value="READ">Lus</option>
              </select>
            </div>

            {/* Date */}
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FiCalendar /> Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-full bg-white/60 p-3 text-gray-800 shadow-inner focus:ring-2 focus:ring-purple-200"
              />
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setFilterRead("");
                setFilterDate("");
              }}
              className="flex items-center gap-2 rounded-full bg-[#30486d] px-5 py-3 font-bold text-white shadow transition hover:bg-[#050f26]"
            >
              <FiRefreshCw /> Réinitialiser
            </button>
          </div>
        </div>

        {/* Liste */}
        <div className="mx-auto max-w-5xl space-y-10">
          {Object.keys(grouped).length === 0 && (
            <p className="text-center text-gray-500">Aucune notification.</p>
          )}

          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h2 className="mb-4 text-3xl font-semibold text-gray-800">
                {date}
              </h2>
              <div className="flex flex-col gap-6">
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`w-full rounded-xl border-l-4 bg-white ${ACCENT.border} cursor-pointer p-6 shadow-md transition hover:bg-gray-50 ${n.read ? "opacity-70" : "opacity-100"}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                        <FiAlertTriangle /> <span>Assignation</span>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm font-semibold ${ACCENT.badgeText} ${ACCENT.badgeBg} rounded-full`}
                      >
                        Assignée
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-gray-700 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <FiClock />
                        <span>
                          <strong>Heure :</strong>{" "}
                          {new Date(n.payload.dateCreation).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          <strong>Incident ID :</strong> {n.payload.incidentId}
                        </span>
                      </div>
                      {n.payload.message && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <span className="font-medium">Message :</span>
                          <span>{n.payload.message}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-4">
                      {!n.read && (
                        <button
                          onClick={(e) => markAsRead(e, n.id)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <FiEye /> Marquer lu
                        </button>
                      )}
                      <Link
                        href={`/rapport/incident/${n.payload.incidentId}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX size={20} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
