"use client";
import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  ToolbarProps,
  EventProps,
} from "react-big-calendar";
import moment from "moment";
import Modal from "react-modal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { motion } from "framer-motion";

const localizer = momentLocalizer(moment);

// -------------------------
// Icônes et couleurs (même logic que précédemment)
// -------------------------
const typeIcon = (type: string) => {
  switch (type) {
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

const eventStyleGetter = (event: any) => {
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

// -------------------------
// Barre d’outils personnalisée (sticky + dégradé bleu)
// -------------------------
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
      {/* Navigation */}
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

      {/* Titre cliquable (ouvre datepicker inline) */}
      <div className="relative">
        <span
          onClick={handleTitleClick}
          className="cursor-pointer select-none text-xl font-semibold"
        >
          {label}
        </span>
        {showPicker && (
          <div className="absolute left-1/2 top-full z-30 mt-2 w-[280px] -translate-x-1/2 transform rounded-xl bg-white p-4 shadow-2xl">
            <input
              type="month"
              value={moment(currentDate).format("YYYY-MM")}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Sélecteur de vue */}
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

// -------------------------
// Page avec uniquement le calendrier
// -------------------------
const CalendarOnlyPage: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  // Exemple d’événements statiques (facultatif)
  const [events] = useState<any[]>([
    {
      id: 1,
      title: "Exemple d’incident",
      start: new Date(new Date().setHours(10, 0, 0)),
      end: new Date(new Date().setHours(11, 0, 0)),
      priority: "Urgent",
      type: "incident",
    },
    {
      id: 2,
      title: "Réunion interne",
      start: new Date(new Date().setDate(new Date().getDate() + 2)).setHours(
        14,
        0,
        0,
      ),
      end: new Date(new Date().setDate(new Date().getDate() + 2)).setHours(
        15,
        30,
        0,
      ),
      priority: "Medium",
      type: "rapport",
    },
    {
      id: 3,
      title: "Maintenance programmée",
      start: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(
        9,
        0,
        0,
      ),
      end: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(
        10,
        0,
        0,
      ),
      priority: "Bas",
      type: "applicatif",
    },
  ]);

  const handleNavigate = (newDate: Date | string, action?: string) => {
    if (newDate instanceof Date) setDate(newDate);
    else if (action === "TODAY") setDate(new Date());
  };

  const handleDateChange = (newDate: Date) => setDate(newDate);
  const handleViewChange = (newView: "month" | "week") => setView(newView);

  return (
    <DefaultLayout>
      <div className="flex h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="flex-1">
          <Calendar
            localizer={localizer}
            date={date}
            view={view}
            onView={(v) => handleViewChange(v as "month" | "week")}
            onNavigate={handleNavigate}
            defaultView="month"
            views={["month", "week"]}
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
                  onDateChange={handleDateChange}
                  view={view}
                  views={["month", "week"]}
                  onView={(v) => handleViewChange(v as "month" | "week")}
                />
              ),
              event: (props: EventProps<any>) => {
                const { event, title } = props;
                return (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center space-x-1 pl-3"
                  >
                    <span className="text-base">{typeIcon(event.type)}</span>
                    <span className="truncate text-sm font-semibold text-white">
                      {title}
                    </span>
                  </motion.div>
                );
              },
            }}
            eventPropGetter={(event) => eventStyleGetter(event as any)}
            onSelectEvent={() => {}}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CalendarOnlyPage;
