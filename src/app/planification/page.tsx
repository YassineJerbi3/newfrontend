// src/app/rapport/planification/MyCalendar.tsx
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
  type: "rapport";
  title: string;
  start: Date;
  end: Date;
  incident: any;
  equipement: any;
  emplacement: { type: string; nom: string; poste?: string };
  technicien?: { nom: string; prenom: string };
  datePlanification: Date | null;
  diagnostic?: string;
  statut: "VALIDE" | "A_PLANIFIER";
  dateValidation?: string;
}

// style dynamique selon statut
const eventStyleGetter = (event: Evenement) => ({
  style: {
    backgroundColor:
      event.statut === "VALIDE" ? "#047857" /* vert */ : "#1E3A8A" /* bleu */,
    borderRadius: "1.25rem",
    color: "#fff",
    padding: "6px 8px",
    fontSize: "0.85rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
});

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
  views,
  onView,
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
}
const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  eventData,
  context,
  onClose,
  onSave,
  onDelete,
}) => {
  const [datePlanif, setDatePlanif] = useState<Date>(
    eventData.datePlanification || new Date(),
  );
  useEffect(() => {
    setDatePlanif(eventData.datePlanification || new Date());
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
              Détails de la planification
            </h2>

            {/* Badge toujours affiché si validé */}
            {eventData.statut === "VALIDE" && (
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                ✔ Validé
              </p>
            )}

            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Équipement :</strong>{" "}
                {eventData.equipement.equipmentType}
              </p>
              <p>
                <strong>N° de série :</strong>{" "}
                {eventData.equipement.numeroSerie}
              </p>
              <p>
                <strong>Emplacement :</strong> {eventData.emplacement.nom}
              </p>
              {eventData.emplacement.type === "classe" &&
                eventData.emplacement.poste && (
                  <p>
                    <strong>Poste :</strong> {eventData.emplacement.poste}
                  </p>
                )}
              {eventData.technicien && (
                <p>
                  <strong>Technicien :</strong> {eventData.technicien.prenom}{" "}
                  {eventData.technicien.nom}
                </p>
              )}
              {eventData.dateValidation && (
                <p>
                  <strong>Date validation :</strong>{" "}
                  {moment(eventData.dateValidation).format("DD/MM/YYYY HH:mm")}
                </p>
              )}
              <div>
                <strong>Date planification :</strong>{" "}
                <DatePicker
                  selected={datePlanif}
                  onChange={(d) => setDatePlanif(d!)}
                  dateFormat="yyyy-MM-dd"
                  className="ml-2 rounded-md border border-gray-300 px-2 py-1 focus:outline-none"
                />
              </div>
              {eventData.diagnostic && (
                <p>
                  <strong>Diagnostic :</strong> {eventData.diagnostic}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              {context === "calendar" && eventData.statut !== "VALIDE" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDelete(eventData.id)}
                  className="rounded-3xl bg-red-600 px-5 py-2 text-white shadow-md hover:bg-red-700"
                >
                  Annuler planif.
                </motion.button>
              )}
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
                    })
                  }
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

const ListEvent: React.FC<{ event: Evenement; onClick: () => void }> = ({
  event,
  onClick,
}) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
    whileTap={{ scale: 0.98 }}
    className="mb-4 flex cursor-pointer items-center space-x-4 rounded-3xl bg-white p-4 shadow-sm"
  >
    <div className="flex-1 space-y-1">
      <h3 className="text-lg font-semibold text-gray-800">Incident</h3>
      <p className="text-sm text-gray-600">
        {event.equipement.equipmentType} — {event.emplacement.nom}
      </p>
      {event.technicien && (
        <p className="text-sm text-gray-600">
          Technicien: {event.technicien.prenom} {event.technicien.nom}
        </p>
      )}
    </div>
    <div className="text-xl">{event.statut === "VALIDE" ? "✅" : "❌"}</div>
  </motion.div>
);

const MyCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [availableEvents, setAvailableEvents] = useState<Evenement[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<Evenement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<Evenement | null>(null);
  const [modalContext, setModalContext] = useState<"list" | "calendar">("list");

  const loadToPlanifier = async () => {
    const res = await fetch(
      "http://localhost:2000/rapports/nature/a-planifier",
      { credentials: "include" },
    );
    const data = await res.json();
    setAvailableEvents(
      data.map((r: any) => ({
        id: r.id,
        type: "rapport",
        title: r.incident.description,
        start: new Date(),
        end: new Date(),
        incident: r.incident,
        equipement: r.incident.equipement,
        emplacement: r.incident.equipement.emplacement,
        technicien: r.technicien
          ? { nom: r.technicien.nom, prenom: r.technicien.prenom }
          : undefined,
        datePlanification: null,
        diagnostic: r.diagnosticPanne,
        statut: r.statut,
        dateValidation: r.dateValidation,
      })),
    );
  };

  const loadPlanned = async () => {
    const res = await fetch("http://localhost:2000/rapports/planifies", {
      credentials: "include",
    });
    const data = await res.json();
    setScheduledEvents(
      data.map((r: any) => ({
        id: r.id,
        type: "rapport",
        title: r.incident.description,
        start: new Date(r.datePlanification),
        end: new Date(r.datePlanification),
        incident: r.incident,
        equipement: r.incident.equipement,
        emplacement: r.incident.equipement.emplacement,
        technicien: r.technicien
          ? { nom: r.technicien.nom, prenom: r.technicien.prenom }
          : undefined,
        datePlanification: new Date(r.datePlanification),
        diagnostic: r.diagnosticPanne,
        statut: r.statut,
        dateValidation: r.dateValidation,
      })),
    );
  };

  useEffect(() => {
    loadToPlanifier();
    loadPlanned();
  }, []);

  const openModal = (ev: Evenement, context: "list" | "calendar") => {
    setModalEvent(ev);
    setModalContext(context);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSave = async (ev: Evenement) => {
    await fetch(`http://localhost:2000/rapports/${ev.id}/planifier`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datePlanification: ev.datePlanification?.toISOString(),
      }),
    });
    await loadToPlanifier();
    await loadPlanned();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:2000/rapports/${id}/planifier`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datePlanification: null }),
    });
    await loadToPlanifier();
    await loadPlanned();
    closeModal();
  };

  return (
    <DefaultLayout>
      <div className="flex h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Liste à planifier */}
        <div
          className="w-1/3 overflow-y-auto rounded-tr-3xl bg-white/70 p-6 backdrop-blur-sm"
          style={{ maxHeight: "calc(100vh - 90px)" }}
        >
          <h2 className="mb-6 text-center text-2xl font-extrabold text-blue-800">
            Incidents à planifier
          </h2>
          {availableEvents.length === 0 ? (
            <p className="text-center text-gray-500">
              Aucun rapport à planifier
            </p>
          ) : (
            availableEvents.map((ev) => (
              <ListEvent
                key={ev.id}
                event={ev}
                onClick={() => openModal(ev, "list")}
              />
            ))
          )}
        </div>

        {/* Calendrier mois seul */}
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
                const { style } = eventStyleGetter(event);
                return (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center space-x-1 pl-3"
                    style={style}
                    title=""
                  >
                    <span
                      className={`${event.statut === "VALIDE" ? "text-green-200" : "text-blue-200"} text-sm font-semibold`}
                    >
                      Incident {event.statut === "VALIDE" ? "✅" : "❌"}
                    </span>
                  </motion.div>
                );
              },
            }}
            onSelectEvent={(e) => openModal(e as Evenement, "calendar")}
          />
        </div>

        {modalOpen && modalEvent && (
          <EventModal
            isOpen={modalOpen}
            eventData={modalEvent}
            context={modalContext}
            onClose={closeModal}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default MyCalendar;
