"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  ToolbarProps,
  EventProps,
} from "react-big-calendar";
import moment from "moment";
import DatePicker from "react-datepicker";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const localizer = momentLocalizer(moment);

export interface Evenement {
  id: string;
  type: "rapport" | "maintenance";
  title: string;
  start: Date;
  end: Date;
  // common
  equipement: any;
  emplacement: { type: string; nom: string; poste?: string };
  datePlanification: Date | null;
  statut: "VALIDE" | "A_PLANIFIER";
  // rapport-only
  incident?: any;
  diagnostique?: string;
  technicien?: { nom: string; prenom: string };
  dateValidation?: string;
  // maintenance-only
  alertDate?: string;
  description?: string;
  maintenancePreventiveId?: string;
  plannedTechnicienId?: string;
}

interface User {
  id: string;
  prenom: string;
  nom: string;
}

interface CustomToolbarProps extends ToolbarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: string;
  views: string[];
  onView: (view: string) => void;
}
const CustomToolbar: React.FC<CustomToolbarProps> = ({
  label,
  onNavigate,
  currentDate,
  onDateChange,
  view,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div className="sticky top-0 z-20 mb-4 flex items-center justify-between rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-3 text-white shadow-md">
      <div className="flex space-x-3">
        <button
          onClick={() => onNavigate("PREV")}
          className="h-10 w-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
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
          className="h-10 w-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
        >
          →
        </button>
      </div>
      <div className="relative">
        <span
          onClick={() => setShowPicker(!showPicker)}
          className="cursor-pointer select-none text-xl font-semibold"
        >
          {label}
        </span>
        {showPicker && (
          <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-lg bg-white p-4 shadow-lg">
            <DatePicker
              selected={currentDate}
              onChange={(d) => {
                onDateChange(d!);
                setShowPicker(false);
              }}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              inline
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none"
            />
          </div>
        )}
      </div>
      <button
        onClick={() => onView("month")}
        className={`rounded-full px-4 py-2 text-sm font-medium ${
          view === "month"
            ? "bg-white text-blue-700"
            : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
        }`}
      >
        Month
      </button>
    </div>
  );
};

interface EventModalProps {
  isOpen: boolean;
  eventData: Evenement;
  context: "list" | "calendar";
  onClose: () => void;
  onSave: (ev: Evenement) => void;
  onDelete: (id: string) => void;
  technicians: User[];
}
const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  eventData,
  context,
  onClose,
  onSave,
  onDelete,
  technicians,
}) => {
  const [datePlanif, setDatePlanif] = useState<Date>(
    eventData.datePlanification || new Date(),
  );
  const [selectedTech, setSelectedTech] = useState<string>(
    eventData.plannedTechnicienId || "",
  );

  useEffect(() => {
    setDatePlanif(eventData.datePlanification || new Date());
    setSelectedTech(eventData.plannedTechnicienId || "");
  }, [eventData]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center pt-[90px] z-40"
      className="outline-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.2 }}
            className="mx-4 w-full max-w-md rounded-3xl bg-white/80 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-xl text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <h2 className="mb-4 text-center text-2xl font-bold text-blue-800">
              {eventData.type === "rapport"
                ? "Détails du rapport"
                : "Planification Maintenance"}
            </h2>

            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Équipement :</strong>{" "}
                {eventData.equipement.equipmentType}
              </p>
              <p>
                <strong>Emplacement :</strong> {eventData.emplacement.nom}
              </p>

              {eventData.type === "maintenance" && (
                <>
                  <p>
                    <strong>Description :</strong> {eventData.description}
                  </p>
                  <div>
                    <strong>Choisir technicien :</strong>
                    <select
                      value={selectedTech}
                      onChange={(e) => setSelectedTech(e.target.value)}
                      className="ml-2 rounded-md border border-gray-300 px-2 py-1 focus:outline-none"
                    >
                      <option value="">-- Sélectionner --</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.prenom} {t.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <strong>Date planification :</strong>
                <DatePicker
                  selected={datePlanif}
                  onChange={(d) => setDatePlanif(d!)}
                  dateFormat="yyyy-MM-dd"
                  className="ml-2 rounded-md border border-gray-300 px-2 py-1 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              {context === "list" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    onSave({
                      ...eventData,
                      datePlanification: datePlanif,
                      start: datePlanif,
                      end: datePlanif,
                      plannedTechnicienId: selectedTech,
                    })
                  }
                  className="rounded-3xl bg-blue-700 px-5 py-2 text-white shadow-md hover:bg-blue-800"
                >
                  Valider
                </motion.button>
              )}
              {context === "calendar" &&
                eventData.type === "rapport" &&
                eventData.statut !== "VALIDE" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onDelete(eventData.id)}
                    className="rounded-3xl bg-red-600 px-5 py-2 text-white shadow-md hover:bg-red-700"
                  >
                    Annuler planif.
                  </motion.button>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

const MyCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [rapportEvents, setRapportEvents] = useState<Evenement[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<Evenement[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<Evenement[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Evenement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<Evenement | null>(null);
  const [modalContext, setModalContext] = useState<"list" | "calendar">("list");
  const [technicians, setTechnicians] = useState<User[]>([]);

  // 2) Chargement des TECHNICIEN
  useEffect(() => {
    fetch("http://localhost:2000/users/role/TECHNICIEN", {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("Impossible de charger les techniciens");
        return r.json();
      })
      .then((data: User[]) => setTechnicians(data))
      .catch((err) => {
        console.error(err);
        setTechnicians([]); // pour éviter undefined
      });
  }, []);

  // 2) Charger rapports + maintenances + planifiés
  useEffect(() => {
    fetch("http://localhost:2000/rapports/nature/a-planifier", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: any[]) => {
        setRapportEvents(
          data.map((r) => ({
            id: r.id,
            type: "rapport",
            title: r.incident.description,
            start: new Date(),
            end: new Date(),
            incident: r.incident,
            equipement: r.incident.equipement,
            emplacement: r.incident.equipement.emplacement,
            datePlanification: null,
            statut: r.statut,
          })),
        );
      });

    fetch("http://localhost:2000/occurrences-maintenance/unplanned", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: any[]) => {
        setMaintenanceEvents(
          data.map((o) => {
            const alertDate = new Date(o.dateOccurrence);
            const defaultPlanif = new Date(alertDate);
            defaultPlanif.setDate(alertDate.getDate() + 7);
            return {
              id: o.id,
              type: "maintenance",
              title: o.maintenancePreventive.description,
              start: defaultPlanif,
              end: defaultPlanif,
              equipement: o.maintenancePreventive.equipement,
              emplacement: o.maintenancePreventive.equipement.emplacement,
              datePlanification: defaultPlanif,
              statut: "A_PLANIFIER",
              alertDate: o.dateOccurrence,
              description: o.maintenancePreventive.description,
              maintenancePreventiveId: o.maintenancePreventive.id,
            };
          }),
        );
      });

    fetch("http://localhost:2000/rapports/planifies", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: any[]) => {
        setScheduledEvents(
          data.map((r) => ({
            id: r.id,
            type: "rapport",
            title: r.incident.description,
            start: new Date(r.datePlanification),
            end: new Date(r.datePlanification),
            incident: r.incident,
            equipement: r.incident.equipement,
            emplacement: r.incident.equipement.emplacement,
            datePlanification: new Date(r.datePlanification),
            statut: r.statut,
          })),
        );
      });
  }, []);

  // 3) Fusionner la liste
  useEffect(() => {
    setAvailableEvents([...rapportEvents, ...maintenanceEvents]);
  }, [rapportEvents, maintenanceEvents]);

  const openModal = (ev: Evenement, context: "list" | "calendar") => {
    setModalEvent(ev);
    setModalContext(context);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // 4) Sauvegarder planification
  const handleSave = async (ev: Evenement) => {
    const url =
      ev.type === "rapport"
        ? `http://localhost:2000/rapports/${ev.id}/planifier`
        : `http://localhost:2000/occurrences-maintenance/${ev.id}/planifier`;
    const body =
      ev.type === "rapport"
        ? { datePlanification: ev.datePlanification?.toISOString() }
        : {
            datePlanification: ev.datePlanification?.toISOString(),
            technicienId: ev.plannedTechnicienId,
          };

    await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // retirer l’événement de la liste « à planifier »
    setRapportEvents((prev) => prev.filter((r) => r.id !== ev.id));
    setMaintenanceEvents((prev) => prev.filter((m) => m.id !== ev.id));
    closeModal();
  };

  // 5) Annuler planif. (rapports)
  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:2000/rapports/${id}/planifier`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datePlanification: null }),
    });
    setRapportEvents((prev) => prev.filter((r) => r.id !== id));
    closeModal();
  };

  const eventStyleGetter = (event: Evenement) => ({
    style: {
      backgroundColor: event.statut === "VALIDE" ? "#047857" : "#1E3A8A",
      borderRadius: "1.25rem",
      color: "#fff",
      padding: "6px 8px",
      fontSize: "0.85rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    },
  });

  return (
    <DefaultLayout>
      <div className="flex h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Liste */}
        <div
          className="w-1/3 overflow-y-auto rounded-tr-3xl bg-white/70 p-6 backdrop-blur-sm"
          style={{ maxHeight: "calc(100vh - 90px)" }}
        >
          <h2 className="mb-6 text-center text-2xl font-extrabold text-blue-800">
            Liste des évènements à planifier
          </h2>
          {availableEvents.length === 0 ? (
            <p className="text-center text-gray-500">
              Aucun événement à planifier
            </p>
          ) : (
            availableEvents.map((ev) => (
              <motion.div
                key={ev.id}
                onClick={() => openModal(ev, "list")}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
                whileTap={{ scale: 0.98 }}
                className="mb-4 flex cursor-pointer items-center space-x-4 rounded-3xl bg-white p-4 shadow-sm"
              >
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {ev.type === "rapport" ? "Rapport" : "Maintenance"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {ev.equipement.equipmentType} — {ev.emplacement.nom}
                  </p>
                  {ev.type === "maintenance" && ev.alertDate && (
                    <p className="text-sm text-gray-500">
                      Prévue le{" "}
                      {new Date(ev.alertDate).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div className="text-xl">
                  {ev.statut === "VALIDE"
                    ? "✅"
                    : ev.type === "rapport"
                      ? "❌"
                      : "🛠️"}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Calendrier */}
        <div className="flex-1 p-6">
          <Calendar
            localizer={localizer}
            date={date}
            view="month"
            views={["month"]}
            onNavigate={(d) => d instanceof Date && setDate(d)}
            defaultView="month"
            events={scheduledEvents}
            popup
            tooltipAccessor={() => ""}
            style={{
              height: "100%",
              borderRadius: "1.5rem",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
            components={{
              toolbar: (props) => (
                <CustomToolbar
                  {...props}
                  currentDate={date}
                  onDateChange={setDate}
                  view="month"
                  views={["month"]}
                  onView={() => {}}
                />
              ),
              event: (props: EventProps<Evenement>) => {
                const { event } = props;
                return (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center space-x-1 pl-3"
                    style={eventStyleGetter(event).style}
                  >
                    <span
                      className={`${event.statut === "VALIDE" ? "text-green-200" : "text-blue-200"} text-sm font-semibold`}
                    >
                      {event.type === "rapport" ? "Incident" : "Maintenance"}{" "}
                      {event.statut === "VALIDE" ? "✅" : "❌"}
                    </span>
                  </motion.div>
                );
              },
            }}
            onSelectEvent={(e) => openModal(e as Evenement, "calendar")}
          />
        </div>

        {/* Modal */}
        {modalOpen && modalEvent && (
          <EventModal
            isOpen={modalOpen}
            eventData={modalEvent}
            context={modalContext}
            onClose={closeModal}
            onSave={handleSave}
            onDelete={handleDelete}
            technicians={technicians}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default MyCalendar;
