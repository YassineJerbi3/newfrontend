"use client";
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, ToolbarProps } from "react-big-calendar";
import moment from "moment";
import DatePicker from "react-datepicker";
import Modal from "react-modal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Setup calendar localizer
const localizer = momentLocalizer(moment);

// ----------------------------------------------------------------------
// Evenement Types and Initial Data
// ----------------------------------------------------------------------
export interface Evenement {
  id: number;
  type: "incident" | "demande" | "rapport" | "applicatif";
  title: string;
  priority: "Urgent" | "Medium" | "Bas";
  technician?: string;
  start?: Date;
  end?: Date;
  progress?: number;
}

const initialEvenements: Evenement[] = [
  { id: 1, type: "incident", title: "Incident", priority: "Urgent" },
  { id: 2, type: "demande", title: "Demande", priority: "Medium" },
  { id: 3, type: "rapport", title: "Rapport d'incident", priority: "Urgent" },
  { id: 4, type: "applicatif", title: "Applicatif", priority: "Bas" },
];

// ----------------------------------------------------------------------
// Icon Helpers
// ----------------------------------------------------------------------
const typeIcon = (ev: Evenement) => {
  switch (ev.type) {
    case "incident":
      return "🔧";
    case "demande":
      return "📩";
    case "rapport":
      return "📝";
    case "applicatif":
      return "💻";
    default:
      return "";
  }
};

const priorityIcon = (ev: Evenement) => {
  switch (ev.priority) {
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

// ----------------------------------------------------------------------
// Custom Toolbar for Calendar
// ----------------------------------------------------------------------
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px",
        background: "#f0f0f0",
        borderRadius: "5px",
        marginBottom: "10px",
        position: "relative",
      }}
    >
      {/* Navigation Buttons */}
      <div style={{ flex: "0 0 auto" }}>
        <button
          onClick={() => onNavigate("PREV")}
          style={{ padding: "5px 10px", marginRight: "5px" }}
        >
          Back
        </button>
        <button
          onClick={() => onNavigate("TODAY")}
          style={{ padding: "5px 10px", marginRight: "5px" }}
        >
          Today
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          style={{ padding: "5px 10px" }}
        >
          Next
        </button>
      </div>

      {/* Clickable Title */}
      <div style={{ flex: "1 1 auto", textAlign: "center" }}>
        <span
          onClick={handleTitleClick}
          style={{ fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer" }}
        >
          {label}
        </span>
        {showPicker && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
          >
            <DatePicker
              selected={currentDate}
              onChange={(date: Date) => handleDateChange(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              inline
            />
          </div>
        )}
      </div>

      {/* View Buttons */}
      <div style={{ flex: "0 0 auto" }}>
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            style={{
              margin: "0 5px",
              padding: "5px 10px",
              border: v === view ? "2px solid #333" : "1px solid #ddd",
              background: v === view ? "#ddd" : "#fff",
              cursor: "pointer",
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Modal for Creating/Editing an Event
// ----------------------------------------------------------------------
interface EventModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  eventData: Evenement | null;
  onClose: () => void;
  onSave: (ev: Evenement) => void;
  onDelete?: (id: number) => void;
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
  const [priority, setPriority] = useState(eventData?.priority || "Urgent");
  const [start, setStart] = useState<Date>(eventData?.start || new Date());
  const [end, setEnd] = useState<Date>(eventData?.end || new Date());
  const [technician, setTechnician] = useState(eventData?.technician || "");
  const technicianOptions = ["Technician A", "Technician B", "Technician C"];

  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title);
      setPriority(eventData.priority);
      setStart(eventData.start || new Date());
      setEnd(eventData.end || new Date());
      setTechnician(eventData.technician || "");
    } else {
      setTitle("");
      setPriority("Urgent");
      setStart(new Date());
      setEnd(new Date());
      setTechnician("");
    }
  }, [eventData]);

  const handleSave = () => {
    if (!title || !priority || !start || !end || !technician) {
      alert("Tous les champs sont obligatoires.");
      return;
    }
    const newEvent: Evenement = {
      id: eventData?.id || Date.now(),
      type: eventData?.type || "incident",
      title,
      priority,
      technician,
      start,
      end,
      progress: eventData?.progress || 0,
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
      style={{
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "20px",
          zIndex: 1000,
        },
        content: {
          background: "#fff",
          padding: "20px",
          borderRadius: "5px",
          width: "400px",
          maxWidth: "90%",
          outline: "none",
        },
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        {mode === "create" ? "Planifier l'événement" : "Modifier l'événement"}
      </h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Titre :</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Priorité :</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        >
          <option value="Urgent">Urgent</option>
          <option value="Medium">Medium</option>
          <option value="Bas">Bas</option>
        </select>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Date de début :</label>
        <DatePicker
          selected={start}
          onChange={(date: Date) => setStart(date)}
          showTimeSelect
          dateFormat="Pp"
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Date de fin :</label>
        <DatePicker
          selected={end}
          onChange={(date: Date) => setEnd(date)}
          showTimeSelect
          dateFormat="Pp"
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Technicien associé :</label>
        <select
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        >
          <option value="">-- Sélectionner --</option>
          {technicianOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      {mode === "edit" && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Progression :</label>
          <div
            style={{
              background: "#ddd",
              borderRadius: "5px",
              overflow: "hidden",
              marginTop: "5px",
            }}
          >
            <div
              style={{
                width: `${eventData?.progress || 0}%`,
                background: "blue",
                height: "10px",
              }}
            />
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {mode === "edit" && (
          <button
            onClick={handleDelete}
            style={{ background: "red", color: "#fff", padding: "5px 10px" }}
          >
            Supprimer
          </button>
        )}
        <button
          onClick={onClose}
          style={{ background: "gray", color: "#fff", padding: "5px 10px" }}
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          style={{ background: "blue", color: "#fff", padding: "5px 10px" }}
        >
          {mode === "create" ? "Ajouter" : "Sauvegarder"}
        </button>
      </div>
    </Modal>
  );
};

// ----------------------------------------------------------------------
// List Event Component
// ----------------------------------------------------------------------
interface ListEventProps {
  event: Evenement;
  onClick: () => void;
}

const ListEvent: React.FC<ListEventProps> = ({ event, onClick }) => (
  <div
    onClick={onClick}
    style={{
      marginBottom: "1rem",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "5px",
      background: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
    }}
  >
    <div style={{ marginRight: "10px", fontSize: "1.5rem" }}>
      {typeIcon(event)}
    </div>
    <div>
      <h3 style={{ margin: 0, fontWeight: "bold" }}>
        {event.title}{" "}
        <span style={{ marginLeft: "5px" }}>{priorityIcon(event)}</span>
      </h3>
      <p style={{ margin: 0 }}>{event.type}</p>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// Main Component: List on Left, Calendar on Right
// ----------------------------------------------------------------------
const MyCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState("month");
  const [availableEvents, setAvailableEvents] =
    useState<Evenement[]>(initialEvenements);
  const [scheduledEvents, setScheduledEvents] = useState<Evenement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);

  const handleNavigate = (newDate: Date, action?: string) => {
    if (newDate instanceof Date) setDate(newDate);
  };
  const handleDateChange = (newDate: Date) => setDate(newDate);
  const handleViewChange = (newView: string) => setView(newView);

  const openCreateModal = (ev: Evenement) => {
    const newEv: Evenement = {
      ...ev,
      start: new Date(),
      end: new Date(Date.now() + 3600000),
      progress: 0,
    };
    setModalMode("create");
    setSelectedEvent(newEv);
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

  const handleSaveEvent = (ev: Evenement) => {
    if (modalMode === "create") {
      setScheduledEvents([...scheduledEvents, ev]);
      setAvailableEvents(availableEvents.filter((e) => e.id !== ev.id));
    } else {
      setScheduledEvents(scheduledEvents.map((e) => (e.id === ev.id ? ev : e)));
    }
  };

  const handleDeleteEvent = (id: number) => {
    const ev = scheduledEvents.find((e) => e.id === id);
    if (ev) {
      setScheduledEvents(scheduledEvents.filter((e) => e.id !== id));
      setAvailableEvents([
        ...availableEvents,
        { ...ev, start: undefined, end: undefined },
      ]);
    }
  };

  return (
    <DefaultLayout>
      <div style={{ display: "flex", height: "100vh", background: "#fafafa" }}>
        {/* Left: scrollable list */}
        <div
          style={{
            flex: 1,
            height: "100vh",
            padding: "20px",
            overflowY: "auto",
            borderRight: "1px solid #ddd",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Liste des événements
          </h2>
          {availableEvents.map((ev) => (
            <ListEvent
              key={ev.id}
              event={ev}
              onClick={() => openCreateModal(ev)}
            />
          ))}
        </div>

        {/* Right: fixed calendar */}
        <div
          style={{
            flex: 2,
            height: "100vh",
            padding: "20px",
            overflow: "hidden",
          }}
        >
          <Calendar
            localizer={localizer}
            date={date}
            view={view}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            defaultView="month"
            views={["month", "week"]}
            events={scheduledEvents}
            style={{ height: "100%" }}
            components={{
              toolbar: (props) => (
                <CustomToolbar
                  {...props}
                  currentDate={date}
                  onDateChange={handleDateChange}
                  view={view}
                  views={["month", "week"]}
                  onView={handleViewChange}
                />
              ),
            }}
            onSelectEvent={(ev: Evenement) => openEditModal(ev)}
          />
        </div>

        {modalOpen && selectedEvent && (
          <EventModal
            isOpen={modalOpen}
            mode={modalMode}
            eventData={selectedEvent}
            onClose={closeModal}
            onSave={handleSaveEvent}
            onDelete={modalMode === "edit" ? handleDeleteEvent : undefined}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default MyCalendar;
