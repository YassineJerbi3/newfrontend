"use client";
import React, { useState } from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Interface with three priority levels
interface Intervention {
  id: number;
  type: "incident" | "applicatif" | "demande";
  technicianStatus?: string;
  description: string;
  date: string; // e.g., "Aujourd'hui", "15 Jun, 2025", "01 Jan, 2020"
  time: string; // e.g., "14:00"
  read: boolean;
  priority: "Urgent" | "Medium" | "Bas";
}

const initialInterventions: Intervention[] = [
  {
    id: 1,
    type: "incident",
    technicianStatus: "Réparation immédiate",
    description: "Incident sur serveur principal (Réparation immédiate)",
    date: "Aujourd'hui",
    time: "14:00",
    read: false,
    priority: "Urgent",
  },
  {
    id: 2,
    type: "incident",
    technicianStatus: "Planifiée",
    description: "Incident sur imprimante B (Planifiée)",
    date: "Aujourd'hui",
    time: "14:30",
    read: false,
    priority: "Medium",
  },
  {
    id: 3,
    type: "incident",
    technicianStatus: "Besoin de technicien externe",
    description: "Incident sur routeur C (Besoin de technicien externe)",
    date: "Aujourd'hui",
    time: "15:00",
    read: false,
    priority: "Urgent",
  },
  {
    id: 4,
    type: "applicatif",
    description: "Erreur dans l'application Y",
    date: "15 Jun, 2025",
    time: "15:30",
    read: false,
    priority: "Bas",
  },
  {
    id: 5,
    type: "demande",
    description: "Demande de publication pour le service Z",
    date: "15 Jun, 2025",
    time: "16:00",
    read: false,
    priority: "Bas",
  },
  {
    id: 6,
    type: "incident",
    technicianStatus: "Réparation immédiate",
    description: "Incident sur serveur secondaire",
    date: "15 Jun, 2025",
    time: "16:30",
    read: false,
    priority: "Urgent",
  },
  {
    id: 7,
    type: "applicatif",
    description: "Bug dans le module d'authentification",
    date: "15 Jun, 2025",
    time: "17:00",
    read: false,
    priority: "Medium",
  },
  {
    id: 8,
    type: "incident",
    technicianStatus: "Planifiée",
    description: "Incident sur réseau local",
    date: "01 Jan, 2020",
    time: "10:15",
    read: false,
    priority: "Medium",
  },
  {
    id: 9,
    type: "demande",
    description: "Demande de mise à jour de logiciel",
    date: "01 Jan, 2020",
    time: "11:30",
    read: false,
    priority: "Bas",
  },
];

// Define sort order for priorities
const priorityOrder: Record<string, number> = {
  Urgent: 3,
  Medium: 2,
  Bas: 1,
};

// Helper function to convert date strings to timestamps
const getTimestamp = (dateStr: string): number => {
  if (dateStr === "Aujourd'hui") {
    return new Date().setHours(0, 0, 0, 0);
  }
  return Date.parse(dateStr);
};

// Comparator: first by priority then by date (oldest first)
const compareInterventions = (a: Intervention, b: Intervention): number => {
  const prioA = priorityOrder[a.priority];
  const prioB = priorityOrder[b.priority];
  if (prioA !== prioB) {
    return prioB - prioA;
  }
  return getTimestamp(a.date) - getTimestamp(b.date);
};

// Returns an icon based on the notification type
const typeIcon = (notification: Intervention) => {
  if (notification.type === "incident") {
    if (notification.technicianStatus === "Planifiée") {
      return "📝"; // Rapport d'incident
    }
    return "🔧"; // Incident sur matériel
  } else if (notification.type === "applicatif") {
    return "💻"; // Incident applicatif
  } else if (notification.type === "demande") {
    return "📩"; // Demande
  }
  return "";
};

// Returns an icon based on the notification priority
const priorityIcon = (notification: Intervention) => {
  switch (notification.priority) {
    case "Urgent":
      return "🚨";
    case "Medium":
      return "💡";
    case "Bas":
      return "📉";
    default:
      return "";
  }
};

const NotificationResponsableSI = () => {
  const [notifications, setNotifications] =
    useState<Intervention[]>(initialInterventions);
  const [removingNotifications, setRemovingNotifications] = useState<number[]>(
    [],
  );
  const [priorityFilter, setPriorityFilter] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous"); // "Tous", "Incident", "Rapport d'incident", "Applicatif", "Demande"
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    [],
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"single" | "batch">("single");
  const [currentNotification, setCurrentNotification] =
    useState<Intervention | null>(null);
  const [selectedPerson, setSelectedPerson] = useState("");
  const persons = ["Alice", "Bob", "Charlie", "David"];

  const removeNotification = (id: number) => {
    setRemovingNotifications((prev) => [...prev, id]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setRemovingNotifications((prev) => prev.filter((r) => r !== id));
    }, 300);
  };

  const handleCheckboxChange = (id: number) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(
        selectedNotifications.filter((item) => item !== id),
      );
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  const handleSelectAll = () => {
    // For type "Incident", we consider only incidents that are not "Planifiée"
    const incidentIds = notifications
      .filter(
        (n) =>
          n.type === "incident" &&
          n.technicianStatus !== "Planifiée" &&
          // Also respect the priority filter if set (unless "Tous")
          (priorityFilter === "Tous" || n.priority === priorityFilter),
      )
      .map((n) => n.id);
    if (selectedNotifications.length === incidentIds.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(incidentIds);
    }
  };

  const openModalForNotification = (notification: Intervention) => {
    setModalMode("single");
    setCurrentNotification(notification);
    setModalVisible(true);
  };

  const openModalForBatch = () => {
    setModalMode("batch");
    setModalVisible(true);
  };

  const handleModalConfirm = () => {
    if (!selectedPerson) return;
    if (modalMode === "single" && currentNotification) {
      removeNotification(currentNotification.id);
    } else if (modalMode === "batch") {
      selectedNotifications.forEach((id) => removeNotification(id));
      setSelectedNotifications([]);
    }
    setModalVisible(false);
    setSelectedPerson("");
    setCurrentNotification(null);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedPerson("");
    setCurrentNotification(null);
  };

  const handleNotificationClick = (id: number) => {
    removeNotification(id);
  };

  // Filter notifications by both priority and type
  const filteredNotifications = notifications.filter((n) => {
    // Apply priority filter if not "Tous"
    if (priorityFilter !== "Tous" && n.priority !== priorityFilter)
      return false;

    // Apply type filter
    if (typeFilter === "Tous") return true;
    if (typeFilter === "Incident") {
      return n.type === "incident" && n.technicianStatus !== "Planifiée";
    }
    if (typeFilter === "Rapport d'incident") {
      return n.type === "incident" && n.technicianStatus === "Planifiée";
    }
    if (typeFilter === "Applicatif") {
      return n.type === "applicatif";
    }
    if (typeFilter === "Demande") {
      return n.type === "demande";
    }
    return true;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const groupKey = notification.date;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
      return groups;
    },
    {} as Record<string, Intervention[]>,
  );

  const sortGroupKeys = (a: string, b: string) => {
    if (a === "Aujourd'hui") return -1;
    if (b === "Aujourd'hui") return 1;
    return Date.parse(a) - Date.parse(b);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl p-6">
        {/* Filtering Controls */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setSelectedNotifications([]); // reset batch selection when changing type
            }}
            className="rounded border border-gray-300 p-2"
          >
            <option value="Tous">Type : Tous</option>
            <option value="Incident">Incident</option>
            <option value="Rapport d'incident">Rapport d'incident</option>
            <option value="Applicatif">Applicatif</option>
            <option value="Demande">Demande</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded border border-gray-300 p-2"
          >
            <option value="Tous">Priorité : Tous</option>
            <option value="Urgent">Priorité : Urgent</option>
            <option value="Medium">Priorité : Medium</option>
            <option value="Bas">Priorité : Bas</option>
          </select>
          {/* Show select/deselect button only for Incident type */}
          {typeFilter === "Incident" && (
            <button
              onClick={handleSelectAll}
              className="rounded bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
            >
              {selectedNotifications.length ===
              notifications.filter(
                (n) =>
                  n.type === "incident" &&
                  n.technicianStatus !== "Planifiée" &&
                  (priorityFilter === "Tous" || n.priority === priorityFilter),
              ).length
                ? "Désélectionner tout"
                : "Sélectionner tout"}
            </button>
          )}
          {typeFilter === "Incident" && selectedNotifications.length > 0 && (
            <button
              onClick={openModalForBatch}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Envoyer ({selectedNotifications.length})
            </button>
          )}
        </div>

        {/* Notifications grouped by date */}
        {Object.keys(groupedNotifications)
          .sort(sortGroupKeys)
          .map((date) => (
            <section key={date} className="mb-10">
              <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-semibold text-gray-700">
                {date === "Aujourd'hui" ? "Aujourd'hui" : date}
              </h2>
              <ul className="space-y-6">
                {groupedNotifications[date]
                  .sort(compareInterventions)
                  .map((notification) => (
                    <li
                      key={notification.id}
                      className={`flex items-center justify-between rounded-xl bg-white p-6 shadow-md transition-transform duration-300 hover:scale-105 ${
                        removingNotifications.includes(notification.id)
                          ? "opacity-0"
                          : "opacity-100"
                      }`}
                    >
                      {/* Type Icon */}
                      <div className="mr-6">
                        <span className="text-3xl">
                          {typeIcon(notification)}
                        </span>
                      </div>
                      {/* Notification Content */}
                      <Link
                        href={
                          notification.type === "incident"
                            ? "/rapport/incident"
                            : notification.type === "applicatif"
                              ? "/rapport/applicatif"
                              : "/rapport/demande"
                        }
                        className="flex-grow"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="flex items-center text-xl font-bold text-gray-800">
                              {notification.type === "incident"
                                ? notification.technicianStatus === "Planifiée"
                                  ? "RAPPORT D'INCIDENT"
                                  : "INCIDENT"
                                : notification.type.toUpperCase()}
                              <span className="ml-3 text-lg">
                                {priorityIcon(notification)}
                              </span>
                            </h3>
                            <span className="text-sm text-gray-500">
                              {notification.date} - {notification.time}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-700">
                            {notification.description}
                          </p>
                          {notification.type === "incident" &&
                            notification.technicianStatus && (
                              <p className="mt-1 text-sm text-gray-600">
                                Technicien :{" "}
                                {notification.technicianStatus !==
                                "Réparation immédiate"
                                  ? "Planifier"
                                  : notification.technicianStatus}
                              </p>
                            )}
                        </div>
                      </Link>
                      {/* Checkbox for Incident type only */}
                      {typeFilter === "Incident" &&
                        notification.type === "incident" &&
                        notification.technicianStatus !== "Planifiée" && (
                          <input
                            type="checkbox"
                            className="ml-4 h-5 w-5 text-indigo-600"
                            checked={selectedNotifications.includes(
                              notification.id,
                            )}
                            onChange={() =>
                              handleCheckboxChange(notification.id)
                            }
                          />
                        )}
                      {/* Action Button for incidents not filtered as batch */}
                      {typeFilter !== "Incident" &&
                        notification.type === "incident" &&
                        notification.technicianStatus !== "Planifiée" && (
                          <button
                            onClick={() =>
                              openModalForNotification(notification)
                            }
                            className="ml-6 rounded-lg bg-blue-600 px-5 py-2 text-white transition-colors hover:bg-blue-700"
                          >
                            Envoyer
                          </button>
                        )}
                    </li>
                  ))}
              </ul>
            </section>
          ))}

        {/* Modal for sending notification */}
        {modalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="z-10 w-80 rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                Envoyer Notification
              </h2>
              <label className="mb-2 block text-gray-700">
                Choisissez une personne :
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="">-- Sélectionner --</option>
                  {persons.map((person, idx) => (
                    <option key={idx} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={handleModalCancel}
                  className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={handleModalConfirm}
                  disabled={!selectedPerson}
                  className={`rounded px-4 py-2 text-white transition-colors ${
                    !selectedPerson
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
};

export default NotificationResponsableSI;
