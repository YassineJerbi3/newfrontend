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
  priority: "Urgent" | "Medium" | "Bas";
  start: Date;
  end: Date;
}

const typeIcon = (ev: Evenement) => (ev.type === "rapport" ? "📝" : "");

const priorityColor = (p: Evenement["priority"]) => {
  switch (p) {
    case "Urgent":
      return "bg-red-700 text-white";
    case "Medium":
      return "bg-yellow-500 text-gray-800";
    case "Bas":
      return "bg-green-600 text-white";
    default:
      return "bg-gray-300 text-black";
  }
};

const eventStyleGetter = (event: Evenement) => {
  const bgColor =
    event.priority === "Urgent"
      ? "#b91c1c"
      : event.priority === "Medium"
        ? "#d97706"
        : "#047857";

  return {
    style: {
      backgroundColor: bgColor,
      borderRadius: "1.25rem",
      border: "none",
      color: "#ffffff",
      padding: "6px 8px",
      fontSize: "0.85rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      transition: "transform 0.2s",
    },
  };
};

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

  const handleTitleClick = () => setShowPicker(true);
  const handleDateChange = (date: Date) => {
    setShowPicker(false);
    onDateChange(date);
    onNavigate(date, "DATE");
  };

  return (
    <div className="sticky top-0 z-20 mb-4 flex items-center justify-between rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-3 text-white shadow-md backdrop-blur-sm">
      <div className="flex space-x-3">
        <button
          onClick={() => onNavigate("PREV")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 transition hover:bg-opacity-30"
          aria-label="Précédent"
        >
          ←
        </button>
        <button
          onClick={() => onNavigate("TODAY")}
          className="rounded-full bg-white bg-opacity-25 px-4 py-2 text-sm font-medium transition hover:bg-opacity-35"
        >
          Aujourd’hui
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 transition hover:bg-opacity-30"
          aria-label="Suivant"
        >
          →
        </button>
      </div>

      <div className="relative">
        <span
          onClick={handleTitleClick}
          className="cursor-pointer select-none text-xl font-semibold"
        >
          {label}
        </span>
        {showPicker && (
          <div className="absolute left-1/2 top-full z-30 mt-2 w-[280px] -translate-x-1/2 transform rounded-xl bg-white p-4 shadow-2xl">
            <DatePicker
              selected={currentDate}
              onChange={(date: Date) => handleDateChange(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              inline
              className="w-full rounded-lg border border-gray-200 focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              v === view
                ? "bg-white text-blue-700"
                : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

interface EventModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  eventData: Evenement | null;
  onClose: () => void;
  onSave: (ev: Evenement) => void;
  onDelete?: (id: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  mode,
  eventData,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(eventData?.title || "");
  const [priority, setPriority] = useState<Evenement["priority"]>(
    eventData?.priority || "Medium",
  );
  const [start, setStart] = useState<Date>(eventData?.start || new Date());

  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title);
      setPriority(eventData.priority);
      setStart(eventData.start);
    } else {
      setTitle("");
      setPriority("Medium");
      setStart(new Date());
    }
  }, [eventData]);

  const handleSave = () => {
    if (!title || !priority || !start) {
      alert("Tous les champs sont obligatoires.");
      return;
    }
    const newEvent: Evenement = {
      id: eventData?.id || Date.now().toString(),
      type: "rapport",
      title,
      priority,
      start,
      end: start,
    };
    onSave(newEvent);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && eventData) {
      onDelete(eventData.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center pt-[85px] z-40"
      className="outline-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative mx-4 w-full max-w-md rounded-3xl bg-white/80 shadow-2xl backdrop-blur-xl"
          >
            <div className="p-5">
              <h2 className="mb-4 text-center text-2xl font-bold text-blue-800">
                {mode === "create"
                  ? "Planifier un rapport"
                  : "Modifier la planification"}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="text-md mb-1 block font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-3xl border border-blue-200 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du rapport"
                  />
                </div>
                <div>
                  <label className="text-md mb-1 block font-medium text-gray-700">
                    Priorité
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as Evenement["priority"])
                    }
                    className="w-full rounded-3xl border border-blue-200 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="Medium">Medium</option>
                    <option value="Bas">Bas</option>
                  </select>
                </div>
                <div>
                  <label className="text-md mb-1 block font-medium text-gray-700">
                    Date de planification
                  </label>
                  <DatePicker
                    selected={start}
                    onChange={(date: Date) => setStart(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full rounded-3xl border border-blue-200 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                {mode === "edit" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    className="rounded-3xl bg-gradient-to-r from-red-700 to-red-500 px-5 py-2 text-white shadow-md transition hover:opacity-90"
                  >
                    Annuler planification
                  </motion.button>
                )}
                <div className="ml-auto flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="rounded-3xl bg-gray-200 px-5 py-2 text-gray-800 shadow transition hover:bg-gray-300"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="rounded-3xl bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-2 text-white shadow-md transition hover:opacity-90"
                  >
                    Valider
                  </motion.button>
                </div>
              </div>
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
    className="mb-4 flex cursor-pointer items-center space-x-4 rounded-3xl bg-white p-4 shadow-sm transition hover:shadow-lg"
  >
    <div className="text-3xl">{typeIcon(event)}</div>
    <div className="flex-1">
      <h3 className="flex items-center text-lg font-semibold">
        {event.title}
        <span
          className={`ml-3 inline-block h-4 w-4 rounded-full ${priorityColor(
            event.priority,
          )}`}
          title={event.priority}
        />
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Cliquez pour choisir une date
      </p>
    </div>
  </motion.div>
);

const MyCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [availableEvents, setAvailableEvents] = useState<Evenement[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<Evenement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);

  const loadToPlanifier = async () => {
    const res = await fetch(
      "http://localhost:2000/rapports/nature/a-planifier",
      { credentials: "include" },
    );
    const data = await res.json();
    setAvailableEvents(
      data.map((r: any) => {
        let prio: Evenement["priority"] = "Medium";
        if (r.incident?.priorite === "URGENT") prio = "Urgent";
        if (r.incident?.priorite === "BASSE") prio = "Bas";
        return {
          id: r.id,
          type: "rapport",
          title: `Rapport #${r.id}`,
          priority: prio,
          start: new Date(),
          end: new Date(),
        };
      }),
    );
  };

  const loadPlanned = async () => {
    const res = await fetch("http://localhost:2000/rapports/planifies", {
      credentials: "include",
    });
    const data = await res.json();
    setScheduledEvents(
      data.map((r: any) => {
        let prio: Evenement["priority"] = "Medium";
        if (r.incident?.priorite === "URGENT") prio = "Urgent";
        if (r.incident?.priorite === "BASSE") prio = "Bas";
        const [year, month, day] = r.datePlanification.split("-").map(Number);
        const planifDate = new Date(year, month - 1, day);
        return {
          id: r.id,
          type: "rapport",
          title: `Rapport #${r.id}`,
          priority: prio,
          start: planifDate,
          end: planifDate,
        };
      }),
    );
  };

  useEffect(() => {
    loadToPlanifier();
    loadPlanned();
  }, []);

  const openCreateModal = (ev: Evenement) => {
    setModalMode("create");
    setSelectedEvent(ev);
    setModalOpen(true);
  };

  const openEditModal = (ev: Evenement) => {
    setModalMode("edit");
    setSelectedEvent(ev);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async (ev: Evenement) => {
    await fetch(`http://localhost:2000/rapports/${ev.id}/planifier`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datePlanification: ev.start.toISOString().split("T")[0],
      }),
    });
    await loadToPlanifier();
    await loadPlanned();
    closeModal();
  };

  const handleDeleteEvent = async (id: string) => {
    await fetch(`http://localhost:2000/rapports/${id}/planification`, {
      method: "DELETE",
      credentials: "include",
    });
    await loadToPlanifier();
    await loadPlanned();
    closeModal();
  };

  return (
    <DefaultLayout>
      <div className="flex h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="w-1/3 overflow-y-auto rounded-tr-3xl bg-white/70 p-6 shadow-inner backdrop-blur-sm">
          <h2 className="mb-6 text-center text-2xl font-extrabold text-blue-800">
            Rapports à planifier
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
                onClick={() => openCreateModal(ev)}
              />
            ))
          )}
        </div>

        <div className="flex-1 p-6">
          <Calendar
            localizer={localizer}
            date={date}
            view={view}
            onView={(v) => setView(v as any)}
            onNavigate={(d) => d instanceof Date && setDate(d)}
            defaultView="month"
            views={["month", "week"]}
            events={scheduledEvents}
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
                  view={view}
                  views={["month", "week"]}
                  onView={(v) => setView(v as any)}
                />
              ),
              event: (props: EventProps<Evenement>) => {
                const { event, title } = props;
                return (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center space-x-1 pl-3"
                  >
                    <span className="text-base">{typeIcon(event)}</span>
                    <span className="truncate text-sm font-semibold text-white">
                      {title}
                    </span>
                  </motion.div>
                );
              },
            }}
            eventPropGetter={(e) => eventStyleGetter(e as Evenement)}
            onSelectEvent={openEditModal}
          />
        </div>

        {modalOpen && selectedEvent && (
          <EventModal
            isOpen={modalOpen}
            mode={modalMode}
            eventData={selectedEvent}
            onClose={closeModal}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default MyCalendar;
