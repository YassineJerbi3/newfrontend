"use client";

import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  FiEye,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

type NotificationType = "intervention-terminee";

interface RawNotification {
  id: string;
  read: boolean;
  type: NotificationType;
  payload: any;
  createdAt: string;
}

interface BaseNotification {
  id: string;
  read: boolean;
  type: NotificationType;
  createdAt: string;
}

interface InterventionTermineePayload {
  incidentId: string;
  equipmentType: string;
  message: string;
}

type NotificationItem = BaseNotification & {
  type: "intervention-terminee";
  incidentId: string;
  equipmentType: string;
  message: string;
};

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: JSX.Element; accent: string; label: string }
> = {
  "intervention-terminee": {
    icon: <FiCheckCircle size={20} />,
    accent: "border-green-500 text-green-500",
    label: "Intervention terminée",
  },
};

export default function NotificationUser() {
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const [filterRead, setFilterRead] = useState<"" | "READ" | "UNREAD">("");
  const [filterDate, setFilterDate] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:2000/notifications", {
          credentials: "include",
        });
        const data: RawNotification[] = await res.json();

        const mapped: NotificationItem[] = data
          .filter((n) => n.type === "intervention-terminee")
          .map((n) => {
            const p = n.payload as InterventionTermineePayload;
            return {
              id: n.id,
              read: n.read,
              type: "intervention-terminee",
              createdAt: n.createdAt,
              incidentId: p.incidentId,
              equipmentType: p.equipmentType,
              message: p.message,
            };
          });

        mapped.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setNotes(mapped);
      } catch (err) {
        console.error("Erreur chargement notifications:", err);
      }
    })();
  }, []);

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

  const grouped = useMemo(() => {
    return notes
      .filter((n) => {
        if (filterRead === "READ" && !n.read) return false;
        if (filterRead === "UNREAD" && n.read) return false;
        if (
          filterDate &&
          new Date(n.createdAt).toISOString().slice(0, 10) !== filterDate
        )
          return false;
        return true;
      })
      .reduce<Record<string, NotificationItem[]>>((acc, n) => {
        const label = new Date(n.createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        (acc[label] ||= []).push(n);
        return acc;
      }, {});
  }, [notes, filterRead, filterDate]);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Mes notifications
          </h1>
          <span className="text-gray-600">
            {new Date().toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Filters */}
        <div className="sticky top-[80px] z-20 mx-auto mb-8 max-w-5xl rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            {/* Statut */}
            <div className="flex flex-col">
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiEye size={16} /> Statut
              </label>
              <select
                value={filterRead}
                onChange={(e) =>
                  setFilterRead(e.target.value as "" | "READ" | "UNREAD")
                }
                className="w-32 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Tous</option>
                <option value="UNREAD">Non lus</option>
                <option value="READ">Lus</option>
              </select>
            </div>

            {/* Date */}
            <div className="flex flex-col">
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiCalendar size={16} /> Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm"
              />
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setFilterRead("");
                setFilterDate("");
              }}
              className="ml-auto flex items-center gap-1 rounded-md bg-gray-800 px-4 py-1 text-sm font-semibold text-white shadow-sm"
            >
              <FiRefreshCw size={16} /> Réinitialiser
            </button>
          </div>
        </div>

        {/* Grouped Notifications */}
        <div className="mx-auto max-w-5xl space-y-10">
          {Object.keys(grouped).length === 0 && (
            <p className="text-center text-gray-500">Aucune notification.</p>
          )}
          {Object.entries(grouped).map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                {date}
              </h2>
              <div className="grid auto-rows-auto gap-6">
                {items.map((n) => {
                  const cfg = TYPE_CONFIG[n.type];
                  return (
                    <div
                      key={n.id}
                      onClick={(e) => markAsRead(e, n.id)}
                      className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg ${
                        n.read ? "opacity-70" : "opacity-100"
                      }`}
                    >
                      {/* Accent bar */}
                      <div className={`h-1 w-full ${cfg.accent}`} />

                      {/* Content */}
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border ${cfg.accent}`}
                          >
                            {cfg.icon}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {cfg.label}
                          </h3>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>Équipement : {n.equipmentType}</p>
                          <p>{n.message}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-end border-t border-gray-200 px-5 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <FiClock size={12} />
                          <span>
                            {new Date(n.createdAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!n.read && (
                        <div className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
