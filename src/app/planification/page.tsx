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
import { addDays, isAfter, isBefore, isEqual } from "date-fns";

const localizer = momentLocalizer(moment);

export interface Evenement {
  id: string;
  type: "rapport" | "maintenance";
  title: string;
  start: Date;
  end: Date;
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

// ---------------------- Modals ----------------------

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Rapport List Modal
interface RapportListModalProps extends BaseModalProps {
  event: Evenement;
  onSave: (ev: Evenement) => void;
  onDelete: (id: string) => void;
}
const RapportListModal: React.FC<RapportListModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
}) => {
  const [datePlanif, setDatePlanif] = useState<Date>(
    event.datePlanification || new Date(),
  );
  useEffect(() => {
    setDatePlanif(event.datePlanification || new Date());
  }, [event]);
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
              Détails du rapport
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Équipement :</strong> {event.equipement.equipmentType}
              </p>
              <p>
                <strong>Emplacement :</strong> {event.emplacement.nom}
              </p>
              <p>
                <strong>Incident :</strong> {event.incident.description}
              </p>
              <div>
                <strong>Date de planification :</strong>{" "}
                <DatePicker
                  selected={datePlanif}
                  onChange={(d) => setDatePlanif(d!)}
                  dateFormat="yyyy-MM-dd"
                  className="ml-2 rounded-md border border-gray-300 px-2 py-1 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  onSave({
                    ...event,
                    datePlanification: datePlanif,
                    start: datePlanif,
                    end: datePlanif,
                  })
                }
                className="rounded-3xl bg-blue-700 px-5 py-2 text-white shadow-md hover:bg-blue-800"
              >
                Valider
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDelete(event.id)}
                className="rounded-3xl bg-red-600 px-5 py-2 text-white shadow-md hover:bg-red-700"
              >
                Annuler planif.
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

// Rapport Calendar Modal
interface RapportCalendarModalProps extends BaseModalProps {
  event: Evenement;
}
const RapportCalendarModal: React.FC<RapportCalendarModalProps> = ({
  isOpen,
  onClose,
  event,
}) => (
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
            Détails du rapport
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Équipement :</strong> {event.equipement.equipmentType}
            </p>
            <p>
              <strong>Emplacement :</strong> {event.emplacement.nom}
            </p>
            <p>
              <strong>Incident :</strong> {event.incident.description}
            </p>
            <p>
              <strong>Diagnostic :</strong> {event.diagnostique}
            </p>
            <p>
              <strong>Technicien :</strong> {event.technicien?.prenom}{" "}
              {event.technicien?.nom}
            </p>
            <p>
              <strong>Date validation :</strong> {event.dateValidation}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </Modal>
);

// Maintenance List Modal
interface MaintenanceListModalProps extends BaseModalProps {
  event: Evenement;
  onSave: (ev: Evenement) => void;
  technicians: User[];
}
const MaintenanceListModal: React.FC<MaintenanceListModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  technicians,
}) => {
  const [datePlanif, setDatePlanif] = useState<Date>(
    event.datePlanification || new Date(),
  );
  const [selectedTech, setSelectedTech] = useState<string>(
    event.plannedTechnicienId || "",
  );
  const [techError, setTechError] = useState<string>("");
  const [warning, setWarning] = useState<string>("");

  useEffect(() => {
    setDatePlanif(event.datePlanification || new Date());
    setSelectedTech(event.plannedTechnicienId || "");
    setTechError("");
    setWarning("");
  }, [event]);
  // calcul de la fenêtre recommandée :
  const occDate = event.alertDate ? new Date(event.alertDate) : new Date(); // si pas d’alertDate, fallback à aujourd’hui
  const recommendedStart = occDate;
  const recommendedEnd = addDays(occDate, 6);

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
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-xl text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <h2 className="mb-4 text-center text-2xl font-bold text-blue-800">
              Planification Maintenance
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Équipement :</strong> {event.equipement.equipmentType}
              </p>
              <p>
                <strong>Emplacement :</strong> {event.emplacement.nom}
              </p>
              <p>
                <strong>Description :</strong> {event.description}
              </p>

              {/* Choix du technicien */}
              <div>
                <strong>Choisir technicien :</strong>
                <select
                  value={selectedTech}
                  onChange={(e) => {
                    setSelectedTech(e.target.value);
                    setTechError("");
                  }}
                  className="ml-2 rounded-md border border-gray-300 px-2 py-1 focus:outline-none"
                >
                  <option value="">-- Sélectionner --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
                {techError && (
                  <p className="mt-1 text-sm text-red-600">{techError}</p>
                )}
              </div>

              {/* Sélecteur de date */}
              <div>
                <strong>Date planification :</strong>
                <DatePicker
                  selected={datePlanif}
                  onChange={(d) => {
                    if (!d) return;
                    setDatePlanif(d);
                    // warning si date hors fenêtre
                    if (isAfter(d, recommendedEnd)) {
                      setWarning(
                        `⚠️ Hors période recommandée (jusqu’au ${recommendedEnd.toLocaleDateString(
                          "fr-FR",
                        )})`,
                      );
                    } else {
                      setWarning("");
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  minDate={recommendedStart} // pas avant la date d'occurrence
                  dayClassName={(d) => {
                    // pendant les 7 jours recommandés → fond vert pâle
                    if (
                      (isAfter(d, recommendedStart) ||
                        isEqual(d, recommendedStart)) &&
                      (isBefore(d, recommendedEnd) ||
                        isEqual(d, recommendedEnd))
                    ) {
                      return "bg-green-100 rounded-full";
                    }
                    return "";
                  }}
                  className="ml-2 rounded-md border border-gray-300 px-2 py-1 focus:outline-none"
                  inline
                />
                <p className="mt-1 text-sm text-gray-600">
                  Période recommandée :{" "}
                  <strong>
                    {recommendedStart.toLocaleDateString("fr-FR")} –{" "}
                    {recommendedEnd.toLocaleDateString("fr-FR")}
                  </strong>
                </p>
                {warning && (
                  <p className="mt-1 text-sm text-red-600">{warning}</p>
                )}
              </div>
            </div>

            {/* Bouton Valider */}
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!selectedTech) {
                    setTechError("Veuillez sélectionner un technicien");
                    return;
                  }
                  onSave({
                    ...event,
                    datePlanification: datePlanif,
                    start: datePlanif,
                    end: datePlanif,
                    plannedTechnicienId: selectedTech,
                  });
                }}
                className="rounded-3xl bg-blue-700 px-5 py-2 text-white shadow-md hover:bg-blue-800"
              >
                Valider
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

// Maintenance Calendar Modal
interface MaintenanceCalendarModalProps extends BaseModalProps {
  event: Evenement;
  onSave: (ev: Evenement) => void;
}
const MaintenanceCalendarModal: React.FC<MaintenanceCalendarModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
}) => {
  const [datePlanif, setDatePlanif] = useState<Date>(
    event.datePlanification || new Date(),
  );
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateChanged, setDateChanged] = useState(false);

  useEffect(() => {
    setDatePlanif(event.datePlanification || new Date());
    setIsEditingDate(false);
    setDateChanged(false);
  }, [event]);

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
              Détails Maintenance
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Équipement :</strong> {event.equipement.equipmentType}
              </p>
              <p>
                <strong>Emplacement :</strong> {event.emplacement.nom}
              </p>
              <p>
                <strong>Description :</strong> {event.description}
              </p>
              <p>
                <strong>Technicien assigné :</strong> {event.technicien?.prenom}{" "}
                {event.technicien?.nom}
              </p>
              <div className="mt-3">
                <strong>Date de planification :</strong>{" "}
                {isEditingDate ? (
                  <DatePicker
                    selected={datePlanif}
                    onChange={(d) => {
                      setDatePlanif(d!);
                      setDateChanged(true);
                    }}
                    dateFormat="yyyy-MM-dd"
                    inline
                  />
                ) : (
                  <span className="ml-2 font-medium">
                    {datePlanif.toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  if (isEditingDate) {
                    setDatePlanif(event.datePlanification || new Date());
                    setDateChanged(false);
                  }
                  setIsEditingDate(!isEditingDate);
                }}
                className="rounded-3xl bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                {isEditingDate ? "Annuler" : "Changer la date"}
              </button>
              {isEditingDate && dateChanged && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSave({
                      ...event,
                      datePlanification: datePlanif,
                      start: datePlanif,
                      end: datePlanif,
                    });
                    setIsEditingDate(false);
                    setDateChanged(false);
                  }}
                  className="rounded-3xl bg-blue-700 px-5 py-2 text-white shadow-md hover:bg-blue-800"
                >
                  Valider
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

// ---------------------- Main Calendar ----------------------

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

  // Load technicians
  useEffect(() => {
    fetch("http://localhost:2000/users/role/TECHNICIEN", {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("Impossible de charger les techniciens");
        return r.json();
      })
      .then((data: User[]) => setTechnicians(data))
      .catch(() => setTechnicians([]));
  }, []);

  // Load events
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:2000/rapports/nature/a-planifier", {
        credentials: "include",
      }).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("http://localhost:2000/occurrences-maintenance/unplanned", {
        credentials: "include",
      }).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("http://localhost:2000/rapports/planifies", {
        credentials: "include",
      }).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("http://localhost:2000/occurrences-maintenance/planned", {
        credentials: "include",
      }).then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([rapToPlan, maintUnplanned, rapPlanned, maintPlanned]) => {
        setRapportEvents(
          rapToPlan.map((r: any) => ({
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
        setMaintenanceEvents(
          maintUnplanned.map((o: any) => {
            const defaultPlan = addDays(new Date(o.dateOccurrence), 7);
            return {
              id: o.id,
              type: "maintenance",
              title: o.maintenancePreventive.description,
              start: defaultPlan,
              end: defaultPlan,
              equipement: o.maintenancePreventive.equipement,
              emplacement: o.maintenancePreventive.equipement.emplacement,
              datePlanification: defaultPlan,
              statut: "A_PLANIFIER",
              alertDate: o.dateOccurrence,
              description: o.maintenancePreventive.description,
            };
          }),
        );
        const rapEv = rapPlanned.map((r: any) => ({
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
          diagnostique: r.diagnostique,
          technicien: r.technicien,
          dateValidation: r.dateValidation,
        }));
        const maintEv = maintPlanned.map((o: any) => ({
          id: o.id,
          type: "maintenance",
          title: o.maintenancePreventive.description,
          start: new Date(o.datePlanification),
          end: new Date(o.datePlanification),
          equipement: o.maintenancePreventive.equipement,
          emplacement: o.maintenancePreventive.equipement.emplacement,
          datePlanification: new Date(o.datePlanification),
          statut: "VALIDE",
          description: o.maintenancePreventive.description,
          plannedTechnicienId: o.plannedTechnicienId,
          technicien:
            technicians.find((t) => t.id === o.plannedTechnicienId) ||
            undefined,
        }));
        setScheduledEvents([...rapEv, ...maintEv]);
      })
      .catch(console.error);
  }, [technicians]);

  // Combine list
  useEffect(() => {
    setAvailableEvents([...rapportEvents, ...maintenanceEvents]);
  }, [rapportEvents, maintenanceEvents]);

  const openModal = (ev: Evenement, context: "list" | "calendar") => {
    setModalEvent(ev);
    setModalContext(context);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSave = async (ev: Evenement) => {
    const isRapport = ev.type === "rapport";
    const url = isRapport
      ? `http://localhost:2000/rapports/${ev.id}/planifier`
      : `http://localhost:2000/occurrences-maintenance/${ev.id}/planifier`;

    const body = isRapport
      ? { datePlanification: ev.datePlanification?.toISOString() }
      : {
          datePlanification: ev.datePlanification?.toISOString(),
          technicienId: ev.plannedTechnicienId,
        };

    await fetch(url, {
      method: isRapport ? "POST" : "PATCH", // ← use POST for rapports
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setRapportEvents((prev) => prev.filter((r) => r.id !== ev.id));
    setMaintenanceEvents((prev) => prev.filter((m) => m.id !== ev.id));
    closeModal();
  };

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
        {/* Liste des événements à planifier */}
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
                const style =
                  event.type === "maintenance"
                    ? {
                        backgroundColor: "#EA580C",
                        border: "2px dashed #F97316",
                        borderRadius: "1rem",
                        color: "#FFF",
                        padding: "6px 8px",
                        fontSize: "0.85rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                      }
                    : eventStyleGetter(event).style;
                return (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center space-x-1 pl-3"
                    style={style}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        event.type === "maintenance"
                          ? "text-yellow-100"
                          : event.statut === "VALIDE"
                            ? "text-green-200"
                            : "text-blue-200"
                      }`}
                    >
                      {event.type === "maintenance"
                        ? "🛠️ Maintenance"
                        : "Incident"}{" "}
                      {event.statut === "VALIDE" ? "✅" : "❌"}
                    </span>
                  </motion.div>
                );
              },
            }}
            onSelectEvent={(e) => openModal(e as Evenement, "calendar")}
          />
        </div>

        {/* Modals */}
        {modalOpen && modalEvent && (
          <>
            {modalEvent.type === "rapport" && modalContext === "list" && (
              <RapportListModal
                isOpen={modalOpen}
                onClose={closeModal}
                event={modalEvent}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            )}
            {modalEvent.type === "rapport" && modalContext === "calendar" && (
              <RapportCalendarModal
                isOpen={modalOpen}
                onClose={closeModal}
                event={modalEvent}
              />
            )}
            {modalEvent.type === "maintenance" && modalContext === "list" && (
              <MaintenanceListModal
                isOpen={modalOpen}
                onClose={closeModal}
                event={modalEvent}
                onSave={handleSave}
                technicians={technicians}
              />
            )}
            {modalEvent.type === "maintenance" &&
              modalContext === "calendar" && (
                <MaintenanceCalendarModal
                  isOpen={modalOpen}
                  onClose={closeModal}
                  event={modalEvent}
                  onSave={handleSave}
                />
              )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default MyCalendar;
