// src/app/notification/not-technicien/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  ToolbarProps,
  EventProps,
} from "react-big-calendar";
import moment from "moment";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { motion, AnimatePresence } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useRouter } from "next/navigation";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";

const localizer = momentLocalizer(moment);

const eventStyleGetter = (event: any) => {
  let bgColor: string, icon: JSX.Element;

  if (event.type === "preventive") {
    // Maintenance préventive en violet
    bgColor = "#8B5CF6";
    icon = <FiAlertTriangle />;
  } else {
    // Rapports
    if (event.statut === "VALIDE") {
      bgColor = "#10B981";
      icon = <FiCheckCircle />;
    } else if (event.priority === "Urgent") {
      bgColor = "#2563EB";
      icon = <FiAlertCircle />;
    } else if (event.priority === "Medium") {
      bgColor = "#3B82F6";
      icon = <FiClock />;
    } else {
      bgColor = "#60A5FA";
      icon = <FiClock />;
    }
  }

  return {
    style: {
      backgroundColor: bgColor,
      borderRadius: "1.25rem",
      border: "none",
      color: "#fff",
      padding: "6px 8px",
      fontSize: "0.85rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    icon,
  };
};

interface CustomToolbarProps extends ToolbarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({
  label,
  onNavigate,
  currentDate,
  onDateChange,
}) => {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());

  useEffect(() => {
    setYear(currentDate.getFullYear());
    setMonth(currentDate.getMonth());
  }, [currentDate]);

  const years = Array.from(
    { length: 21 },
    (_, i) => currentDate.getFullYear() - 10 + i,
  );
  const months = moment.months();

  return (
    <div className="sticky top-0 z-20 mb-4 flex items-center justify-between rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-3 text-white shadow-md">
      <div className="flex space-x-3">
        <button
          onClick={() => onNavigate("PREV")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 transition hover:bg-opacity-30"
        >
          ←
        </button>
        <button
          onClick={() => {
            onNavigate("TODAY");
            onDateChange(new Date());
          }}
          className="rounded-full bg-white bg-opacity-25 px-4 py-2 text-sm font-medium hover:bg-opacity-35"
        >
          Aujourd’hui
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 transition hover:bg-opacity-30"
        >
          →
        </button>
      </div>

      <div className="relative">
        <span
          onClick={() => setOpen(!open)}
          className="cursor-pointer select-none text-xl font-semibold"
        >
          {label}
        </span>
        {open && (
          <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-3 flex justify-between">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-1/2 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-800 focus:outline-none"
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-1/2 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-800 focus:outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDateChange(new Date(year, month, 1));
                  setOpen(false);
                }}
                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ width: 120 }} />
    </div>
  );
};

const CalendarOnlyPage: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Charger rapports planifiés
        const res1 = await fetch(
          "http://localhost:2000/rapports/mes-planifies",
          { credentials: "include" },
        );
        if (!res1.ok) throw new Error(`Rapports – Erreur ${res1.status}`);
        const rapports = await res1.json();

        // Charger maintenances préventives assignées
        const res2 = await fetch(
          "http://localhost:2000/occurrences-maintenance/assigned",
          { credentials: "include" },
        );
        if (!res2.ok) throw new Error(`Préventives – Erreur ${res2.status}`);
        const preventives = await res2.json();

        // Transformer en events
        const eventsRapports = rapports.map((r: any) => {
          const d = new Date(r.datePlanification);
          return {
            id: r.id,
            type: "rapport",
            start: d,
            end: d,
            priority:
              r.incident.priorite === "URGENT"
                ? "Urgent"
                : r.incident.priorite === "BASSE"
                  ? "Bas"
                  : "Medium",
            statut: r.statut,
            title: "Rapport",
            incident: r.incident,
            equipement: r.incident.equipement,
            emplacement: r.incident.equipement.emplacement,
            dateIncident: r.incident.dateCreation,
            datePlanification: d,
            diagnostic: r.diagnosticPanne,
          };
        });

        const eventsPreventives = preventives.map((o: any) => {
          const d = new Date(o.datePlanification);
          return {
            id: o.id,
            type: "preventive",
            start: d,
            end: d,
            title: "Maintenance préventive",
            equipement: o.maintenancePreventive.equipement,
            emplacement: o.maintenancePreventive.equipement.emplacement,
            description: o.maintenancePreventive.description,
            datePlanification: d,
          };
        });

        setEvents([...eventsRapports, ...eventsPreventives]);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  return (
    <DefaultLayout>
      <div className="flex h-screen flex-col bg-gradient-to-b from-blue-50 to-white p-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}
        <div className="flex-1">
          {!events.length && !error ? (
            <p className="mt-10 text-center text-gray-500">
              Aucune planification trouvée.
            </p>
          ) : (
            <Calendar
              localizer={localizer}
              date={date}
              view="month"
              onNavigate={(d) => d instanceof Date && setDate(d)}
              defaultView="month"
              views={["month"]}
              popup
              events={events}
              style={{
                height: "100%",
                borderRadius: "1.5rem",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
              components={{
                toolbar: (props) => (
                  <CustomToolbar
                    {...props}
                    currentDate={date}
                    onDateChange={setDate}
                  />
                ),
                event: ({ event }: EventProps<any>) => {
                  const { style, icon } = eventStyleGetter(event);
                  return (
                    <div style={style}>
                      {icon}
                      <span className="truncate">{event.title}</span>
                    </div>
                  );
                },
              }}
              onSelectEvent={(e) => setSelectedEvent(e)}
            />
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                className="relative w-full max-w-md rounded-3xl bg-white bg-opacity-60 p-8 shadow-xl backdrop-blur-xl"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute right-4 top-4 text-2xl text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>

                <h2 className="mb-4 text-xl font-semibold text-blue-700">
                  {selectedEvent.type === "preventive"
                    ? "Détails Maintenance Préventive"
                    : "Détails de la planification"}
                </h2>

                {/* Badge Disponibilité */}
                {Date.now() < selectedEvent.datePlanification.getTime() && (
                  <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
                    ⏱ Disponible dans{" "}
                    {Math.ceil(
                      (selectedEvent.datePlanification.getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    jour(s)
                  </p>
                )}
                {selectedEvent.type !== "preventive" &&
                  selectedEvent.statut === "VALIDE" && (
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                      ✔ Validé
                    </p>
                  )}

                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Équipement :</strong>{" "}
                    {selectedEvent.equipement.equipmentType}
                  </p>
                  <p>
                    <strong>Emplacement :</strong>{" "}
                    {selectedEvent.emplacement.nom}
                  </p>
                  {selectedEvent.type === "preventive" ? (
                    <>
                      <p>
                        <strong>Description :</strong>{" "}
                        {selectedEvent.description}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Date de l'incident :</strong>{" "}
                        {moment(selectedEvent.dateIncident).format(
                          "DD/MM/YYYY HH:mm",
                        )}
                      </p>
                      <p>
                        <strong>Diagnostic :</strong>{" "}
                        {selectedEvent.diagnostic || "Aucun diagnostic"}
                      </p>
                    </>
                  )}
                  <p>
                    <strong>Date de planification :</strong>{" "}
                    {moment(selectedEvent.datePlanification).format(
                      "DD/MM/YYYY",
                    )}
                  </p>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    className={`rounded-full px-4 py-2 font-semibold text-white transition ${
                      Date.now() >= selectedEvent.datePlanification.getTime()
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "cursor-not-allowed bg-gray-400"
                    }`}
                    disabled={
                      Date.now() < selectedEvent.datePlanification.getTime()
                    }
                    onClick={() => {
                      if (
                        Date.now() >= selectedEvent.datePlanification.getTime()
                      ) {
                        // on considère que pour un event.preventive c'est l'occurrenceMaintenanceId
                        // et pour un event.rapport (incidents) tu as peut‑être déjà un rapportId ou
                        // tu gères ça ailleurs.
                        const path =
                          selectedEvent.type === "preventive"
                            ? // on passe l'ID de l'occurrence ici pour créer/éditer le rapport
                              `/rapport-maintenance/${selectedEvent.id}`
                            : // si tu veux quand même rediriger vers un incident-report
                              `/rapport-incident/${selectedEvent.incident.id}`;
                        router.push(path);
                      }
                    }}
                  >
                    {selectedEvent.type === "preventive"
                      ? "Saisir le rapport"
                      : "Voir le rapport incident"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DefaultLayout>
  );
};

export default CalendarOnlyPage;
