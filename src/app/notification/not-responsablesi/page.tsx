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
  FiFlag,
  FiBox,
  FiRefreshCw,
  FiFilter,
  FiCalendar,
  FiEye,
  FiX,
  FiClock,
  FiUser,
  FiMapPin,
  FiEdit2,
  FiTool,
  FiFileText,
} from "react-icons/fi";
import { getSocket } from "@/utils/socket";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

type NotificationType =
  | "incident"
  | "applicatif"
  | "demande"
  | "rapport-incident"
  | "rapport-a-corriger"
  | "ALERTE_STOCK"
  | "DEPASSEMENT_STOCK_ALERT"
  | "STOCK_INDISPONIBLE"
  | "MAINTENANCE_ALERT"
  | "RAPPORT_PREVENTIF_SOUMIS"
  | "RAPPORT_MAINTENANCE_A_CORRIGER"
  | "demande-deplacement-creee"; // ← ajouté

interface NotificationItem {
  id: string;
  read: boolean;
  type: NotificationType;
  payload: {
    priorite?: "URGENT" | "NORMALE" | "BASSE";
    creator?: string;
    creatorRole?: string;
    equipmentType?: string;
    location?: string;
    dateCreation?: string;
    message?: string;
    createdAt: string;
    incidentId?: string;
    technicianId?: string;
    technicienPrenom?: string;
    technicienNom?: string;
    natureResolution?: string;
    natureIntervention?: string;
    emplacement?: string;
    occurrenceMaintenanceId?: string;
    rapportId?: string;
    autorise?: boolean;
    deplacementId?: string;
    // ← ajouté
    // <- nouveau

    // ← Nouveau pour maintenance
    dateOccurrence?: string; // J–7
    description?: string; // mp.description
  };
}

interface User {
  id: string;
  prenom: string;
  nom: string;
  roles: string;
}

const PRIORITY_STYLES = {
  URGENT: { bg: "bg-red-500", text: "text-white" },
  NORMALE: { bg: "bg-yellow-500", text: "text-white" },
  BASSE: { bg: "bg-blue-500", text: "text-white" },
} as const;

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: JSX.Element; accent: string; label: string }
> = {
  incident: {
    icon: <FiAlertTriangle size={20} />,
    accent: "border-red-500 text-red-500",
    label: "Incident",
  },
  applicatif: {
    icon: <FiCpu size={20} />,
    accent: "border-purple-500 text-purple-500",
    label: "Applicatif",
  },
  demande: {
    icon: <FiMail size={20} />,
    accent: "border-green-500 text-green-500",
    label: "Demande",
  },
  "rapport-incident": {
    icon: <FiFlag size={20} />,
    accent: "border-indigo-500 text-indigo-500",
    label: "Rapport d'incident",
  },
  "rapport-a-corriger": {
    icon: <FiEdit2 size={20} />,
    accent: "border-red-600 text-red-600",
    label: " Rapport d'incident à Corriger",
  },
  ALERTE_STOCK: {
    icon: <FiBox size={20} />,
    accent: "border-yellow-500 text-yellow-500",
    label: "Alerte de Stock",
  },
  DEPASSEMENT_STOCK_ALERT: {
    icon: <FiBox size={20} />,
    accent: "border-orange-500 text-orange-500",
    label: "Dépassement de Stock",
  },
  STOCK_INDISPONIBLE: {
    icon: <FiBox size={20} />,
    accent: "border-gray-500 text-gray-500",
    label: "Stock Indisponible",
  },
  MAINTENANCE_ALERT: {
    icon: <FiTool size={20} />, // ou FiCalendar
    accent: "border-green-500 text-green-500",
    label: "Maintenance Préventif",
  },

  RAPPORT_PREVENTIF_SOUMIS: {
    icon: <FiFileText size={20} />, // ou une autre icône qui te parle
    accent: "border-green-600 text-green-600",
    label: "Rapport de la maintenance Préventif",
  },
  // … après RAPPORT_PREVENTIF_SOUMIS
  RAPPORT_MAINTENANCE_A_CORRIGER: {
    icon: <FiEdit2 size={20} />,
    accent: "border-orange-500 text-orange-500",
    label: "Correction de maintenance soumise",
  },
  "demande-deplacement-creee": {
    icon: <FiMapPin size={20} />, // choisis l’icône la plus pertinente
    accent: "border-blue-600 text-blue-600",
    label: "Demande de déplacement",
  },
};

export default function NotificationResponsableSI() {
  const router = useRouter();
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

  const [modalOpen, setModalOpen] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(
    null,
  );
  const [selectedTech, setSelectedTech] = useState<string>("");

  // Charge les notifications depuis l’API
  const loadNotifications = useCallback(async () => {
    try {
      // 1) Charger les notifications brutes
      const res = await fetch("http://localhost:2000/notifications", {
        credentials: "include",
      });
      const data: any[] = await res.json();

      // 2) Enrichir chaque notification
      const items = await Promise.all(
        data.map(async (r) => {
          const basePayload: any = {
            ...r.payload,
            deplacementId: r.payload.deplacementId,
            technicianId: r.payload.technicianId,
            createdAt: r.createdAt,
            dateOccurrence: r.payload.dateOccurrence,
            description: r.payload.description,
            emplacement: r.payload.emplacement,
            location: r.payload.emplacement,
            equipmentType: r.payload.equipmentType,
            occurrenceMaintenanceId: r.payload.occurrenceMaintenanceId,
            rapportId: r.payload.rapportId,
            // on réinitialise autorise pour qu’on le remplisse depuis la source
            autorise: undefined as boolean | undefined,
          };

          // Si c'est une demande de déplacement et qu'on a l'ID
          if (
            r.type === "demande-deplacement-creee" &&
            r.payload.deplacementId
          ) {
            try {
              const dr = await fetch(
                `http://localhost:2000/deplacements/${r.payload.deplacementId}`,
                { credentials: "include" },
              );
              if (dr.ok) {
                const dep = await dr.json();
                basePayload.autorise = dep.autorise;
              } else {
                console.warn(
                  `Échec fetch déplacement ${r.payload.deplacementId}:`,
                  dr.status,
                );
              }
            } catch (err) {
              console.warn(
                "Erreur réseau lors du fetch deplacement",
                r.payload.deplacementId,
                err,
              );
            }
          }

          return {
            id: r.id,
            read: r.read,
            type: r.type as NotificationType,
            payload: basePayload,
          } as NotificationItem;
        }),
      );

      // 3) Tri par date décroissante
      items.sort((a, b) => {
        const aDate = new Date(a.payload.createdAt).getTime();
        const bDate = new Date(b.payload.createdAt).getTime();
        return bDate - aDate;
      });

      // 4) Stockage dans le state
      setNotifications(items);
    } catch (err) {
      console.error("Erreur loadNotifications:", err);
    }
  }, []);

  // Charge la liste des techniciens
  useEffect(() => {
    fetch("http://localhost:2000/users", { credentials: "include" })
      .then((res) => res.json())
      .then((all: User[]) =>
        setUsers(all.filter((u) => u.roles.includes("TECHNICIEN"))),
      )
      .catch(console.error);
  }, []);

  // Écoute des sockets pour nouvelle notification
  useEffect(() => {
    loadNotifications();
    const socket = getSocket();
    if (!socket) return;
    if (socket.disconnected) socket.connect();

    const handler = (payload: any) => {
      const newNotif: NotificationItem = {
        id: payload.id,
        read: false,
        type: payload.type as NotificationType,
        payload: {
          ...payload,
          deplacementId: payload.deplacementId,
          technicianId: payload.technicianId, // ← ajouté
          createdAt: payload.dateCreation ?? new Date().toISOString(),
          dateOccurrence: payload.dateOccurrence, // J–7
          description: payload.description, // ex. "Nettoyage filtre"
          equipmentType: payload.equipmentType,
          location: payload.emplacement,
          emplacement: payload.emplacement,
          occurrenceMaintenanceId: payload.occurrenceMaintenanceId,
          rapportId: payload.rapportId, // ← AJOUTÉ
        },
      };
      setNotifications((prev) =>
        [newNotif, ...prev].sort((a, b) => {
          const aDate = new Date(
            a.payload.dateCreation ?? a.payload.createdAt,
          ).getTime();
          const bDate = new Date(
            b.payload.dateCreation ?? b.payload.createdAt,
          ).getTime();
          return bDate - aDate;
        }),
      );
    };

    socket.on("incident", handler);
    socket.on("incident_assign", handler);
    socket.on("rapport-incident", handler);
    socket.on("rapport-a-corriger", handler);
    socket.on("ALERTE_STOCK", handler);
    socket.on("DEPASSEMENT_STOCK_ALERT", handler);
    socket.on("STOCK_INDISPONIBLE", handler);
    socket.on("MAINTENANCE_ALERT", handler);
    socket.on("RAPPORT_PREVENTIF_SOUMIS", handler);
    socket.on("RAPPORT_MAINTENANCE_A_CORRIGER", handler);
    socket.on("demande-deplacement-creee", handler);

    return () => {
      socket.off("incident", handler);
      socket.off("incident_assign", handler);
      socket.off("rapport-incident", handler);
      socket.off("rapport-a-corriger", handler);
      socket.off("ALERTE_STOCK", handler);
      socket.off("DEPASSEMENT_STOCK_ALERT", handler);
      socket.off("STOCK_INDISPONIBLE", handler);
      socket.off("MAINTENANCE_ALERT", handler);
      socket.off("RAPPORT_PREVENTIF_SOUMIS", handler);
      socket.off("RAPPORT_MAINTENANCE_A_CORRIGER", handler);
      socket.off("demande-deplacement-creee", handler);
    };
  }, [loadNotifications]);

  // Marquer une notification comme lue
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

  // Ouvre le modal pour affecter un technicien
  const openAssignModal = (incidentId: string) => {
    setCurrentIncidentId(incidentId);
    setSelectedTech("");
    setModalOpen(true);
  };

  // Confirme l’affectation
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
        loadNotifications();
      })
      .catch(console.error);
  };

  // Regroupe et filtre par date
  const grouped = useMemo(() => {
    const filtered = notifications.filter((n) => {
      const dateStr = n.payload.dateCreation ?? n.payload.createdAt;
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return false;
      const key = dateObj.toISOString().slice(0, 10);

      if (filterType && n.type !== filterType) return false;
      if (filterPriority && n.payload.priorite !== filterPriority) return false;
      if (filterRead === "READ" && !n.read) return false;
      if (filterRead === "UNREAD" && n.read) return false;
      if (filterDate && key !== filterDate) return false;
      return true;
    });

    return filtered.reduce<Record<string, NotificationItem[]>>((acc, n) => {
      const dateObj = new Date(n.payload.dateCreation ?? n.payload.createdAt);
      const dateLabel = dateObj.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      (acc[dateLabel] ||= []).push(n);
      return acc;
    }, {});
  }, [notifications, filterType, filterPriority, filterRead, filterDate]);
  const handleAutorisation = async (notifId: string, autorise: boolean) => {
    console.log("handleAutorisation called", notifId, autorise);
    const notif = notifications.find((n) => n.id === notifId);
    if (!notif) {
      console.warn("Notification introuvable", notifId);
      return;
    }
    const deplId = notif.payload.deplacementId;
    if (!deplId) {
      console.warn("Pas de deplacementId pour cette notif", notif);
      return;
    }

    const url = `http://localhost:2000/deplacements/${deplId}/autoriser`;
    const body = { autorise };
    console.log("Envoi PATCH vers", url, "avec le body", body);

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      console.log("Réponse brute:", res);
      const json = await res.json();
      console.log("Réponse JSON:", json);

      if (!res.ok) {
        console.error("Erreur 4xx/5xx:", json);
        return;
      }

      // Mise à jour du state
      setNotifications((prev) =>
        prev.map((n) =>
          n.payload.deplacementId === deplId
            ? { ...n, payload: { ...n.payload, autorise: json.autorise } }
            : n,
        ),
      );
    } catch (err) {
      console.error("Erreur réseau sur fetch:", err);
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Filtres */}
        <div className="sticky top-[80px] z-20 mx-auto mb-8 max-w-5xl rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            {/* Filtre Type */}
            <div className="flex flex-col">
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiFilter size={16} /> Type
              </label>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as NotificationItem["type"])
                }
                className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
              >
                <option value="">Tous</option>
                <option value="incident">Incident</option>
                <option value="applicatif">Applicatif</option>
                <option value="demande">Demande</option>
                <option value="rapport-incident">Rapport</option>
                <option value="ALERTE_STOCK">Alerte Stock</option>
                <option value="MAINTENANCE_ALERT">Maintenance</option>

                <option value="DEPASSEMENT_STOCK_ALERT">
                  Dépassement Stock
                </option>
                <option value="STOCK_INDISPONIBLE">Stock Indisp.</option>
                <option value="RAPPORT_PREVENTIF_SOUMIS">
                  Rapport préventif reçu
                </option>
                <option value="RAPPORT_MAINTENANCE_A_CORRIGER">
                  Correction de maintenance
                </option>
              </select>
            </div>

            {/* Filtre Priorité */}
            <div className="flex flex-col">
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiFlag size={16} /> Priorité
              </label>
              <select
                value={filterPriority}
                onChange={(e) =>
                  setFilterPriority(
                    e.target.value as keyof typeof PRIORITY_STYLES,
                  )
                }
                className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-200"
              >
                <option value="">Toutes</option>
                <option value="URGENT">Urgent</option>
                <option value="NORMALE">Normale</option>
                <option value="BASSE">Basse</option>
              </select>
            </div>

            {/* Filtre Statut */}
            <div className="flex flex-col">
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <FiEye size={16} /> Statut
              </label>
              <select
                value={filterRead}
                onChange={(e) =>
                  setFilterRead(e.target.value as "READ" | "UNREAD" | "")
                }
                className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-green-400 focus:ring-1 focus:ring-green-200"
              >
                <option value="">Tous</option>
                <option value="UNREAD">Non lus</option>
                <option value="READ">Lus</option>
              </select>
            </div>

            {/* Filtre Date */}
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

            {/* Bouton Réinitialiser */}
            <button
              onClick={() => {
                setFilterType("");
                setFilterPriority("");
                setFilterRead("");
                setFilterDate("");
              }}
              className="ml-auto flex items-center gap-1 rounded-md bg-gray-800 px-4 py-1 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
            >
              <FiRefreshCw size={16} /> Réinitialiser
            </button>
          </div>
        </div>

        {/* Groupement par date */}
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
                  // Déstructuration de ton payload
                  const {
                    priorite,
                    creator,
                    creatorRole,
                    equipmentType,
                    emplacement,
                    location,
                    dateCreation,
                    message,
                    incidentId,
                    technicianId,
                    technicienPrenom,
                    technicienNom,
                    natureResolution,
                    natureIntervention,
                  } = n.payload;

                  // Calculs communs
                  const { icon, accent, label } = TYPE_CONFIG[n.type];
                  const priorityStyle = priorite
                    ? PRIORITY_STYLES[priorite]
                    : PRIORITY_STYLES.NORMALE;
                  const isStock =
                    n.type === "ALERTE_STOCK" ||
                    n.type === "DEPASSEMENT_STOCK_ALERT" ||
                    n.type === "STOCK_INDISPONIBLE";
                  const isAssigned =
                    n.type === "incident" && !!incidentId && !!technicianId;

                  // Texte détaillé rapports
                  let detailRapport = "";
                  if (n.type === "rapport-incident") {
                    const fullName = `${technicienPrenom} ${technicienNom}`;
                    if (natureIntervention === "SOUS_TRAITANT") {
                      detailRapport = `Le technicien ${fullName} a fait son diagnostic et a demandé une résolution sous-traitant.`;
                    } else if (natureResolution === "IMMEDIATE") {
                      detailRapport = `Le technicien ${fullName} a terminé le travail immédiatement après diagnostic.`;
                    } else if (natureResolution === "A_PLANIFIER") {
                      detailRapport = `Le technicien ${fullName}, après diagnostic, a décidé de planifier cet incident.`;
                    }
                  } else if (n.type === "rapport-a-corriger") {
                    const fullName = `${technicienPrenom} ${technicienNom}`;
                    detailRapport = `Le technicien ${fullName} a corrigé le rapport suite à un rejet. Merci de le relire et de le valider.`;
                  }

                  // Texte détaillé maintenance
                  let detailMaintenance = "";
                  if (
                    n.type === "MAINTENANCE_ALERT" &&
                    n.payload.dateOccurrence
                  ) {
                    const alertDate = new Date(n.payload.dateOccurrence);
                    const dueDate = new Date(alertDate);
                    dueDate.setDate(alertDate.getDate() + 7);
                    const dueDateStr = dueDate.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                    detailMaintenance = `Maintenance “${n.payload.description}” sur l’équipement ${n.payload.equipmentType} à l’emplacement ${n.payload.location}, prévue le ${dueDateStr}.`;
                  }

                  // 1) Cas DEMANDE DE DEPLACEMENT
                  if (n.type === "demande-deplacement-creee") {
                    return (
                      <div
                        key={n.id}
                        className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
                      >
                        {/* Accent bar */}
                        <div className="h-1 w-full border-blue-600 bg-blue-600" />

                        {/* Contenu spécifique */}
                        <div className="flex flex-col gap-4 px-5 py-4">
                          <p className="text-sm text-gray-700">
                            Nouvelle demande de déplacement pour
                            l’équipement&nbsp;
                            <strong>{equipmentType}</strong>&nbsp;à&nbsp;
                            <strong>{emplacement || location}</strong>.
                          </p>
                          <div className="flex items-center">
                            {n.payload.autorise === undefined ? (
                              <div className="ml-auto flex flex-col space-y-2">
                                <button
                                  type="button"
                                  onClick={() => handleAutorisation(n.id, true)}
                                  className="rounded bg-blue-600 px-2 py-1 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                  Autoriser
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAutorisation(n.id, false)
                                  }
                                  className="rounded bg-gray-600 px-2 py-1 text-sm font-semibold text-white hover:bg-gray-700"
                                >
                                  Refuser
                                </button>
                              </div>
                            ) : (
                              <div className="ml-auto">
                                {n.payload.autorise ? (
                                  <FiCheckCircle
                                    size={24}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <FiXCircle
                                    size={24}
                                    className="text-red-500"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 2) Carte générique pour les autres types
                  return (
                    <div
                      key={n.id}
                      onClick={(e) => {
                        if (isAssigned) return;
                        if (n.type === "incident" && incidentId) {
                          openAssignModal(incidentId);
                          return;
                        }
                        if (
                          n.type === "RAPPORT_PREVENTIF_SOUMIS" &&
                          n.payload.rapportId
                        ) {
                          router.push(
                            `/rapport-maintenance-si/${n.payload.rapportId}`,
                          );
                          return;
                        }
                        if (
                          (n.type === "rapport-incident" ||
                            n.type === "rapport-a-corriger") &&
                          incidentId
                        ) {
                          router.push(`/rapport/incident-si/${incidentId}`);
                          return;
                        }
                        if (
                          n.type === "RAPPORT_MAINTENANCE_A_CORRIGER" &&
                          n.payload.rapportId
                        ) {
                          router.push(
                            `/rapport-maintenance-si/${n.payload.rapportId}`,
                          );
                          return;
                        }
                        markAsRead(e, n.id);
                      }}
                      className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-transform ${
                        isAssigned
                          ? "cursor-default opacity-70"
                          : "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                      }`}
                    >
                      {/* Accent bar */}
                      <div className={`h-1 w-full ${accent}`} />

                      {/* Main Content */}
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${accent} bg-white`}
                          >
                            {isAssigned ? <FiUser size={20} /> : icon}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {label}
                          </h3>
                        </div>

                        {n.type === "RAPPORT_PREVENTIF_SOUMIS" ? (
                          <p className="mt-2 text-sm text-gray-700">
                            {n.payload.message}
                          </p>
                        ) : n.type === "MAINTENANCE_ALERT" ? (
                          <p className="mt-2 text-sm text-gray-700">
                            {detailMaintenance}
                          </p>
                        ) : n.type === "rapport-incident" ||
                          n.type === "rapport-a-corriger" ? (
                          <p className="mt-2 text-sm text-gray-700">
                            {detailRapport}
                          </p>
                        ) : message ? (
                          <p className="mt-2 text-sm text-gray-600">
                            {message}
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2 text-sm text-gray-600">
                            {location && (
                              <p className="flex items-center gap-1">
                                <FiMapPin size={14} className="text-gray-500" />
                                <span>
                                  <strong>Emplacement:</strong>&nbsp;{location}
                                </span>
                              </p>
                            )}
                            {creator && (
                              <p className="flex items-center gap-1">
                                <FiUser size={14} className="text-gray-500" />
                                <span>
                                  <strong>Créateur:</strong>&nbsp;{creator}
                                  {creatorRole && ` (${creatorRole})`}
                                </span>
                              </p>
                            )}
                            {equipmentType && (
                              <p className="flex items-center gap-1">
                                <FiBox size={14} className="text-gray-500" />
                                <span>
                                  <strong>Équipement:</strong>&nbsp;
                                  {equipmentType}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
                        <div className="flex items-center gap-2">
                          {!isStock && priorite && (
                            <span
                              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${priorityStyle.text} ${priorityStyle.bg}`}
                            >
                              {priorite.charAt(0) +
                                priorite.slice(1).toLowerCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <FiClock size={12} />
                          <span>
                            {new Date(
                              dateCreation ?? n.payload.createdAt,
                            ).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Unread Indicator */}
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

        {/* Assign Technician Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="z-10 w-80 rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Assigner un technicien
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={18} />
                </button>
              </div>
              <label className="block text-sm text-gray-700">
                Sélectionnez :
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-200"
                >
                  <option value="">-- Choisir --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.prenom} {u.nom}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-md bg-gray-300 px-4 py-1 text-sm text-gray-800 hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAssign}
                  disabled={!selectedTech}
                  className={`rounded-md px-4 py-1 text-sm text-white ${
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
