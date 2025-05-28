// src/app/notification/not-responsablesi/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  MouseEvent,
  useMemo,
} from "react";
import {
  FiAlertTriangle,
  FiCpu,
  FiMail,
  FiUser,
  FiMapPin,
  FiClock,
  FiBox,
  FiRefreshCw,
  FiFilter,
  FiCalendar,
  FiEye,
  FiFlag,
  FiX,
} from "react-icons/fi";
import { getSocket } from "@/utils/socket";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface NotificationItem {
  id: string;
  read: boolean;
  type: "incident" | "applicatif" | "demande";
  payload: {
    priorite: "URGENT" | "NORMALE" | "BASSE";
    creator: string;
    creatorRole?: string;
    equipmentType: string;
    location: string;
    dateCreation: string;
  };
}

interface User {
  id: string;
  prenom: string;
  nom: string;
  roles: string;
}

const PRIORITY_STYLES = {
  URGENT: {
    accent: "border-red-500",
    badgeBg: "bg-red-100",
    badgeText: "text-red-600",
  },
  NORMALE: {
    accent: "border-yellow-500",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-600",
  },
  BASSE: {
    accent: "border-blue-500",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-600",
  },
} as const;

const TYPE_CONFIG: Record<
  NotificationItem["type"],
  { icon: JSX.Element; label: string }
> = {
  incident: { icon: <FiAlertTriangle />, label: "Incident" },
  applicatif: { icon: <FiCpu />, label: "Applicatif" },
  demande: { icon: <FiMail />, label: "Demande" },
};

export default function NotificationResponsableSI() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterType, setFilterType] = useState<"" | NotificationItem["type"]>(
    "",
  );
  const [filterPriority, setFilterPriority] = useState<
    "" | keyof typeof PRIORITY_STYLES
  >("");
  const [filterRead, setFilterRead] = useState<"" | "READ" | "UNREAD">("");
  const [filterDate, setFilterDate] = useState<string>("");

  // Modal d'assignation
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(
    null,
  );
  const [selectedTech, setSelectedTech] = useState<string>("");

  // 1️⃣ Charger les notifications
  const loadNotifications = useCallback(() => {
    fetch("http://localhost:2000/notifications", { credentials: "include" })
      .then((res) => res.json())
      .then((data) =>
        setNotifications(
          data
            .map((r: any) => ({
              id: r.id,
              read: r.read,
              type: r.type,
              payload: r.payload,
            }))
            .sort(
              (a, b) =>
                new Date(b.payload.dateCreation).getTime() -
                new Date(a.payload.dateCreation).getTime(),
            ),
        ),
      )
      .catch(console.error);
  }, []);

  // 2️⃣ Charger les techniciens
  useEffect(() => {
    fetch("http://localhost:2000/users", { credentials: "include" })
      .then((res) => res.json())
      .then((all: User[]) =>
        setUsers(all.filter((u) => u.roles === "TECHNICIEN")),
      )
      .catch(console.error);
  }, []);

  // 3️⃣ WebSocket en temps réel + reconnection
  useEffect(() => {
    loadNotifications();
    const socket = getSocket();
    if (!socket) return;

    if (socket.disconnected) {
      socket.connect();
    }

    const handler = (payload: any) =>
      setNotifications((prev) =>
        [
          { id: payload.id, read: false, type: payload.type, payload },
          ...prev,
        ].sort(
          (a, b) =>
            new Date(b.payload.dateCreation).getTime() -
            new Date(a.payload.dateCreation).getTime(),
        ),
      );

    socket.on("incident", handler);
    socket.on("incident_assign", handler);

    return () => {
      socket.off("incident", handler);
      socket.off("incident_assign", handler);
    };
  }, [loadNotifications]);

  // 4️⃣ Marquer comme lu
  const markAsRead = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    fetch(`http://localhost:2000/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    }).catch(console.error);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  // 5️⃣ Ouvrir la modal
  // Au lieu de `setCurrentIncidentId(idNotification)`
  // tu reçois désormais directement l'id de l'incident
  const openAssignModal = (incidentId: string) => {
    setCurrentIncidentId(incidentId);
    setSelectedTech("");
    setModalOpen(true);
  };

  // 6️⃣ Confirmer l’assignation
  const confirmAssign = () => {
    if (!currentIncidentId || !selectedTech) return;
    fetch(`http://localhost:2000/incidents/${currentIncidentId}/assign`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technicianId: selectedTech }),
    })
      .then(() => {
        setModalOpen(false);
        setSelectedTech("");
        // 🔄 on recharge
        loadNotifications();
      })
      .catch(console.error);
  };

  // 7️⃣ Regroupement par date & filtres
  const grouped = useMemo(() => {
    const filtered = notifications.filter((n) => {
      const key = new Date(n.payload.dateCreation).toISOString().slice(0, 10);
      if (filterType && n.type !== filterType) return false;
      if (filterPriority && n.payload.priorite !== filterPriority) return false;
      if (filterRead === "READ" && !n.read) return false;
      if (filterRead === "UNREAD" && n.read) return false;
      if (filterDate && key !== filterDate) return false;
      return true;
    });
    return filtered.reduce<Record<string, NotificationItem[]>>((acc, n) => {
      const dateLabel = new Date(n.payload.dateCreation).toLocaleDateString(
        "fr-FR",
        { day: "2-digit", month: "2-digit", year: "numeric" },
      );
      (acc[dateLabel] ||= []).push(n);
      return acc;
    }, {});
  }, [notifications, filterType, filterPriority, filterRead, filterDate]);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
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
            {/* Type */}
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FiFilter /> Type
              </label>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as NotificationItem["type"])
                }
                className="w-full rounded-full bg-white/60 p-3 text-gray-800 shadow-inner focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Tous</option>
                <option value="incident">Incident</option>
                <option value="applicatif">Applicatif</option>
                <option value="demande">Demande</option>
              </select>
            </div>
            {/* Priorité */}
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FiFlag /> Priorité
              </label>
              <select
                value={filterPriority}
                onChange={(e) =>
                  setFilterPriority(
                    e.target.value as keyof typeof PRIORITY_STYLES,
                  )
                }
                className="w-full rounded-full bg-white/60 p-3 text-gray-800 shadow-inner focus:ring-2 focus:ring-yellow-200"
              >
                <option value="">Toutes</option>
                <option value="URGENT">Urgent</option>
                <option value="NORMALE">Normale</option>
                <option value="BASSE">Basse</option>
              </select>
            </div>
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
                setFilterType("");
                setFilterPriority("");
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
                {items.map((n) => {
                  const {
                    priorite,
                    creator,
                    creatorRole,
                    equipmentType,
                    location,
                    dateCreation,
                  } = n.payload;
                  const style = PRIORITY_STYLES[priorite];
                  const { icon, label } = TYPE_CONFIG[n.type];

                  return (
                    <div
                      key={n.id}
                      onClick={(e) => {
                        if (n.type === "incident") {
                          // on stocke l'incidentId, pas l'id de notif
                          openAssignModal(n.payload.incidentId as string);
                        } else {
                          markAsRead(e, n.id);
                        }
                      }}
                      className={`w-full rounded-xl border-l-4 bg-white ${style.accent} cursor-pointer p-6 shadow-md transition hover:bg-gray-50 ${
                        n.read ? "opacity-70" : "opacity-100"
                      }`}
                    >
                      {/* Header */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                          {icon} <span>{label}</span>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm font-semibold ${style.badgeText} ${style.badgeBg} rounded-full`}
                        >
                          {priorite[0] + priorite.slice(1).toLowerCase()}
                        </span>
                      </div>
                      {/* Détails */}
                      <div className="grid grid-cols-1 gap-3 text-gray-700 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <FiMapPin />
                          <span>
                            <strong>Emplacement :</strong> {location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUser />
                          <span>
                            <strong>Créateur :</strong> {creator}
                            {creatorRole && ` (${creatorRole})`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock />
                          <span>
                            <strong>Heure :</strong>{" "}
                            {new Date(dateCreation).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-medium text-indigo-700">
                          <FiBox />
                          <span>
                            <strong>Équipement :</strong> {equipmentType}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal d’assignation */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="z-10 w-80 rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Assigner un technicien
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>
              <label className="block text-gray-700">
                Sélectionnez :
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="mt-2 w-full rounded border-gray-300 p-2 shadow-sm"
                >
                  <option value="">-- Choisir --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.prenom} {u.nom}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAssign}
                  disabled={!selectedTech}
                  className={`rounded px-4 py-2 text-white ${
                    !selectedTech
                      ? "bg-blue-300"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
