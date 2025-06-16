// src/app/notification/not-technicien/page.tsx
"use client";

import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";
import {
  FiEye,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from "react-icons/fi";

type NotificationType =
  | "incident_assign"
  | "rapport-valide"
  | "rapport-invalide"
  | "rapport-a-planifier"
  | "rapport-mod-planifier"
  | "rapport-non-planifie"
  | "maintenance-assignation"
  | "RAPPORT_MAINTENANCE_VALIDE"
  | "RAPPORT_MAINTENANCE_INVALIDE"; // ← nouveau

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

interface RapportPlanifPayload {
  rapportId: string;
  incidentId: string;
  datePlanification?: string;
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
    })
  | (BaseNotification & {
      type: "RAPPORT_MAINTENANCE_VALIDE";
      rapportId: string;
      equipmentType: string;
      emplacement: string;
    })
  | (BaseNotification & {
      type: "RAPPORT_MAINTENANCE_INVALIDE";
      rapportId: string;
      equipmentType: string;
      emplacement: string;
      remarqueResponsable: string;
    })
  | (BaseNotification & {
      type: "rapport-a-planifier" | "rapport-mod-planifier";
      rapportId: string;
      incidentId: string;
      datePlanification: string;
    })
  | (BaseNotification & {
      type: "rapport-non-planifie";
      rapportId: string;
      incidentId: string;
    })
  | (BaseNotification & {
      type: "maintenance-assignation";
      equipmentType: string;
      location: string;
      datePlanification: string;
    });

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: JSX.Element; accent: string; label: string }
> = {
  incident_assign: {
    icon: <FiAlertTriangle size={20} />,
    accent: "border-blue-500 text-blue-500",
    label: "Incident assigné",
  },
  "rapport-valide": {
    icon: <FiCheckCircle size={20} />,
    accent: "border-green-500 text-green-500",
    label: "Rapport validé",
  },
  "rapport-invalide": {
    icon: <FiXCircle size={20} />,
    accent: "border-red-500 text-red-500",
    label: "Rapport invalidé",
  },
  "rapport-a-planifier": {
    icon: <FiCalendar size={20} />,
    accent: "border-indigo-500 text-indigo-500",
    label: "Planification ajoutée",
  },
  "rapport-mod-planifier": {
    icon: <FiRefreshCw size={20} />,
    accent: "border-yellow-500 text-yellow-500",
    label: "Planification modifiée",
  },
  "rapport-non-planifie": {
    icon: <FiXCircle size={20} />,
    accent: "border-gray-500 text-gray-500",
    label: "Planification annulée",
  },
  "maintenance-assignation": {
    icon: <FiAlertTriangle size={20} />, // ou un autre icône si tu veux
    accent: "border-purple-500 text-purple-500",
    label: "Maintenance assignée",
  },
  RAPPORT_MAINTENANCE_VALIDE: {
    icon: <FiCheckCircle size={20} />,
    accent: "border-green-500 text-green-500",
    label: "Rapport maintenance validé",
  },
  RAPPORT_MAINTENANCE_INVALIDE: {
    icon: <FiXCircle size={20} />,
    accent: "border-red-500 text-red-500",
    label: "Rapport maintenance invalidé",
  },
};

export default function NotificationTechnicien() {
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<"" | NotificationType>("");
  const [filterRead, setFilterRead] = useState<"" | "READ" | "UNREAD">("");
  const [filterDate, setFilterDate] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:2000/notifications", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: RawNotification[]) => {
        const mapped: NotificationItem[] = data
          .filter((n) =>
            [
              "incident_assign",
              "rapport-valide",
              "rapport-invalide",
              "rapport-a-planifier",
              "rapport-mod-planifier",
              "rapport-non-planifie",
              "maintenance-assignation",
              "RAPPORT_MAINTENANCE_VALIDE",
              "RAPPORT_MAINTENANCE_INVALIDE", // ← ajouter
            ].includes(n.type),
          )
          .map((n) => {
            const base: BaseNotification = {
              id: n.id,
              read: n.read,
              type: n.type,
              createdAt: n.createdAt,
            };
            switch (n.type) {
              case "incident_assign": {
                const p = n.payload;
                return {
                  ...base,
                  type: "incident_assign",
                  incidentId: p.incidentId,
                  equipmentType: p.equipmentType,
                  location: p.location,
                };
              }
              case "rapport-valide": {
                const p = n.payload;
                return {
                  ...base,
                  type: "rapport-valide",
                  rapportId: p.rapportId,
                  incidentId: p.incidentId,
                  technicienPrenom: p.technicienPrenom,
                  technicienNom: p.technicienNom,
                };
              }
              case "rapport-invalide": {
                const p = n.payload;
                return {
                  ...base,
                  type: "rapport-invalide",
                  rapportId: p.rapportId,
                  incidentId: p.incidentId,
                  remarqueResponsable: p.remarqueResponsable,
                  technicienPrenom: p.technicienPrenom,
                  technicienNom: p.technicienNom,
                };
              }
              case "rapport-a-planifier":
              case "rapport-mod-planifier": {
                const p = n.payload as RapportPlanifPayload;
                return {
                  ...base,
                  type: n.type,
                  rapportId: p.rapportId,
                  incidentId: p.incidentId,
                  datePlanification: p.datePlanification!,
                };
              }
              case "rapport-non-planifie": {
                const p = n.payload as RapportPlanifPayload;
                return {
                  ...base,
                  type: "rapport-non-planifie",
                  rapportId: p.rapportId,
                  incidentId: p.incidentId,
                };
              }
              case "maintenance-assignation": {
                const p = n.payload as {
                  equipmentType: string;
                  emplacement: string;
                  datePlanification: string;
                };
                return {
                  ...base,
                  type: "maintenance-assignation",
                  equipmentType: p.equipmentType,
                  location: p.emplacement,
                  datePlanification: p.datePlanification,
                };
              }
              case "RAPPORT_MAINTENANCE_VALIDE": {
                const p = n.payload;
                return {
                  ...base,
                  type: "RAPPORT_MAINTENANCE_VALIDE",
                  rapportId: p.rapportId,
                  equipmentType: p.equipmentType,
                  emplacement: p.emplacement,
                };
              }

              case "RAPPORT_MAINTENANCE_INVALIDE": {
                const p = n.payload;
                return {
                  ...base,
                  type: "RAPPORT_MAINTENANCE_INVALIDE",
                  rapportId: p.rapportId,
                  equipmentType: p.equipmentType,
                  emplacement: p.emplacement,
                  remarqueResponsable: p.remarqueResponsable,
                };
              }
            }
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        setNotes(mapped);
      })
      .catch(console.error);
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
    const filtered = notes.filter((n) => {
      if (filterType && n.type !== filterType) return false;
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
  }, [notes, filterType, filterRead, filterDate]);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Notifications
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
            {/* Type */}
            <div className="flex flex-col">
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiAlertTriangle size={16} /> Type
              </label>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as NotificationType)
                }
                className="w-48 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
              >
                <option value="">Tous</option>
                <option value="incident_assign">Incident</option>
                <option value="rapport-valide">Validé</option>
                <option value="rapport-invalide">Invalidé</option>
                <option value="rapport-a-planifier">Planifié</option>
                <option value="rapport-mod-planifier">Modifié</option>
                <option value="rapport-non-planifie">Annulé</option>
                <option value="RAPPORT_MAINTENANCE_VALIDE">
                  Maint. validé
                </option>
                <option value="RAPPORT_MAINTENANCE_INVALIDE">
                  Maint. invalidé
                </option>
              </select>
            </div>

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
                className="w-32 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-green-400 focus:ring-1 focus:ring-green-200"
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
                className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
              />
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setFilterType("");
                setFilterRead("");
                setFilterDate("");
              }}
              className="ml-auto flex items-center gap-1 rounded-md bg-gray-800 px-4 py-1 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
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
                    <Link
                      key={n.id}
                      href={
                        n.type === "incident_assign" ||
                        n.type === "rapport-valide" ||
                        n.type === "rapport-invalide"
                          ? `/rapport/incident/${(n as any).incidentId}`
                          : n.type === "rapport-a-planifier" ||
                              n.type === "rapport-mod-planifier" ||
                              n.type === "rapport-non-planifie"
                            ? "/planification-tech"
                            : "#"
                      }
                      className={`
    relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-transform
    hover:-translate-y-1 hover:shadow-lg ${n.read ? "opacity-70" : "opacity-100"}
  `}
                    >
                      {/* Accent bar */}
                      <div className={`h-1 w-full ${cfg.accent}`} />

                      {/* Content */}
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${cfg.accent} bg-white`}
                          >
                            {cfg.icon}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {cfg.label}
                          </h3>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          {(() => {
                            switch (n.type) {
                              case "incident_assign":
                                return (
                                  <>
                                    <p>
                                      Équipement : {(n as any).equipmentType}
                                    </p>
                                    <p>Emplacement : {(n as any).location}</p>
                                  </>
                                );
                              case "RAPPORT_MAINTENANCE_VALIDE":
                                return (
                                  <>
                                    <p>
                                      Équipement : {(n as any).equipmentType}
                                    </p>
                                    <p>
                                      Emplacement : {(n as any).emplacement}
                                    </p>
                                    <p>
                                      Date de validation :{" "}
                                      {new Date(n.createdAt).toLocaleDateString(
                                        "fr-FR",
                                      )}
                                    </p>
                                  </>
                                );

                              case "RAPPORT_MAINTENANCE_INVALIDE":
                                return (
                                  <>
                                    <p>
                                      Le responsable SI n’a pas validé votre
                                      rapport. Il faut modifier certains
                                      champs :{" "}
                                      <Link
                                        href={`/rapport-maintenance/${(n as any).rapportId}`}
                                        className="text-indigo-600 underline"
                                      >
                                        Cliquez ici pour voir le rapport et la
                                        remarque
                                      </Link>
                                    </p>
                                    <p>
                                      Équipement : {(n as any).equipmentType}
                                    </p>
                                    <p>
                                      Emplacement : {(n as any).emplacement}
                                    </p>
                                  </>
                                );
                              case "rapport-valide":
                                return (
                                  <p>
                                    Validé par {(n as any).technicienPrenom}{" "}
                                    {(n as any).technicienNom}.
                                  </p>
                                );
                              case "rapport-invalide":
                                return (
                                  <>
                                    <p>
                                      Invalidé par {(n as any).technicienPrenom}{" "}
                                      {(n as any).technicienNom}.
                                    </p>
                                    <p className="italic">
                                      Remarque :{" "}
                                      {(n as any).remarqueResponsable}
                                    </p>
                                  </>
                                );
                              case "rapport-a-planifier":
                              case "rapport-mod-planifier":
                                return (
                                  <p>
                                    Date planifiée :{" "}
                                    {new Date(
                                      (n as any).datePlanification,
                                    ).toLocaleDateString("fr-FR")}
                                  </p>
                                );
                              case "rapport-non-planifie":
                                return <p>Planification annulée.</p>;
                              case "maintenance-assignation":
                                return (
                                  <>
                                    <p>
                                      Équipement : {(n as any).equipmentType}
                                    </p>
                                    <p>Emplacement : {(n as any).location}</p>
                                    <p>
                                      Date planifiée :{" "}
                                      {new Date(
                                        (n as any).datePlanification,
                                      ).toLocaleDateString("fr-FR")}
                                    </p>
                                  </>
                                );
                              default:
                                return null;
                            }
                          })()}
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
                    </Link>
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
