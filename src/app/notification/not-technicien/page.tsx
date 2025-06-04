// src/app/notification/not-technicien/page.tsx
"use client";

import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiClipboard,
  FiClock,
  FiEye,
  FiFilter,
  FiCalendar,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

type NotificationType =
  | "incident_assign"
  | "rapport-valide"
  | "rapport-invalide";

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

interface IncidentAssignPayload {
  incidentId: string;
  equipmentType: string;
  location: string;
}

interface RapportValidePayload {
  rapportId: string;
  incidentId: string;
  technicienPrenom: string;
  technicienNom: string;
}

interface RapportInvalidePayload {
  rapportId: string;
  incidentId: string;
  remarqueResponsable: string;
  technicienPrenom: string;
  technicienNom: string;
}

type NotificationItem =
  | (BaseNotification & {
      type: "incident_assign";
      incidentId: string;
      equipmentType: string;
      location: string;
    })
  | (BaseNotification & {
      type: "rapport-valide";
      rapportId: string;
      incidentId: string;
      technicienPrenom: string;
      technicienNom: string;
    })
  | (BaseNotification & {
      type: "rapport-invalide";
      rapportId: string;
      incidentId: string;
      remarqueResponsable: string;
      technicienPrenom: string;
      technicienNom: string;
    });

const ACCENT = {
  border: "border-blue-500",
  badgeBg: "bg-blue-100",
  badgeText: "text-blue-600",
} as const;

export default function NotificationTechnicien() {
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const [filterRead, setFilterRead] = useState<"" | "READ" | "UNREAD">("");
  const [filterDate, setFilterDate] = useState<string>("");

  // Charger toutes les notifications qui concernent le technicien
  useEffect(() => {
    fetch("http://localhost:2000/notifications", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: RawNotification[]) => {
        const mapped: NotificationItem[] = data
          .filter((n) =>
            ["incident_assign", "rapport-valide", "rapport-invalide"].includes(
              n.type,
            ),
          )
          .map((n) => {
            switch (n.type) {
              case "incident_assign": {
                const p = n.payload as IncidentAssignPayload;
                return {
                  id: n.id,
                  read: n.read,
                  type: "incident_assign",
                  createdAt: n.createdAt,
                  incidentId: p.incidentId,
                  equipmentType: p.equipmentType,
                  location: p.location,
                };
              }
              case "rapport-valide": {
                const p = n.payload as RapportValidePayload;
                return {
                  id: n.id,
                  read: n.read,
                  type: "rapport-valide",
                  createdAt: n.createdAt,
                  rapportId: p.rapportId,
                  incidentId: p.incidentId,
                  technicienPrenom: p.technicienPrenom,
                  technicienNom: p.technicienNom,
                };
              }
              case "rapport-invalide": {
                const p = n.payload as RapportInvalidePayload;
                return {
                  id: n.id,
                  read: n.read,
                  type: "rapport-invalide",
                  createdAt: n.createdAt,
                  rapportId: p.rapportId,
                  incidentId: p.incidentId,
                  remarqueResponsable: p.remarqueResponsable,
                  technicienPrenom: p.technicienPrenom,
                  technicienNom: p.technicienNom,
                };
              }
              default:
                // Type non géré
                return null;
            }
          })
          .filter((x): x is NotificationItem => x !== null)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

        setNotes(mapped);
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

    return filtered.reduce<Record<string, NotificationItem[]>>((acc, n) => {
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

        {/* Liste groupée par date */}
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
                {items.map((n) => {
                  // Déterminer le contenu & le lien en fonction du type
                  let title: string;
                  let description: JSX.Element | string;
                  let href: string;
                  let Icon: JSX.Element;
                  let badgeText: string;
                  let badgeColor: string;

                  switch (n.type) {
                    case "incident_assign":
                      title = "Incident assigné";
                      Icon = <FiAlertTriangle className="text-blue-600" />;
                      badgeText = "Assignée";
                      badgeColor = `${ACCENT.badgeText} ${ACCENT.badgeBg}`;
                      description = (
                        <>
                          <div className="flex items-center gap-2">
                            <FiClock />
                            <span>
                              Notification à{" "}
                              {new Date(n.createdAt).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>
                              <strong>Équipement :</strong>{" "}
                              {(n as any).equipmentType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>
                              <strong>Emplacement :</strong>{" "}
                              {(n as any).location}
                            </span>
                          </div>
                        </>
                      );
                      href = `/rapport/incident/${(n as any).incidentId}`;
                      Icon = <FiAlertTriangle />;
                      break;

                    case "rapport-valide":
                      title = "Rapport validé";
                      Icon = <FiCheckCircle className="text-green-600" />;
                      badgeText = "Validé";
                      badgeColor = "text-green-700 bg-green-100";
                      description = (
                        <div className="flex items-center gap-2">
                          <FiClock />
                          <span>
                            Votre rapport a été validé par{" "}
                            {(n as any).technicienPrenom}{" "}
                            {(n as any).technicienNom} à{" "}
                            {new Date(n.createdAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            .
                          </span>
                        </div>
                      );
                      href = `/rapport/incident/${(n as any).incidentId}`;
                      break;

                    case "rapport-invalide":
                      title = "Rapport invalidé";
                      Icon = <FiXCircle className="text-red-600" />;
                      badgeText = "Invalidé";
                      badgeColor = "text-red-700 bg-red-100";
                      description = (
                        <>
                          <div className="flex items-center gap-2">
                            <FiClock />
                            <span>
                              Votre rapport a été invalidé par{" "}
                              {(n as any).technicienPrenom}{" "}
                              {(n as any).technicienNom} à{" "}
                              {new Date(n.createdAt).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                              .
                            </span>
                          </div>
                          <div className="mt-2 text-sm italic text-gray-600">
                            Remarque : <em>{(n as any).remarqueResponsable}</em>
                          </div>
                        </>
                      );
                      href = `/rapport/incident/${(n as any).incidentId}`;
                      break;

                    default:
                      return null;
                  }

                  return (
                    <Link
                      key={n.id}
                      href={href}
                      className={`block w-full rounded-xl border-l-4 bg-white ${ACCENT.border} p-6 shadow-md transition hover:bg-gray-50 ${
                        n.read ? "opacity-70" : "opacity-100"
                      }`}
                    >
                      {/* En-tête */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                          {Icon} <span>{title}</span>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm font-semibold ${badgeColor} rounded-full`}
                        >
                          {badgeText}
                        </span>
                      </div>

                      {/* Contenu */}
                      <div className="grid grid-cols-1 gap-3 text-gray-700 sm:grid-cols-2">
                        {description}
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
