// src/app/notification/not-technicien/page.tsx
"use client";

import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiClock,
  FiEye,
  FiFilter,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";

interface Notification {
  id: string;
  read: boolean;
  incidentId: string;
  equipmentType: string;
  location: string;
  createdAt: string;
}

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
    fetch("http://localhost:2000/notifications", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: any[]) => {
        const assigned = data
          .filter((n) => n.type === "incident_assign")
          .map((n) => ({
            id: n.id,
            read: n.read,
            incidentId: n.payload.incidentId,
            equipmentType: n.payload.equipmentType,
            location: n.payload.location,
            createdAt: n.createdAt,
          }))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        setNotes(assigned);
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
        const key = new Date(n.createdAt).toISOString().slice(0, 10);
        if (key !== filterDate) return false;
      }
      return true;
    });

    return filtered.reduce<Record<string, Notification[]>>((acc, n) => {
      const dateLabel = new Date(n.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      (acc[dateLabel] ||= []).push(n);
      return acc;
    }, {});
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
                onChange={(e) =>
                  setFilterRead(e.target.value as "" | "READ" | "UNREAD")
                }
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
                  <Link
                    key={n.id}
                    href={`/rapport/incident/${n.incidentId}`}
                    className={`block w-full rounded-xl border-l-4 bg-white ${ACCENT.border} p-6 shadow-md transition hover:bg-gray-50 ${
                      n.read ? "opacity-70" : "opacity-100"
                    }`}
                  >
                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                        <FiAlertTriangle /> <span>Incident</span>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm font-semibold ${ACCENT.badgeText} ${ACCENT.badgeBg} rounded-full`}
                      >
                        Assignée
                      </span>
                    </div>

                    {/* Contenu */}
                    <div className="grid grid-cols-1 gap-3 text-gray-700 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <FiClock />
                        <span>
                          <strong>Notification :</strong>{" "}
                          {new Date(n.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          <strong>Équipement :</strong> {n.equipmentType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          <strong>Emplacement :</strong> {n.location}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="mt-4 flex items-center justify-end gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!n.read && (
                        <button
                          onClick={(e) => markAsRead(e, n.id)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <FiEye /> Marquer lu
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
